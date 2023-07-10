
// Fastify & Express import
const express = require('express')
const app = express()
const router = require('express').Router()
const bodyParser = require('body-parser')

// // Socket IO import
let http = require('http').Server(app);
let io = require('socket.io')(http);

// logging import
const morgan = require('morgan')
router.use(morgan('dev'));

const { version } = require('../package.json');

const ST = require('./slide-tracking/slide-tracker')
const STR = require('./slide-tracking/reports')
const STCB = require('./slide-tracking/CaseBlockSlideCount.js')
const STFunc = Object.keys(ST)
const STRFunc = Object.keys(STR)
const STCBFunc = Object.keys(STCB);

io.on('connection', (socket) => {
  app.set("socket", socket);
  console.log('New connection: '+ socket.client.conn.server.clientsCount +' users connected');
  socket.use((packet, next) => {
    console.log('SOCKET IO MESSAGE: '+JSON.stringify(packet)+'\n')
    next();
  });

  //On Message Request
  socket.on("message", (arg) => {
    console.log(arg);
  });

  socket.on("engraverUpdate", (arg) => {
    io.emit('engUpdate', {})
    // console.log(arg);
  });

  //On Version Request
  socket.on("version", (arg) => {
    console.log(arg)
    console.log(version)
    if (arg != version) {
      socket.emit("toast", {content:'The website version ('+arg+') is old than expected ('+version+'): Please reload the page.',title:'versionError',variant:'danger'});
    }
    socket.emit("BackendVersion", version);
  });

});


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('dist'))
app.use('/slidetracker', router)

app.use(function (req, res, next) {
  console.log('\n')
  console.info('Route Requested: '+req.url.substring(1))
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Cache-Control', 'no-cache, must-revalidate')
  res.setHeader('Cache-Control', 'max-age=0')
  if ('OPTIONS' === req.method) {
    console.log('\n')
    console.info('Route Requested: '+req.url.substring(1))
    res.sendStatus(200);
  }else{
    next()
  }
})

app.use( (req, res) => { //Check if requested route is in:
  const route = req.url.substring(1)
  if (!route.includes('socket.io')) {
    console.log('\n')
    console.info('Route Requested: ' + route)
    if (STFunc.includes(route)) {           //SlideTracker Routes
      ST[route](req, res);
    } else if (STRFunc.includes(route)) {    //SlideTrackerReport Routes
      STR[route](req, res);
    } else if (STCBFunc.includes(route)) {   //SlideTrackerCaseBlock Routes
      STCB[route](req, res);
    } else {
      console.error("NO ROUTE FOUND: " + route)
    }
  }
})

module.exports = {start}

function start  (port) {
  http.listen(port||2081, "0.0.0.0", () => console.log(`Listening on port ${port||2081}`))
}