require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { connectDatabase } = require('../config/database');
const Category = require('../models/Category');

async function importCategories() {
  const filePath = path.join(__dirname, '..', 'data', 'categories.json');
  const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('categories.json must contain a non-empty JSON array.');
  }

  await connectDatabase();
  const result = await Category.bulkWrite(
    categories.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $set: category },
        upsert: true
      }
    }))
  );

  console.log(`Imported ${categories.length} categories (${result.upsertedCount} inserted, ${result.modifiedCount} updated).`);
}

importCategories()
  .catch((error) => {
    console.error(`Category import failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
