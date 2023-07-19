const express = require('express')
const router = express.Router()
const passport = require('passport');
const db = require('../config/database');
const genPassword = require('../utils/auth').genPassword;


router.get('/', (req, res) =>{
    
    console.log(req.session);
    if (req.session.viewCount){
        req.session.viewCount = req.session.viewCount + 1;
    }else{
        req.session.viewCount = 1
    }
    res.render('index', { count: req.session.viewCount})
})

router.get('/login', (req, res) =>{
    res.render('login')
})

router.get('/register', (req, res) =>{
    res.render('register')
})

//Post Routes
router.post('/login', passport.authenticate('local', { failureRedirect: '/auth_fail', successRedirect: "/"}));

router.post('/register', (req,res,next) => {
    const saltHash = genPassword(req.body.password);


    const newUser = {
        username: req.body.username,
        salt: saltHash.salt,
        hashed_password: saltHash.hash,
        created_date: new Date().toISOString()
    }

    let stmt = db.prepare(`
    INSERT INTO users (username, hashed_password, salt, created_date)
    VALUES (?, ?, ?, ?)
    `)

    try {
        stmt.run(newUser.username, newUser.hashed_password, newUser.salt, newUser.created_date);
        res.redirect('/login');  // redirect to login page after successful registration
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.log('Username already exists. Insertion failed.');
            res.status(400).send('Username already exists.');  // send error response
        } else {
            next(error);  // forward other errors to your error handler
        }
    }

});




module.exports = router