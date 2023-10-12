// ES6 imports
import os from 'os';
import http from 'http';
import io from 'socket.io';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import packageInfo from '../package.json' assert { type: 'json' };

const { localVersion } = packageInfo;
const STATION_NAME = os.hostname();
const SLIDE_QUEUE_PATH = `/media/slideprinters/slidequeue/${STATION_NAME}`;
const WEBSOCKET_PORT = '8001';

// Function to start the server
(function startServer() {
  // Create an HTTP server and make it listen on the WEBSOCKET_PORT
  const server = http.createServer().listen(WEBSOCKET_PORT, () => {
    console.log(`Server listening on port ${WEBSOCKET_PORT}`);
  });
  // Initialize a socket.io server using the HTTP server
  const socketServer = io(server);
  // List all available serial ports to identify the barcode scanner
  SerialPort.list().then((data) => {
    const scanner = data.find((port) => port.serialNumber === 'USB_CDC_Symbol_Scanner');
    if (!scanner) {console.log('Scanner Not Found');return;}
    // Setup the SerialPort instance for reading barcode scanner data
    const parser = new SerialPort({ path: scanner.path, baudRate: 9600, parser: new ReadlineParser({ delimiter: '\r\n' }) });
    // Setup the socket.io server to listen for incoming connections and barcode scan events
    socketServer.on('connection', (socket) => {
      // Whenever a barcode scan occurs, forward the data to the connected client(s)
      parser.on('data', (barcodeScanData) => {
        socket.emit('stream', { barcodeScanData, STATION_NAME, SLIDE_QUEUE_PATH, localVersion });
      });
    });
    console.log('Scanner Found');
  });
})();

