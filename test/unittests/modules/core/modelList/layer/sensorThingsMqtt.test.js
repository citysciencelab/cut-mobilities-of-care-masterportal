import {expect} from "chai";
import {SensorThingsMqtt, SensorThingsMqttClient} from "@modules/core/modelList/layer/sensorThingsMqtt";

describe("core/modelList/layer/SensorThingsMqtt", function () {
    describe("SensorThingsMqtt connect", function () {
        const mqtt = new SensorThingsMqtt(),
            mqttTest = {
                connect: function () {
                    return "testclient";
                }
            };

        it("should have a connect function", function () {
            expect(typeof mqtt.connect === "function").to.be.true;
        });
        it("should return a new client and call connect on the given mqtt object", function () {
            const client = mqtt.connect({
                host: "foo"
            }, mqttTest);

            expect(typeof client.on === "function").to.be.true;
            expect(typeof client.subscribe === "function").to.be.true;
            expect(typeof client.unsubscribe === "function").to.be.true;

            expect(client.getMqttClient()).to.equal("testclient");
        });

        it("should warn if the host is not set in the mqtt options", function () {
            let lastError = false;

            /**
             * a function to call on error
             * @param {String} errormsg the error message as String
             * @returns {Void}  -
             */
            function onerror (errormsg) {
                lastError = errormsg;
            }

            mqtt.connect({}, mqttTest, onerror);
            expect(lastError).to.be.a("string");
        });
    });

    describe("SensorThingsMqttClient", function () {
        /**
         * declaration of the MqttTestClientClass to test the MqttClient with
         * @returns {Void}  -
         */
        function MqttTestClientClass () {
            let lastWhat,
                lastHandler,
                lastTopic,
                lastOptions,
                lastUnsubscribeTopic;

            this.getLastWhat = function () {
                return lastWhat;
            };
            this.getLastHandler = function () {
                return lastHandler;
            };
            this.getLastTopic = function () {
                return lastTopic;
            };
            this.getLastOptions = function () {
                return lastOptions;
            };
            this.getLastUnsubscribeTopic = function () {
                return lastUnsubscribeTopic;
            };

            this.on = function (what, handler) {
                lastWhat = what;
                lastHandler = handler;
            };
            this.subscribe = function (topic, options) {
                lastTopic = topic;
                lastOptions = options;
            };
            this.unsubscribe = function (topic) {
                lastUnsubscribeTopic = topic;
            };
        }

        const mqttTestClient = new MqttTestClientClass(),
            testContext = {
                barTest: function () {
                    return "bar";
                }
            },
            client = new SensorThingsMqttClient(mqttTestClient, "testhost", testContext);

        describe("the 'on' event setter", function () {
            it("should call the on function of the given mqttTestClient", function () {
                client.on("foo", function () {
                    return true;
                });
                expect(mqttTestClient.getLastWhat()).to.equal("foo");
                expect(typeof mqttTestClient.getLastHandler() === "function").to.be.true;
            });
            it("should apply the context to every handler given by the on function", function () {
                client.on("foo", function () {
                    return this.barTest();
                });
                expect(mqttTestClient.getLastHandler()()).to.equal("bar");
            });
            it("should parse the payload to JSON if the event name is 'message'", function () {
                client.on("message", function (topic, payload) {
                    return payload;
                });
                expect(mqttTestClient.getLastHandler()("testTopic", "{\"foo\": \"bar\"}")).to.deep.equal({foo: "bar"});
            });
            it("if the payload isn't a valid JSON string, it should not parse the payload, even if the event name is 'message'", function () {
                expect(mqttTestClient.getLastHandler()("testTopic", undefined)).to.equal(undefined);
            });
        });

        describe("subscribe", function () {
            let httpLastUrl = false;

            /**
             * Setter for httpLastUrl
             * @param {String} url the url to update httpLastUrl with
             * @returns {Void}  -
             */
            function httpTestClient (url) {
                httpLastUrl = url;
            }

            it("should call the subscribe function of the mqttClient without simulating retained messages if rmSimulate is set to false", function () {
                client.subscribe("baz", {
                    rmSimulate: false,
                    rmHttpClient: httpTestClient
                });

                expect(mqttTestClient.getLastTopic()).to.equal("baz");
                expect(httpLastUrl).to.be.false;
            });
            it("should not simulate retained messages if retain is set to 2, even if rmSimulate is set to true", function () {
                client.subscribe("qux", {
                    retain: 2,
                    rmSimulate: true,
                    rmHttpClient: httpTestClient
                });

                expect(mqttTestClient.getLastTopic()).to.equal("qux");
                expect(httpLastUrl).to.be.false;
            });
            it("should simulate retained messages if rmSimulate is set to true and retain is 0 or 1", function () {
                client.subscribe("baz", {
                    retain: 0,
                    rmSimulate: true,
                    rmUrl: "https://example.com:8080",
                    rmHttpClient: httpTestClient
                });
                expect(httpLastUrl).to.equal("https://example.com:8080/baz");

                client.subscribe("qux", {
                    retain: 1,
                    rmSimulate: true,
                    rmUrl: "https://example.com:8080",
                    rmHttpClient: httpTestClient
                });
                expect(httpLastUrl).to.equal("https://example.com:8080/qux");
            });

            it("should extent the simulation url in case Observations are subscribed", function () {
                client.subscribe("baz/Observations", {
                    rmSimulate: true,
                    rmUrl: "https://example.com:8080",
                    rmHttpClient: httpTestClient
                });
                expect(httpLastUrl).to.equal("https://example.com:8080/baz/Observations?%24orderby=phenomenonTime%20desc&%24top=1");
            });
            it("should not extent the simulation url in case a Observation is subscribed with an exact identifier", function () {
                client.subscribe("baz/Observations(123456)", {
                    rmSimulate: true,
                    rmUrl: "https://example.com:8080",
                    rmHttpClient: httpTestClient
                });
                expect(httpLastUrl).to.equal("https://example.com:8080/baz/Observations(123456)");
            });
        });

        describe("unsubscribe", function () {
            it("should unsubscribe a topic", function () {
                client.unsubscribe("foobar");
                expect(mqttTestClient.getLastUnsubscribeTopic()).to.equal("foobar");
            });
        });
    });
});
