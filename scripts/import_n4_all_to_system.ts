import fs from 'fs';
import path from 'path';
import { pool } from '../src/db/index';

// Load the 49 topics
import allTopics from './n4_all_topics.cjs';

async function run() {
  console.log(`Starting import of ${allTopics.length} N4 grammar topics...`);

  try {
    // 1. Fetch all N4 lessons
    const lessonsRes = await pool.query(
      `SELECT id, lesson_number, title_vi, title_jp FROM lessons WHERE lesson_number BETWEEN 26 AND 50 ORDER BY lesson_number ASC`
    );
    console.log(`Found ${lessonsRes.rows.length} N4 lessons in database.`);
    const lessonMap = new Map<number, number>(); // lesson_number -> id
    for (const row of lessonsRes.rows) {
      lessonMap.set(row.lesson_number, row.id);
    }

    // 2. Fetch all existing grammars in N4
    const existingGrammarsRes = await pool.query(`
      SELECT g.id, g.lesson_id, g.structure, g.meaning, l.lesson_number 
      FROM grammars g
      JOIN lessons l ON g.lesson_id = l.id
      WHERE l.lesson_number BETWEEN 26 AND 50
    `);
    console.log(`Found ${existingGrammarsRes.rows.length} existing grammar items in N4 lessons.`);

    // Map existing by lesson_number
    const existingByLesson = new Map<number, Array<{ id: number; structure: string; meaning: string }>>();
    for (const g of existingGrammarsRes.rows) {
      if (!existingByLesson.has(g.lesson_number)) {
        existingByLesson.set(g.lesson_number, []);
      }
      existingByLesson.get(g.lesson_number)!.push(g);
    }

    // Read current grammarAiContents.json
    const aiContentsPath = path.join(process.cwd(), 'src/data/grammarAiContents.json');
    let aiContents: Record<string, any> = {};
    if (fs.existsSync(aiContentsPath)) {
      try {
        aiContents = JSON.parse(fs.readFileSync(aiContentsPath, 'utf8'));
      } catch (e: any) {
        console.warn('Error reading existing grammarAiContents.json:', e.message);
      }
    }

    let updatedCount = 0;
    let insertedCount = 0;
    const processedGrammarIds = new Set<number>();

    // Process each of the 49 topics
    for (const topic of allTopics) {
      const lessonId = lessonMap.get(topic.lessonNumber);
      if (!lessonId) {
        console.error(`Missing lessonId for lesson ${topic.lessonNumber}`);
        continue;
      }

      const lessonGrammars = existingByLesson.get(topic.lessonNumber) || [];
      const cleanPattern = topic.pattern.replace(/[～〜\s]/g, '');

      // Find matching existing grammar in this lesson that hasn't been claimed yet
      const match = lessonGrammars.find(g => {
        if (processedGrammarIds.has(g.id)) return false;
        const cleanG = (g.structure || '').replace(/[～〜\s]/g, '');
        return cleanG === cleanPattern || cleanG.includes(cleanPattern) || cleanPattern.includes(cleanG);
      });

      let grammarDbId: number;

      if (match) {
        // Update existing grammar with richer explanation and examples, preserving user progress and ID
        grammarDbId = match.id;
        processedGrammarIds.add(grammarDbId);
        await pool.query(
          `UPDATE grammars 
           SET structure = $1, meaning = $2, explanation = $3, example_jp = $4, example_vi = $5
           WHERE id = $6`,
          [topic.structure, topic.meaning, topic.explanation, topic.exampleJp, topic.exampleVi, grammarDbId]
        );
        updatedCount++;
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
        processedGrammarIds.add(grammarDbId);
        insertedCount++;
        console.log(`Inserted new grammar #${grammarDbId} (Lesson ${topic.lessonNumber}): ${topic.pattern}`);
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
      aiContents[`g_${grammarDbId}`] = richContent;
      aiContents[`${grammarDbId}`] = richContent;
      aiContents[topic.pattern] = richContent;
      aiContents[topic.structure] = richContent;
    }

    // Save updated grammarAiContents.json
    fs.writeFileSync(aiContentsPath, JSON.stringify(aiContents, null, 2), 'utf8');
    console.log(`Saved ${Object.keys(aiContents).length} keys to ${aiContentsPath}`);

    // Verify total count in grammars table
    const countRes = await pool.query(`SELECT count(*) FROM grammars`);
    console.log(`Total grammars in database now: ${countRes.rows[0].count} (Updated: ${updatedCount}, Inserted: ${insertedCount})`);

    console.log('✅ Import completed successfully!');
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    await pool.end();
  }
}

run();
