"use strict";
require('dotenv').load();
require('console-info');
require('console-warn');
require('console-error');
require('./http-server')
    .start(process.env.HttpPort, function (err, message) {
  if (err) console.error(err);
  console.log(message);
});