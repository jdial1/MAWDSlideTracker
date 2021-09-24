
// Fastify & Express import
const fastify = require('fastify')()
const express = require('express')
const router = require('express').Router()
const bodyParser = require('body-parser')
const path = require('path');

// Socket IO import
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// logging import
const morgan = require('morgan')
router.use(morgan('dev'));

const version = '4.1'

const ST = require('./slide-tracking/slide-tracker')
const STR = require('./slide-tracking/reports')
const STCB = require('./slide-tracking/CaseBlockSlideCount.js')
const STFunc = Object.keys(ST)
const STRFunc = Object.keys(STR)
const STCBFunc = Object.keys(STCB);

io.on('connection', (socket) => {
  app.set("socket", socket);
  //ON Connection
  console.log('New connection: '+ socket.client.conn.server.clientsCount +' users connected');

  socket.use((packet, next) => {
    console.log('SOCKET IO MESSAGE: '+JSON.stringify(packet)+'\n')
    next();
  });

  //On Message Request
  socket.on("message", (arg) => {
    console.log(arg); // world
  });

  //On Version Request
  socket.on("version", (arg) => {
    console.log('Version Check: ');
    console.log('-> Client Version: '+arg);
    console.log('-> Server Version: '+version)
    if (arg!=version){
      socket.emit("toast", {text:'The website version is old than expected: Reloading page in 5 minutes.',type:'versionError',color:'danger'});
    }
    socket.emit("BackendVersion", version);
  });

});


router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(express.static('dist'))
router.use('/slidetracker', router)



router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Cache-Control', 'max-age=0')
  if ('OPTIONS' === req.method) {
    console.log('\n')
    console.info('Route Requested: '+req.url.substring(1))
    res.sendStatus(200);
  }else{
    next()
  }
})

router.use(function (req, res) { //Check if requested route is in:
  const route = req.url.substring(1)
  const socket = req.app.get("socket");
  if (!route.includes('socket.io')) {
    console.log('\n')
    console.info('Route Requested: ' + route)
    if (STFunc.includes(route)) {           //SlideTracker Routes
      ST[route](req, res);
    } else if (STRFunc.includes(route)) {    //SlideTrackerReport Routes
      STR[route](req, res);
    } else if (STCBFunc.includes(route)) {   //SlideTrackerCaseBlock Routes
      STCB[route](req, res);
    }else if (route === '') {                 //host frontend vue
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
      console.error("NO ROUTE FOUND: " + route)
    }
  }
})

fastify.register(require('fastify-express'))
    .after(() => {fastify.use(router)})

module.exports = {start}

 function start (port) {
   http.listen(port, "0.0.0.0", () => console.log(`Listening on port ${port}`))
}