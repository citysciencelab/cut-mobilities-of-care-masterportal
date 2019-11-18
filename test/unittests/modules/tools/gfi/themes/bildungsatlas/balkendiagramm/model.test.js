import Model from "@modules/tools/gfi/themes/bildungsatlas/balkendiagramm/model.js";
import {expect} from "chai";

var model;

before(function () {
    model = new Model();
});

describe("tools/gfi/themes/bildungsatlas/balkendiagramm", function () {
    describe("getStatisticWithYear", function () {
        const goodGfiProperties = {
            foo_2011: 1,
            foo_2012: 3,
            baz: "qux"
        };

        it("should return an emtpy array for a wrong prefix to lookup years in data", function () {
            expect(model.getStatisticWithYear(goodGfiProperties, "foobar", "bar_")).to.be.empty;
            expect(model.getStatisticWithYear(goodGfiProperties, "foobar", "oo_")).to.be.empty;
            expect(model.getStatisticWithYear(goodGfiProperties, "foobar", "fo")).to.be.empty;
        });

        it("should return an array of objects with the keys year and number with years in total for a well formed set of data", function () {
            const result = model.getStatisticWithYear(goodGfiProperties, "foobar", "foo_");

            expect(result).to.be.an("array");
            expect(result[0]).to.include({year: "2011", number: 1});
            expect(result[1]).to.include({year: "2012", number: 3});
        });
        it("should return an array of objects with the keys year and number with years in schoolyears for a well formed set of data with category schule", function () {
            const result = model.getStatisticWithYear(goodGfiProperties, "schule", "foo_");

            expect(result).to.be.an("array");
            expect(result[0]).to.include({year: "11/12", number: 1});
            expect(result[1]).to.include({year: "12/13", number: 3});
        });
    });

    describe("getRawTableContent", function () {
        let gfiProperties,
            result;

        it("should return an object with expected keys and unformated values for a well formed call (Stadtteile, anteilWanderungen), should set the themeTitle correctly", function () {
            model.set("themeTitle", false);
            gfiProperties = {
                stadtteil: "foo",
                zuzuege_aus_umland: "bar",
                fortzuege_aus_dem_umland: "baz"
            };
            result = model.getRawTableContent(gfiProperties, "Stadtteile", "anteilWanderungen", "qux");
            expect(result).to.be.an("object");
            expect(result).to.include({"In foo": "qux", "Anteil der Zuzüge aus dem Umland:": "bar", "Anteil der Zuzüge ins Umland:": "baz"});
            expect(model.get("themeTitle")).to.equal("foo");
        });
        it("should return an object with expected keys and unformated values for a well formed call (Stadtteile, -), should set the themeTitle correctly", function () {
            model.set("themeTitle", false);
            gfiProperties = {
                stadtteil: "foo",
                bezirk: "bar",
                summe_bezirk: "baz",
                summe_hamburg: 1234
            };
            result = model.getRawTableContent(gfiProperties, "Stadtteile", "something", "qux");
            expect(result).to.be.an("object").that.includes({"foo": "qux", "Bezirk bar": "baz", "Hamburg": 1234});
            expect(model.get("themeTitle")).to.equal("foo");
        });
        it("should return an object with expected keys and unformated values for a well formed call (Sozialräume), should set the themeTitle correctly", function () {
            model.set("themeTitle", false);
            gfiProperties = {
                sozialraum_name: "foo",
                bezirk: "bar",
                summe_bezirk: "baz",
                summe_hamburg: 1234
            };
            result = model.getRawTableContent(gfiProperties, "Sozialräume", "something", "qux");
            expect(result).to.be.an("object").that.includes({"foo": "qux", "Bezirk bar": "baz", "Hamburg": 1234});
            expect(model.get("themeTitle")).to.equal("foo");
        });
        it("should return an object with expected keys and unformated values for a well formed call (Statistische Gebiete, anteilWanderungen), should set the themeTitle correctly", function () {
            model.set("themeTitle", false);
            gfiProperties = {
                stadtteil: "foo",
                statgebiet: "bar"
            };
            result = model.getRawTableContent(gfiProperties, "Statistische Gebiete", "anteilWanderungen", "qux");
            expect(result).to.be.an("object").that.includes({"im Statistischen Gebiet": "qux"});
            expect(model.get("themeTitle")).to.equal("foo: bar");
        });
        it("should return an object with expected keys and unformated values for a well formed call (Statistische Gebiete, -), should set the themeTitle correctly", function () {
            model.set("themeTitle", false);
            gfiProperties = {
                stadtteil: "foo",
                statgebiet: "bar",
                summe_stadtteil: "baz",
                bezirk: "foobar",
                summe_bezirk: 1234,
                summe_hamburg: 5678
            };
            result = model.getRawTableContent(gfiProperties, "Statistische Gebiete", "something", "qux");
            expect(result).to.be.an("object").that.includes({"Statistisches Gebiet": "qux", "foo": "baz", "Bezirk foobar": 1234, "Hamburg": 5678});
            expect(model.get("themeTitle")).to.equal("foo: bar");
        });
        it("should return an empty object for a well formed call without any known parameters, should not change the themeTitle in this case", function () {
            model.set("themeTitle", "unchanged foo");
            gfiProperties = {
                "bar": "baz"
            };
            result = model.getRawTableContent(gfiProperties, "something", "something else", "qux");
            expect(result).to.be.an("object").that.is.empty;
            expect(model.get("themeTitle")).to.equal("unchanged foo");
        });
    });

    describe("getRevertData", function () {
        let result,
            rawContent;

        it("should flat copy any key/value pair found in raw content", function () {
            const copyTest = {"test": 1};

            rawContent = {
                "foo": "bar",
                "baz": copyTest
            };
            result = model.getRevertData(rawContent, "something", "anything");
            copyTest.test = 2;
            expect(result).to.be.an("object").that.deep.includes({"foo": "bar", "baz": {"test": 2}});
        });
        it("should convert null and undefined values into Strings with an expected output", function () {
            const expectedOutput = "*g.F.";

            rawContent = {
                "foo": null,
                "bar": undefined
            };
            result = model.getRevertData(rawContent, "something", "anything");
            expect(result).to.be.an("object").that.includes({"foo": expectedOutput, "bar": expectedOutput});
        });
        it("should interpret values as numbers, place thousand points and round values for a the themeUnit 'anzahl'", function () {
            rawContent = {
                "foo": 123456789,
                "bar": 12345.6789,
                "baz": "foobar"
            };
            result = model.getRevertData(rawContent, "anzahl", "something");
            expect(result).to.be.an("object").that.includes({"foo": "123.456.789", "bar": "12.346", "baz": "0"});
        });
        it("should interpret values as number, round the value and postfix % for the themeUnit 'anteil'", function () {
            rawContent = {
                "foo": 10,
                "bar": 20.923,
                "baz": "foobar"
            };
            result = model.getRevertData(rawContent, "anteil", "something");
            expect(result).to.be.an("object").that.includes({"foo": "10%", "bar": "21%", "baz": "0%"});
        });
        it("should round to 2 decimal places and add a '+' for positive values (except for 0) for themeUnit 'anteilWanderungen' and particular keys", function () {
            rawContent = {
                "im Statistischen Gebiet": 12.34567,
                "In foobar": -76.54321
            };
            result = model.getRevertData(rawContent, "anteilWanderungen", "foobar");
            expect(result).to.be.an("object").that.includes({"im Statistischen Gebiet": "+12,35", "In foobar": "-76,54"});

            rawContent = {
                "im Statistischen Gebiet": 0,
                "In foobar": "foo"
            };
            result = model.getRevertData(rawContent, "anteilWanderungen", "foobar");
            expect(result).to.be.an("object").that.includes({"im Statistischen Gebiet": "0", "In foobar": "0"});
        });
        it("should round to 2 decimal places and postfix a '%' for themeUnit 'anteilWanderungen' and any keys other than particular keys", function () {
            rawContent = {
                "foo": "bar",
                "baz": 12.34567,
                "qux": -76.5432,
                "In foobar": 1,
                "In anything": 1
            };
            result = model.getRevertData(rawContent, "anteilWanderungen", "foobar");
            expect(result).to.be.an("object").that.includes({"foo": "0%", "baz": "12,35%", "qux": "-76,54%", "In foobar": "+1", "In anything": "1%"});
        });
    });

    describe("setTooltipValue", function () {
        it("should not process invalid or unwell formed values", function () {
            expect(model.setTooltipValue("foo")).to.be.empty;
            expect(model.setTooltipValue(null)).to.be.empty;
            expect(model.setTooltipValue(undefined)).to.be.empty;
            expect(model.setTooltipValue({"foo": "bar"})).to.be.empty;
            expect(model.setTooltipValue([1, 2, 3, 4, 5])).to.be.empty;
        });

        it("should set thousand points for any value without decimal places", function () {
            expect(model.setTooltipValue(123456789)).to.equal("123.456.789");
            expect(model.setTooltipValue(-123456789)).to.equal("-123.456.789");
            expect(model.setTooltipValue("123456789")).to.equal("123.456.789");
            expect(model.setTooltipValue("-123456789")).to.equal("-123.456.789");
        });
        it("should let 2 decimal places and postfix with '%' for values with decimal places and themeUnit unlike 'anteilWanderungen'", function () {
            expect(model.setTooltipValue(123.4567)).to.equal("123,46%");
            expect(model.setTooltipValue(-123.4567)).to.equal("-123,46%");
            expect(model.setTooltipValue("123.4567")).to.equal("123,46%");
            expect(model.setTooltipValue("-123.4567")).to.equal("-123,46%");
        });
        it("should let 2 decimal places for values with decimal places and themeUnit equals 'anteilWanderungen'", function () {
            expect(model.setTooltipValue(123.4567, "anteilWanderungen")).to.equal("123,46");
            expect(model.setTooltipValue(-123.4567, "anteilWanderungen")).to.equal("-123,46");
            expect(model.setTooltipValue("123.4567", "anteilWanderungen")).to.equal("123,46");
            expect(model.setTooltipValue("-123.4567", "anteilWanderungen")).to.equal("-123,46");
        });
    });
});
