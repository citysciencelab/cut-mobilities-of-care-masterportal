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
            expect(model.get("highestWorkloadWeekDesc")).to.equal("KW calendarWeek");
            expect(model.get("highestWorkloadWeekValue")).to.equal("quix");
            expect(model.get("highestWorkloadMonthDesc")).to.equal("month");
            expect(model.get("highestWorkloadMonthValue")).to.equal("foobar");
        });
    });

    describe("addD3LegendData", function () {
        it("should create an array of objects{class, style, text} that can be used as legend data for the D3 diagram", function () {
            const legendData = [],
                legendDataExpected = [{
                    class: "classname",
                    style: "stylename",
                    text: "text"
                }];

            model.addD3LegendData("classname", "stylename", "text", legendData);

            expect(legendData).to.deep.equal(legendDataExpected);
        });
    });

    describe("addD3AttrToShowArray", function () {
        it("should create an array of objects{attrName, attrClass} to be used as 'attrToShowArray'", function () {
            const attrToShowArray = [],
                attrToShowArrayExpected = [{attrClass: "classname", attrName: "yAttr"}];

            model.addD3AttrToShowArray("yAttr", "classname", attrToShowArray);

            expect(attrToShowArray).to.deep.equal(attrToShowArrayExpected);
        });
    });

    describe("addD3LineData", function () {
        it("should create an array of objects{class, style, (xAttr), (yAttr)} that can be used as dataset for the D3 diagram", function () {
            const lineData = model.addD3LineData("classname", "stylename", "xAttr", "yAttr", function () {
                    return "foobar";
                }, {
                    "foo": "bar"
                }, {
                    "foobar": {"xAttr": "foobar"}
                }),
                lineDataExpected = [{
                    class: "classname",
                    style: "stylename",
                    date: "foo",
                    xAttr: "foobar",
                    yAttr: "bar"
                }];

            expect(lineData).to.deep.equal(lineDataExpected);
        });
    });

    describe("getXAxisTickValuesDay", function () {
        it("should generate an array of xAxis Attributes to be shown in the diagram", function () {
            const xAxisTickValues = model.getXAxisTickValuesDay(),
                xAxisTickValuesExpected = ["00:00", "06:00", "12:00", "18:00", "23:00"];

            expect(xAxisTickValues).to.deep.equal(xAxisTickValuesExpected);
        });
    });

    describe("getXAxisTickValuesWeek", function () {
        it("should generate an array of xAxis Attributes to be shown in the diagram", function () {
            const xAxisTickValues = model.getXAxisTickValuesWeek(),
                xAxisTickValuesExpected = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

            expect(xAxisTickValues).to.deep.equal(xAxisTickValuesExpected);
        });
    });

    describe("getXAxisTickValuesYear", function () {
        it("should generate an array of xAxis Attributes to be shown in the diagram", function () {
            const xAxisTickValues = model.getXAxisTickValuesYear(),
                xAxisTickValuesExpected = [
                    "Jan.",
                    "Feb.",
                    "März",
                    "Apr.",
                    "Mai",
                    "Juni",
                    "Juli",
                    "Aug.",
                    "Sep.",
                    "Okt.",
                    "Nov.",
                    "Dez."
                ];

            expect(xAxisTickValues).to.deep.equal(xAxisTickValuesExpected);
        });
    });

    describe("getEmptyDiagramDataYear", function () {
        it("should return a full diagram dataset with empty entries for the given year", function () {
            const emptyDiagramData = model.getEmptyDiagramDataYear("1990"),
                emptyDiagramDataExpected = {
                    "Jan.": {month: "Jan."},
                    "Jan.-02": {month: "Jan.-02"},
                    "Jan.-03": {month: "Jan.-03"},
                    "Jan.-04": {month: "Jan.-04"},
                    "Jan.-05": {month: "Jan.-05"},
                    "Feb.": {month: "Feb."},
                    "Feb.-07": {month: "Feb.-07"},
                    "Feb.-08": {month: "Feb.-08"},
                    "Feb.-09": {month: "Feb.-09"},
                    "März": {month: "März"},
                    "März-11": {month: "März-11"},
                    "März-12": {month: "März-12"},
                    "März-13": {month: "März-13"},
                    "Apr.": {month: "Apr."},
                    "Apr.-15": {month: "Apr.-15"},
                    "Apr.-16": {month: "Apr.-16"},
                    "Apr.-17": {month: "Apr.-17"},
                    "Apr.-18": {month: "Apr.-18"},
                    "Mai": {month: "Mai"},
                    "Mai-20": {month: "Mai-20"},
                    "Mai-21": {month: "Mai-21"},
                    "Mai-22": {month: "Mai-22"},
                    "Juni": {month: "Juni"},
                    "Juni-24": {month: "Juni-24"},
                    "Juni-25": {month: "Juni-25"},
                    "Juni-26": {month: "Juni-26"},
                    "Juli": {month: "Juli"},
                    "Juli-28": {month: "Juli-28"},
                    "Juli-29": {month: "Juli-29"},
                    "Juli-30": {month: "Juli-30"},
                    "Juli-31": {month: "Juli-31"},
                    "Aug.": {month: "Aug."},
                    "Aug.-33": {month: "Aug.-33"},
                    "Aug.-34": {month: "Aug.-34"},
                    "Aug.-35": {month: "Aug.-35"},
                    "Sep.": {month: "Sep."},
                    "Sep.-37": {month: "Sep.-37"},
                    "Sep.-38": {month: "Sep.-38"},
                    "Sep.-39": {month: "Sep.-39"},
                    "Okt.": {month: "Okt."},
                    "Okt.-41": {month: "Okt.-41"},
                    "Okt.-42": {month: "Okt.-42"},
                    "Okt.-43": {month: "Okt.-43"},
                    "Okt.-44": {month: "Okt.-44"},
                    "Nov.": {month: "Nov."},
                    "Nov.-46": {month: "Nov.-46"},
                    "Nov.-47": {month: "Nov.-47"},
                    "Nov.-48": {month: "Nov.-48"},
                    "Dez.": {month: "Dez."},
                    "Dez.-50": {month: "Dez.-50"},
                    "Dez.-51": {month: "Dez.-51"},
                    "Dez.-52": {month: "Dez.-52"},
                    "Dez.-01": {month: "Dez.-01"}
                };

            expect(emptyDiagramData).to.deep.equal(emptyDiagramDataExpected);
        });
    });

    describe("createD3Config", function () {
        it("should return a specific object for the given data", function () {
            const graphConfig = model.createD3Config("legendData", "selector", "selectorTooltip", "width", "height", "xAttr", "xAxisTicks", "xAxisLabel", "yAxisLabel", "attrToShowArray", "setTooltipValue", "dataset"),
                graphConfigExpected = {
                    legendData: "legendData",
                    graphType: "Linegraph",
                    selector: "selector",
                    width: "width",
                    height: "height",
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 60
                    },
                    svgClass: "graph-svg",
                    selectorTooltip: "selectorTooltip",
                    scaleTypeX: "ordinal",
                    scaleTypeY: "linear",
                    xAxisTicks: "xAxisTicks",
                    dotSize: 2,
                    yAxisTicks: {
                        ticks: 5,
                        factor: ",f"
                    },
                    data: "dataset",
                    xAttr: "xAttr",
                    xAxisLabel: "xAxisLabel",
                    yAxisLabel: "yAxisLabel",
                    attrToShowArray: "attrToShowArray",
                    setTooltipValue: "setTooltipValue"
                };

            expect(graphConfig).to.deep.equal(graphConfigExpected);
        });
    });
});
