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

stmt = db.prepare(`
  CREATE TABLE IF NOT EXISTS my_table (
    Device_Id TEXT NOT NULL,
    Date TEXT NOT NULL,
    Time TEXT NOT NULL,
    Run INTEGER,
    Event INTEGER,
    Data TEXT NOT NULL,
    UNIQUE(Device_Id, Date, Time, Run, Event, Data)
  )
`);

stmt = db.prepare(`
  CREATE TABLE IF NOT EXISTS devices (
    Device_Id INTEGER NOT NULL UNIQUE,
    Name TEXT,
    Connected INTEGER NOT NULL
  )
`);
stmt.run();


stmt.run();


// Define function to insert data into the database
function insertDataIntoDB(params, db, res) {
  try {
    // Extract parameters
    let deviceId = params.device_id;
    let date = params.date;
    let time = params.time;
    let run = params.run;
    let event = params.event;
    let dataString = params.data_string;

    // Prepare and run the insert statement
    let stmt = db.prepare("INSERT INTO my_table (Device_ID, Date, Time, Run, Event, Data) VALUES (?, ?, ?, ?, ?, ?)");

    stmt.run(deviceId, date, time, run, event, dataString);
  } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
          console.log('Combination Already Exists already exists. Insertion failed.');
          res.status(400).send('Combination already exists.');  // send error response
      } else {
          next(error);  // forward other errors to your error handler
      }
  }
}


function changeDeviceConnection(id, connection_status, db) {
  try {
    const stmt = db.prepare("INSERT OR REPLACE INTO devices (Device_Id, Connected) VALUES (?, ?)");
    stmt.run(id, connection_status);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('Device already exists. Attempting to update connection status.');
      updateDeviceConnection(id, connection_status, db);
    } else {
      // Handle other errors as needed
      console.error(error);
    }
  }
}

module.exports.changeDeviceConnection = changeDeviceConnection;
module.exports.insertDataIntoDB = insertDataIntoDB;
module.exports.db = db;