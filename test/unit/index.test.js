import { assert, expect } from 'chai';
const globalRef = typeof window !== 'undefined' ? window : global;
const indexPath = '../../src/index';
const timeEventPath = '../../src/timeEvent';

describe("TimeEvent prototype", function() {
    var timeEvent = require(timeEventPath);
    var event = new timeEvent();

    it("should have a getTime prototype", function() {
        expect(event.__proto__.getTime).to.not.be.undefined;
    });
    
    it("should have a getTimeDiff prototype", function() {
        expect(event.__proto__.getTimeDiff).to.not.be.undefined;
    });
});

describe("include lib", function() {
    var lib = require(indexPath);
    
    it("is on global context", function() {
        expect(typeof globalRef._purrrf).to.equal('object');
    });

    it("is not overridden on global context", function() {
        // require it again
        var lib2 = require(indexPath);    
        expect(lib._id).to.equal(globalRef._purrrf._id);
        expect(lib2._id).to.equal(lib._id);
    });
    
    
    var firstEvent = 'event1';
    var firstEventTime;
    describe("push new event", function() {
        firstEventTime = lib.push(firstEvent);

        it("should return a number greater than 0", function() {
            expect(typeof firstEventTime).to.equal('number');
            expect(firstEventTime).to.be.above(0);
        });
    });

    describe("get event map", function() {
        var map = lib.getMap();
        
        it("should be an object", function() {
            expect(typeof map).to.equal('object');
        });
        
        it("should contain the event we created", function() {
            expect(map[firstEvent]).to.not.be.undefined;
        });
    });

    describe("get event time", function() {
        var time = lib.getTime(firstEvent);
        
        it("should return a number greater than 0", function() {
            expect(time).to.be.above(0);
        });
        it("should equal the time returned when we initially pushed it", function() {
            expect(time).to.equal(firstEventTime);
        });
    });

    var secondEvent = 'event2';
    var secondEventTime;
    describe("push a second event", function() {

        secondEventTime = lib.push(secondEvent);
        
        it("should return a number greater than first event time", function() {
            expect(secondEventTime).to.be.above(firstEventTime);
        });
        
        describe("get time diff between two events", function() {
            var diff = lib.getTimeDiff(secondEvent, firstEvent);
            var diffNegative = lib.getTimeDiff(firstEvent, secondEvent);
            
            it("should return a number greater than 0 when reference event is first event", function() {
                expect(diff).to.be.above(0);
            });

            it("should equal the exact difference between the two event times", function() {
                expect(diff).to.equal(secondEventTime - firstEventTime);
            });

            it("reversed diff should return a number below 0 (reference event is the second event)", function() {
                expect(diffNegative).to.be.below(0);
            });

            it("reversed diff should equal the first diff * -1", function() {
                expect(diffNegative).to.equal(diff * -1);
            });
        })
        
    }); 
    
    describe("change reference start time to now", function() {

        var newStartRef = lib.setStart();

        it("should return a number greater than 0", function() {
            expect(newStartRef).to.be.above(0);
        });
        
        var firstEventTimeToStartRef = lib.getTime(firstEvent);
        it("first event getTime should now return negative", function() {
            expect(firstEventTimeToStartRef).to.be.below(0);
        });

        var firstEventTimeToStartRef = lib.getTime(firstEvent);
        it("first event getTime + new reference start time should equal old first event time", function() {
            expect(firstEventTimeToStartRef + newStartRef).to.equal(firstEventTime);
        });        
        
    });
    
    describe("get event times using array of events", function() {
        var multipleEvents = [firstEvent, secondEvent];
        var multipleEventTimes = lib.getTime(multipleEvents);
        
        it("should return an array", function() {
            expect(multipleEventTimes).to.be.an('array');
        });
        
        var multipleEventsWithUndefined = [firstEvent, secondEvent, "undefined"];
        var multipleEventsWithUndefinedTimes = lib.getTime(multipleEventsWithUndefined);
        it("should return array which contains a false, when passed an array with an undefined event", function() {
            expect(multipleEventsWithUndefinedTimes).to.be.an('array');
            expect(multipleEventsWithUndefinedTimes[2]).to.be.false;
        });
        
    });

    describe("get event time of an undefined event", function() {
        var undefinedEventTime = lib.getTime('undefined');
        
        it("should return false", function() {
            expect(undefinedEventTime).to.be.false;
        });
        
    });
    
});