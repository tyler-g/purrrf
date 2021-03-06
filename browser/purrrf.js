(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);



}).call(this,require('_process'))
},{"_process":7}],2:[function(require,module,exports){
/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

},{}],3:[function(require,module,exports){
(function (global){
// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
var rng = require('./lib/rng');
var bytesToUuid = require('./lib/bytesToUuid');

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

},{"./lib/bytesToUuid":2,"./lib/rng":3}],5:[function(require,module,exports){
(function (global){
"use strict";

const TimeEvent = require("./timeEvent.js");
const uuidV4    = require('uuid/v4');
const globalRef = typeof window !== 'undefined' ? window : global;

module.exports = globalRef._purrrf =
function init(options) {

    /*
      option defaults
    */
    options = options || {};
    
    /*
      private
    */
    var push;
    var getMap;
    var getTime;
    var getTimeDiff;
    var setStart;
    var getStart;
    var setEventContext;
    var bind;
    
    var purrrfQueueMap      = {};
    var openGroupMap        = {};
    var purrrfOrderedQueue  = [];
    var eventContext        = null;
    
    var offset = 0;
    

    /**
     * Sets the event context on which to bind event listeners
     * @param {String} context the event context
     * @return {Object|Boolean} Returns the event context object that was set successfully. If no context is passed, returns false.
     */
    setEventContext = function(context) {
        if (!context) { return false }
        
        return eventContext = context;
    }


    /**
     * Binds an event listener to the event context, which pushes a new event to the master list when called
     * @param {String} eventToBind name of event to listen for
     * @param {String} eventToPush name of new event to push to master list
     * @param {String} group name of group to attach to the new event (optional)
     * @return {Promise|Boolean} Returns a promise which resolves when the event listener is called. If no event context has been set, returns false.
     */
    bind = function(eventToBind, eventToPush, group) {
        if (!eventContext ) { return false }
        
        return new Promise(function(resolve, reject) {
            if (typeof eventContext.on === 'undefined') {
                if (typeof eventContext.addEventListener === 'undefined') {
                    return reject(false);
                }
                eventContext.addEventListener(eventToBind, () => {
                    console.log('bound event %s called!', eventToBind);
                    resolve(push(eventToPush, group));
                }, false);
            }
            else {
                eventContext.on(eventToBind, () => {
                  console.log('bound event %s called!', eventToBind);
                  resolve(push(eventToPush, group));
                });
            }
        });
    }
    
    
    /**
     * Pushes a new event to the master list
     * @param {String} name event name
     * @param {String} group group name used for grouping events of a similar type
     * @return {Number} Returns time since reference start of the event just created. If group is passed and it has been used on a previous pushed event, returns the time difference in ms between this event and the most recent event with the same group. If this is first time this group is passed, returns time in ms since reference start.
     */
    push = function(name, group) {
        var newTime = new TimeEvent(name, group);
            
        purrrfQueueMap[name] = newTime;
        purrrfOrderedQueue.push(newTime);
        
        // if a group is passed and already exists in the group map, return the time difference from the last event pushed of the same group name
        if (typeof openGroupMap[group] !== 'undefined') {
            var eventReference = openGroupMap[group];
            openGroupMap[group] = name;
            
            return getTimeDiff(name, eventReference);
        }        
        if (typeof group !== 'undefined') {
            openGroupMap[group] = name;
        }
        
        return newTime.getTime() - offset;
    }


    /**
     * Sets start reference time to now
     * @return {Number} Returns the start reference time in ms that was just set.
     */
    setStart = function() {
        return offset = new TimeEvent().getTime();     
    }


    /**
     * Gets current start reference time. Default is 0
     * @return {Number} Returns the current start reference time in ms.
     */
    getStart = function() {
        return offset;
    }
    

    /**
     * Gets the time difference in ms between event and event reference.
     * @param {String} event event name
     * @param {String} eventReference event name of the reference. If not passed, start reference is used
     * @return {Number|Boolean} Returns the time difference in ms between the events. Negative value indicates event occurred before eventReference. If event is not found in the master map, returns false.
     */
    getTimeDiff = function(event, eventReference) {
        if (typeof purrrfQueueMap[event] === 'undefined') { return false }    
        if (typeof purrrfQueueMap[eventReference] === 'undefined') { 
            // no reference passed, so simply return relative to the start reference
            return purrrfQueueMap[event].getTime() - offset;
        }
        
        return purrrfQueueMap[event].getTimeDiff(purrrfQueueMap[eventReference]);
    }


    /**
     * Gets time since reference start of an event 
     * @param {String|Array} event name of a single event || array of event names
     * @return {Number|Array|Boolean} Returns time in ms since reference start for a single event. If array is passed, returns array of times instead. If a single event is passed and is not in the master map, returns false.
     */
    getTime = function(event) {
        // if passed an array of time events
        if (typeof event === 'object' && typeof event.length !== 'undefined') {
            var len = event.length;
            var returnArr = [];

            for (var i = 0; i < len; i++) {
                if (typeof purrrfQueueMap[event[i]] === 'undefined') {
                    returnArr.push(false);
                }
                else {
                    returnArr.push(purrrfQueueMap[event[i]].getTime());
                }
            }
            
            return returnArr;    
        }

        // otherwise assume single time event
        if (typeof purrrfQueueMap[event] === 'undefined') { return false }
        
        return purrrfQueueMap[event].getTime() - offset;
    }
    
    
    /**
     * Gets the object map of all pushed events
     * @param {Object} options options to pass in
     * @return {Object|Array} Returns object map with event names as keys. If options.ordered is passed, returns an ordered array instead.
     */
    getMap = function(options) {
        
        if (options && options.ordered) {
            return purrrfOrderedQueue;
        }
        
        // special configs to return
        purrrfQueueMap['_config'] = {
            offset: offset
        };
        
        return purrrfQueueMap;
    }
    
    
    return {
        _id             : uuidV4(),
        push            : push,
        getMap          : getMap,
        getTime         : getTime,
        getTimeDiff     : getTimeDiff,
        setStart        : setStart,
        getStart        : getStart,
        setEventContext : setEventContext,
        bind            : bind
    }   
}();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./timeEvent.js":6,"uuid/v4":4}],6:[function(require,module,exports){
const uuidV4    = require('uuid/v4');
const now       = require("performance-now");

function TimeEvent(name, group) {
    this.id = uuidV4();
    this.name = name || '';
    this.group = group || '';
    this.time = typeof window !== 'undefined' ? window.performance.now() : now();
}

TimeEvent.prototype.getTime = function () { 
    return this.time;
}

TimeEvent.prototype.getTimeDiff = function (event) {
    if (typeof event === 'undefined') { return false; }
    
    return this.time - event.time;
}

module.exports = TimeEvent;

},{"performance-now":1,"uuid/v4":4}],7:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[5]);
