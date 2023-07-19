const sqlite3 = require('better-sqlite3');
const db = new sqlite3('test2.db');

// Create users table if it doesn't already exist
let stmt = db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
stmt.run();

stmt = db.prepare(`CREATE TABLE IF NOT EXISTS my_table (
    Device_Id TEXT NOT NULL,
    Date TEXT NOT NULL,
    Time TEXT NOT NULL,
    Run INTEGER,
    Event INTEGER,
    Data TEXT NOT NULL
  )`);
  
stmt.run();

module.exports = db;