const uuidV4    = require('uuid/v4');
const now       = require("performance-now");

function TimeEvent() {
    this.id = uuidV4();
    this.time = typeof window !== 'undefined' ? window.performance.now() : now();
}

TimeEvent.prototype.getTime = function () { return this.time; }

TimeEvent.prototype.getTimeDiff = function (event) {
    if (typeof event === 'undefined') { return false; }
    
    return this.time - event.time;
}

module.exports = TimeEvent;
