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
            expect(model.addThousandPoints(undefined)).to.equal("");
            expect(model.addThousandPoints(false)).to.equal("");
            expect(model.addThousandPoints(null)).to.equal("");
            expect(model.addThousandPoints([])).to.equal("");
            expect(model.addThousandPoints({})).to.equal("");
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
            const axis = {
                    xAttr: "xAttr",
                    xAxisTicks: "xAxisTicks",
                    xAxisLabel: "xAxisLabel",
                    yAxisLabel: "yAxisLabel"
                },
                graphConfig = model.createD3Config("legendData", "selector", "selectorTooltip", "width", "height", axis, "attrToShowArray", "setTooltipValue", "dataset"),
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
                        ],
                        meansOfTransport: "AnzFahrraeder"
                    }
                };

            model.prepareTableContent(dataset, "day", "Datum", {from: "2020-03-31", until: "2020-03-31"}, "AnzFahrraeder");

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
                            {date: "2020-03-16", result: 1324},
                            {date: "2020-03-17", result: 1381},
                            {date: "2020-03-18", result: 1619},
                            {date: "2020-03-19", result: 1409},
                            {date: "2020-03-20", result: 1567},
                            {date: "2020-03-21", result: 1464}
                        ]
                    },

                tblContentExpected = {
                    week: {
                        title: "Woche",
                        firstColumn: "12/2020",
                        headerDateArr: [
                            "16.03.2020",
                            "17.03.2020",
                            "18.03.2020",
                            "19.03.2020",
                            "20.03.2020",
                            "21.03.2020"
                        ],
                        carsArr: [
                            1324,
                            1381,
                            1619,
                            1409,
                            1567,
                            1464
                        ],
                        meansOfTransport: "AnzFahrzeuge"
                    }
                };

            model.prepareTableContent(dataset, "week", "Woche", {from: "2020-03-16", until: "2020-03-21"}, "AnzFahrzeuge");

            expect(model.get("weekTableContent")).to.deep.equal(tblContentExpected);
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
                        ],
                        meansOfTransport: "AnzFahrzeuge"
                    }
                };

            model.prepareTableContent(dataset, "day", "Datum", {from: "2020-03-31", until: "2020-03-31"}, "AnzFahrzeuge");

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
                            {date: "2020-03-16", result: 1324},
                            {date: "2020-03-17", result: 1378},
                            {date: "2020-03-18", result: ""},
                            {date: "2020-03-19", result: 1409},
                            {date: "2020-03-20", result: 1567},
                            {date: "2020-03-21", result: 1464}
                        ]
                    },

                tblContentExpected = {
                    week: {
                        title: "Woche",
                        firstColumn: "12/2020",
                        headerDateArr: [
                            "16.03.2020",
                            "17.03.2020",
                            "18.03.2020",
                            "19.03.2020",
                            "20.03.2020",
                            "21.03.2020"
                        ],
                        carsArr: [
                            1324,
                            1378,
                            "",
                            1409,
                            1567,
                            1464
                        ],
                        meansOfTransport: "AnzFahrzeuge"
                    }
                };

            model.prepareTableContent(dataset, "week", "Woche", {from: "2020-03-16", until: "2020-03-21"}, "AnzFahrzeuge");
            expect(model.get("weekTableContent")).to.deep.equal(tblContentExpected);
        });
    });

    describe("prepareDatasetHourly", function () {
        it("should return a specific object for the given dataset of week for cars", function () {

            const dataset =
                    {
                        "AnzFahrzeuge": {
                            "2020-06-17 00:00:01": "",
                            "2020-06-17 00:15:01": null,
                            "2020-06-17 00:30:01": undefined,
                            "2020-06-17 00:45:01": 229,
                            "2020-06-17 01:00:01": 285,
                            "2020-06-17 01:15:01": 190,
                            "2020-06-17 01:30:01": 990,
                            "2020-06-17 01:45:01": 255,
                            "2020-06-17 02:00:01": 222,
                            "2020-06-17 02:15:01": 240,
                            "2020-06-17 02:30:01": 958,
                            "2020-06-17 02:45:01": 216,
                            "2020-06-17 03:00:01": 273,
                            "2020-06-17 03:15:01": 265,
                            "2020-06-17 03:30:01": 855,
                            "2020-06-17 03:45:01": 193,
                            "2020-06-17 04:00:01": 180,
                            "2020-06-17 04:15:01": 241,
                            "2020-06-17 04:30:01": 763,
                            "2020-06-17 04:45:01": 174,
                            "2020-06-17 05:00:01": 201,
                            "2020-06-17 05:15:01": 215,
                            "2020-06-17 05:30:01": 968,
                            "2020-06-17 05:45:01": 231,
                            "2020-06-17 06:00:01": 202,
                            "2020-06-17 06:15:01": 347,
                            "2020-06-17 06:30:01": 873,
                            "2020-06-17 06:45:01": 252,
                            "2020-06-17 07:00:01": 264,
                            "2020-06-17 07:15:01": 196,
                            "2020-06-17 07:30:01": 851,
                            "2020-06-17 07:45:01": 174,
                            "2020-06-17 08:00:01": 254,
                            "2020-06-17 08:15:01": 218,
                            "2020-06-17 08:30:01": 896,
                            "2020-06-17 08:45:01": 180,
                            "2020-06-17 09:00:01": 252,
                            "2020-06-17 09:15:01": 239,
                            "2020-06-17 09:30:01": 906,
                            "2020-06-17 09:45:01": 296,
                            "2020-06-17 10:00:01": 173,
                            "2020-06-17 10:15:01": 223,
                            "2020-06-17 10:30:01": 275,
                            "2020-06-17 10:45:01": 204,
                            "2020-06-17 11:00:01": 220
                        },
                        "AntSV": {
                            "2020-06-17 00:00:01": 0.23,
                            "2020-06-17 00:15:01": 0.08,
                            "2020-06-17 00:30:01": 0.15,
                            "2020-06-17 00:45:01": 0.27,
                            "2020-06-17 01:00:01": 0.1,
                            "2020-06-17 01:15:01": 0,
                            "2020-06-17 01:30:01": 0.18,
                            "2020-06-17 01:45:01": 0.23,
                            "2020-06-17 02:00:01": 0.16,
                            "2020-06-17 02:15:01": 0.12,
                            "2020-06-17 02:30:01": 0.19,
                            "2020-06-17 02:45:01": 0.01,
                            "2020-06-17 03:00:01": 0.18,
                            "2020-06-17 03:15:01": 0.05,
                            "2020-06-17 03:30:01": 0.16,
                            "2020-06-17 03:45:01": 0.29,
                            "2020-06-17 04:00:01": 0.24,
                            "2020-06-17 04:15:01": 0.04,
                            "2020-06-17 04:30:01": 0.17,
                            "2020-06-17 04:45:01": 0.08,
                            "2020-06-17 05:00:01": 0.26,
                            "2020-06-17 05:15:01": 0.09,
                            "2020-06-17 05:30:01": 0.09,
                            "2020-06-17 05:45:01": 0.17,
                            "2020-06-17 06:00:01": 0.2,
                            "2020-06-17 06:15:01": 0.29,
                            "2020-06-17 06:30:01": 0.29,
                            "2020-06-17 06:45:01": 0.16,
                            "2020-06-17 07:00:01": 0.29,
                            "2020-06-17 07:15:01": 0.06,
                            "2020-06-17 07:30:01": 0.26,
                            "2020-06-17 07:45:01": 0.09,
                            "2020-06-17 08:00:01": 0.05,
                            "2020-06-17 08:15:01": 0.07,
                            "2020-06-17 08:30:01": 0.21,
                            "2020-06-17 08:45:01": 0.06,
                            "2020-06-17 09:00:01": 0.08,
                            "2020-06-17 09:15:01": 0.02,
                            "2020-06-17 09:30:01": 0.27,
                            "2020-06-17 09:45:01": 0.14,
                            "2020-06-17 10:00:01": 0.27,
                            "2020-06-17 10:15:01": 0.29,
                            "2020-06-17 10:30:01": 0.27,
                            "2020-06-17 10:45:01": 0.19,
                            "2020-06-17 11:00:01": 0.26
                        }
                    },

                tblContentExpected = {
                    "trucks": [
                        {
                            "date": "2020-06-17",
                            "hour": "00:00",
                            "result": 0.23
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "00:15",
                            "result": 0.08
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "00:30",
                            "result": 0.15
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "00:45",
                            "result": 0.27
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:00",
                            "result": 0.1
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:15",
                            "result": 0
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:30",
                            "result": 0.18
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:45",
                            "result": 0.23
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:00",
                            "result": 0.16
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:15",
                            "result": 0.12
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:30",
                            "result": 0.19
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:45",
                            "result": 0.01
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:00",
                            "result": 0.18
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:15",
                            "result": 0.05
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:30",
                            "result": 0.16
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:45",
                            "result": 0.29
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:00",
                            "result": 0.24
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:15",
                            "result": 0.04
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:30",
                            "result": 0.17
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:45",
                            "result": 0.08
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:00",
                            "result": 0.26
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:15",
                            "result": 0.09
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:30",
                            "result": 0.09
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:45",
                            "result": 0.17
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:00",
                            "result": 0.2
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:15",
                            "result": 0.29
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:30",
                            "result": 0.29
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:45",
                            "result": 0.16
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:00",
                            "result": 0.29
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:15",
                            "result": 0.06
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:30",
                            "result": 0.26
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:45",
                            "result": 0.09
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:00",
                            "result": 0.05
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:15",
                            "result": 0.07
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:30",
                            "result": 0.21
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:45",
                            "result": 0.06
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:00",
                            "result": 0.08
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:15",
                            "result": 0.02
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:30",
                            "result": 0.27
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:45",
                            "result": 0.14
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:00",
                            "result": 0.27
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:15",
                            "result": 0.29
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:30",
                            "result": 0.27
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:45",
                            "result": 0.19
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "11:00",
                            "result": 0.26
                        }
                    ],
                    "cars": [
                        {
                            "date": "2020-06-17",
                            "hour": "00:00",
                            "result": ""
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "00:15",
                            "result": ""
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "00:30",
                            "result": ""
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "00:45",
                            "result": "229"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:00",
                            "result": "285"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:15",
                            "result": "190"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:30",
                            "result": "990"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "01:45",
                            "result": "255"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:00",
                            "result": "222"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:15",
                            "result": "240"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:30",
                            "result": "958"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "02:45",
                            "result": "216"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:00",
                            "result": "273"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:15",
                            "result": "265"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:30",
                            "result": "855"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "03:45",
                            "result": "193"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:00",
                            "result": "180"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:15",
                            "result": "241"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:30",
                            "result": "763"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "04:45",
                            "result": "174"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:00",
                            "result": "201"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:15",
                            "result": "215"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:30",
                            "result": "968"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "05:45",
                            "result": "231"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:00",
                            "result": "202"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:15",
                            "result": "347"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:30",
                            "result": "873"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "06:45",
                            "result": "252"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:00",
                            "result": "264"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:15",
                            "result": "196"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:30",
                            "result": "851"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "07:45",
                            "result": "174"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:00",
                            "result": "254"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:15",
                            "result": "218"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:30",
                            "result": "896"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "08:45",
                            "result": "180"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:00",
                            "result": "252"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:15",
                            "result": "239"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:30",
                            "result": "906"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "09:45",
                            "result": "296"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:00",
                            "result": "173"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:15",
                            "result": "223"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:30",
                            "result": "275"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "10:45",
                            "result": "204"
                        },
                        {
                            "date": "2020-06-17",
                            "hour": "11:00",
                            "result": "220"
                        }
                    ],
                    "bicycles": []
                };

            expect(model.prepareDatasetHourly(dataset)).to.deep.equal(tblContentExpected);
        });
    });

    describe("getSortedDatasets", function () {
        it("should return an array sorted by object key", function () {
            const datasets = [
                    {
                        AnzFahrzeuge:
                        {
                            "2020-06-23 00:00:01": 232
                        }
                    },
                    {
                        AnzFahrzeuge:
                        {
                            "2020-07-25 00:00:01": 232
                        }
                    },
                    {
                        AnzFahrzeuge:
                        {
                            "2020-05-23 00:00:01": 232
                        }
                    },
                    {
                        AnzFahrzeuge:
                        {
                            "2020-07-24 00:00:01": 232
                        }
                    },
                    {
                        AnzFahrzeuge:
                        {
                            "2020-07-24 00:00:01": 232
                        }
                    },
                    {
                        AnzFahrzeuge:
                        {
                            "2020-06-24 00:00:01": 232
                        }
                    }
                ],
                sortedDatasets = model.getSortedDatasets(datasets, "AnzFahrzeuge");

            expect(sortedDatasets[0].AnzFahrzeuge).to.have.all.keys("2020-05-23 00:00:01");
            expect(sortedDatasets[1].AnzFahrzeuge).to.have.all.keys("2020-06-23 00:00:01");
            expect(sortedDatasets[2].AnzFahrzeuge).to.have.all.keys("2020-06-24 00:00:01");
            expect(sortedDatasets[3].AnzFahrzeuge).to.have.all.keys("2020-07-24 00:00:01");
            expect(sortedDatasets[4].AnzFahrzeuge).to.have.all.keys("2020-07-24 00:00:01");
            expect(sortedDatasets[5].AnzFahrzeuge).to.have.all.keys("2020-07-25 00:00:01");
        });
    });
});

