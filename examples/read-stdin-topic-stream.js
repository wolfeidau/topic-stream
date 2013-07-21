"use strict";

var es = require('event-stream')
var amqp = require('amqp')
var topicStream = require('../lib/topic-stream.js')
var log = require('debug')('read-stdin-topic-stream')

var connection =
  amqp.createConnection({url: "amqp://guest:guest@localhost:5672"})

connection.on('ready', function () {
  log('Connection', 'open')

  topicStream({connection: connection, exchangeName: '/events/input', routingKey: '#'}, function (err, ts) {
    log('topicStream', 'open')
    es.pipeline(process.openStdin(), es.split(), ts)
  })
})