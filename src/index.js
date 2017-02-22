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
     * @return {undefined|Boolean} Returns undefined if event context is set successfully. If no context is passed, returns false.
     */
    setEventContext = function(context) {
        if (!context) { return false }
        
        eventContext = context;
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
