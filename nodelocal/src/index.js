const SlideQueuePath = '/media/slideprinters/slidequeue/JustinTest/';
const StationName = 'TestStation1';
const WebSocketPort = '8001';

const { localVersion } = require('../package.json');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const http = require('http');
const io = require('socket.io');

const startServer = () => {
  const server = http.createServer().listen(WebSocketPort, () => {
    console.log(`Server listening on port ${WebSocketPort}`);
  });

  SerialPort.list().then((data) => {
    const scanner = data.find((port) => port.serialNumber === 'USB_CDC_Symbol_Scanner');
    if (!scanner) {console.log('Scanner Not Found');return;}
    const parser = new SerialPort({ path: scanner.path, baudRate: 9600 }).pipe(new ReadlineParser({ delimiter: '\r\n' }));
    io(server).on('connection', (socket) => {
      console.log(`${socket.client.conn.server.clientsCount} user(s) connected`);
      parser.on('data', (barcodeScanData) => {
        console.log(`${JSON.stringify({ barcodeScanData, StationName, SlideQueuePath, localVersion }, null, 2)}`);
        socket.emit('stream', { barcodeScanData, StationName, SlideQueuePath, localVersion });
      });
    });
    console.log('Scanner Found');
  });
};

startServer();
