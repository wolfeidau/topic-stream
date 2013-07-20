"use strict";
/*
 * topic-stream
 * https://github.com/wolfeidau/topic-stream
 *
 * Copyright (c) 2013 Mark Wolfe
 * Licensed under the MIT license.
 */
var log = require('debug')('topic_stream')
var through = require('through')

module.exports = function (options, cb) {

  var connection = options.connection
  var exchangeName = options.exchangeName || ''
  var params = options.params || {contentEncoding: 'utf8', contentType: 'application/json'}

  log('exchangeName', exchangeName)

  connection.exchange(exchangeName, {type: 'topic'}, function (exchange) {
    log('Exchange', exchange.name, 'open')
    var stream = through(
      function write(data) {
        var routingKey = data.routingKey;
        // remove the routing key from the payload
        delete data.routingKey
        if (routingKey) {
          exchange.publish(routingKey, JSON.stringify(data), params)
        }
        else {
          exchange.publish('', JSON.stringify(data), params)
        }
      },
      function end() {
        exchange.close()
      }
    )

    cb(null, stream)
  })


}