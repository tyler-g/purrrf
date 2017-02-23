# purrrf

![Build Status](https://img.shields.io/travis/tyler-g/purrrf.svg)
[![codecov](https://codecov.io/gh/tyler-g/purrrf/branch/master/graph/badge.svg)](https://codecov.io/gh/tyler-g/purrrf)
![Downloads](https://img.shields.io/npm/dm/purrrf.svg)
![Downloads](https://img.shields.io/npm/dt/purrrf.svg)
![npm version](https://img.shields.io/npm/v/purrrf.svg)
![dependencies](https://img.shields.io/david/tyler-g/purrrf.svg)
![dev dependencies](https://img.shields.io/david/dev/tyler-g/purrrf.svg)
![License](https://img.shields.io/npm/l/purrrf.svg)

a lightweight utility for measuring accurate performance timings in the browser or in nodejs. 

*2.5KB gzipped!*

<img src="jimmy.jpg" width="420" alt="jimmy" />

## Getting Started

Install it via npm:

```shell
npm install purrrf
```

And include in your project:

#### Node
```javascript
var purrrf = require('purrrf'); // nodejs, requirejs, or any framework that supports require
```
#### Browser
*purrrf.js* and *purrrf-min.js* are included in the browser folder of every release
(for browser projects not using any framework supporting require)
```html
<script src="purrrf.js"></script>
```
```javascript
var purrrf = require('purrrf');
```

## Usage

#### Setting the Reference Point
```javascript

// set the reference point for all future times
// it is a good habit to call this as early as possible, so its clear where your start reference time is in the code
purrrf.setStart();
15.2 // returns time in ms as the new reference start

```
*Note: Setting the reference point is not required, but it is a good way to ensure you know where your reference is. If it is not set, your reference point will be 0, which depends on the context. In node, 0 is the point at which your process has started. In the browser, 0 is the point at which the page is requested to be loaded.*

#### Pushing Time Events
```javascript

// push an event to the master list
purrrf.push('someEventName'); 
78.55 // returns time in ms from reference start at which event occurred

```

#### Pushing Time Events Using Groups
```javascript

// push an event to the master list with a group name. 
// If the group name was used on a previous event, it will return the time difference in ms between the this event and the most recent event with the same group name
purrrf.push('someEventNameStart', 'groupTask');
100.52

/* do other stuff that takes 50ms */

purrrf.push('someEventNameEnd', 'groupTask'); 
50 // returns the time difference in ms between 'someEventNameEnd' and 'someEventNameStart'

// note if you had not passed the 'groupTask' parameter above, it would return the time of that event, eg:
purrrf.push('someEventNameEnd');
150.52 // because no group parameter is specified, it returns the time in ms from reference start
```

#### Get Times from Pushed Events
```javascript

// get the time in ms from reference start for any event
purrrf.getTime('someEventName'); 
78.55 // returns time in ms from reference start at which event occurred

purrrf.getTime('someEventNameThatDoesNotExist');
false // returns false

```

#### Get Time Difference between any Two Events
```javascript

// you can also at any time get the time difference between any two known events
// The second parameter is the reference point. Thus if first event occurred before the second, a negative value will be returned
purrrf.getTimeDiff('someEventNameEnd', 'someEventNameStart');
50 // returns the time difference in ms between 'someEventNameEnd' and 'someEventNameStart'

```

#### Automatically Push Time Events from Event Listeners
In case your project already has events that fire at significant times in which you would like to track, you can bind to those events and automatically push Time Events to purrrf.

```javascript

// You must first set the context on which to listen for events
purrrf.setContext(document); // browser
/* or */
purrrf.setContext(myEventEmitter); // node (where eventEmitter is an instance of EventEmitter)

```
```javascript

// every time 'eventToListenForOnTheContext' event fires, 'eventToPushToPurrrfWhenThatHappens' will get pushed to purrrf
purrrf.bind('eventToListenForOnTheContext', 'eventToPushToPurrrfWhenThatHappens', 'optionalGroupName');

// binding returns a Promise which resolves when the event being listened for is fired
purrrf.bind('eventToListenForOnTheContext', 'eventToPushToPurrrfWhenThatHappens', 'optionalGroupName').then(function(result) {
    // result is the time returned from pushing event `eventToPushToPurrrfWhenThatHappens`
    console.log('eventToPushToPurrrfWhenThatHappens was pushed to purrrf after x ms from reference start', result);
    // this follows the same rules as what returns from purrrf.push (see above). 
    // If an group name was passed, and a Time Event with that group name has previously been pushed, 
    // then result will be the time difference in ms between those two Time Events
});

```

#### Get the master list (generally not needed)
```javascript

// you can pull the event map at any time which contains all collected data on every event pushed to the master list
purrrf.getMap(); // returns object map. The keys of this object are event names. Thus note if you pushed the same event name to the master list, the latter will override the former.

// if you'd rather get an ordered event list...
purrrf.getMap({ ordered: true }); // returns an array (not an object!) which contains the pushed events in the order in which they were received

```
*Note: The times in the master map are always absolute times.  This means that regardless of if or when you called `.setStart()` these times in the map will not be relative to that point.  However there is a special key `_config` returned in the map which contains the offset.  The offset is 0 by default, but if `.setStart()` was called, offset will contain the time at which it was called.  Thus it can be used to calculate relative times.  If you retrieve the map as an ordered array (using `purrrf.getMap({ ordered: true })`) note there is no special `_config` key, as doing so would pollute the array.*

## License

ISC
