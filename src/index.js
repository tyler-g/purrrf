"use strict";

const TimeEvent = require("./timeEvent.js");

function init() {
    
    /*
    * private *
    */
    var push;
    var getMap;
    var getTime;
    
    var purrrfQueueMap = {};

    /*
    * methods *
    */
    push = function(name) {
        purrrfQueueMap[name] = new TimeEvent();
    }
    
    getTime = function(event) {
        if (typeof purrrfQueueMap[event] === 'undefined') { return false }
        
        return purrrfQueueMap[event].getTime();
    }
    
    getMap = function() {
        return purrrfQueueMap;
    }
    
    
    return {
        push    : push,
        getMap  : getMap,
        getTime : getTime
    }   
}
    
module.exports = init();
