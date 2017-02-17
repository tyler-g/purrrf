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
