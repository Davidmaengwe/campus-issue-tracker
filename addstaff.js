const crypto = require('crypto');
const db = require('./db');

const [, , username, password, fullName] = process.argv;

if (!username || !password) {
  console.log('Usage: node addstaff.js username password "Full Name"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

db.prepare(
  'INSERT INTO staff (username, password_hash, salt, full_name) VALUES (?, ?, ?, ?)'
).run(username, hash, salt, fullName || username);

console.log('Staff created:', username);