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
    
    var purrrfQueueMap      = {};
    var openGroupMap        = {};
    var purrrfOrderedQueue  = [];
    
    var offset = 0;
    
    /*
      methods
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
    
    setStart = function() {
        return offset = new TimeEvent().getTime();     
    }
    
    getStart = function() {
        return offset;
    }
    
    /* 
        Gets the execution time difference between event and event reference.
        If event reference is not passed OR is not in the map, the internal _start reference is used.
        
        @param event | type string | event name 
        @param eventReference | type string | event name of the reference
        
        return | type number | the float value in ms of the time difference between the events
    */
    getTimeDiff = function(event, eventReference) {
        if (typeof purrrfQueueMap[event] === 'undefined') { return false }    
        if (typeof purrrfQueueMap[eventReference] === 'undefined') { 
            // no reference passed, so simply return relative to the start reference
            return purrrfQueueMap[event].getTime() - offset;
        }
        
        return purrrfQueueMap[event].getTimeDiff(purrrfQueueMap[eventReference]);
    }
    
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
     * ### .assert(expression, message, negateMessage, expected, actual, showDiff)
     *
     * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
     *
     * @name assert
     * @param {Philosophical} expression to be tested
     * @param {String|Function} message or function that returns message to display if expression fails
     * @param {Boolean} showDiff (optional) when set to `true`, assert will display a diff in addition to the message if expression fails
     * @api private
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
        _id         : uuidV4(),
        push        : push,
        getMap      : getMap,
        getTime     : getTime,
        getTimeDiff : getTimeDiff,
        setStart    : setStart,
        getStart    : getStart
    }   
}();
