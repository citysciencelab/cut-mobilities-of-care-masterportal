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
                            layerName: "no match"
                        }
                    },
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
                    "Feb.": {month: "Feb."},
                    "Feb.-06": {month: "Feb.-06"},
                    "Feb.-07": {month: "Feb.-07"},
                    "Feb.-08": {month: "Feb.-08"},
                    "März": {month: "März"},
                    "März-10": {month: "März-10"},
                    "März-11": {month: "März-11"},
                    "März-12": {month: "März-12"},
                    "März-13": {month: "März-13"},
                    "Apr.": {month: "Apr."},
                    "Apr.-15": {month: "Apr.-15"},
                    "Apr.-16": {month: "Apr.-16"},
                    "Apr.-17": {month: "Apr.-17"},
                    "Mai": {month: "Mai"},
                    "Mai-19": {month: "Mai-19"},
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
                    "Aug.": {month: "Aug."},
                    "Aug.-32": {month: "Aug.-32"},
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
                    "Nov.": {month: "Nov."},
                    "Nov.-45": {month: "Nov.-45"},
                    "Nov.-46": {month: "Nov.-46"},
                    "Nov.-47": {month: "Nov.-47"},
                    "Nov.-48": {month: "Nov.-48"},
                    "Dez.": {month: "Dez."},
                    "Dez.-50": {month: "Dez.-50"},
                    "Dez.-51": {month: "Dez.-51"},
                    "Dez.-52": {month: "Dez.-52"}
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

    describe("prepareTableContent", function () {
        it("should return a specific object for the given dataset of day for bicycles", function () {

            const dataset =
                    {
                        trucks: [],
                        cars: [],
                        bicycles: [
                            {date: "2020-03-31", hour: "00:15", result: 84},
                            {date: "2020-03-31", hour: "00:30", result: 82},
                            {date: "2020-03-31", hour: "00:45", result: 76},
                            {date: "2020-03-31", hour: "01:00", result: 96},
                            {date: "2020-03-31", hour: "01:15", result: 74},
                            {date: "2020-03-31", hour: "01:30", result: 72},
                            {date: "2020-03-31", hour: "01:45", result: 70},
                            {date: "2020-03-31", hour: "02:00", result: 69},
                            {date: "2020-03-31", hour: "02:15", result: 58},
                            {date: "2020-03-31", hour: "02:30", result: 89},
                            {date: "2020-03-31", hour: "02:45", result: 70},
                            {date: "2020-03-31", hour: "03:00", result: 75},
                            {date: "2020-03-31", hour: "03:15", result: 93},
                            {date: "2020-03-31", hour: "03:30", result: 71},
                            {date: "2020-03-31", hour: "03:45", result: 85},
                            {date: "2020-03-31", hour: "04:00", result: 89},
                            {date: "2020-03-31", hour: "04:15", result: 62},
                            {date: "2020-03-31", hour: "04:30", result: 69},
                            {date: "2020-03-31", hour: "04:45", result: 62},
                            {date: "2020-03-31", hour: "05:00", result: 82},
                            {date: "2020-03-31", hour: "05:15", result: 91},
                            {date: "2020-03-31", hour: "05:30", result: 72},
                            {date: "2020-03-31", hour: "05:45", result: 88},
                            {date: "2020-03-31", hour: "06:00", result: 54},
                            {date: "2020-03-31", hour: "06:15", result: 50},
                            {date: "2020-03-31", hour: "06:30", result: 72},
                            {date: "2020-03-31", hour: "06:45", result: 62},
                            {date: "2020-03-31", hour: "07:00", result: 91},
                            {date: "2020-03-31", hour: "07:15", result: 81},
                            {date: "2020-03-31", hour: "07:30", result: 88},
                            {date: "2020-03-31", hour: "07:45", result: 82},
                            {date: "2020-03-31", hour: "08:00", result: 77},
                            {date: "2020-03-31", hour: "08:15", result: 75},
                            {date: "2020-03-31", hour: "08:30", result: 97},
                            {date: "2020-03-31", hour: "08:45", result: 69},
                            {date: "2020-03-31", hour: "09:00", result: 92},
                            {date: "2020-03-31", hour: "09:15", result: 75},
                            {date: "2020-03-31", hour: "09:30", result: 91},
                            {date: "2020-03-31", hour: "09:45", result: 88},
                            {date: "2020-03-31", hour: "10:00", result: 81},
                            {date: "2020-03-31", hour: "10:15", result: 65},
                            {date: "2020-03-31", hour: "10:30", result: 65},
                            {date: "2020-03-31", hour: "10:45", result: 71},
                            {date: "2020-03-31", hour: "11:00", result: 105},
                            {date: "2020-03-31", hour: "11:15", result: 65},
                            {date: "2020-03-31", hour: "11:30", result: 78}
                        ]
                    },

                tblContentExpected = {
                    day: {
                        title: "Datum",
                        firstColumn: "31.03.2020",
                        headerArr: [
                            "00:15",
                            "00:30",
                            "00:45",
                            "01:00",
                            "01:15",
                            "01:30",
                            "01:45",
                            "02:00",
                            "02:15",
                            "02:30",
                            "02:45",
                            "03:00",
                            "03:15",
                            "03:30",
                            "03:45",
                            "04:00",
                            "04:15",
                            "04:30",
                            "04:45",
                            "05:00",
                            "05:15",
                            "05:30",
                            "05:45",
                            "06:00",
                            "06:15",
                            "06:30",
                            "06:45",
                            "07:00",
                            "07:15",
                            "07:30",
                            "07:45",
                            "08:00",
                            "08:15",
                            "08:30",
                            "08:45",
                            "09:00",
                            "09:15",
                            "09:30",
                            "09:45",
                            "10:00",
                            "10:15",
                            "10:30",
                            "10:45",
                            "11:00",
                            "11:15",
                            "11:30"
                        ],
                        bicyclesArr: [
                            84,
                            82,
                            76,
                            96,
                            74,
                            72,
                            70,
                            69,
                            58,
                            89,
                            70,
                            75,
                            93,
                            71,
                            85,
                            89,
                            62,
                            69,
                            62,
                            82,
                            91,
                            72,
                            88,
                            54,
                            50,
                            72,
                            62,
                            91,
                            81,
                            88,
                            82,
                            77,
                            75,
                            97,
                            69,
                            92,
                            75,
                            91,
                            88,
                            81,
                            65,
                            65,
                            71,
                            105,
                            65,
                            78
                        ]
                    }
                };

            model.prepareTableContent(dataset, "day", "Datum");

            expect(model.get("dayTableContent")).to.deep.equal(tblContentExpected);
        });
    });

    describe("prepareTableContent", function () {
        it("should return a specific object for the given dataset of day for cars", function () {

            const dataset =
                    {
                        trucks: [],
                        bicycles: [],
                        cars: [
                            {date: "2020-03-31", hour: "00:15", result: 84},
                            {date: "2020-03-31", hour: "00:30", result: 82},
                            {date: "2020-03-31", hour: "00:45", result: 76},
                            {date: "2020-03-31", hour: "01:00", result: 96},
                            {date: "2020-03-31", hour: "01:15", result: 74},
                            {date: "2020-03-31", hour: "01:30", result: 72},
                            {date: "2020-03-31", hour: "01:45", result: 70},
                            {date: "2020-03-31", hour: "02:00", result: 69},
                            {date: "2020-03-31", hour: "02:15", result: 58},
                            {date: "2020-03-31", hour: "02:30", result: 89},
                            {date: "2020-03-31", hour: "02:45", result: 70},
                            {date: "2020-03-31", hour: "03:00", result: 75},
                            {date: "2020-03-31", hour: "03:15", result: 93},
                            {date: "2020-03-31", hour: "03:30", result: 71},
                            {date: "2020-03-31", hour: "03:45", result: 85},
                            {date: "2020-03-31", hour: "04:00", result: 89},
                            {date: "2020-03-31", hour: "04:15", result: 62},
                            {date: "2020-03-31", hour: "04:30", result: 69},
                            {date: "2020-03-31", hour: "04:45", result: 62},
                            {date: "2020-03-31", hour: "05:00", result: 82},
                            {date: "2020-03-31", hour: "05:15", result: 91},
                            {date: "2020-03-31", hour: "05:30", result: 72},
                            {date: "2020-03-31", hour: "05:45", result: 88},
                            {date: "2020-03-31", hour: "06:00", result: 54},
                            {date: "2020-03-31", hour: "06:15", result: 50},
                            {date: "2020-03-31", hour: "06:30", result: 72},
                            {date: "2020-03-31", hour: "06:45", result: 62},
                            {date: "2020-03-31", hour: "07:00", result: 91},
                            {date: "2020-03-31", hour: "07:15", result: 81},
                            {date: "2020-03-31", hour: "07:30", result: 88},
                            {date: "2020-03-31", hour: "07:45", result: 82},
                            {date: "2020-03-31", hour: "08:00", result: 77},
                            {date: "2020-03-31", hour: "08:15", result: 75},
                            {date: "2020-03-31", hour: "08:30", result: 97},
                            {date: "2020-03-31", hour: "08:45", result: 69},
                            {date: "2020-03-31", hour: "09:00", result: 92},
                            {date: "2020-03-31", hour: "09:15", result: 75},
                            {date: "2020-03-31", hour: "09:30", result: 91},
                            {date: "2020-03-31", hour: "09:45", result: 88},
                            {date: "2020-03-31", hour: "10:00", result: 81},
                            {date: "2020-03-31", hour: "10:15", result: 65},
                            {date: "2020-03-31", hour: "10:30", result: 65},
                            {date: "2020-03-31", hour: "10:45", result: 71},
                            {date: "2020-03-31", hour: "11:00", result: 105},
                            {date: "2020-03-31", hour: "11:15", result: 65},
                            {date: "2020-03-31", hour: "11:30", result: 78}
                        ]
                    },

                tblContentExpected = {
                    day: {
                        title: "Datum",
                        firstColumn: "31.03.2020",
                        headerArr: [
                            "00:15",
                            "00:30",
                            "00:45",
                            "01:00",
                            "01:15",
                            "01:30",
                            "01:45",
                            "02:00",
                            "02:15",
                            "02:30",
                            "02:45",
                            "03:00",
                            "03:15",
                            "03:30",
                            "03:45",
                            "04:00",
                            "04:15",
                            "04:30",
                            "04:45",
                            "05:00",
                            "05:15",
                            "05:30",
                            "05:45",
                            "06:00",
                            "06:15",
                            "06:30",
                            "06:45",
                            "07:00",
                            "07:15",
                            "07:30",
                            "07:45",
                            "08:00",
                            "08:15",
                            "08:30",
                            "08:45",
                            "09:00",
                            "09:15",
                            "09:30",
                            "09:45",
                            "10:00",
                            "10:15",
                            "10:30",
                            "10:45",
                            "11:00",
                            "11:15",
                            "11:30"
                        ],
                        carsArr: [
                            84,
                            82,
                            76,
                            96,
                            74,
                            72,
                            70,
                            69,
                            58,
                            89,
                            70,
                            75,
                            93,
                            71,
                            85,
                            89,
                            62,
                            69,
                            62,
                            82,
                            91,
                            72,
                            88,
                            54,
                            50,
                            72,
                            62,
                            91,
                            81,
                            88,
                            82,
                            77,
                            75,
                            97,
                            69,
                            92,
                            75,
                            91,
                            88,
                            81,
                            65,
                            65,
                            71,
                            105,
                            65,
                            78
                        ]
                    }
                };

            model.prepareTableContent(dataset, "day", "Datum");

            expect(model.get("dayTableContent")).to.deep.equal(tblContentExpected);
        });
    });

    describe("prepareTableContent", function () {
        it("should return a specific object for the given dataset of week for cars", function () {

            const dataset =
                    {
                        trucks: [],
                        bicycles: [],
                        cars: [
                            {date: "2020-03-16", hour: "01:00", result: 3870},
                            {date: "2020-03-16", hour: "02:00", result: 2351},
                            {date: "2020-03-16", hour: "03:00", result: 2563},
                            {date: "2020-03-16", hour: "04:00", result: 2412},
                            {date: "2020-03-16", hour: "05:00", result: 2835},
                            {date: "2020-03-16", hour: "06:00", result: 1287},
                            {date: "2020-03-16", hour: "07:00", result: 1784},
                            {date: "2020-03-16", hour: "08:00", result: 1540},
                            {date: "2020-03-16", hour: "09:00", result: 1365},
                            {date: "2020-03-16", hour: "10:00", result: 2988},
                            {date: "2020-03-16", hour: "11:00", result: 3236},
                            {date: "2020-03-16", hour: "12:00", result: 2914},
                            {date: "2020-03-16", hour: "13:00", result: 2218},
                            {date: "2020-03-16", hour: "14:00", result: 3111},
                            {date: "2020-03-16", hour: "15:00", result: 2533},
                            {date: "2020-03-16", hour: "16:00", result: 3534},
                            {date: "2020-03-16", hour: "17:00", result: 2341},
                            {date: "2020-03-16", hour: "18:00", result: 2900},
                            {date: "2020-03-16", hour: "19:00", result: 3273},
                            {date: "2020-03-16", hour: "20:00", result: 2919},
                            {date: "2020-03-16", hour: "21:00", result: 1241},
                            {date: "2020-03-16", hour: "22:00", result: 4003},
                            {date: "2020-03-16", hour: "23:00", result: 3398},
                            {date: "2020-03-17", hour: "00:00", result: 2595},
                            {date: "2020-03-17", hour: "01:00", result: 4354},
                            {date: "2020-03-17", hour: "02:00", result: 2576},
                            {date: "2020-03-17", hour: "03:00", result: 3004},
                            {date: "2020-03-17", hour: "04:00", result: 3004},
                            {date: "2020-03-17", hour: "05:00", result: 3404},
                            {date: "2020-03-17", hour: "06:00", result: 1962},
                            {date: "2020-03-17", hour: "07:00", result: 2101},
                            {date: "2020-03-17", hour: "08:00", result: 2771},
                            {date: "2020-03-17", hour: "09:00", result: 1785},
                            {date: "2020-03-17", hour: "10:00", result: 3868},
                            {date: "2020-03-17", hour: "11:00", result: 1650},
                            {date: "2020-03-17", hour: "12:00", result: 2769},
                            {date: "2020-03-17", hour: "13:00", result: 3184},
                            {date: "2020-03-17", hour: "14:00", result: 3754},
                            {date: "2020-03-17", hour: "15:00", result: 2632},
                            {date: "2020-03-17", hour: "16:00", result: 1337},
                            {date: "2020-03-17", hour: "17:00", result: 1392},
                            {date: "2020-03-17", hour: "18:00", result: 3584},
                            {date: "2020-03-17", hour: "19:00", result: 4151},
                            {date: "2020-03-17", hour: "20:00", result: 1801},
                            {date: "2020-03-17", hour: "21:00", result: 4076},
                            {date: "2020-03-17", hour: "22:00", result: 3548},
                            {date: "2020-03-17", hour: "23:00", result: 3903},
                            {date: "2020-03-18", hour: "00:00", result: 2023},
                            {date: "2020-03-18", hour: "01:00", result: 4244},
                            {date: "2020-03-18", hour: "02:00", result: 3970},
                            {date: "2020-03-18", hour: "03:00", result: 2675},
                            {date: "2020-03-18", hour: "04:00", result: 3104},
                            {date: "2020-03-18", hour: "05:00", result: 3028},
                            {date: "2020-03-18", hour: "06:00", result: 1630},
                            {date: "2020-03-18", hour: "07:00", result: 2430},
                            {date: "2020-03-18", hour: "08:00", result: 4319},
                            {date: "2020-03-18", hour: "09:00", result: 2824},
                            {date: "2020-03-18", hour: "10:00", result: 3938},
                            {date: "2020-03-18", hour: "11:00", result: 3312},
                            {date: "2020-03-18", hour: "12:00", result: 2055},
                            {date: "2020-03-18", hour: "13:00", result: 2976},
                            {date: "2020-03-18", hour: "14:00", result: 1211},
                            {date: "2020-03-18", hour: "15:00", result: 2939},
                            {date: "2020-03-18", hour: "16:00", result: 1468},
                            {date: "2020-03-18", hour: "17:00", result: 3151},
                            {date: "2020-03-18", hour: "18:00", result: 2027},
                            {date: "2020-03-18", hour: "19:00", result: 1621},
                            {date: "2020-03-18", hour: "20:00", result: 4397},
                            {date: "2020-03-18", hour: "21:00", result: 3324},
                            {date: "2020-03-18", hour: "22:00", result: 3665},
                            {date: "2020-03-18", hour: "23:00", result: 2766},
                            {date: "2020-03-19", hour: "00:00", result: 4167},
                            {date: "2020-03-19", hour: "01:00", result: 2484},
                            {date: "2020-03-19", hour: "02:00", result: 4373}
                        ]
                    },

                tblContentExpected = {
                    week: {
                        title: "Woche",
                        firstColumn: "12/2020",
                        headerDateArr: [
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "16.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "17.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "18.03.2020",
                            "19.03.2020",
                            "19.03.2020",
                            "19.03.2020"
                        ],
                        headerHourArr: [
                            "01:00",
                            "02:00",
                            "03:00",
                            "04:00",
                            "05:00",
                            "06:00",
                            "07:00",
                            "08:00",
                            "09:00",
                            "10:00",
                            "11:00",
                            "12:00",
                            "13:00",
                            "14:00",
                            "15:00",
                            "16:00",
                            "17:00",
                            "18:00",
                            "19:00",
                            "20:00",
                            "21:00",
                            "22:00",
                            "23:00",
                            "00:00",
                            "01:00",
                            "02:00",
                            "03:00",
                            "04:00",
                            "05:00",
                            "06:00",
                            "07:00",
                            "08:00",
                            "09:00",
                            "10:00",
                            "11:00",
                            "12:00",
                            "13:00",
                            "14:00",
                            "15:00",
                            "16:00",
                            "17:00",
                            "18:00",
                            "19:00",
                            "20:00",
                            "21:00",
                            "22:00",
                            "23:00",
                            "00:00",
                            "01:00",
                            "02:00",
                            "03:00",
                            "04:00",
                            "05:00",
                            "06:00",
                            "07:00",
                            "08:00",
                            "09:00",
                            "10:00",
                            "11:00",
                            "12:00",
                            "13:00",
                            "14:00",
                            "15:00",
                            "16:00",
                            "17:00",
                            "18:00",
                            "19:00",
                            "20:00",
                            "21:00",
                            "22:00",
                            "23:00",
                            "00:00",
                            "01:00",
                            "02:00"
                        ],
                        carsArr: [
                            3870,
                            2351,
                            2563,
                            2412,
                            2835,
                            1287,
                            1784,
                            1540,
                            1365,
                            2988,
                            3236,
                            2914,
                            2218,
                            3111,
                            2533,
                            3534,
                            2341,
                            2900,
                            3273,
                            2919,
                            1241,
                            4003,
                            3398,
                            2595,
                            4354,
                            2576,
                            3004,
                            3004,
                            3404,
                            1962,
                            2101,
                            2771,
                            1785,
                            3868,
                            1650,
                            2769,
                            3184,
                            3754,
                            2632,
                            1337,
                            1392,
                            3584,
                            4151,
                            1801,
                            4076,
                            3548,
                            3903,
                            2023,
                            4244,
                            3970,
                            2675,
                            3104,
                            3028,
                            1630,
                            2430,
                            4319,
                            2824,
                            3938,
                            3312,
                            2055,
                            2976,
                            1211,
                            2939,
                            1468,
                            3151,
                            2027,
                            1621,
                            4397,
                            3324,
                            3665,
                            2766,
                            4167,
                            2484,
                            4373
                        ]
                    }
                };

            model.prepareTableContent(dataset, "week", "Woche");

            expect(model.get("weekTableContent")).to.deep.equal(tblContentExpected);
        });
    });
});

