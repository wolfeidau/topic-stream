"use strict";
/*
 * This example is designed to be run from the command line as follows.
 *
 * tail /var/log/syslog | node examples/read-stdin-topic-stream.js
 *
 * This program will split the input file on line end and send write each line the configured topic.
 */

var es = require('event-stream');
var amqp = require('amqp');
var topicStream = require('../index.js');
var log = require('debug')('read-stdin-topic-stream');

// exit once we have processed the data that was piped in.
process.stdin.on('close', process.exit);

var connection =
  amqp.createConnection({url: "amqp://guest:guest@localhost:5672"});

connection.on('ready', function () {
  log('Connection', 'open');

  topicStream({connection: connection, exchangeName: '/events/syslog'}, function (err, ts) {
    log('topicStream', 'open');
    es.pipeline(process.stdin, es.split(), ts);
  });
});