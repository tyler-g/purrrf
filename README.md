# purrrf

![Build Status](https://img.shields.io/travis/tyler-g/purrrf.svg)
![Coverage](https://img.shields.io/coveralls/tyler-g/purrrf.svg)
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
import purrrf from 'purrrf';
```

## Usage

```javascript
// creates _purrrf object on window (if in browser) or on global (if in nodejs). This prevents overriding itself if you have to require it in multiple places
var purrrf = require('purrrf'); 

// push an event to the master list
purrrf.push('someEventName'); // returns true

// push an event to the master list with a group name. If the group name was used on a previous event, it will return the time difference between the two events in ms
purrrf.push('someEventNameStart', 'groupTask');
/* do other stuff */
purrrf.push('someEventNameEnd', 'groupTask'); // returns the time difference in ms between 'someEventNameStart' and 'someEventNameEnd'

// get the time from _start for any event
purrrf.getTime('someEventName'); // returns false if passed event is not in the master list

// you can also at any time get the time difference between any two known events
// The second parameter is the reference point. Thus if first event occurred before the second, a negative value will be returned
purrr.getTimeDiff('someEventNameEnd', 'someEventNameStart');


// you can pull the event map at any time which contains all collected data on every event pushed to the master list
purrrf.getMap(); // returns object map. The keys of this object are event names. Thus note if you pushed the same event name to the master list, the latter will override the former.

// if you'd rather get an ordered event list...
purrr.getMap({ ordered: true }); // returns an array (not an object!) which contains the pushed events in the order in which they were received

```

## License

ISC