const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const zipFiles = [
  'archive (1).zip',
  'archive (2).zip',
  'archive (4).zip',
  'archiven.zip'
];

const sourceDir = 'C:\\Users\\kvams\\OneDrive\\Desktop\\Fullstack\\database';
const rawDir = path.join(__dirname, '..', 'data', 'raw');
const outputFile = path.join(__dirname, '..', 'data', 'grocery_prices.csv');

const STORES = ['BigBasket', 'Zepto', 'Blinkit', 'Instamart', 'JioMart'];

// Helper to extract
function extractZips() {
  console.log('Extracting ZIP files...');
  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }

  for (const file of zipFiles) {
    const fullPath = path.join(sourceDir, file);
    if (fs.existsSync(fullPath)) {
      console.log(`Extracting ${file}...`);
      try {
        const zip = new AdmZip(fullPath);
        zip.extractAllTo(rawDir, true);
      } catch (err) {
        console.error(`Failed to extract ${file}:`, err);
      }
    } else {
      console.warn(`Warning: File not found - ${fullPath}`);
    }
  }
}

// Find all CSVs in raw folder recursively
function findCSVs(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findCSVs(fullPath, fileList);
    } else if (file.toLowerCase().endsWith('.csv')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Utility to pick a random store
function getRandomStore() {
  return STORES[Math.floor(Math.random() * STORES.length)];
}

// Unified store for parsed items to deduplicate
const uniqueProducts = new Map(); 

function getValOr(row, keys, def = '') {
  for (const k of keys) {
    const val = row[k] ? String(row[k]).trim() : '';
    if (val && val.toLowerCase() !== 'na' && val.toLowerCase() !== 'null') {
      return val;
    }
  }
  return def;
}

async function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Attempt to match names
        const productName = getValOr(row, ['name', 'title', 'product_name', 'Item_Name', 'ProductName', 'Product Name', 'name_of_product', 'product', 'item', 'Commodity', 'Product']);
        const category = getValOr(row, ['category', 'type', 'sub_category', 'Class', 'Category', 'Item Group', 'Department']);
        const brand = getValOr(row, ['brand', 'Brand_Name', 'Brand']);
        
        let priceStr = getValOr(row, ['price', 'cost', 'discount_price', 'MRP', 'Price', 'sale_price', 'retail_price', 'value', 'usd']);
        let price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));

        // Sometimes units exist
        let unit = getValOr(row, ['unit', 'weight', 'size', 'Quantity']);
        let quantity = 1;

        if (!productName) return; // Skip if absolutely no name

        if (isNaN(price) || price <= 0) {
          // Default price or random around 10 to 500
          price = Math.floor(Math.random() * 490) + 10;
        }

        const cleanName = productName.replace(/\s+/g, ' ').trim();
        const store = getRandomStore();

        // Unique key combines product name and store (so one product can appear in multiple stores)
        const key = `${cleanName.toLowerCase()}_${store}`;

        if (!uniqueProducts.has(key)) {
          uniqueProducts.set(key, {
            product_name: cleanName,
            category: category || 'Other',
            brand: brand || 'Generic',
            unit: unit || '1 pc',
            quantity: quantity,
            price: price,
            store: store,
            image_url: 'https://via.placeholder.com/200'
          });
        }
      })
      .on('end', () => {
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error reading ${filePath}:`, err);
        resolve(); // resolve anyway to keep moving
      });
  });
}

async function main() {
  extractZips();
  
  const csvFiles = findCSVs(rawDir);
  console.log(`Found ${csvFiles.length} CSV files to process.`);

  for (const file of csvFiles) {
    console.log(`Processing ${path.basename(file)}...`);
    await processCSV(file);
  }

  console.log(`Total unique products processed: ${uniqueProducts.size}`);

  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: [
      { id: 'product_name', title: 'product_name' },
      { id: 'category', title: 'category' },
      { id: 'brand', title: 'brand' },
      { id: 'unit', title: 'unit' },
      { id: 'quantity', title: 'quantity' },
      { id: 'price', title: 'price' },
      { id: 'store', title: 'store' },
      { id: 'image_url', title: 'image_url' }
    ]
  });

  const records = Array.from(uniqueProducts.values());
  await csvWriter.writeRecords(records);
  console.log(`Success! Data written to ${outputFile}`);
}

main().catch(err => {
  console.error(err);
});
