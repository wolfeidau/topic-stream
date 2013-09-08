# topic-stream [![Build Status](https://drone.io/github.com/wolfeidau/topic-stream/status.png)](https://drone.io/github.com/wolfeidau/topic-stream/latest)

The topic-stream is a writable stream which translates objects written to into JSON messages which it sends over an AMQP topic.

[![NPM](https://nodei.co/npm/topic-stream.png)](https://nodei.co/npm/topic-stream/)
[![NPM](https://nodei.co/npm-dl/topic-stream.png)](https://nodei.co/npm/topic-stream/)

# Example

This is a simple example using [event-stream](https://github.com/dominictarr/event-stream) to pipeline data entered via stdin, split it into lines and send it via topic stream to `/events/input` over AMQP.

```javascript
"use strict";

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
```

Anything sent to stdin on the process will be split into lines and packaged into AMQP messages.

# TODO

* Add the option to just pass an AMQP URL.

## License
Copyright (c) 2013 Mark Wolfe
Licensed under the MIT license.