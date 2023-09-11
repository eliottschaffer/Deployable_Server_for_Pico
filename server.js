const express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
const sqlite3 = require('better-sqlite3');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const Qrouter = require('./routes/query');
const db = require('./config/database').db;
const insertDataIntoDB = require('./config/database').insertDataIntoDB;
const changeDeviceConnection = require('./config/database').changeDeviceConnection;

const WebSocket = require('ws');


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

// Create a Map to store WebSocket connections
const wsConnections = new Map();


// // Prepare SQL insert statement
// app.use('/data/:device_id/:date/:time/:run/:event/:data_string', (req, res) => {
//     insertDataIntoDB(req.params, db, res);
//     res.sendStatus(200);  // Respond to the request indicating success
// });


// Route to manually send a ping frame to a specific WebSocket connection
app.get('/ping/:id', (req, res) => {
  const targetId = parseInt(req.params.id, 10); // Parse the ID from the URL parameter

  // Find the WebSocket connection associated with the target ID
  const targetWebSocket = wsConnections.get(targetId);

  if (targetWebSocket) {
    // Send a ping frame to the target WebSocket connection
    targetWebSocket.ping();
    res.status(200).send(`Ping sent to WebSocket with ID ${targetId}`);
  } else {
    res.status(404).send(`WebSocket with ID ${targetId} not found`);
  }
});


app.ws('/data', function(ws, req) {

  ws.on('message', function(msg) {

    const frame_code = msg[0];

    if(frame_code == 0x01){
      const idBytes = msg.slice(1, 3);
      const id = (idBytes[0] << 8) | idBytes[1]; // Combine bytes into an integer
      
      // Store the WebSocket session in the Map with the ID as the key
      wsConnections.set(id, ws);

      console.log('Frame Code:', frame_code);
      console.log('ID:', id);

      changeDeviceConnection(id, 1, db);

    }

    console.log(msg);
  });



  // Pong handler
  ws.on('pong', function(data) {
    const idBytes = data.slice(1, 3);
    const id = (idBytes[0] << 8) | idBytes[1]; // Combine bytes into an integer

    // Update the WebSocket connections map with the ID as the key
    wsConnections.set(id, ws);

    console.log('Pong received for ID:', id);
    // Handle the pong data as needed

    // You can also perform actions or checks on the WebSocket connection here
  });
  
  console.log('socket', req.testing);
});




app.listen(8080, () => {
  console.log(`Server listening at http://localhost:8080`);
});