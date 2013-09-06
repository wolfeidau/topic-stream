"use strict";

var chai = require('chai');

var log = require('debug')('test:topic-stream');
var amqp = require('amqp');

var topicStream = require('../lib/topic-stream.js');

var expect = chai.expect;

describe('TopicStream', function () {

  function createQueue(connection, onData, cb) {
    connection.exchange('/test/events1234', {}, function (ex) {
      log('Exchange', ex.name, 'open');
      connection.queue('/queue/events1234', function (queue) {
        log('Queue', queue.name, 'open');
        queue.bind(ex, '#');
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

      topicStream({connection: connection, exchangeName: '/test/events123', routingKey: '#'}, function (err, stream) {
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

      createQueue(connection, function onData(message) {
        log('message', message)
        expect(message).to.have.property('text')
        expect(message.text).to.equal('something')
        done()

      }, function () {
        topicStream({connection: connection, exchangeName: '/test/events1234', routingKey: '#'}, function (err, stream) {
          stream.write({text: 'something'});
          stream.end();
        })
      });

    });

  });

});