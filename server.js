const express = require('express');
const sqlite3 = require('better-sqlite3');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const Qrouter = require('./routes/query');
const db = require('./config/database').db;
const insertDataIntoDB = require('./config/database').insertDataIntoDB;

const session = require('express-session');
var passport = require('passport');


const SqliteStore = require("better-sqlite3-session-store")(session)
const dbsession = new sqlite3("sessions.db", { verbose: console.log });

app.use(bodyParser.urlencoded({ extended: true }));


//Session setup
app.use(
  session({
    store: new SqliteStore({
      client: dbsession, 
      expired: {
        clear: true,
        intervalMs: 900000 //ms = 15min
      }
    }),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day experies
    }
  })
)


//Password authentication
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());



app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/query', Qrouter);



// Prepare SQL insert statement
app.use('/data/:device_id/:date/:time/:run/:event/:data_string', (req, res) => {
    insertDataIntoDB(req.params, db, res);
    res.sendStatus(200);  // Respond to the request indicating success
});


app.listen(3000, () => {
  console.log(`Server listening at http://localhost:3000`);
});