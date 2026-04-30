const fs = require('fs');
const newItems = require('./new_data.json');

const code = fs.readFileSync('src/CurrentAffairsGuide.tsx', 'utf-8');
const initialDataMatch = code.match(/const initialData: qaItem\[\] = \[\s*([^]*?)\s*\];/);

let existingItems = [];
if (initialDataMatch && initialDataMatch[1]) {
    try {
        // Evaluate the array contents as JavaScript (since it's not valid JSON due to single quotes or missing quotes around keys in some cases, though it uses object literals).
        const arrayStr = `[${initialDataMatch[1].replace(/\/\/.*?(\n|$)/g, '')}]`;
        existingItems = eval(arrayStr);
    } catch (e) {
        console.error('Failed to parse existing array', e);
    }
}

const allItems = [...existingItems, ...newItems].filter((v, i, a) => a.findIndex(t => t.q === v.q) === i);

console.log('Total combined:', allItems.length);

const arrayRows = allItems.map(item => `  {q:${JSON.stringify(item.q)},a:${JSON.stringify(item.a)},tag:${JSON.stringify(item.tag)},cat:${JSON.stringify(item.cat)}}`);
const newArrayString = `const initialData: qaItem[] = [\n${arrayRows.join(',\n')}\n];`;

const newCode = code.replace(/const initialData: qaItem\[\] = \[\s*[^]*?\s*\];/, newArrayString);
fs.writeFileSync('src/CurrentAffairsGuide.tsx', newCode);
console.log('Successfully updated src/CurrentAffairsGuide.tsx');
