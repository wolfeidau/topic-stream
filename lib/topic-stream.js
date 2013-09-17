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
module.exports = function (open, options, cb) {

  var exchangeName = options.exchangeName || '';
  var params = options.params || {contentEncoding: 'utf8', contentType: 'application/json', durable: true};

  log('exchangeName', exchangeName);

  var exchangeOpts = {durable: true};

  open.then(function(conn){
    log('connection', 'open')
    var ok = conn.createChannel();

    ok = ok.then(function(ch){

      var ok = ch.assertExchange(exchangeName, 'topic', exchangeOpts);

      return ok.then(function() {

        log('Exchange', exchangeName, 'open');

        var stream = through({ objectMode: true },
          function write(chunk, enc, callback) {
            log('write', chunk);
            var routingKey = chunk._routingKey || '';
            // remove the routing key from the payload
            delete chunk._routingKey;
            ch.publish(exchangeName, routingKey, new Buffer(JSON.stringify(chunk)), params);
            callback();
          });

        cb(null, stream);
      }, console.warn);

    }, console.warn);

    return ok;
  }).then(null, console.warn);

};