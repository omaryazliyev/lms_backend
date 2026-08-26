const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false');
    console.log('SUCCESS: isActive ustuni qoshildi!');
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await client.end();
  }
}

main();
