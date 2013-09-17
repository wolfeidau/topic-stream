"use strict";

var chai = require('chai');

var log = require('debug')('test:topic-stream');
var amqp = require('amqp');

var topicStream = require('../lib/topic-stream.js');

var expect = chai.expect;

var opts = {type: 'topic', durable: true};

describe('TopicStream', function () {

  function createQueue(connection, onData, cb) {
    connection.exchange('/test/events1234', opts, function (ex) {
      log('Exchange', ex.name, 'open');
      connection.queue('/queue/sometest', {"x-message-ttl": 30000, "durable": true}, function (queue) {
        log('Queue', queue.name, 'open');
        queue.bind(ex, 'test');
        // Receive messages
        queue.subscribe(onData);
        log('queue', 'cb');
        cb(queue)
      })
    })
  }

  it('should create a new topic stream', function (done) {

    var connection =
      amqp.createConnection({url: "amqp://guest:guest@localhost:5672"});

    connection.on('ready', function () {
      log('Connection', 'open');

      topicStream({connection: connection, exchangeName: '/test/events123'}, function (err, stream) {
        expect(err).to.not.exist;
        expect(stream).to.exist;
        stream.end();
        done()
      });

    });
  });

  it('should send data', function (done) {

    var connection =
      amqp.createConnection({url: "amqp://guest:guest@localhost:5672"});

    connection.on('ready', function () {
      log('Connection', 'open');

      createQueue(connection, function onData(message, headers, deliveryInfo) {
        log('message', message);
        log('deliveryInfo', deliveryInfo.routingKey);
        expect(message).to.have.property('text');
        expect(message.text).to.equal('something');
        done();

      }, function () {
        topicStream({connection: connection, exchangeName: '/test/events1234'}, function (err, stream) {
          stream.write({text: 'something', _routingKey:'test'});
          // this write should never hit the subscribed queue as it doesn't match the routing key.
          stream.write({text: 'something', _routingKey:'ddd'});
          stream.end();
        })
      });

    });

  });

});