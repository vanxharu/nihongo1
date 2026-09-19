const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const allTopics = require('./n4_all_topics.cjs');

async function run() {
  console.log(`Starting import of ${allTopics.length} N4 grammar topics...`);

  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
  });

  try {
    // 1. Fetch all lessons to get ID map
    const lessonsRes = await pool.query(`SELECT id, lesson_number, level, title FROM lessons WHERE level = 'N4' OR lesson_number BETWEEN 26 AND 50 ORDER BY lesson_number ASC`);
    console.log(`Found ${lessonsRes.rows.length} N4 lessons in database.`);
    const lessonMap = new Map(); // lesson_number -> id
    for (const row of lessonsRes.rows) {
      lessonMap.set(row.lesson_number, row.id);
    }

    // Ensure all lessons 26 to 50 exist
    for (let lNum = 26; lNum <= 50; lNum++) {
      if (!lessonMap.has(lNum)) {
        console.log(`Creating missing lesson ${lNum}...`);
        const ins = await pool.query(
          `INSERT INTO lessons (lesson_number, level, title, description) VALUES ($1, 'N4', $2, $3) RETURNING id`,
          [lNum, `Bài ${lNum}`, `Ngữ pháp Minna no Nihongo Bài ${lNum}`]
        );
        lessonMap.set(lNum, ins.rows[0].id);
      }
    }

    // 2. Fetch all existing grammars in N4
    const existingGrammarsRes = await pool.query(`
      SELECT g.id, g.lesson_id, g.structure, g.meaning, l.lesson_number 
      FROM grammars g
      JOIN lessons l ON g.lesson_id = l.id
      WHERE l.lesson_number BETWEEN 26 AND 50 OR l.level = 'N4'
    `);
    console.log(`Found ${existingGrammarsRes.rows.length} existing grammar items in N4 lessons.`);

    // Map existing by lesson_number + normalized structure
    const existingByLesson = new Map(); // lesson_number -> Array<{id, structure, meaning}>
    for (const g of existingGrammarsRes.rows) {
      if (!existingByLesson.has(g.lesson_number)) {
        existingByLesson.set(g.lesson_number, []);
      }
      existingByLesson.get(g.lesson_number).push(g);
    }

    // Read current grammarAiContents.json
    const aiContentsPath = path.join(process.cwd(), 'src/data/grammarAiContents.json');
    let aiContents = {};
    if (fs.existsSync(aiContentsPath)) {
      try {
        aiContents = JSON.parse(fs.readFileSync(aiContentsPath, 'utf8'));
      } catch (e) {
        console.warn('Error reading existing grammarAiContents.json:', e.message);
      }
    }

    const importedGrammars = [];

    // Process each topic
    for (const topic of allTopics) {
      const lessonId = lessonMap.get(topic.lessonNumber);
      if (!lessonId) {
        console.error(`Missing lessonId for lesson ${topic.lessonNumber}`);
        continue;
      }

      const lessonGrammars = existingByLesson.get(topic.lessonNumber) || [];
      // Find matching existing grammar in this lesson
      // Normalize patterns: remove ～, 〜, spaces, punctuation
      const cleanPattern = topic.pattern.replace(/[～〜\s]/g, '');
      let match = lessonGrammars.find(g => {
        const cleanG = (g.structure || '').replace(/[～〜\s]/g, '');
        return cleanG === cleanPattern || cleanG.includes(cleanPattern) || cleanPattern.includes(cleanG);
      });

      let grammarDbId;

      if (match) {
        // Update existing grammar with richer explanation and examples, preserving user progress and ID
        grammarDbId = match.id;
        await pool.query(
          `UPDATE grammars 
           SET structure = $1, meaning = $2, explanation = $3, example_jp = $4, example_vi = $5
           WHERE id = $6`,
          [topic.structure, topic.meaning, topic.explanation, topic.exampleJp, topic.exampleVi, grammarDbId]
        );
        console.log(`Updated existing grammar #${grammarDbId} (Lesson ${topic.lessonNumber}): ${topic.pattern}`);
      } else {
        // Insert new grammar item into this lesson
        const ins = await pool.query(
          `INSERT INTO grammars (lesson_id, structure, meaning, explanation, example_jp, example_vi)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [lessonId, topic.structure, topic.meaning, topic.explanation, topic.exampleJp, topic.exampleVi]
        );
        grammarDbId = ins.rows[0].id;
        console.log(`Inserted new grammar #${grammarDbId} (Lesson ${topic.lessonNumber}): ${topic.pattern}`);
        // Add to local cache to prevent duplicate inserts
        lessonGrammars.push({ id: grammarDbId, structure: topic.structure, meaning: topic.meaning });
        existingByLesson.set(topic.lessonNumber, lessonGrammars);
      }

      // Prepare rich AI content payload
      const richContent = {
        grammarId: `g_${grammarDbId}`,
        dbId: grammarDbId,
        topicNumber: topic.topicNumber,
        lessonNumber: topic.lessonNumber,
        grammar: topic.structure,
        pattern: topic.pattern,
        level: 'N4',
        overview: topic.overview,
        formationRules: topic.formationRules,
        usageGuide: topic.usageGuide,
        notes: topic.notes,
        memoryTip: topic.memoryTip,
        similarGrammars: topic.similarGrammars,
        examples: topic.examples,
        exercises: topic.exercises,
        updatedAt: new Date().toISOString()
      };

      // Store in aiContents under multiple keys for resilient matching:
      // 1. Database string ID: `g_123`
      aiContents[`g_${grammarDbId}`] = richContent;
      // 2. Numeric ID as string: `123`
      aiContents[`${grammarDbId}`] = richContent;
      // 3. Exact pattern: `～んです`
      aiContents[topic.pattern] = richContent;
      // 4. Exact structure: topic.structure
      aiContents[topic.structure] = richContent;

      importedGrammars.push({
        id: grammarDbId,
        lessonId: lessonId,
        lessonNumber: topic.lessonNumber,
        structure: topic.structure,
        pattern: topic.pattern,
        meaning: topic.meaning,
        explanation: topic.explanation,
        exampleJp: topic.exampleJp,
        exampleVi: topic.exampleVi
      });
    }

    // Save updated grammarAiContents.json
    fs.writeFileSync(aiContentsPath, JSON.stringify(aiContents, null, 2), 'utf8');
    console.log(`Saved ${Object.keys(aiContents).length} keys to ${aiContentsPath}`);

    // Verify total count in grammars table
    const countRes = await pool.query(`SELECT count(*) FROM grammars`);
    console.log(`Total grammars in database now: ${countRes.rows[0].count}`);

    console.log('✅ Import completed successfully!');
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await pool.end();
  }
}

run();
