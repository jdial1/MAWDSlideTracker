
// Fastify & Express import
const express = require('express')
const app = express()
const router = require('express').Router()
const bodyParser = require('body-parser')
const path = require('path');

// // Socket IO import
var http = require('http').Server(app);
var io = require('socket.io')(http);

// logging import
const morgan = require('morgan')
router.use(morgan('dev'));

const version = '4.3'

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
      socket.emit("toast", {text:'The website version ('+arg+') is old than expected ('+version+'): Please reload the page.',type:'versionError',color:'danger'});
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

app.use(function (req, res) { //Check if requested route is in:
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


///////// OLD ROUTES FAILOVER ////
app.post('/getuserinfo', function (request, response) {
  ST.getUserInfo(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/getpartblockcurrentandtotals', function (request, response) {
  ST.getPartBlockCurrentAndTotals(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/updateslidetoprint', function (request, response) {
  ST.updateSlideToPrint(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/printslides', function (request, response) {
  ST.printSlides(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/histodata', function (request, response) {
  ST.histoData(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/slidedistribution', function (request, response) {
  ST.slideDistribution(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/GetBlockData', function (request, response) {
  ST.GetBlockData(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/SetBlockData', function (request, response) {
  ST.SetBlockData(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/GetStatusData', function (request, response) {
  ST.GetStatusData(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/GetCassEngLoc', function (request, response) {
  ST.GetCassEngLoc(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/caseinquiry', (request, response) => {
  ST.caseinquiry(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(request)
    console.log(message)
  })
})

app.post('/reports', function (request, response) {
  STR.reports(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.get('/slideparameters', (request, response) => {
  ST.pullSlides(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/caseblockslidecount', (request, response) => {
  STCB.caseblockslidecount(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})

app.post('/caseblockslidecountdetails', (request, response) => {
  STCB.caseblockslidecountdetails(request, response, function (err, message) {
    if (err) return console.log(err)
    console.log(message)
  })
})
///////// OLD ROUTES FAILOVER ////


module.exports = {start}

 function start (port) {
   http.listen(port, "0.0.0.0", () => console.log(`Listening on port ${port}`))
}