const SlideQueuePath='/media/slideprinters/slidequeue/JustinTest/'
const StationName='JustinTest'
const BarcodeScannerPort='COM3'
const WebSocketPort='8001'

const { localVersion } = require('../package.json');
const SerialPort = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const parser = new SerialPort(BarcodeScannerPort).pipe(new ReadlineParser({ delimiter: '\r\n' }));
const server = require("http").createServer();
const io = require('socket.io').listen(server);
server.listen(WebSocketPort);

io.sockets.on('connection', (socket) => {
    console.log(socket.client.conn.server.clientsCount + " user(s) connected" );
    parser.on('data', (barcodeScanData) => {
      console.log(`${JSON.stringify({barcodeScanData, StationName, SlideQueuePath, localVersion}, null, 2)}`)
      socket.emit('stream', {barcodeScanData, StationName, SlideQueuePath, localVersion})
    })
});