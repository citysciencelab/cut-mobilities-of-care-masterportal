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

    describe("getEmptyDiagramDataDay", function () {
        it("should return a full diagram dataset with empty entries for the given day", function () {
            const emptyDiagramData = model.getEmptyDiagramDataDay(),
                emptyDiagramDataExpected = {
                    "00:00": {hour: "00:00"},
                    "00:15": {hour: "00:15"},
                    "00:30": {hour: "00:30"},
                    "00:45": {hour: "00:45"},
                    "01:00": {hour: "01:00"},
                    "01:15": {hour: "01:15"},
                    "01:30": {hour: "01:30"},
                    "01:45": {hour: "01:45"},
                    "02:00": {hour: "02:00"},
                    "02:15": {hour: "02:15"},
                    "02:30": {hour: "02:30"},
                    "02:45": {hour: "02:45"},
                    "03:00": {hour: "03:00"},
                    "03:15": {hour: "03:15"},
                    "03:30": {hour: "03:30"},
                    "03:45": {hour: "03:45"},
                    "04:00": {hour: "04:00"},
                    "04:15": {hour: "04:15"},
                    "04:30": {hour: "04:30"},
                    "04:45": {hour: "04:45"},
                    "05:00": {hour: "05:00"},
                    "05:15": {hour: "05:15"},
                    "05:30": {hour: "05:30"},
                    "05:45": {hour: "05:45"},
                    "06:00": {hour: "06:00"},
                    "06:15": {hour: "06:15"},
                    "06:30": {hour: "06:30"},
                    "06:45": {hour: "06:45"},
                    "07:00": {hour: "07:00"},
                    "07:15": {hour: "07:15"},
                    "07:30": {hour: "07:30"},
                    "07:45": {hour: "07:45"},
                    "08:00": {hour: "08:00"},
                    "08:15": {hour: "08:15"},
                    "08:30": {hour: "08:30"},
                    "08:45": {hour: "08:45"},
                    "09:00": {hour: "09:00"},
                    "09:15": {hour: "09:15"},
                    "09:30": {hour: "09:30"},
                    "09:45": {hour: "09:45"},
                    "10:00": {hour: "10:00"},
                    "10:15": {hour: "10:15"},
                    "10:30": {hour: "10:30"},
                    "10:45": {hour: "10:45"},
                    "11:00": {hour: "11:00"},
                    "11:15": {hour: "11:15"},
                    "11:30": {hour: "11:30"},
                    "11:45": {hour: "11:45"},
                    "12:00": {hour: "12:00"},
                    "12:15": {hour: "12:15"},
                    "12:30": {hour: "12:30"},
                    "12:45": {hour: "12:45"},
                    "13:00": {hour: "13:00"},
                    "13:15": {hour: "13:15"},
                    "13:30": {hour: "13:30"},
                    "13:45": {hour: "13:45"},
                    "14:00": {hour: "14:00"},
                    "14:15": {hour: "14:15"},
                    "14:30": {hour: "14:30"},
                    "14:45": {hour: "14:45"},
                    "15:00": {hour: "15:00"},
                    "15:15": {hour: "15:15"},
                    "15:30": {hour: "15:30"},
                    "15:45": {hour: "15:45"},
                    "16:00": {hour: "16:00"},
                    "16:15": {hour: "16:15"},
                    "16:30": {hour: "16:30"},
                    "16:45": {hour: "16:45"},
                    "17:00": {hour: "17:00"},
                    "17:15": {hour: "17:15"},
                    "17:30": {hour: "17:30"},
                    "17:45": {hour: "17:45"},
                    "18:00": {hour: "18:00"},
                    "18:15": {hour: "18:15"},
                    "18:30": {hour: "18:30"},
                    "18:45": {hour: "18:45"},
                    "19:00": {hour: "19:00"},
                    "19:15": {hour: "19:15"},
                    "19:30": {hour: "19:30"},
                    "19:45": {hour: "19:45"},
                    "20:00": {hour: "20:00"},
                    "20:15": {hour: "20:15"},
                    "20:30": {hour: "20:30"},
                    "20:45": {hour: "20:45"},
                    "21:00": {hour: "21:00"},
                    "21:15": {hour: "21:15"},
                    "21:30": {hour: "21:30"},
                    "21:45": {hour: "21:45"},
                    "22:00": {hour: "22:00"},
                    "22:15": {hour: "22:15"},
                    "22:30": {hour: "22:30"},
                    "22:45": {hour: "22:45"},
                    "23:00": {hour: "23:00"},
                    "23:15": {hour: "23:15"},
                    "23:30": {hour: "23:30"},
                    "23:45": {hour: "23:45"}
                };

            expect(emptyDiagramData).to.deep.equal(emptyDiagramDataExpected);
        });
    });

    describe("getEmptyDiagramDataWeek", function () {
        it("should return a full diagram dataset with empty entries for the given week", function () {
            const emptyDiagramData = model.getEmptyDiagramDataWeek(),
                emptyDiagramDataExpected = {
                    "Mo": {weekday: "Mo"},
                    "Mo-01": {weekday: "Mo-01"},
                    "Mo-02": {weekday: "Mo-02"},
                    "Mo-03": {weekday: "Mo-03"},
                    "Mo-04": {weekday: "Mo-04"},
                    "Mo-05": {weekday: "Mo-05"},
                    "Mo-06": {weekday: "Mo-06"},
                    "Mo-07": {weekday: "Mo-07"},
                    "Mo-08": {weekday: "Mo-08"},
                    "Mo-09": {weekday: "Mo-09"},
                    "Mo-10": {weekday: "Mo-10"},
                    "Mo-11": {weekday: "Mo-11"},
                    "Mo-12": {weekday: "Mo-12"},
                    "Mo-13": {weekday: "Mo-13"},
                    "Mo-14": {weekday: "Mo-14"},
                    "Mo-15": {weekday: "Mo-15"},
                    "Mo-16": {weekday: "Mo-16"},
                    "Mo-17": {weekday: "Mo-17"},
                    "Mo-18": {weekday: "Mo-18"},
                    "Mo-19": {weekday: "Mo-19"},
                    "Mo-20": {weekday: "Mo-20"},
                    "Mo-21": {weekday: "Mo-21"},
                    "Mo-22": {weekday: "Mo-22"},
                    "Mo-23": {weekday: "Mo-23"},
                    "Di": {weekday: "Di"},
                    "Di-01": {weekday: "Di-01"},
                    "Di-02": {weekday: "Di-02"},
                    "Di-03": {weekday: "Di-03"},
                    "Di-04": {weekday: "Di-04"},
                    "Di-05": {weekday: "Di-05"},
                    "Di-06": {weekday: "Di-06"},
                    "Di-07": {weekday: "Di-07"},
                    "Di-08": {weekday: "Di-08"},
                    "Di-09": {weekday: "Di-09"},
                    "Di-10": {weekday: "Di-10"},
                    "Di-11": {weekday: "Di-11"},
                    "Di-12": {weekday: "Di-12"},
                    "Di-13": {weekday: "Di-13"},
                    "Di-14": {weekday: "Di-14"},
                    "Di-15": {weekday: "Di-15"},
                    "Di-16": {weekday: "Di-16"},
                    "Di-17": {weekday: "Di-17"},
                    "Di-18": {weekday: "Di-18"},
                    "Di-19": {weekday: "Di-19"},
                    "Di-20": {weekday: "Di-20"},
                    "Di-21": {weekday: "Di-21"},
                    "Di-22": {weekday: "Di-22"},
                    "Di-23": {weekday: "Di-23"},
                    "Mi": {weekday: "Mi"},
                    "Mi-01": {weekday: "Mi-01"},
                    "Mi-02": {weekday: "Mi-02"},
                    "Mi-03": {weekday: "Mi-03"},
                    "Mi-04": {weekday: "Mi-04"},
                    "Mi-05": {weekday: "Mi-05"},
                    "Mi-06": {weekday: "Mi-06"},
                    "Mi-07": {weekday: "Mi-07"},
                    "Mi-08": {weekday: "Mi-08"},
                    "Mi-09": {weekday: "Mi-09"},
                    "Mi-10": {weekday: "Mi-10"},
                    "Mi-11": {weekday: "Mi-11"},
                    "Mi-12": {weekday: "Mi-12"},
                    "Mi-13": {weekday: "Mi-13"},
                    "Mi-14": {weekday: "Mi-14"},
                    "Mi-15": {weekday: "Mi-15"},
                    "Mi-16": {weekday: "Mi-16"},
                    "Mi-17": {weekday: "Mi-17"},
                    "Mi-18": {weekday: "Mi-18"},
                    "Mi-19": {weekday: "Mi-19"},
                    "Mi-20": {weekday: "Mi-20"},
                    "Mi-21": {weekday: "Mi-21"},
                    "Mi-22": {weekday: "Mi-22"},
                    "Mi-23": {weekday: "Mi-23"},
                    "Do": {weekday: "Do"},
                    "Do-01": {weekday: "Do-01"},
                    "Do-02": {weekday: "Do-02"},
                    "Do-03": {weekday: "Do-03"},
                    "Do-04": {weekday: "Do-04"},
                    "Do-05": {weekday: "Do-05"},
                    "Do-06": {weekday: "Do-06"},
                    "Do-07": {weekday: "Do-07"},
                    "Do-08": {weekday: "Do-08"},
                    "Do-09": {weekday: "Do-09"},
                    "Do-10": {weekday: "Do-10"},
                    "Do-11": {weekday: "Do-11"},
                    "Do-12": {weekday: "Do-12"},
                    "Do-13": {weekday: "Do-13"},
                    "Do-14": {weekday: "Do-14"},
                    "Do-15": {weekday: "Do-15"},
                    "Do-16": {weekday: "Do-16"},
                    "Do-17": {weekday: "Do-17"},
                    "Do-18": {weekday: "Do-18"},
                    "Do-19": {weekday: "Do-19"},
                    "Do-20": {weekday: "Do-20"},
                    "Do-21": {weekday: "Do-21"},
                    "Do-22": {weekday: "Do-22"},
                    "Do-23": {weekday: "Do-23"},
                    "Fr": {weekday: "Fr"},
                    "Fr-01": {weekday: "Fr-01"},
                    "Fr-02": {weekday: "Fr-02"},
                    "Fr-03": {weekday: "Fr-03"},
                    "Fr-04": {weekday: "Fr-04"},
                    "Fr-05": {weekday: "Fr-05"},
                    "Fr-06": {weekday: "Fr-06"},
                    "Fr-07": {weekday: "Fr-07"},
                    "Fr-08": {weekday: "Fr-08"},
                    "Fr-09": {weekday: "Fr-09"},
                    "Fr-10": {weekday: "Fr-10"},
                    "Fr-11": {weekday: "Fr-11"},
                    "Fr-12": {weekday: "Fr-12"},
                    "Fr-13": {weekday: "Fr-13"},
                    "Fr-14": {weekday: "Fr-14"},
                    "Fr-15": {weekday: "Fr-15"},
                    "Fr-16": {weekday: "Fr-16"},
                    "Fr-17": {weekday: "Fr-17"},
                    "Fr-18": {weekday: "Fr-18"},
                    "Fr-19": {weekday: "Fr-19"},
                    "Fr-20": {weekday: "Fr-20"},
                    "Fr-21": {weekday: "Fr-21"},
                    "Fr-22": {weekday: "Fr-22"},
                    "Fr-23": {weekday: "Fr-23"},
                    "Sa": {weekday: "Sa"},
                    "Sa-01": {weekday: "Sa-01"},
                    "Sa-02": {weekday: "Sa-02"},
                    "Sa-03": {weekday: "Sa-03"},
                    "Sa-04": {weekday: "Sa-04"},
                    "Sa-05": {weekday: "Sa-05"},
                    "Sa-06": {weekday: "Sa-06"},
                    "Sa-07": {weekday: "Sa-07"},
                    "Sa-08": {weekday: "Sa-08"},
                    "Sa-09": {weekday: "Sa-09"},
                    "Sa-10": {weekday: "Sa-10"},
                    "Sa-11": {weekday: "Sa-11"},
                    "Sa-12": {weekday: "Sa-12"},
                    "Sa-13": {weekday: "Sa-13"},
                    "Sa-14": {weekday: "Sa-14"},
                    "Sa-15": {weekday: "Sa-15"},
                    "Sa-16": {weekday: "Sa-16"},
                    "Sa-17": {weekday: "Sa-17"},
                    "Sa-18": {weekday: "Sa-18"},
                    "Sa-19": {weekday: "Sa-19"},
                    "Sa-20": {weekday: "Sa-20"},
                    "Sa-21": {weekday: "Sa-21"},
                    "Sa-22": {weekday: "Sa-22"},
                    "Sa-23": {weekday: "Sa-23"},
                    "So": {weekday: "So"},
                    "So-01": {weekday: "So-01"},
                    "So-03": {weekday: "So-03"},
                    "So-04": {weekday: "So-04"},
                    "So-05": {weekday: "So-05"},
                    "So-06": {weekday: "So-06"},
                    "So-07": {weekday: "So-07"},
                    "So-08": {weekday: "So-08"},
                    "So-09": {weekday: "So-09"},
                    "So-10": {weekday: "So-10"},
                    "So-11": {weekday: "So-11"},
                    "So-12": {weekday: "So-12"},
                    "So-13": {weekday: "So-13"},
                    "So-14": {weekday: "So-14"},
                    "So-15": {weekday: "So-15"},
                    "So-16": {weekday: "So-16"},
                    "So-17": {weekday: "So-17"},
                    "So-18": {weekday: "So-18"},
                    "So-19": {weekday: "So-19"},
                    "So-20": {weekday: "So-20"},
                    "So-21": {weekday: "So-21"},
                    "So-22": {weekday: "So-22"},
                    "So-23": {weekday: "So-23"}
                };

            expect(emptyDiagramData).to.deep.equal(emptyDiagramDataExpected);
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
