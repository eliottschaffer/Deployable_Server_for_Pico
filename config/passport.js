const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('better-sqlite3');
const validPassword = require('../utils/auth').validPassword;
const db = require('./database');


function verify(username, password, cb) {
    try {
        let stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        let user = stmt.get(username);
    
        if (!user) {
            return cb(null, false);
        }
        
        validPassword(password, user, cb);
    
    } catch (err) {
        return cb(err);
    }
}


const strategy = new LocalStrategy(verify);


passport.use(strategy);

passport.serializeUser((user, cb) => {
    cb(null, user.id);
})

passport.deserializeUser((userId, cb) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (user) {
        cb(null, user);
    } else {
        cb(new Error('User not found: ' + userId));
    }
});
