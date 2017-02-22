const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const globalRef = typeof window !== 'undefined' ? window : global;

const EventEmitter = require('events');
const globalEventContext = typeof document !== 'undefined' ? document : new EventEmitter();
const indexPath = '../../src/index';
const timeEventPath = '../../src/timeEvent';

describe("TimeEvent prototype", function() {
    var timeEvent = require(timeEventPath);
    var event = new timeEvent();

    it("should have a getTime function", function() {
        expect(event.__proto__.getTime).to.not.be.undefined;
    });
    
    it("should have a getTimeDiff function", function() {
        expect(event.__proto__.getTimeDiff).to.not.be.undefined;
    });
    
    describe("call TimeEvent getTimeDiff function with no parameters", function() {
        
        it("should return false", function() {
            expect(event.__proto__.getTimeDiff()).to.be.false;
        });
    })
});

describe("Include lib", function() {
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
    describe("Push new event", function() {
        firstEventTime = lib.push(firstEvent);

        it("should return a number greater than 0", function() {
            expect(typeof firstEventTime).to.equal('number');
            expect(firstEventTime).to.be.above(0);
        });
    });

    describe("Get event time", function() {
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
    describe("Push a second event", function() {

        secondEventTime = lib.push(secondEvent);
        
        it("should return a number greater than first event time", function() {
            expect(secondEventTime).to.be.above(firstEventTime);
        });
        
        describe("Get time diff between two events", function() {
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
    
    describe("Change reference start time to now", function() {

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
        
        describe("Get current reference start time", function() {
            var currentOffset = lib.getStart();
            it("should return the current offset which was just set", function() {
                expect(currentOffset).to.equal(newStartRef);
            });
        });
    
    });
    
    describe("Get event times using array of events", function() {
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

    describe("Get event time of an undefined event", function() {
        var undefinedEventTime = lib.getTime('undefined');
        
        it("should return false", function() {
            expect(undefinedEventTime).to.be.false;
        });
        
    });

    describe("Get time diff of an undefined event and no passed reference event", function() {
        var undefinedEventTimeDiff = lib.getTimeDiff('undefined');
        
        it("should return false", function() {
            expect(undefinedEventTimeDiff).to.be.false;
        });
        
    });

    describe("Get time diff of a defined event and a passed undefined reference event", function() {
        var definedEventUndefinedReferenceTime = lib.getTimeDiff(firstEvent, 'undefined');
        var currentOffset = lib.getStart();
        
        it("should return the definded event's time minus any offset if the start reference has been changed", function() {
            expect(definedEventUndefinedReferenceTime).to.equal(firstEventTime - currentOffset);
        });
    });
        
    describe("Push new event with group name", function() {
        
        var eventWithGroupTime = lib.push("event", "group");
        
        it("should return a number greater than 0", function() {
            expect(eventWithGroupTime).to.be.above(0);
        });
        
        describe("Push another event with same group name", function() {
            var anotherEvent = "anotherEvent";
            var anotherEventWithGroupTimeDiff = lib.push(anotherEvent, "group");
            
            it("should return the time difference between the two events of the same group name", function() {
                expect(anotherEventWithGroupTimeDiff).to.be.above(0);
                
                var anotherEventWithGroupTime = lib.getTime(anotherEvent);
                expect(anotherEventWithGroupTime).to.be.above(0);
                expect(anotherEventWithGroupTime - eventWithGroupTime).to.equal(anotherEventWithGroupTimeDiff);
            });
        });
        
    });

    describe("Get event map", function() {
        var map = lib.getMap();
        
        it("should be an object", function() {
            expect(typeof map).to.equal('object');
        });
        
        it("should contain an event we created", function() {
            expect(map[firstEvent]).to.not.be.undefined;
        });
    });
        
    describe("Get event map passing the ordered option", function() {
        var orderedEvents = lib.getMap({ ordered: true });
        
        it("should return an array", function() {
            expect(orderedEvents).to.be.an('array');
        });
    });
    
    describe("Set event context without passing a context", function() {
        var setContext = lib.setEventContext();

        it("should return false", function() {
            expect(setContext).to.be.false;
        });
        
        describe("Bind an event to the context (which is currently null because no context was previously passed)", function() {
            
            it("should return false", function() {
                expect(lib.bind("eventToListenFor", "timeEventToPush")).to.be.false;
            });
            
            after(function() {
                describe("Set event context to an invalid event context (an object which has no .on method)", function() {
                    var invalidEventContext = {};
                    var setContext = lib.setEventContext(invalidEventContext);
                    
                    it("should return the context passed", function() {
                        expect(setContext).to.be.equal(invalidEventContext);
                    });
                    
                    describe("Bind an event to the invalid context", function() {
                        var boundedEventPromise = lib.bind("eventToListenFor", "timeEventToPush");
                        
                        it("should return a Promise", function() {
                            expect(boundedEventPromise).to.be.a('promise');
                        });
                        
                        describe("Emit the event that is being listened for by the invalid context", function() {
                            
                            it("should trigger the bounded event promise to reject with false", function() {
                                globalEventContext.emit('eventToListenFor');
                                return expect(boundedEventPromise).to.eventually.be.reject;
                            });
                        });
                    });
                });
            });
        });
        
        // must use after – otherwise the above tests may inadvertently fail because the context is set on the library below before they are checked.
        after(function() {    
            describe("Set event context to document (if browser), or EventEmitter (if node)", function() {
                var setContext = lib.setEventContext(globalEventContext);

                it("should not return false", function() {
                    expect(setContext).to.not.be.false;
                });
                
                describe("Bind an event to the context", function() {
                    var boundedEventPromise = lib.bind("eventToListenFor", "timeEventToPush");
                    
                    it("should return a Promise", function() {
                        expect(boundedEventPromise).to.be.a('promise');
                    });

                    describe("Emit the event that is being listened for by the context", function() {
                        
                        it("should trigger the bounded event promise to resolve with a TimeEvent number", function() {
                            globalEventContext.emit('eventToListenFor');
                            return expect(boundedEventPromise).to.eventually.be.a('number');
                        });
                    });

                });
            });
        });
    });
    

});
