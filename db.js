const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('reports.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT,
    category TEXT,
    building TEXT,
    description TEXT,
    photo TEXT,
    status TEXT DEFAULT 'Submitted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    salt TEXT,
    full_name TEXT
  )
`);

module.exports = db;