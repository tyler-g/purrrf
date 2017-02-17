"use strict";

const TimeEvent = require("./timeEvent.js");
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
    
    var purrrfQueueMap      = {};
    var openGroupMap        = {};
    var purrrfOrderedQueue  = [];
    
    var offset = 0;
    
    /*
      methods
    */
    push = function(name, group) {
        var newTime = new TimeEvent(name, group);
        
        //console.log('purrrf | push | %s %s', name, typeof group !== 'undefined' ? group : '');
        
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
        push        : push,
        getMap      : getMap,
        getTime     : getTime,
        getTimeDiff : getTimeDiff,
        setStart    : setStart
    }   
}();
