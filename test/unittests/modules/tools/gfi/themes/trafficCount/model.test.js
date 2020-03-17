import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/trafficCount/model.js";

describe("tools/gfi/themes/trafficCount", function () {
    let model;

    before(function () {
        model = new Model();
    });
    describe("onIsVisibleEvent should set internal variable", function () {
        it("should set isCreated to false", function () {
            model.onIsVisibleEvent(null, false);
            expect(model.get("isCreated")).to.be.false;
        });
        it("should set isCreated to true", function () {
            model.create = () => {
                // do nothing.
            };
            model.onIsVisibleEvent(null, true);
            expect(model.get("isCreated")).to.be.true;
        });
    });
    describe("destroy", function () {
        it("should unsubscribe everything", function () {
            let hasUnsubscribed = false;

            const dummyApi = {
                unsubscribeEverything: () => {
                    hasUnsubscribed = true;
                }
            };

            model.set("propTrafficCountApi", dummyApi);

            hasUnsubscribed = false;
            model.destroy();
            expect(hasUnsubscribed).to.be.true;
        });
    });
    describe("addThousandPoints", function () {
        it("should parse a number and add thousand points", function () {
            expect(model.addThousandPoints(1234567)).to.equal("1.234.567");
        });
        it("should also parse any string and add thousand points focusing on numbers only", function () {
            expect(model.addThousandPoints("1234567")).to.equal("1.234.567");
            expect(model.addThousandPoints("foo1234bar56789")).to.equal("foo1.234bar56.789");
        });
        it("should return a zero as string if anything but a number or string is given", function () {
            expect(model.addThousandPoints(undefined)).to.equal("0");
            expect(model.addThousandPoints(false)).to.equal("0");
            expect(model.addThousandPoints(null)).to.equal("0");
            expect(model.addThousandPoints([])).to.equal("0");
            expect(model.addThousandPoints({})).to.equal("0");
        });
    });
    describe("getMeansOfTransportFromDatastream", function () {
        it("should return the key that matches the start of the given array of datastreams", function () {
            const datastreams = [
                    {
                        properties: {
                            layerName: "foobar"
                        }
                    }
                ],
                meansOfTransportArray = ["foo", "bar", "baz"];

            expect(model.getMeansOfTransportFromDatastream(datastreams, meansOfTransportArray)).to.equal("foo");
        });
    });
    describe("setupTabInfo", function () {
        it("should set the expected model values based on the given api", function () {
            const dummyApi = {
                updateTotal: (thingId, meansOfTransport, onupdate) => {
                    onupdate("2020-03-17", "foo");
                },
                updateYear: (thingId, meansOfTransport, year, onupdate) => {
                    onupdate("2020", "bar");
                },
                updateDay: (thingId, meansOfTransport, date, onupdate) => {
                    onupdate("2020-02-17", "baz");
                },
                updateHighestWorkloadDay: (thingId, meansOfTransport, year, onupdate) => {
                    onupdate("2020-01-17", "qox");
                },
                updateHighestWorkloadWeek: (thingId, meansOfTransport, year, onupdate) => {
                    onupdate("calendarWeek", "quix");
                },
                updateHighestWorkloadMonth: (thingId, meansOfTransport, year, onupdate) => {
                    onupdate("month", "foobar");
                }
            };

            model.setTotalDesc("");
            model.setTotalValue("");
            model.setThisYearDesc("");
            model.setThisYearValue("");
            model.setLastYearDesc("");
            model.setLastYearValue("");
            model.setLastDayDesc("");
            model.setLastDayValue("");
            model.setHighestWorkloadDayDesc("");
            model.setHighestWorkloadDayValue("");
            model.setHighestWorkloadWeekDesc("");
            model.setHighestWorkloadWeekValue("");
            model.setHighestWorkloadMonthDesc("");
            model.setHighestWorkloadMonthValue("");

            model.setupTabInfo(dummyApi, "thingId", "meansOfTransport");

            expect(model.get("totalDesc")).to.equal("17.03.2020");
            expect(model.get("totalValue")).to.equal("foo");
            expect(model.get("thisYearDesc")).to.equal("01.01.2020");
            expect(model.get("thisYearValue")).to.equal("bar");
            expect(model.get("lastYearDesc")).to.equal("2020");
            expect(model.get("lastYearValue")).to.equal("bar");
            expect(model.get("lastDayDesc")).to.equal("17.02.2020");
            expect(model.get("lastDayValue")).to.equal("baz");
            expect(model.get("highestWorkloadDayDesc")).to.equal("17.01.2020");
            expect(model.get("highestWorkloadDayValue")).to.equal("qox");
            expect(model.get("highestWorkloadWeekDesc")).to.equal("calendarWeek");
            expect(model.get("highestWorkloadWeekValue")).to.equal("quix");
            expect(model.get("highestWorkloadMonthDesc")).to.equal("month");
            expect(model.get("highestWorkloadMonthValue")).to.equal("foobar");
        });
    });
});
