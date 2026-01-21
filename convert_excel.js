import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const workbook = XLSX.readFile('first and second week (1).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const exercises = [];
const gridData = {};
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Simple heuristic: read until we hit a header row or empty long gap
// We assume the first block is Week 1.
let rowIndex = 0;

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const exerciseName = row[0];

    // Stop if we hit a header row (starts with "HAREKETLER") or empty name
    if (!exerciseName || exerciseName.toString().includes("HAREKETLER")) {
        // If it's the first row and looks like header, skip it.
        // But in our dump, the first row WAS data: "Incline Chest Press..."
        // The header "HAREKETLER" appeared at row 19.
        if (i > 0) {
            console.log(`Stopping at row ${i} (found separator or end)`);
            break;
        }
        continue;
    }

    // Add exercise
    exercises.push(exerciseName);

    // Add data for columns 1-7
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const cellValue = row[dayIdx + 1]; // Col 1 is Mon, etc.
        if (cellValue && cellValue !== '-') {
            // gridData key: "rowIndex-DayId"
            // NOTE: rowIndex follows the "exercises" array index
            gridData[`${rowIndex}-${days[dayIdx]}`] = cellValue.toString();
        }
    }
    rowIndex++;
}

const output = {
    exercises,
    gridData
};

fs.writeFileSync('src/data_import.json', JSON.stringify(output, null, 2));
console.log("Conversion complete. Saved to src/data_import.json");
console.log(`Extracted ${exercises.length} exercises.`);
