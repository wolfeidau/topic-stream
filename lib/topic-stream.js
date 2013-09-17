"use strict";
/*
 * topic-stream
 * https://github.com/wolfeidau/topic-stream
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */
var log = require('debug')('topic_stream')
var through = require('through2');

/**
 * Builds a writable stream which translates objects written to into JSON messages which it sends over an AMQP topic.
 * @param {Object} options this expects a connection and optionally an exchangeName parameter, along with the normal params for an AMQP exchange.
 * @param {Function} cb This returns err and a writable stream.
 */
module.exports = function (options, cb) {

  var connection = options.connection;
  var exchangeName = options.exchangeName || '';
  var params = options.params || {contentEncoding: 'utf8', contentType: 'application/json', durable: true};

  connection.on('error', log);

  log('exchangeName', exchangeName);

  var opts = {type: 'topic', durable: true};

  connection.exchange(exchangeName, opts, function (exchange) {
    log('Exchange', exchange.name, 'open');
    var stream = through({ objectMode: true },
      function write(chunk, enc, callback) {
        log('write', chunk);
        var routingKey = chunk._routingKey || '';
        // remove the routing key from the payload
        delete chunk._routingKey;
        exchange.publish(routingKey, JSON.stringify(chunk), params);
        callback();
      },
      function end() {
        exchange.close();
      }
    );

    // propagate any errors.
    connection.on('error', function (err) {
      stream.emit('error', err);
    });

    cb(null, stream);
  })


};