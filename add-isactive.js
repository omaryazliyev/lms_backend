const { Client } = require('pg');
require('dotenv').config();

async function tryConnect(dbUrl) {
  console.log('Connecting to:', dbUrl.replace(/:[^:]+@/, ':****@')); // Hide password in logs
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  return client;
}

async function main() {
  let client;
  const urlsToTry = [];

  if (process.env.DATABASE_URL) {
    urlsToTry.push(process.env.DATABASE_URL);
  }

  // Fallback 1: replace localhost with db (inside docker)
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
    urlsToTry.push(process.env.DATABASE_URL.replace('localhost', 'db'));
  }

  // Fallback 2: replace db with localhost
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@db:')) {
    urlsToTry.push(process.env.DATABASE_URL.replace('@db:', '@localhost:'));
  }

  // Fallback 3: default docker URL
  urlsToTry.push('postgresql://postgres:postgres@db:5432/bizler?schema=public');
  urlsToTry.push('postgresql://postgres:18062004@localhost:5432/lms?schema=public');

  let success = false;
  for (const url of urlsToTry) {
    try {
      client = await tryConnect(url);
      success = true;
      break;
    } catch (e) {
      console.log(`Failed to connect with url: ${e.message}`);
    }
  }

  if (!success) {
    console.error('CRITICAL: Barcha ulanish urinishlari xato bilan tugadi.');
    process.exit(1);
  }

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
