import Model from "@modules/tools/gfi/themes/bildungsatlas/schulentlassene/model.js";
import {expect} from "chai";

var model;

before(function () {
    model = new Model();
});

describe("tools/gfi/themes/bildungsatlas/schulentlassene", function () {
    describe("defaults:legendAbschluesse", function () {
        it("should be an array of objects with the keys class, style and text.", function () {
            expect(model.get("legendAbschluesse")).to.be.an("array").that.has.lengthOf(5);
            model.get("legendAbschluesse").forEach(obj => expect(obj).to.have.all.keys("class", "style", "text"));
        });
        it("expects objects with class parameter values in the following order: dotAbi, dotMSA, dotESA, dotOSA, dotALL", function () {
            const legendAbschluesse = model.get("legendAbschluesse");

            expect(legendAbschluesse[0]).to.include({class: "dotAbi"});
            expect(legendAbschluesse[1]).to.include({class: "dotMSA"});
            expect(legendAbschluesse[2]).to.include({class: "dotESA"});
            expect(legendAbschluesse[3]).to.include({class: "dotOSA"});
            expect(legendAbschluesse[4]).to.include({class: "dotALL"});
        });
    });

    describe("createDataForZeitverlauf", function () {
        const goodGfiProperties = {
                foo_2011: 1,
                foo_2012: 3,
                bar_2011: 5,
                bar_2012: 7,
                baz: "qux"
            },
            maxYearsToShowInDiagrams = 10;

        it("should return an empty array for an unknown tag", function () {
            expect(model.createDataForZeitverlauf(goodGfiProperties, "unknownFoo", "foobar", maxYearsToShowInDiagrams)).to.be.empty;
        });
        it("should be able to handle gaps between years", function () {
            const gapsBetweenYears = {
                    foo_2011: 1,
                    foo_2017: 3,
                    bar_2011: 5,
                    bar_2012: 7,
                    baz: "qux"
                },
                bardata = model.createDataForZeitverlauf(gapsBetweenYears, "foo", "foobar", maxYearsToShowInDiagrams);

            expect(bardata).to.be.an("array").that.has.lengthOf(2);
            expect(bardata[0]).to.include({year: "11/12", foobar: 1});
            expect(bardata[1]).to.include({year: "17/18", foobar: 3});
        });
        it("should order years not well ordered", function () {
            const unorderedYears = {
                    foo_2012: 3,
                    foo_2011: 1,
                    bar_2011: 5,
                    bar_2012: 7,
                    baz: "qux"
                },
                bardata = model.createDataForZeitverlauf(unorderedYears, "foo", "foobar", maxYearsToShowInDiagrams);

            expect(bardata).to.be.an("array").that.has.lengthOf(2);
            expect(bardata[0]).to.include({year: "11/12", foobar: 1});
            expect(bardata[1]).to.include({year: "12/13", foobar: 3});
        });
        it("should include only a maximum number of years", function () {
            const bardata = model.createDataForZeitverlauf(goodGfiProperties, "foo", "foobar", 1);
            expect(bardata).to.be.an("array").that.has.lengthOf(1);
            expect(bardata[0]).to.not.include({year: "11/12", foobar: 1});
            expect(bardata[0]).to.include({year: "12/13", foobar: 3});
        });
        it("should include postfixed years only", function () {
            const poisonedPostfixedYears = {
                    foo_2011: 1,
                    foo_2012_poison: 3,
                    bar_2011: 5,
                    bar_2012: 7,
                    baz: "qux"
                },
                bardata = model.createDataForZeitverlauf(poisonedPostfixedYears, "foo", "foobar", maxYearsToShowInDiagrams);

            expect(bardata).to.be.an("array").that.has.lengthOf(1);
            expect(bardata[0]).to.include({year: "11/12", foobar: 1});
            expect(bardata[1]).to.be.undefined;
        });
        it("should ignore empty tags, should not deliver years without a prefix as a result", function () {
            const unprefixedYears = {
                    _2011: 1,
                    _2012: 3,
                    bar_2011: 5,
                    bar_2012: 7,
                    baz: "qux"
                },
                bardata = model.createDataForZeitverlauf(unprefixedYears, "", "foobar", maxYearsToShowInDiagrams);

            expect(bardata).to.be.empty;
        });

        it("should create an array of Objects with a certain structure usable as graph data", function () {
            let bardata;

            bardata = model.createDataForZeitverlauf(goodGfiProperties, "foo", "foobar", maxYearsToShowInDiagrams);
            expect(bardata).to.be.an("array").that.has.lengthOf(2);
            expect(bardata[0]).to.include({year: "11/12", foobar: 1});
            expect(bardata[1]).to.include({year: "12/13", foobar: 3});

            bardata = model.createDataForZeitverlauf(goodGfiProperties, "bar", "foobar", maxYearsToShowInDiagrams);
            expect(bardata).to.be.an("array").that.has.lengthOf(2);
            expect(bardata[0]).to.include({year: "11/12", foobar: 5});
            expect(bardata[1]).to.include({year: "12/13", foobar: 7});
        });
    });

    describe("helperCreateDataForAbschluesse", function () {
        const goodData = [{
                year: 2019, bar: 1
            }],
            goodLegend = {
                "foo": {
                    style: "foobar"
                },
                "dotALL": {
                    style: "foobar"
                }
            };

        it("should ignore wrong y axis keys in dataset", function(){
            expect(model.helperCreateDataForAbschluesse("foo", "wrongBar", goodData, goodLegend, {})).to.be.an("array").that.is.empty;
            expect(model.helperCreateDataForAbschluesse("foo", "bar", [{year: 2019, wrongBar: 1}], goodLegend, {})).to.be.an("array").that.is.empty;
        });
        it("should ignore unknown classname of dots", function(){
            expect(model.helperCreateDataForAbschluesse("wrongFoo", "bar", goodData, goodLegend, {})).to.be.an("array").that.is.empty;
            expect(model.helperCreateDataForAbschluesse("foo", "bar", goodData, {"wrongFoo": {style: "foobar"}, "dotALL": {style: "foobar"}}, {})).to.be.an("array").that.is.empty;
        });
        it("should only use legends with a 'dotALL' key", function(){
            expect(model.helperCreateDataForAbschluesse("foo", "bar", goodData, {"foo": {style: "foobar"}}, {})).to.be.an("array").that.is.empty;
        });

        it("should result in an array of objects with class, style, y- and x-axis values in it", function () {
            const result = model.helperCreateDataForAbschluesse("foo", "bar", goodData, goodLegend, {});
            expect(result).to.be.an("array").that.has.lengthOf(1);
            expect(result[0]).to.include({class: "foo", style: "foobar", year: 2019, bar: 1});
        });

        it("should expand a given object to collect the aggregated overall data with the class 'dotALL'", function () {
            const verlaufAll = {};
            model.helperCreateDataForAbschluesse("foo", "bar", goodData, goodLegend, verlaufAll);
            expect(verlaufAll).to.have.keys("2019");
            expect(verlaufAll["2019"]).to.include({numberALL: 1, class: "dotALL", style: "foobar", year: 2019});
        });
    });

    describe("createDataForAbschluesse", function () {
        const maxYearsToShowInDiagrams = 10,
            goodLegendArray = [
                {class: "dotFoo", style: "bazStyle", text: "something"},
                {class: "dotBar", style: "bazStyle", text: "we ourselves"},
                {class: "dotALL", style: "bazStyle", text: "everything"}
            ],
            goodIfbqKeysAbsolute = {
                "1": {prefix: "foo", attrToShowArray: "quxFoo", refLegendClass: "dotFoo"},
                "2": {prefix: "bar", attrToShowArray: "quxBar", refLegendClass: "dotBar"}
            },
            goodGfiProperties = {
                foo_2011: 1,
                foo_2012: 3,
                bar_2011: 5,
                bar_2012: 7,
                baz: "qux"
            };

        it("should return an array of objects in a certain structure", function () {
            const result = model.createDataForAbschluesse(goodGfiProperties, goodLegendArray, maxYearsToShowInDiagrams, goodIfbqKeysAbsolute);
            expect(result).to.be.an("array").that.has.lengthOf(6);
            expect(result[0]).to.include({class: "dotFoo", quxFoo: 1, style: "bazStyle", year: "11/12"});
            expect(result[1]).to.include({class: "dotFoo", quxFoo: 3, style: "bazStyle", year: "12/13"});
            expect(result[2]).to.include({class: "dotBar", quxBar: 5, style: "bazStyle", year: "11/12"});
            expect(result[3]).to.include({class: "dotBar", quxBar: 7, style: "bazStyle", year: "12/13"});
            expect(result[4]).to.include({class: "dotALL", numberALL: 6, style: "bazStyle", year: "11/12"});
            expect(result[5]).to.include({class: "dotALL", numberALL: 10, style: "bazStyle", year: "12/13"});
        });
    });

    describe("setTemplateValues", function () {
        it("should set layerType, themeType, dataZeitverlauf and dataAbschluesse appropriately", function () {
            const maxYearsToShowInDiagrams = 10,
                goodLegendArray = [
                    {class: "dotFoo", style: "bazStyle", text: "something"},
                    {class: "dotBar", style: "bazStyle", text: "we ourselves"},
                    {class: "dotALL", style: "bazStyle", text: "everything"}
                ],
                goodIfbqKeysAbsolute = {
                    "1": {prefix: "foo", attrToShowArray: "quxFoo", refLegendClass: "dotFoo"},
                    "2": {prefix: "bar", attrToShowArray: "quxBar", refLegendClass: "dotBar"}
                },
                goodIfbqKeysRelative = {
                    "Abi": {prefix: "foo", attrToShowArray: "quxFoo", refLegendClass: "dotFoo"},
                    "oHS": {prefix: "bar", attrToShowArray: "quxBar", refLegendClass: "dotBar"}
                },
                goodGfiProperties = {
                    foo_2011: 1,
                    foo_2012: 3,
                    bar_2011: 5,
                    bar_2012: 7,
                    baz: "qux"
                };
            let gfiBildungsatlasFormat;

            gfiBildungsatlasFormat = {themeType: "Abi", layerType: "stadtteil"};
            model.setTemplateValues(goodGfiProperties, goodLegendArray, maxYearsToShowInDiagrams, goodIfbqKeysRelative, goodIfbqKeysAbsolute, gfiBildungsatlasFormat);

            expect(model.get("layerType")).to.equal("stadtteil");
            expect(model.get("themeType")).to.equal("Abi");

            expect(model.get("dataZeitverlauf")).to.be.an("array").that.has.lengthOf(2);
            expect(model.get("dataZeitverlauf")[0]).to.include({fullyear: 2011, year: "11/12", quxFoo: 1, value: 1});
            expect(model.get("dataZeitverlauf")[1]).to.include({fullyear: 2012, year: "12/13", quxFoo: 3, value: 3});

            expect(model.get("dataAbschluesse")).to.be.an("array").that.has.lengthOf(6);
            expect(model.get("dataAbschluesse")[0]).to.include({class: "dotFoo", quxFoo: 1, style: "bazStyle", year: "11/12"});
            expect(model.get("dataAbschluesse")[1]).to.include({class: "dotFoo", quxFoo: 3, style: "bazStyle", year: "12/13"});
            expect(model.get("dataAbschluesse")[2]).to.include({class: "dotBar", quxBar: 5, style: "bazStyle", year: "11/12"});
            expect(model.get("dataAbschluesse")[3]).to.include({class: "dotBar", quxBar: 7, style: "bazStyle", year: "12/13"});
            expect(model.get("dataAbschluesse")[4]).to.include({class: "dotALL", numberALL: 6, style: "bazStyle", year: "11/12"});
            expect(model.get("dataAbschluesse")[5]).to.include({class: "dotALL", numberALL: 10, style: "bazStyle", year: "12/13"});

            gfiBildungsatlasFormat = {themeType: "oHS", layerType: "sozialraum"};
            model.setTemplateValues(goodGfiProperties, goodLegendArray, maxYearsToShowInDiagrams, goodIfbqKeysRelative, goodIfbqKeysAbsolute, gfiBildungsatlasFormat);

            expect(model.get("layerType")).to.equal("sozialraum");
            expect(model.get("themeType")).to.equal("oHS");

            expect(model.get("dataZeitverlauf")).to.be.an("array").that.has.lengthOf(2);
            expect(model.get("dataZeitverlauf")[0]).to.include({fullyear: 2011, year: "11/12", quxBar: 5, value: 5});
            expect(model.get("dataZeitverlauf")[1]).to.include({fullyear: 2012, year: "12/13", quxBar: 7, value: 7});

            expect(model.get("dataAbschluesse")).to.be.an("array").that.has.lengthOf(6);
            expect(model.get("dataAbschluesse")[0]).to.include({class: "dotFoo", quxFoo: 1, style: "bazStyle", year: "11/12"});
            expect(model.get("dataAbschluesse")[1]).to.include({class: "dotFoo", quxFoo: 3, style: "bazStyle", year: "12/13"});
            expect(model.get("dataAbschluesse")[2]).to.include({class: "dotBar", quxBar: 5, style: "bazStyle", year: "11/12"});
            expect(model.get("dataAbschluesse")[3]).to.include({class: "dotBar", quxBar: 7, style: "bazStyle", year: "12/13"});
            expect(model.get("dataAbschluesse")[4]).to.include({class: "dotALL", numberALL: 6, style: "bazStyle", year: "11/12"});
            expect(model.get("dataAbschluesse")[5]).to.include({class: "dotALL", numberALL: 10, style: "bazStyle", year: "12/13"});
        });
    });
});
