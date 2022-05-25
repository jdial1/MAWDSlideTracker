"use strict";

require('dotenv').load();
require('console-info');
require('console-warn');
require('console-error');


let httpServer = require('./http-server');

let port = process.env.HttpPort;
httpServer.start(port,  (err, message) => {
  if (err) console.error(err);
  console.log(message);
});