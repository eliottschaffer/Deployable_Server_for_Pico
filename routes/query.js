const express = require('express')
const sqlite3 = require('better-sqlite3');
const json2csv = require('json2csv').parse;
const db = new sqlite3('test2.db');
const Qrouter = express.Router()


let stmt = db.prepare(`CREATE TABLE IF NOT EXISTS my_table (
    Device_Id TEXT NOT NULL,
    Date TEXT NOT NULL,
    Time TEXT NOT NULL,
    Run INTEGER,
    Event INTEGER,
    Data TEXT NOT NULL
  )`);




Qrouter.get('/', (req, res) =>{
    if (req.isAuthenticated()){
    res.render('form')
    } else{
        res.render('auth_fail')
    }
})

Qrouter.post('/', (req, res) => {
    let sql = req.body.sql;
    try {
        let stmt = db.prepare(sql);
        let result = stmt.all();
        let csv = json2csv(result)
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csv);
    } catch (err) {
        res.json({error: err.message});
    }
});

module.exports = Qrouter