import {expect} from "chai";
import {TrafficCountCache} from "../../library/trafficCountCache";
import moment from "moment";

// change language from moment.js to german
moment.locale("de");

describe("tools/gfi/themes/trafficCount/trafficCountCache", function () {
    let cache = null;

    beforeEach(() => {
        // this sets the cache with a boolean true as api without starting the real api
        // use param trafficCountApiOpt to emulate the api for testing methods calling the api
        cache = new TrafficCountCache(null, null, null, true);
    });


    describe("cacheCreate", () => {
        it("should create an empty cache entry for key", () => {
            cache.cacheCreate("key");

            expect(cache.getCache()).to.deep.equal({
                "key": {
                    value: [],
                    isReady: false,
                    inProgress: false,
                    waitlist: [],
                    observer: null
                }
            });
        });
    });
    describe("cacheSetValue", () => {
        it("should set the value of a cache entry for key", () => {
            cache.cacheCreate("key");
            cache.cacheSetValue("key", "value");

            expect(cache.getCache()).to.deep.equal({
                "key": {
                    value: "value",
                    isReady: false,
                    inProgress: false,
                    waitlist: [],
                    observer: null
                }
            });
        });
    });
    describe("cacheSetIsReady", () => {
        it("should set the status isReady of a cache entry for key", () => {
            cache.cacheCreate("key");
            cache.cacheSetIsReady("key", "isReady");

            expect(cache.getCache()).to.deep.equal({
                "key": {
                    value: [],
                    isReady: "isReady",
                    inProgress: false,
                    waitlist: [],
                    observer: null
                }
            });
        });
    });
    describe("cacheSetInProgress", () => {
        it("should set the status inProgress of a cache entry for key", () => {
            cache.cacheCreate("key");
            cache.cacheSetInProgress("key", "inProgress");

            expect(cache.getCache()).to.deep.equal({
                "key": {
                    value: [],
                    isReady: false,
                    inProgress: "inProgress",
                    waitlist: [],
                    observer: null
                }
            });
        });
    });
    describe("cacheAddToWaitlist", () => {
        it("should add the given handler to the waitlist of a cache entry for key", () => {
            cache.cacheCreate("key");
            cache.cacheAddToWaitlist("key", "handler");

            expect(cache.getCache()).to.deep.equal({
                "key": {
                    value: [],
                    isReady: false,
                    inProgress: false,
                    waitlist: ["handler"],
                    observer: null
                }
            });
        });
    });
    describe("cacheSetObserver", () => {
        it("should set the observer of a cache entry for key", () => {
            cache.cacheCreate("key");
            cache.cacheSetObserver("key", "observer");

            expect(cache.getCache()).to.deep.equal({
                "key": {
                    value: [],
                    isReady: false,
                    inProgress: false,
                    waitlist: [],
                    observer: "observer"
                }
            });
        });
    });

    describe("cacheGetValue", () => {
        it("should return the value from the entry for key", () => {
            cache.cacheCreate("key");

            cache.cacheSetValue("key", "value");
            expect(cache.cacheGetValue("key")).to.equal("value");
        });
    });
    describe("cacheIsReady", () => {
        it("should return the isReady state from the entry for key", () => {
            cache.cacheCreate("key");

            cache.cacheSetIsReady("key", true);
            expect(cache.cacheIsReady("key")).to.be.true;

            cache.cacheSetIsReady("key", "bar");
            expect(cache.cacheIsReady("key")).to.be.false;
        });
    });
    describe("cacheInProgress", () => {
        it("should return the inProgress state from the entry for key", () => {
            cache.cacheCreate("key");

            cache.cacheSetInProgress("key", true);
            expect(cache.cacheInProgress("key")).to.be.true;

            cache.cacheSetInProgress("key", "bar");
            expect(cache.cacheInProgress("key")).to.be.false;
        });
    });
    describe("cacheWorkOffWaitlist", () => {
        it("should work through the waitlist from top to bottom of the entry for key, calling all handler", () => {
            let firstCall = null,
                secondCall = null,
                order = 0;

            cache.cacheCreate("key");

            cache.cacheAddToWaitlist("key", () => {
                firstCall = ++order;
            });
            cache.cacheAddToWaitlist("key", () => {
                secondCall = ++order;
            });

            cache.cacheWorkOffWaitlist("key");

            expect(firstCall).to.equal(1);
            expect(secondCall).to.equal(2);

            expect(cache.cacheGetWaitlist("key")).to.be.empty;
        });
    });
    describe("cacheGetObserver", () => {
        it("should return the observer from the entry for key", () => {
            cache.cacheCreate("key");

            cache.cacheSetObserver("key", "observer");
            expect(cache.cacheGetObserver("key")).to.equal("observer");
        });
    });


    describe("simpleCacheCall", () => {
        describe("for when cache of key is ready", () => {
            it("should set the observer for the cache of key for an entry", () => {
                cache.cacheCreate("key");
                cache.cacheSetIsReady("key", true);

                cache.simpleCacheCall("key", "apiCall", "onupdate", "observer", "onstart", "oncomplete");

                expect(cache.cacheGetObserver("key")).to.equal("observer");
            });
            it("should call onupdate with the value of the cache as params for the entry of key", () => {
                let lastValueA = null,
                    lastValueB = null;

                cache.cacheCreate("key");
                cache.cacheSetIsReady("key", true);
                cache.cacheSetValue("key", ["valueA", "valueB"]);

                cache.simpleCacheCall("key", "apiCall", (valueA, valueB) => {
                    lastValueA = valueA;
                    lastValueB = valueB;
                }, "observer", "onstart", "oncomplete");

                expect(lastValueA).to.equal("valueA");
                expect(lastValueB).to.equal("valueB");
            });
            it("should run onstart, onupdate and oncomplete in the right order for an entry", () => {
                let lastOnstart = null,
                    lastOnupdate = null,
                    lastOncomplete = null,
                    order = 0;

                cache.cacheCreate("key");
                cache.cacheSetIsReady("key", true);
                cache.cacheSetValue("key", "value");

                cache.simpleCacheCall("key", "apiCall", () => {
                    lastOnupdate = ++order;
                }, "observer", () => {
                    lastOnstart = ++order;
                }, () => {
                    lastOncomplete = ++order;
                });

                expect(lastOnstart).to.equal(1);
                expect(lastOnupdate).to.equal(2);
                expect(lastOncomplete).to.equal(3);
            });
        });

        describe("for when cache of key is in progress", () => {
            it("should add a new handler to the waitlist at key for an entry", () => {
                let waitlist = null;

                cache.cacheCreate("key");
                cache.cacheSetInProgress("key", true);

                cache.simpleCacheCall("key", "apiCall", "onupdate", "observer", "onstart", "oncomplete");

                waitlist = cache.cacheGetWaitlist("key");
                expect(waitlist).to.be.an("array").to.have.lengthOf(1);
                expect(typeof waitlist[0]).to.equal("function");
            });
            it("should set the observer after working off the waitlist for an entry", () => {
                cache.cacheCreate("key");
                cache.cacheSetInProgress("key", true);
                cache.cacheSetObserver("key", true);

                cache.simpleCacheCall("key", "apiCall", "onupdate", "observer", "onstart", "oncomplete");
                expect(cache.cacheGetObserver("key")).to.be.true;

                cache.cacheWorkOffWaitlist("key");
                expect(cache.cacheGetObserver("key")).to.equal("observer");
            });
            it("should hand over the value working off the waitlist for an entry", () => {
                let lastValue = null;

                cache.cacheCreate("key");
                cache.cacheSetInProgress("key", true);
                cache.cacheSetValue("key", ["value"]);

                cache.simpleCacheCall("key", "apiCall", value => {
                    lastValue = value;
                }, "observer", "onstart", "oncomplete");

                cache.cacheWorkOffWaitlist("key");
                expect(lastValue).to.equal("value");
            });
            it("should call onstart, onupdate and oncomplete in the right order for an entry", () => {
                let lastOnstart = null,
                    lastOnupdate = null,
                    lastOncomplete = null,
                    order = 0;

                cache.cacheCreate("key");
                cache.cacheSetInProgress("key", true);
                cache.cacheSetValue("key", "value");

                cache.simpleCacheCall("key", "apiCall", () => {
                    lastOnupdate = ++order;
                }, "observer", () => {
                    lastOnstart = ++order;
                }, () => {
                    lastOncomplete = ++order;
                });

                expect(lastOnstart).to.equal(1);
                expect(lastOnupdate).to.equal(null);
                expect(lastOncomplete).to.equal(null);

                cache.cacheWorkOffWaitlist("key");

                expect(lastOnstart).to.equal(1);
                expect(lastOnupdate).to.equal(2);
                expect(lastOncomplete).to.equal(3);
            });
        });

        describe("for when key has not yet been used", () => {
            it("should create a new cache entry for key, should flag it to be in progress", () => {
                cache.simpleCacheCall("key", "apiCall", "onupdate", "observer", "onstart", "oncomplete");

                expect(cache.cacheInProgress("key")).to.be.true;
            });
            it("should add a handler to the waitlist", () => {
                let waitlist = null;

                cache.simpleCacheCall("key", "apiCall", "onupdate", "observer", "onstart", "oncomplete");

                waitlist = cache.cacheGetWaitlist("key");
                expect(waitlist).to.be.an("array").to.have.lengthOf(1);
                expect(typeof waitlist[0]).to.equal("function");
            });
            it("should set the observer after working off the waitlist for an entry", () => {
                cache.simpleCacheCall("key", "apiCall", "onupdate", "observer", "onstart", "oncomplete");
                cache.cacheWorkOffWaitlist("key");
                expect(cache.cacheGetObserver("key")).to.equal("observer");
            });
            it("should hand over the value working off the waitlist for an entry", () => {
                let lastValue = null;

                cache.simpleCacheCall("key", "apiCall", value => {
                    lastValue = value;
                }, "observer", "onstart", "oncomplete");

                cache.cacheSetValue("key", ["value"]);
                cache.cacheWorkOffWaitlist("key");
                expect(lastValue).to.equal("value");
            });
            it("should call onstart, onupdate and oncomplete in the right order for an entry", () => {
                let lastOnstart = null,
                    lastOnupdate = null,
                    lastOncomplete = null,
                    order = 0;

                cache.simpleCacheCall("key", "apiCall", () => {
                    lastOnupdate = ++order;
                }, "observer", () => {
                    lastOnstart = ++order;
                }, () => {
                    lastOncomplete = ++order;
                });

                expect(lastOnstart).to.equal(1);
                expect(lastOnupdate).to.equal(null);
                expect(lastOncomplete).to.equal(null);

                cache.cacheWorkOffWaitlist("key");

                expect(lastOnstart).to.equal(1);
                expect(lastOnupdate).to.equal(2);
                expect(lastOncomplete).to.equal(3);
            });
            it("should use the given apiCall to receive and set data, should work off waitlist", () => {
                let lastValue = null;

                cache.simpleCacheCall("key", callback => {
                    callback("value");
                }, value => {
                    lastValue = value;
                });

                expect(lastValue).to.equal("value");
            });
            it("should call apiCall once and put all other requests on the waitlist during execution", () => {
                let receiveCount = 0,
                    firstCallback = null;

                cache.simpleCacheCall("key", callback => {
                    firstCallback = callback;
                }, () => {
                    receiveCount++;
                });
                cache.simpleCacheCall("key", () => {
                    firstCallback = false;
                }, () => {
                    receiveCount++;
                });
                cache.simpleCacheCall("key", () => {
                    firstCallback = false;
                }, () => {
                    receiveCount++;
                });

                expect(typeof firstCallback).to.equal("function");
                expect(receiveCount).to.equal(0);

                firstCallback();

                expect(receiveCount).to.equal(3);
            });
            it("should call apiCall once and deliver value immediately after cache is ready for key", () => {
                let receiveCount = 0;

                cache.simpleCacheCall("key", callback => {
                    callback();
                }, () => {
                    receiveCount++;
                });
                expect(receiveCount).to.equal(1);

                cache.simpleCacheCall("key", "apiCall", () => {
                    receiveCount++;
                });
                expect(receiveCount).to.equal(2);
            });
            it("should always use the last observer for subscriptions of a key", () => {
                let lastValue = null,
                    firstCallback = null;

                cache.simpleCacheCall("key", callback => {
                    firstCallback = callback;
                    callback("foo");
                }, value => {
                    // onupdate
                    lastValue = value + "1";
                }, value => {
                    // observer
                    lastValue = value + "2";
                });

                cache.simpleCacheCall("key", "apiCall", value => {
                    // onupdate
                    lastValue = value + "3";
                }, value => {
                    // observer
                    lastValue = value + "4";
                });

                // simulate subscription
                firstCallback("bar");

                expect(lastValue).to.equal("bar4");
            });
        });
    });

    describe("updateTitle", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateTitlethingId";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateTitle("thingId", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateTitle on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateTitle("thingId", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateTitle: (thingId, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateTitle("thingId", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateTitle: (thingId, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("updateDirection", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateDirectionthingId";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateDirection("thingId", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateDirection on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateDirection("thingId", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateDirection: (thingId, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateDirection("thingId", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateDirection: (thingId, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("updateDay", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateDaythingIdmeansOfTransportday";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateDay("thingId", "meansOfTransport", "day", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateDay on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateDay("thingId", "meansOfTransport", "day", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateDay: (thingId, meansOfTransport, day, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateDay("thingId", "meansOfTransport", "day", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateDay: (thingId, meansOfTransport, day, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("updateYear", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateYearthingIdmeansOfTransportyear";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateYear("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateYear on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateYear("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateYear: (thingId, meansOfTransport, year, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateYear("thingId", "meansOfTransport", "year", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateYear: (thingId, meansOfTransport, year, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("updateTotal", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateTotalthingIdmeansOfTransport";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateTotal("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateTotal on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateTotal("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateTotal: (thingId, meansOfTransport, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateTotal("thingId", "meansOfTransport", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateTotal: (thingId, meansOfTransport, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("updateHighestWorkloadDay", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateHighestWorkloadDaythingIdmeansOfTransportyear";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateHighestWorkloadDay("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateHighestWorkloadDay on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateHighestWorkloadDay("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateHighestWorkloadDay: (thingId, meansOfTransport, year, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateHighestWorkloadDay("thingId", "meansOfTransport", "year", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateHighestWorkloadDay: (thingId, meansOfTransport, year, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("updateHighestWorkloadWeek", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateHighestWorkloadWeekthingIdmeansOfTransportyear";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateHighestWorkloadWeek("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateHighestWorkloadWeek on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateHighestWorkloadWeek("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateHighestWorkloadWeek: (thingId, meansOfTransport, year, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateHighestWorkloadWeek("thingId", "meansOfTransport", "year", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateHighestWorkloadWeek: (thingId, meansOfTransport, year, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("updateHighestWorkloadMonth", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "updateHighestWorkloadMonththingIdmeansOfTransportyear";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.updateHighestWorkloadMonth("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call updateHighestWorkloadMonth on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.updateHighestWorkloadMonth("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                updateHighestWorkloadMonth: (thingId, meansOfTransport, year, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.updateHighestWorkloadMonth("thingId", "meansOfTransport", "year", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                updateHighestWorkloadMonth: (thingId, meansOfTransport, year, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("udpateDataset", () => {
        it("should pass thingId, meansOfTransport and timeSettings to a helper function", () => {
            let lastThingId = null,
                lastMeansOfTransport = null,
                lastTimeSettings = null;

            cache.updateDataset("thingId", "meansOfTransport", "timeSettings", "onupdate", "onerror", "onstart", "oncomplete", (thingId, meansOfTransport, timeSettings) => {
                // updateDatasetHelperOpt
                lastThingId = thingId;
                lastMeansOfTransport = meansOfTransport;
                lastTimeSettings = timeSettings;
            });

            expect(lastThingId).to.equal("thingId");
            expect(lastMeansOfTransport).to.equal("meansOfTransport");
            expect(lastTimeSettings).to.equal("timeSettings");
        });
        it("should trigger the helper function with an empty array for collecting the datasets", () => {
            let lastDatasets = null;

            cache.updateDataset("thingId", "meansOfTransport", "timeSettings", "onupdate", "onerror", "onstart", "oncomplete", (thingId, meansOfTransport, timeSettings, datasets) => {
                // updateDatasetHelperOpt
                lastDatasets = datasets;
            });

            expect(lastDatasets).to.be.an("array").to.be.empty;
        });
        it("should call onsuccess of the helper function using onupdate to hand over data", () => {
            let lastValue = false;

            cache.updateDataset("thingId", "meansOfTransport", "timeSettings", value => {
                // onupdate
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", (thingId, meansOfTransport, timeSettings, datasets, onsuccess) => {
                // updateDatasetHelperOpt
                onsuccess(true);
            });

            expect(lastValue).to.be.true;
        });
        it("should call onstart, onupdate and oncomplete in the right order", () => {
            let lastOnstart = null,
                lastOnupdate = null,
                lastOncomplete = null,
                order = 0;

            cache.updateDataset("thingId", "meansOfTransport", "timeSettings", () => {
                // onupdate
                lastOnupdate = ++order;
            }, "onerror", () => {
                // onstart
                lastOnstart = ++order;
            }, () => {
                // oncomplete
                lastOncomplete = ++order;
            }, (thingId, meansOfTransport, timeSettings, datasets, onsuccess) => {
                // updateDatasetHelperOpt
                onsuccess();
            });

            expect(lastOnstart).to.equal(1);
            expect(lastOnupdate).to.equal(2);
            expect(lastOncomplete).to.equal(3);
        });
        it("should hand over an observer triggering the helper function with a observer flaged false", () => {
            let lastObserver = null,
                depth = 0;

            cache.updateDataset("thingId", "meansOfTransport", "timeSettings", "onupdate", "onerror", "onstart", "oncomplete", (thingId, meansOfTransport, timeSettings, datasets, onsuccess, observer) => {
                // updateDatasetHelperOpt
                // use depth to avoid infinit loop if someone has changed updateDataset
                depth++;

                if (depth === 1) {
                    // call observer at depth 1 to simulate subscription
                    observer();
                }
                else {
                    // in any other depth the given observer must be false to avoid infinit loop and/or a overridden observer
                    lastObserver = observer;
                }
            });

            expect(lastObserver).to.be.false;
        });
    });

    describe("updateDatasetHelper", () => {
        it("should call onsuccess if length of datasets equals or outnumbers length of timeSettings", () => {
            let lastSimpleCacheCall = false,
                lastOnsuccess = false;

            cache.updateDatasetHelper("thingId", "meansOfTransport", [], [], () => {
                lastOnsuccess = true;
            }, "observer", "onerror", () => {
                // simpleCacheCallOpt
                lastSimpleCacheCall = true;
            });

            expect(lastOnsuccess).to.be.true;
            expect(lastSimpleCacheCall).to.be.false;
        });
        it("should call simpleCacheCall if length of datasets is lower then length of timeSettings", () => {
            let lastSimpleCacheCall = false,
                lastOnsuccess = false;

            cache.updateDatasetHelper("thingId", "meansOfTransport", ["timeSetting"], [], () => {
                lastOnsuccess = true;
            }, "observer", "onerror", () => {
                // simpleCacheCallOpt
                lastSimpleCacheCall = true;
            });

            expect(lastOnsuccess).to.be.false;
            expect(lastSimpleCacheCall).to.be.true;
        });
        it("should call simpleCacheCall with a correct key including the given element in timeSettings", () => {
            const expectedKey = "updateDatasetHelperthingIdmeansOfTransport\"timeSetting\"";
            let lastKey = false;

            cache.updateDatasetHelper("thingId", "meansOfTransport", ["timeSetting"], [], "onsuccess", "observer", "onerror", key => {
                // simpleCacheCallOpt
                lastKey = key;
            });

            expect(lastKey).to.equal(expectedKey);
        });
        it("should call updateDataset at the given api when simpleCacheCall uses the apiCall with thingId, meansOfTransport and timeSetting, handing over the dataset", () => {
            let lastThingId = null,
                lastMeansOfTransport = null,
                lastTimeSet = null,
                lastDataset = null;

            cache.updateDatasetHelper("thingId", "meansOfTransport", ["timeSetting"], [], "onsuccess", "observer", "onerror", (key, apiCall) => {
                // simpleCacheCallOpt
                apiCall(dataset => {
                    lastDataset = dataset;
                });
            }, {
                // trafficCountApiOpt
                updateDataset: (thingId, meansOfTransport, timeSet, onupdate) => {
                    lastThingId = thingId;
                    lastMeansOfTransport = meansOfTransport;
                    lastTimeSet = timeSet;
                    onupdate("dataset");
                }
            });

            expect(lastThingId).to.equal("thingId");
            expect(lastMeansOfTransport).to.equal("meansOfTransport");
            expect(lastTimeSet).to.equal("timeSetting");
            expect(lastDataset).to.equal("dataset");
        });
        it("should push all datasets into the given array and hand over the result if finished", () => {
            const timeSettings = [
                    "timeSetA",
                    "timeSetB",
                    "timeSetC"
                ],
                expectedResult = [
                    "dataset_timeSetA",
                    "dataset_timeSetB",
                    "dataset_timeSetC"
                ];
            let lastResult = null;

            // use inner simpleCacheCall for this test
            cache.updateDatasetHelper("thingId", "meansOfTransport", timeSettings, [], result => {
                // onsuccess
                lastResult = result;
            }, "observer", "onerror", null, {
                // trafficCountApiOpt
                updateDataset: (thingId, meansOfTransport, timeSet, onupdate) => {
                    onupdate("dataset_" + timeSet);
                }
            });

            expect(lastResult).to.deep.equal(expectedResult);
        });
    });

    describe("subscribeLastUpdate", () => {
        it("should create a cache key and a callback as a function", () => {
            const expectedKey = "subscribeLastUpdatethingIdmeansOfTransport";
            let lastKey = "",
                lastApiCall = null,
                lastOnupdate = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.subscribeLastUpdate("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall, onupdate, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnupdate = onupdate;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnupdate).to.equal("onupdate");
            expect(lastObserver).to.equal("onupdate");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call subscribeLastUpdate on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.subscribeLastUpdate("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                subscribeLastUpdate: (thingId, meansOfTransport, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
        it("should be the handler of subscriptions for its key", () => {
            let lastValue = null,
                firstCallback = null;

            // use inner simpleCacheCall
            cache.subscribeLastUpdate("thingId", "meansOfTransport", value => {
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", null, {
                subscribeLastUpdate: (thingId, meansOfTransport, callback) => {
                    firstCallback = callback;
                    callback("foo");
                }
            });

            expect(lastValue).to.equal("foo");
            expect(typeof firstCallback).to.equal("function");

            // simulate subscription
            firstCallback("bar");
            expect(lastValue).to.equal("bar");
        });
    });

    describe("unsubscribeEverything", () => {
        it("should call unsubscribeEverything on the api and empty the cache", () => {
            let onsuccessCalled = false;

            cache.setCache("some cache");
            cache.unsubscribeEverything(() => {
                onsuccessCalled = true;
            }, {
                unsubscribeEverything: (callback) => {
                    callback();
                }
            });

            expect(onsuccessCalled).to.be.true;
            expect(cache.getCache()).to.deep.equals({});
        });
    });

    describe("getFirstDateEver", () => {
        it("should create a cache key and a callback as a function without an observer", () => {
            const expectedKey = "getFirstDateEverthingIdmeansOfTransport";
            let lastKey = "",
                lastApiCall = null,
                lastOnsuccess = null,
                lastObserver = null,
                lastOnstart = null,
                lastOncomplete = null;

            cache.getFirstDateEver("thingId", "meansOfTransport", "onsuccess", "onerror", "onstart", "oncomplete", (key, apiCall, onsuccess, observer, onstart, oncomplete) => {
                lastKey = key;
                lastApiCall = apiCall;
                lastOnsuccess = onsuccess;
                lastObserver = observer;
                lastOnstart = onstart;
                lastOncomplete = oncomplete;
            });

            expect(lastKey).to.equal(expectedKey);
            expect(typeof lastApiCall).to.equal("function");
            expect(lastOnsuccess).to.equal("onsuccess");
            expect(lastObserver).to.be.false;
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("should call getFirstDateEver on the given api and fetch the received data", () => {
            const expectedData = "data";
            let lastData = null,
                lastOnerror = null;

            cache.getFirstDateEver("thingId", "meansOfTransport", "onsuccess", "onerror", "onstart", "oncomplete", (key, apiCall) => {
                apiCall((data) => {
                    lastData = data;
                });
            }, {
                getFirstDateEver: (thingId, meansOfTransport, callback, onerror) => {
                    lastOnerror = onerror;
                    callback("data");
                }
            });

            expect(lastData).to.equal(expectedData);
            expect(lastOnerror).to.equal("onerror");
        });
    });
});
