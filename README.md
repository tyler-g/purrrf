# purrrf

![Build Status](https://img.shields.io/travis/tyler-g/purrrf.svg)
[![codecov](https://codecov.io/gh/tyler-g/purrrf/branch/master/graph/badge.svg)](https://codecov.io/gh/tyler-g/purrrf)
![Downloads](https://img.shields.io/npm/dm/purrrf.svg)
![Downloads](https://img.shields.io/npm/dt/purrrf.svg)
![npm version](https://img.shields.io/npm/v/purrrf.svg)
![dependencies](https://img.shields.io/david/tyler-g/purrrf.svg)
![dev dependencies](https://img.shields.io/david/dev/tyler-g/purrrf.svg)
![License](https://img.shields.io/npm/l/purrrf.svg)

a lightweight utility for measuring accurate performance timings in the browser or in nodejs

## Getting Started

Install it via npm:

```shell
npm install purrrf
```

And include in your project:

```javascript
var purrrf = require('purrrf'); // nodejs, requirejs, or any framework that supports require
```

Or use browserify to build a requirable module for the browser:
```shell
browserify src/index.js -o purrrf.js
```
```html
<script src="purrrf.js"></script>
```
```javascript
var purrrf = require('purrrf');
```

## Usage

```javascript
// creates _purrrf object on window (if in browser) or on global (if in nodejs). 
// This prevents overriding itself if you have to require it in multiple places
var purrrf = require('purrrf'); 

// push an event to the master list
purrrf.push('someEventName'); 
78.55 // returns time in ms from reference start at which event occurred

// push an event to the master list with a group name. 
// If the group name was used on a previous event, it will return the time difference in ms between the this event and the most recent event with the same group name
purrrf.push('someEventNameStart', 'groupTask');
100.52
/* do other stuff that takes 50ms */
purrrf.push('someEventNameEnd', 'groupTask'); 
50 // returns the time difference in ms between 'someEventNameEnd' and 'someEventNameStart'

// note if you had not passed the 'groupTask' parameter above, it would return the time of that event, eg:
purrrf.push('someEventNameEnd');
150.52 // because no group parameter is specified, it returns the time

// get the time in ms from reference start for any event
purrrf.getTime('someEventName'); 
78.55 // returns time in ms from reference start at which event occurred
purrrf.getTime('someEventNameThatDoesNotExist');
false // returns false

// you can also at any time get the time difference between any two known events
// The second parameter is the reference point. Thus if first event occurred before the second, a negative value will be returned
purrrf.getTimeDiff('someEventNameEnd', 'someEventNameStart');


// you can pull the event map at any time which contains all collected data on every event pushed to the master list
purrrf.getMap(); // returns object map. The keys of this object are event names. Thus note if you pushed the same event name to the master list, the latter will override the former.

// if you'd rather get an ordered event list...
purrrf.getMap({ ordered: true }); // returns an array (not an object!) which contains the pushed events in the order in which they were received

```

## License

ISC
