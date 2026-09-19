const part1 = require('./n4_part1.cjs');
const part2 = require('./n4_part2.cjs');
const part3 = require('./n4_part3.cjs');
const part4 = require('./n4_part4.cjs');
const part5 = require('./n4_part5.cjs');

const allTopics = [...part1, ...part2, ...part3, ...part4, ...part5];
console.log(`Loaded ${allTopics.length} N4 grammar topics.`);

module.exports = allTopics;
