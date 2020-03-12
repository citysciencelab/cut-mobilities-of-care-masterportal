import {expect} from "chai";
import {TrafficCountApi} from "@modules/tools/gfi/themes/trafficCount/trafficCountApi";


describe("tools/gfi/themes/trafficCount/trafficCountApi", function () {
    describe("TrafficCountApi.constructor", function () {
        describe("TrafficCountApi.constructor: SensorThingsHttp", function () {
            it("should take the given dummy instead of creating a new instance of SensorThingsHttp", function () {
                const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "foo", "sensorThingsMqttOpt");

                expect(api.getSensorThingsHttp()).to.equal("foo");
            });
            it("should create a new instance of SensorThingsHttp on construction if no dummy was given", function () {
                const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", false, "sensorThingsMqttOpt");

                expect(api.getSensorThingsHttp().constructor.name).to.equal("SensorThingsHttp");
            });
        });

        describe("TrafficCountApi.constructor: SensorThingsMqtt", function () {
            it("should take the given dummy instead of creating a new instance of SensorThingsMqtt", function () {
                const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "foo");

                expect(api.getSensorThingsMqtt()).to.equal("foo");
                expect(api.getMqttClient()).to.be.false;
            });
            it("should create a new instance of SensorThingsMqtt on construction if no dummy was given", function () {
                const api = new TrafficCountApi("httpHost", "sensorThingsVersion", {host: "foo"}, "sensorThingsHttpOpt", false);

                expect(api.getSensorThingsMqtt().constructor.name).to.equal("SensorThingsMqtt");
                expect(api.getMqttClient().constructor.name).to.equal("SensorThingsMqttClient");
            });
        });

        describe("TrafficCountApi.constructor: baseUrlHttp", function () {
            it("should set the base url for http calls correctly at construction", function () {
                const api = new TrafficCountApi("https://www.example.com/foo", "version1234", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

                expect(api.getBaseUrlHttp()).to.equal("https://www.example.com/foo/version1234");
            });
        });

        describe("TrafficCountApi.constructor: subscriptionTopics", function () {
            it("should set the subscription topics as an empty object at time of construction", function () {
                const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

                expect(api.getSubscriptionTopics()).to.be.an("object").and.to.be.empty;
            });
        });

        describe("TrafficCountApi.constructor: SensorThingsMqttClient", function () {
            it("should use the given mqtt options to get the client from SensorThingsMqtt", function () {
                let lastMqttOptions = false;
                const dummySensorThingsMqtt = {
                        connect: (mqttOptions) => {
                            lastMqttOptions = mqttOptions;

                            return "baz";
                        }
                    },
                    api = new TrafficCountApi("httpHost", "sensorThingsVersion", {"foo": "bar"}, "sensorThingsHttpOpt", dummySensorThingsMqtt);

                expect(lastMqttOptions).to.deep.equal({"foo": "bar"});
                expect(api.getMqttClient()).to.equal("baz");
            });
            it("should set the on message event with an event", function () {
                let lastEventName = false,
                    lastCallback = false;
                const dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            on: (eventName, callback) => {
                                lastEventName = eventName;
                                lastCallback = callback;
                            }
                        };
                    }
                };

                new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", dummySensorThingsMqtt);

                expect(lastEventName).to.equal("message");
                expect(typeof lastCallback).to.equal("function");
            });
            it("should set the on message event with an event(topic, payload) that will give payload to all callbacks stored in subscriptionTopics[topic]", function () {
                let lastCallback = false;
                const dummySensorThingsMqtt = {
                        connect: () => {
                            return {
                                on: (eventName, callback) => {
                                    lastCallback = callback;
                                }
                            };
                        }
                    },
                    api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", dummySensorThingsMqtt),
                    lastPayloads = [];

                api.setSubscriptionTopics({
                    "foo": [
                        (payload) => {
                            lastPayloads.push(payload);
                        },
                        (payload) => {
                            lastPayloads.push(payload);
                        },
                        (payload) => {
                            lastPayloads.push(payload);
                        }
                    ]
                });

                expect(typeof lastCallback).to.equal("function");

                lastCallback("baz", "qux");
                expect(lastPayloads).to.be.an("array").that.is.empty;

                lastCallback("foo", "bar");
                expect(lastPayloads).to.deep.equal(["bar", "bar", "bar"]);
            });
        });
    });

    describe("TrafficCountApi.getSQLDate", function () {
        it("getSQLDate: should return a date in format YYYY-MM-DD if a specific date object is given", function () {
            const dt = new Date(),
                api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

            dt.setDate(1);
            dt.setMonth(1);
            dt.setYear(2000);

            expect(api.getSQLDate(dt)).to.equal("2000-02-01");
        });
        it("getSQLDate: should return the current day in format YYYY-MM-DD if no date object is given", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt"),
                dt = new Date(),
                year = dt.getFullYear(),
                month = String(dt.getMonth() + 1).length > 1 ? dt.getMonth() + 1 : "0" + (dt.getMonth() + 1),
                day = String(dt.getDate()).length > 1 ? dt.getDate() : "0" + dt.getDate();

            expect(api.getSQLDate()).to.equal(year + "-" + month + "-" + day);
        });
    });

    describe("TrafficCountApi.getYear", function () {
        it("getYear: should return a year in format YYYY if a specific date object is given", function () {
            const dt = new Date(),
                api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

            dt.setDate(1);
            dt.setMonth(1);
            dt.setYear(2000);

            expect(api.getYear(dt)).to.equal("2000");
        });
        it("getYear: should return the current year in format YYYY if no date object is given", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt"),
                year = String(new Date().getFullYear());

            expect(api.getYear()).to.equal(year);
        });
    });

    describe("TrafficCountApi.getMonday", function () {
        it("getMonday: should return the date of monday in format YYYY-MM-DD if a specific date object with a random day of the week is given", function () {
            const dt = new Date(),
                api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

            dt.setDate(1);
            dt.setMonth(0); // january
            dt.setYear(2020);

            expect(api.getMonday(dt)).to.equal("2019-12-30");

            dt.setDate(1);
            dt.setMonth(2); // march
            dt.setYear(2020);

            expect(api.getMonday(dt)).to.equal("2020-02-24");
        });
    });

    describe("TrafficCountApi.getNameOfMonth", function () {
        it("getNameOfMonth: should return the name of the given month", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

            expect(api.getNameOfMonth(0)).to.be.false;
            expect(api.getNameOfMonth(1)).to.equal("Januar");
            expect(api.getNameOfMonth(2)).to.equal("Februar");
            expect(api.getNameOfMonth(3)).to.equal("März");
            expect(api.getNameOfMonth(4)).to.equal("April");
            expect(api.getNameOfMonth(5)).to.equal("Mai");
            expect(api.getNameOfMonth(6)).to.equal("Juni");
            expect(api.getNameOfMonth(7)).to.equal("Juli");
            expect(api.getNameOfMonth(8)).to.equal("August");
            expect(api.getNameOfMonth(9)).to.equal("September");
            expect(api.getNameOfMonth(10)).to.equal("Oktober");
            expect(api.getNameOfMonth(11)).to.equal("November");
            expect(api.getNameOfMonth(12)).to.equal("Dezember");
            expect(api.getNameOfMonth(13)).to.be.false;
        });
    });

    describe("TrafficCountApi.getCalendarWeek", function () {
        it("getCalendarWeek: should return the number of week of the given date", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

            expect(api.getCalendarWeek("2020-03-16")).to.equal(12);
        });
    });

    describe("TrafficCountApi.checkForObservations", function () {
        it("checkForObservations: checks if the given dataset is an array with an object that has a key Datastreams which is an array with an object with an id and a key Observations that is an array", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt"),
                dataset = [
                    {
                        Datastreams: [
                            {
                                "@iot.id": "foo",
                                Observations: []
                            }
                        ]
                    }
                ];

            expect(api.checkForObservations(dataset)).to.be.true;
            expect(api.checkForObservations([{}])).to.be.false;
        });
    });

    describe("TrafficCountApi.sumObservations", function () {
        it("sumObservations: sum up the given observations", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt"),
                dataset = [{
                    Datastreams: [{
                        "@iot.id": "foo",
                        Observations: [
                            {result: 1},
                            {result: 2},
                            {result: 3},
                            {result: 4}
                        ]
                    }]
                }];

            expect(api.sumObservations(dataset)).to.equal(10);
            expect(api.sumObservations([{}])).to.be.false;
        });
    });

    describe("TrafficCountApi.getFirstDate", function () {
        it("getFirstDate: fetch the oldest date from the given observations", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt"),
                dataset = [{
                    Datastreams: [{
                        "@iot.id": "foo",
                        Observations: [
                            {phenomenonTime: "B date"},
                            {phenomenonTime: "C date"},
                            {phenomenonTime: "000000"},
                            {phenomenonTime: "D date"}
                        ]
                    }]
                }];

            expect(api.getFirstDate(dataset)).to.equal("000000");
            expect(api.getFirstDate([{}])).to.be.false;
        });
        it("getFirstDate: should take an initial date to account for the best first date initialy", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt"),
                dataset = [{
                    Datastreams: [{
                        "@iot.id": "foo",
                        Observations: [
                            {phenomenonTime: "C date"},
                            {phenomenonTime: "D date"},
                            {phenomenonTime: "B not first"},
                            {phenomenonTime: "E date"}
                        ]
                    }]
                }];

            expect(api.getFirstDate(dataset, "A first")).to.equal("A first");
            expect(api.getFirstDate([{}])).to.be.false;
        });
    });

    describe("TrafficCountApi.mqttSubscribe", function () {
        it("mqttSubscribe: should push a handler for the given topic on subscription topics", function () {
            const api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", "sensorThingsMqttOpt");

            api.setSubscriptionTopics({});
            api.mqttSubscribe("foo", false, "bar");

            expect(api.getSubscriptionTopics().hasOwnProperty("foo")).to.be.true;
            expect(api.getSubscriptionTopics().foo).to.be.an("array").that.is.not.empty;
            expect(api.getSubscriptionTopics().foo[0]).to.equal("bar");
        });
        it("mqttSubscribe: should use the mqtt client to subscribe to a topic with the given options", function () {
            let lastTopic = false,
                lastMqttOptions = false;
            const dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            subscribe: (topic, mqttOptions) => {
                                lastTopic = topic;
                                lastMqttOptions = mqttOptions;
                            }
                        };
                    }
                },
                api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", "sensorThingsHttpOpt", dummySensorThingsMqtt);

            api.mqttSubscribe("foo", "quix");

            expect(lastTopic).to.equal("foo");
            expect(lastMqttOptions).to.equal("quix");
        });
    });

    describe("TrafficCountApi.updateTitle", function () {
        it("updateTitle: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", dummySensorThingsHttp, "sensorThingsMqttOpt");

            api.updateTitle("thingId", "onupdate", "onerror", "onstart", "oncomplete");

            expect(lastUrl).to.equal("httpHost/sensorThingsVersion/Things(thingId)");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("updateTitle: should call onupdate with the property name of the first element in the received payload", function () {
            let lastTitle = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            name: "foo"
                        }]);
                    }
                },
                api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", dummySensorThingsHttp, "sensorThingsMqttOpt");

            api.updateTitle(false, title => {
                lastTitle = title;
            });

            expect(lastTitle).to.equal("foo");
        });
        it("updateTitle: should call onerror with an error message if no property name was found on the first element in the received payload", function () {
            let lastError = false;
            const dummySensorThingsHttp = {
                    get: false
                },
                api = new TrafficCountApi("httpHost", "sensorThingsVersion", "mqttOptions", dummySensorThingsHttp, "sensorThingsMqttOpt");

            lastError = false;
            dummySensorThingsHttp.get = (url, onupdate) => {
                return onupdate([{
                    foo: "bar"
                }]);
            };
            api.updateTitle(false, false, (error) => {
                lastError = error;
            });
            expect(lastError).to.be.a.string;

            lastError = false;
            dummySensorThingsHttp.get = (url, onupdate) => {
                onupdate(["foo"]);
                return false;
            };
            api.updateTitle(false, false, (error) => {
                lastError = error;
            });
            expect(lastError).to.be.a.string;

            lastError = false;
            dummySensorThingsHttp.get = (url, onupdate) => {
                onupdate("foo");
                return false;
            };
            api.updateTitle(false, false, (error) => {
                lastError = error;
            });
            expect(lastError).to.be.a.string;

            lastError = false;
            dummySensorThingsHttp.get = (url, onupdate) => {
                onupdate();
                return false;
            };
            api.updateTitle(false, false, (error) => {
                lastError = error;
            });
            expect(lastError).to.be.a.string;
        });
    });

    describe("TrafficCountApi.updateDay", function () {
        it("updateDay: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.updateDay("thingId", "meansOfTransport", "day", "onupdate", "onerror", "onstart", "oncomplete", "dayTodayOpt");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_15-Min';$expand=Observations($filter=date(phenomenonTime) eq 'day'))");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("updateDay: should call onupdate with a sum of all given observation result values", function () {
            let lastDate = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1},
                                    {result: 2},
                                    {result: 3},
                                    {result: 4}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedDate = "day",
                expectedValue = 10;

            api.updateDay("thingId", "meansOfTransport", "day", (date, value) => {
                lastDate = date;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", "dayTodayOpt");

            expect(lastDate).to.equal(expectedDate);
            expect(lastValue).to.equal(expectedValue);
        });
        it("updateDay: should initialize mqtt subscription on topic with given options if the given day equals today", function () {
            let lastTopic = false,
                lastMqttOptions = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: []
                            }]
                        }]);
                    }
                },
                dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            subscribe: (topic, mqttOptions) => {
                                lastTopic = topic;
                                lastMqttOptions = mqttOptions;
                            }
                        };
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, dummySensorThingsMqtt),
                expectedTopic = "v1234/Datastreams(foo)/Observations",
                expectedMqttOptions = {retain: 2};

            // hint: day === dayTodayOpt with "day" === "day"
            api.updateDay("thingId", "meansOfTransport", "day", "onupdate", "onerror", "onstart", "oncomplete", "day");

            expect(lastTopic).to.equal(expectedTopic);
            expect(lastMqttOptions).to.deep.equal(expectedMqttOptions);
        });
        it("updateDay: should not initialize mqtt subscription on topic with given options if the given day does not equal today", function () {
            let lastTopic = false,
                lastMqttOptions = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: []
                            }]
                        }]);
                    }
                },
                dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            subscribe: (topic, mqttOptions) => {
                                lastTopic = topic;
                                lastMqttOptions = mqttOptions;
                            }
                        };
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, dummySensorThingsMqtt);

            // hint: day !== dayTodayOpt with "day" !== "today"
            api.updateDay("thingId", "meansOfTransport", "day", "onupdate", "onerror", "onstart", "oncomplete", "today");

            expect(lastTopic).to.be.false;
            expect(lastMqttOptions).to.be.false;
        });
        it("updateDay: should add any number received by observation.result via mqtt to the current sum and call onupdate", function () {
            let lastSum = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1},
                                    {result: 2},
                                    {result: 3},
                                    {result: 4}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(foo)/Observations";

            api.setSubscriptionTopics({});

            // hint: day === dayTodayOpt with "day" === "day"
            api.updateDay("thingId", "meansOfTransport", "day", (date, value) => {
                lastSum = value;
            }, "onerror", "onstart", "oncomplete", "day");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopic][0]({result: 5});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 6});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 7});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 8});

            expect(lastSum).to.equal(36);
        });
        it("updateDay: should call onerror if no observation was found in http response", function () {
            let lastErrorMessage = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                wrongObservations: []
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi(false, false, {}, dummySensorThingsHttp, true);

            // hint: day === dayTodayOpt with "day" === "day"
            api.updateDay("thingId", "meansOfTransport", "day", "onupdate", (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete", "day");

            expect(lastErrorMessage).to.be.a("string");
        });
        it("updateDay: should call on error if a received observation via mqtt has no result key", function () {
            let lastErrorMessage = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: []
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(foo)/Observations";

            // hint: day === dayTodayOpt with "day" === "day"
            api.updateDay("thingId", "meansOfTransport", "day", "onupdate", (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete", "day");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopic][0]({wrongResult: 1});

            expect(lastErrorMessage).to.be.a("string");
        });
    });

    describe("TrafficCountApi.updateYear", function () {
        it("updateYear: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.updateYear("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", "yearTodayOpt");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_1-Woche';$expand=Observations($filter=year(phenomenonTime) eq 'year'))");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("updateYear: should call onupdate with a sum of all given observation result values if year does not equal todays year", function () {
            let lastDate = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1},
                                    {result: 2},
                                    {result: 3},
                                    {result: 4}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedDate = "year",
                expectedValue = 10;

            api.updateYear("thingId", "meansOfTransport", "year", (date, value) => {
                lastDate = date;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", "yearTodayOpt");

            expect(lastDate).to.equal(expectedDate);
            expect(lastValue).to.equal(expectedValue);
        });
        it("updateYear: should call onupdate with a sum of all observations for the _1-Woche and _15-Min urls if year does equal todays year", function () {
            let lastDate = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        if (url.indexOf("_1-Woche") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "foo",
                                    Observations: [
                                        {result: 1},
                                        {result: 2},
                                        {result: 3},
                                        {result: 4}
                                    ]
                                }]
                            }]);
                        }
                        else if (url.indexOf("_15-Min") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "bar",
                                    Observations: [
                                        {result: 5},
                                        {result: 6},
                                        {result: 7},
                                        {result: 8}
                                    ]
                                }]
                            }]);
                        }
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedDate = "year",
                expectedValue = 36;

            api.updateYear("thingId", "meansOfTransport", "year", (date, value) => {
                lastDate = date;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete", "year");

            expect(lastDate).to.equal(expectedDate);
            expect(lastValue).to.equal(expectedValue);
        });
        it("updateYear: should not initialize mqtt subscription on topic with given options if the given year does not equal todays year", function () {
            let lastTopic = false,
                lastMqttOptions = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: []
                            }]
                        }]);
                    }
                },
                dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            subscribe: (topic, mqttOptions) => {
                                lastTopic = topic;
                                lastMqttOptions = mqttOptions;
                            }
                        };
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, dummySensorThingsMqtt);

            // hint: year !== yearTodayOpt with "year" !== "todays year"
            api.updateYear("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete", "todays year");

            expect(lastTopic).to.be.false;
            expect(lastMqttOptions).to.be.false;
        });
        it("updateYear: should add any number received by observation.result via mqtt to the current sum and call onupdate", function () {
            let lastSum = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        if (url.indexOf("_1-Woche") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "foo",
                                    Observations: [
                                        {result: 1},
                                        {result: 2},
                                        {result: 3},
                                        {result: 4}
                                    ]
                                }]
                            }]);
                        }
                        else if (url.indexOf("_15-Min") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "bar",
                                    Observations: [
                                        {result: 5},
                                        {result: 6},
                                        {result: 7},
                                        {result: 8}
                                    ]
                                }]
                            }]);
                        }
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(bar)/Observations";

            api.setSubscriptionTopics({});

            // hint: year === yearTodayOpt with "year" === "todays year"
            api.updateYear("thingId", "meansOfTransport", "year", (date, value) => {
                lastSum = value;
            }, "onerror", "onstart", "oncomplete", "year");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopic][0]({result: 9});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 10});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 11});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 12});

            expect(lastSum).to.equal(78);
        });
        it("updateYear: should call onerror if no observation was found in http response", function () {
            let lastErrorMessage = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                wrongObservations: []
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi(false, false, {}, dummySensorThingsHttp, true);

            // hint: year === yearTodayOpt with "year" === "todays year"
            api.updateYear("thingId", "meansOfTransport", "day", "onupdate", (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete", "day");

            expect(lastErrorMessage).to.be.a("string");
        });
        it("updateYear: should call on error if a received observation via mqtt has no result key", function () {
            let lastErrorMessage = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: []
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(foo)/Observations";

            // hint: year === yearTodayOpt with "year" === "todays year"
            api.updateYear("thingId", "meansOfTransport", "year", "onupdate", (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete", "year");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopic][0]({wrongResult: 1});

            expect(lastErrorMessage).to.be.a("string");
        });
    });

    describe("TrafficCountApi.updateTotal", function () {
        it("updateTotal: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.updateTotal("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_1-Woche';$expand=Observations)");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal(false);
        });
        it("updateTotal: should call onupdate with a sum of all given observation result values", function () {
            let lastFirstDate = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1, phenomenonTime: "C some date"},
                                    {result: 2, phenomenonTime: "D some date"},
                                    {result: 3, phenomenonTime: "0000"},
                                    {result: 4, phenomenonTime: "B some date"}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedDate = "0000",
                expectedValue = 20;

            api.updateTotal("thingId", "meansOfTransport", (date, value) => {
                lastFirstDate = date;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete");

            expect(lastFirstDate).to.equal(expectedDate);
            expect(lastValue).to.equal(expectedValue);
        });
        it("updateTotal: should call onupdate with a sum of all observations for the _1-Woche and _15-Min urls", function () {
            let lastDate = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        if (url.indexOf("_1-Woche") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "foo",
                                    Observations: [
                                        {result: 1, phenomenonTime: "some date"},
                                        {result: 2, phenomenonTime: "some date"},
                                        {result: 3, phenomenonTime: "some date"},
                                        {result: 4, phenomenonTime: "some date"}
                                    ]
                                }]
                            }]);
                        }
                        else if (url.indexOf("_15-Min") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "bar",
                                    Observations: [
                                        {result: 5, phenomenonTime: "some date"},
                                        {result: 6, phenomenonTime: "0000"},
                                        {result: 7, phenomenonTime: "some date"},
                                        {result: 8, phenomenonTime: "some date"}
                                    ]
                                }]
                            }]);
                        }
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedDate = "0000",
                expectedValue = 36;

            api.updateTotal("thingId", "meansOfTransport", (date, value) => {
                lastDate = date;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete");

            expect(lastDate).to.equal(expectedDate);
            expect(lastValue).to.equal(expectedValue);
        });
        it("updateTotal: should add any number received by observation.result via mqtt to the current sum and call onupdate", function () {
            let lastSum = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        if (url.indexOf("_1-Woche") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "foo",
                                    Observations: [
                                        {result: 1, phenomenonTime: "some date"},
                                        {result: 2, phenomenonTime: "some date"},
                                        {result: 3, phenomenonTime: "some date"},
                                        {result: 4, phenomenonTime: "some date"}
                                    ]
                                }]
                            }]);
                        }
                        else if (url.indexOf("_15-Min") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "bar",
                                    Observations: [
                                        {result: 5, phenomenonTime: "some date"},
                                        {result: 6, phenomenonTime: "some date"},
                                        {result: 7, phenomenonTime: "some date"},
                                        {result: 8, phenomenonTime: "some date"}
                                    ]
                                }]
                            }]);
                        }
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(bar)/Observations";

            api.setSubscriptionTopics({});

            api.updateTotal("thingId", "meansOfTransport", (date, value) => {
                lastSum = value;
            }, "onerror", "onstart", "oncomplete");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopic][0]({result: 9});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 10});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 11});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 12});

            expect(lastSum).to.equal(78);
        });
        it("updateTotal: should call onerror if no observation was found in http response", function () {
            let lastErrorMessage = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                wrongObservations: []
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi(false, false, {}, dummySensorThingsHttp, true);

            api.updateTotal("thingId", "meansOfTransport", "onupdate", (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete");

            expect(lastErrorMessage).to.be.a("string");
        });
        it("updateTotal: should call on error if a received observation via mqtt has no result key", function () {
            let lastErrorMessage = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: []
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(foo)/Observations";

            api.updateTotal("thingId", "meansOfTransport", "onupdate", (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopic][0]({wrongResult: 1});

            expect(lastErrorMessage).to.be.a("string");
        });
    });

    describe("TrafficCountApi.updateStrongestDay", function () {
        it("updateStrongestDay: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.updateStrongestDay("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_1-Tag';$expand=Observations($filter=year(phenomenonTime) eq 'year';$orderby=result DESC;$top=1))");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("updateStrongestDay: should call onupdate with the found date and value", function () {
            let lastDate = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1, phenomenonTime: "0000"}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedDate = "0000",
                expectedValue = 1;

            api.updateStrongestDay("thingId", "meansOfTransport", "year", (date, value) => {
                lastDate = date;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete");

            expect(lastDate).to.equal(expectedDate);
            expect(lastValue).to.equal(expectedValue);
        });
    });

    describe("TrafficCountApi.updateStrongestWeek", function () {
        it("updateStrongestWeek: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.updateStrongestWeek("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_1-Woche';$expand=Observations($filter=year(phenomenonTime) eq 'year';$orderby=result DESC;$top=1))");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("updateStrongestWeek: should call onupdate with the found date and value", function () {
            let lastCalendarWeek = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1, phenomenonTime: "2020-03-16"}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedCalendarWeek = 12,
                expectedValue = 1;

            api.updateStrongestWeek("thingId", "meansOfTransport", "year", (calendarWeek, value) => {
                lastCalendarWeek = calendarWeek;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete");

            expect(lastCalendarWeek).to.equal(expectedCalendarWeek);
            expect(lastValue).to.equal(expectedValue);
        });
    });

    describe("TrafficCountApi.updateStrongestMonth", function () {
        it("updateStrongestMonth: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.updateStrongestMonth("thingId", "meansOfTransport", "year", "onupdate", "onerror", "onstart", "oncomplete");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_1-Tag';$expand=Observations($filter=year(phenomenonTime) eq 'year'))");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("updateStrongestMonth: should call onupdate with the best month and value of all received observations", function () {
            let lastMonth = false,
                lastValue = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1, phenomenonTime: "2010-01-01"},
                                    {result: 2, phenomenonTime: "2010-03-01"},
                                    {result: 3, phenomenonTime: "2010-03-01"},
                                    {result: 4, phenomenonTime: "2010-03-01"},
                                    {result: 5, phenomenonTime: "2010-04-01"}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedMonth = "März",
                expectedValue = 9;

            api.updateStrongestMonth("thingId", "meansOfTransport", "year", (date, value) => {
                lastMonth = date;
                lastValue = value;
            }, "onerror", "onstart", "oncomplete");

            expect(lastMonth).to.equal(expectedMonth);
            expect(lastValue).to.equal(expectedValue);
        });
    });

    describe("TrafficCountApi.updateDataset", function () {
        it("updateDataset: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.updateDataset("thingId", "meansOfTransport", "interval", "from", "until", "onupdate", "onerror", "onstart", "oncomplete", "todayUntilOpt");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_interval';$expand=Observations($filter=date(phenomenonTime) ge 'from' and date(phenomenonTime) le 'until'))");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("updateDataset: should call onupdate with a dataset generated out of the found observations without subscription if until does not equal todays date", function () {
            let lastDataset = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1, phenomenonTime: "some date A"},
                                    {result: 2, phenomenonTime: "some date B"},
                                    {result: 3, phenomenonTime: "some long date C"},
                                    {result: 4, phenomenonTime: "some other long date D"}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedDataset = {
                    meansOfTransport: {
                        "some date A": 1,
                        "some date B": 2,
                        "some long date C": 3,
                        "some other long date D": 4
                    }
                };

            api.updateDataset("thingId", "meansOfTransport", "interval", "from", "until", (dataset) => {
                lastDataset = dataset;
            }, "onerror", "onstart", "oncomplete", "todayUntilOpt");

            expect(lastDataset).to.deep.equal(expectedDataset);
        });
        it("updateDataset: should subscribe via mqtt retain 2 if param until equals today", function () {
            let lastTopic = false,
                lastMqttOptions = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: []
                            }]
                        }]);
                    }
                },
                dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            subscribe: (topic, mqttOptions) => {
                                lastTopic = topic;
                                lastMqttOptions = mqttOptions;
                            }
                        };
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {host: "foobar"}, dummySensorThingsHttp, dummySensorThingsMqtt);

            // hint: until === todayUntilOpt with "until" === "today"
            api.updateDataset("thingId", "meansOfTransport", "interval", "from", "until", "onupdate", "onerror", "onstart", "oncomplete", "until");

            expect(lastTopic).to.equal("v1234/Datastreams(foo)/Observations");
            expect(lastMqttOptions).to.deep.equal({retain: 2});
        });
        it("updateDataset: should resend the result with new data to onupdate anytime a subscribed message was received", function () {
            let lastDataset = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo",
                                Observations: [
                                    {result: 1, phenomenonTime: "some date A"}
                                ]
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(foo)/Observations",
                expectedDataset = {
                    meansOfTransport: {
                        "some date A": 1,
                        "some date B": 2,
                        "some long date C": 3,
                        "some other long date D": 4,
                        "and the last date E": 5
                    }
                };

            api.setSubscriptionTopics({});

            // hint: until === todayUntilOpt with "until" === "today"
            api.updateDataset("thingId", "meansOfTransport", "interval", "from", "until", (dataset) => {
                lastDataset = dataset;
            }, "onerror", "onstart", "oncomplete", "until");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopic][0]({result: 2, phenomenonTime: "some date B"});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 3, phenomenonTime: "some long date C"});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 4, phenomenonTime: "some other long date D"});
            api.getSubscriptionTopics()[expectedTopic][0]({result: 5, phenomenonTime: "and the last date E"});

            expect(lastDataset).to.deep.equal(expectedDataset);
        });
        it("updateDataset: should add antSV data to dataset if meansOfTransport equals 'anzFahrzeuge'; should resend data anytime a subscribed message was received", function () {
            let lastDataset = false;

            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        if (url.indexOf("AnzFahrzeuge") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "foo",
                                    Observations: [
                                        {result: 1000, phenomenonTime: "some date A"}
                                    ]
                                }]
                            }]);
                        }
                        else if (url.indexOf("AntSV") !== -1) {
                            onupdate([{
                                Datastreams: [{
                                    "@iot.id": "bar",
                                    Observations: [
                                        {result: 1, phenomenonTime: "some date A"}
                                    ]
                                }]
                            }]);
                        }
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                meansOfTransport = "AnzFahrzeuge",
                expectedTopicFahrzeuge = "v1234/Datastreams(foo)/Observations",
                expectedTopicSV = "v1234/Datastreams(bar)/Observations";

            api.setSubscriptionTopics({});

            // hint: until === todayUntilOpt with "until" === "today"
            api.updateDataset("thingId", meansOfTransport, "interval", "from", "until", (dataset) => {
                lastDataset = dataset;
            }, "onerror", "onstart", "oncomplete", "until");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopicFahrzeuge)).to.be.true;
            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopicSV)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopicFahrzeuge]).to.be.an("array").that.is.not.empty;
            expect(api.getSubscriptionTopics()[expectedTopicSV]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopicFahrzeuge][0] === "function").to.be.true;
            expect(typeof api.getSubscriptionTopics()[expectedTopicSV][0] === "function").to.be.true;

            // stimulate subscription handler
            api.getSubscriptionTopics()[expectedTopicFahrzeuge][0]({result: 2000, phenomenonTime: "some date B"});
            expect(lastDataset).to.deep.equal({
                AnzFahrzeuge: {
                    "some date A": 1000,
                    "some date B": 2000
                },
                AntSV: {
                    "some date A": 1
                }
            });

            api.getSubscriptionTopics()[expectedTopicSV][0]({result: 2, phenomenonTime: "some long date C"});
            expect(lastDataset).to.deep.equal({
                AnzFahrzeuge: {
                    "some date A": 1000,
                    "some date B": 2000
                },
                AntSV: {
                    "some date A": 1,
                    "some long date C": 2
                }
            });

            api.getSubscriptionTopics()[expectedTopicSV][0]({result: 3, phenomenonTime: "some other long date D"});
            expect(lastDataset).to.deep.equal({
                AnzFahrzeuge: {
                    "some date A": 1000,
                    "some date B": 2000
                },
                AntSV: {
                    "some date A": 1,
                    "some long date C": 2,
                    "some other long date D": 3
                }
            });

            api.getSubscriptionTopics()[expectedTopicFahrzeuge][0]({result: 3000, phenomenonTime: "and the last date E"});
            expect(lastDataset).to.deep.equal({
                AnzFahrzeuge: {
                    "some date A": 1000,
                    "some date B": 2000,
                    "and the last date E": 3000
                },
                AntSV: {
                    "some date A": 1,
                    "some long date C": 2,
                    "some other long date D": 3
                }
            });
        });
    });

    describe("TrafficCountApi.subscribeLastUpdate", function () {
        it("subscribeLastUpdate: should build a correct url and call it via given http dummy", function () {
            let lastOnupdate = false,
                lastOnstart = false,
                lastOncomplete = false,
                lastOnerror = false,
                lastUrl = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate, onstart, oncomplete, onerror) => {
                        lastUrl = url;
                        lastOnupdate = onupdate;
                        lastOnstart = onstart;
                        lastOncomplete = oncomplete;
                        lastOnerror = onerror;
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.subscribeLastUpdate("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete");

            expect(lastUrl).to.equal("https://www.example.com/v1234/Things(thingId)?$expand=Datastreams($filter=properties/layerName eq 'meansOfTransport_15-Min')");
            expect(typeof lastOnupdate === "function").to.be.true;
            expect(lastOnerror).to.equal("onerror");
            expect(lastOnstart).to.equal("onstart");
            expect(lastOncomplete).to.equal("oncomplete");
        });
        it("subscribeLastUpdate: should create a new subscription topic", function () {
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo"
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(foo)/Observations";

            api.setSubscriptionTopics({});
            api.subscribeLastUpdate("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete");

            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
        });
        it("subscribeLastUpdate: should subscribe to a subscription topic with mqtt options retain 0 and rmSimulate true", function () {
            let lastTopic = false,
                lastMqttOptions = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo"
                            }]
                        }]);
                    }
                },
                dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            subscribe: (topic, mqttOptions) => {
                                lastTopic = topic;
                                lastMqttOptions = mqttOptions;
                            }
                        };
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {host: "foobar"}, dummySensorThingsHttp, dummySensorThingsMqtt);

            api.subscribeLastUpdate("thingId", "meansOfTransport", "onupdate", "onerror", "onstart", "oncomplete");

            expect(lastTopic).to.equal("v1234/Datastreams(foo)/Observations");
            expect(lastMqttOptions).to.deep.equal({retain: 0, rmSimulate: true});
        });
        it("subscribeLastUpdate: should push an event to subscriptionTopics that will hand over phenomenonTime to the given onupdate handler", function () {
            let lastPhenomenonTime = false,
                lastErrorMessage = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "@iot.id": "foo"
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true),
                expectedTopic = "v1234/Datastreams(foo)/Observations";

            api.setSubscriptionTopics({});
            api.subscribeLastUpdate("thingId", "meansOfTransport", (phenomenonTime) => {
                lastPhenomenonTime = phenomenonTime;
            }, "onerror", "onstart", "oncomplete");
            api.subscribeLastUpdate("foo", "quix", (phenomenonTime) => {
                lastPhenomenonTime = phenomenonTime;
            });
            expect(api.getSubscriptionTopics().hasOwnProperty(expectedTopic)).to.be.true;
            expect(api.getSubscriptionTopics()[expectedTopic]).to.be.an("array").that.is.not.empty;
            expect(typeof api.getSubscriptionTopics()[expectedTopic][0] === "function").to.be.true;
            api.getSubscriptionTopics()[expectedTopic][0]({
                phenomenonTime: "bar"
            });
            expect(lastPhenomenonTime).to.equal("bar");

            lastPhenomenonTime = false;
            api.setSubscriptionTopics({});
            api.subscribeLastUpdate("thingId", "meansOfTransport", (phenomenonTime) => {
                lastPhenomenonTime = phenomenonTime;
            }, (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete");
            api.getSubscriptionTopics()[expectedTopic][0]({
                wrongPhenomenonTime: "baz"
            });
            expect(lastPhenomenonTime).to.be.false;
            expect(lastErrorMessage).to.be.a("string");
        });

        it("subscribeLastUpdate: should call onerror if no Datastream with a @iot.id was found in payload", function () {
            let lastErrorMessage = false;
            const dummySensorThingsHttp = {
                    get: (url, onupdate) => {
                        onupdate([{
                            Datastreams: [{
                                "wrong@iot.id": "foo"
                            }]
                        }]);
                    }
                },
                api = new TrafficCountApi("https://www.example.com", "v1234", {}, dummySensorThingsHttp, true);

            api.setSubscriptionTopics({});
            api.subscribeLastUpdate("thingId", "meansOfTransport", "onupdate", (error) => {
                lastErrorMessage = error;
            }, "onstart", "oncomplete");

            expect(api.getSubscriptionTopics()).to.be.empty;
            expect(lastErrorMessage).to.be.a("string");
        });
    });

    describe("TrafficCountApi.unsubscribeEverything", function () {
        it("unsubscribeEverything: should empty subscription topics", function () {
            const api = new TrafficCountApi(false, false, {}, true, true);

            api.setSubscriptionTopics({
                foo: "bar",
                baz: "qox"
            });

            api.unsubscribeEverything();

            expect(api.getSubscriptionTopics()).to.be.empty;
        });
        it("unsubscribeEverything: should call unsubscribe on the given mqtt client for each topic found in subscription topics", function () {
            const unsubscribedTopics = [],
                dummySensorThingsMqtt = {
                    connect: () => {
                        return {
                            unsubscribe: (topic) => {
                                unsubscribedTopics.push(topic);
                            }
                        };
                    }
                },
                api = new TrafficCountApi(false, false, {}, true, dummySensorThingsMqtt);

            api.setSubscriptionTopics({
                foo: "bar",
                baz: "qox"
            });

            api.unsubscribeEverything();

            expect(unsubscribedTopics).to.be.an("array").to.deep.equal(["foo", "baz"]);
        });
        it("unsubscribeEverything: should call onsuccess after unsubscribing everything topic found in subscription topics", function () {
            let onsuccessCalled = false;
            const api = new TrafficCountApi(false, false, {}, true, true);

            api.unsubscribeEverything(() => {
                onsuccessCalled = true;
            });

            expect(onsuccessCalled).to.be.true;
        });
    });
});
