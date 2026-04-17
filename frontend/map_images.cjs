const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dirPath = path.join(__dirname, '../test-data/product_images 2');
const excelPath = path.join(dirPath, 'Menu (1).xlsx');

// 1. Get all image files
const files = fs.readdirSync(dirPath).filter(f => !f.endsWith('.xlsx') && !f.startsWith('.'));

// Create a searchable map of normalized names to exact file names
const fileMap = {};
files.forEach(f => {
  // Normalize by removing extension, replacing underscores/dashes with spaces, ignoring case
  const baseName = f.replace(/\.[^/.]+$/, "");
  const normalized = baseName.replace(/[_-]/g, ' ').toLowerCase().trim();
  fileMap[normalized] = f;
  
  // Also try replacing spaces explicitly
  fileMap[baseName.toLowerCase().trim()] = f;
});

// 2. Read the Excel
const wb = XLSX.readFile(excelPath);
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

// 3. Map the names
let matched = 0;
data.forEach(row => {
  const name = row.Name || row.name || row['Emri i Produktit'] || row['Emri'] || '';
  if (!name) return;

  const normalizedName = name.replace(/[_-]/g, ' ').toLowerCase().trim();
  
  // Try exact normalized match
  let matchedFile = fileMap[normalizedName];
  
  // If not found, try partial matching
  if (!matchedFile) {
    const keys = Object.keys(fileMap);
    for (let k of keys) {
      if (k.includes(normalizedName) || normalizedName.includes(k)) {
        matchedFile = fileMap[k];
        break;
      }
    }
  }

  if (matchedFile) {
    row.ImageFile = matchedFile;
    // ensure Vendi per foto or whatever is synced just in case, but BulkProductImport.jsx prefers ImageFile now
    matched++;
  } else {
    console.log(`Could not find image for: ${name}`);
  }
});

console.log(`Mapped ${matched} out of ${data.length} items to photos.`);

// 4. Save the excel file
const newWs = XLSX.utils.json_to_sheet(data);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newWs, sheetName);
XLSX.writeFile(newWb, path.join(dirPath, 'Menu_Final.xlsx'));

console.log('Saved back to Menu_Final.xlsx!');
