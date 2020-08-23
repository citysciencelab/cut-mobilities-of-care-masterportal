import Model from "@modules/tools/gfi/themes/model.js";
import {expect} from "chai";
import * as moment from "moment";

let model;

before(function () {
    model = new Model();
});

describe("tools/gfi/themes/Model", function () {
    describe("translateGFI", function () {
        it("should return an correct array for gfiList and gfiAttributes input", function () {
            const gfiList = [
                    {
                        strasse: "Teststraße",
                        ort: "Testort"
                    }
                ],
                gfiAttributes = {
                    strasse: "StrassenName",
                    ort: "Ortname"
                };

            expect(model.translateGFI(gfiList, gfiAttributes)).to.be.an("array").to.deep.include({
                Ortname: "Testort",
                StrassenName: "Teststraße"
            });
        });
    });
    describe("prepareGfiValue", function () {
        it("Should return the value of given key", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "bar";

            expect(model.prepareGfiValue(gfi, key)).to.equal("foo");
        });
        it("Should return the value of given key if key is an object path", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "@barfoo.firstLevel";

            expect(model.prepareGfiValue(gfi, key)).to.equal("foobar");
        });
        it("Should return undefined for key that is not in gfi", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "foobar";

            expect(model.prepareGfiValue(gfi, key)).to.be.undefined;
        });
    });
    describe("getValueFromPath", function () {
        it("Should return object on firstLevel attribute", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "@barfoo.firstLevel";

            expect(model.getValueFromPath(gfi, key)).to.equal("foobar");
        });
        it("Should return object on secondLevel attribute", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: "foobar"
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel";

            expect(model.getValueFromPath(gfi, key)).to.equal("foobar");
        });
        it("Should return object on secondLevel attribute and array position 1", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: ["foobar", "barfoo"]
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel.0";

            expect(model.getValueFromPath(gfi, key)).to.equal("foobar");
        });
        it("Should return object on secondLevel attribute and array position 2", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: ["foobar", "barfoo"]
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel.1";

            expect(model.getValueFromPath(gfi, key)).to.equal("barfoo");
        });
        it("Should return object on secondLevel attribute and object in array position 0", function () {
            const gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: [
                                {
                                    thirdLevel: "foobar"
                                }
                            ]
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel.0.thirdLevel";

            expect(model.getValueFromPath(gfi, key)).to.equal("foobar");
        });
    });
    describe("prepareGfiValueFromObject", function () {
        it("Should return value of attribute that starts with 'foo_' and append 'mySuffix'", function () {
            const key = "foo_",
                obj = {
                    condition: "startsWith",
                    suffix: "mySuffix"
                },
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(model.prepareGfiValueFromObject(key, obj, gfi)).to.equal("foo_bar mySuffix");
        });
        it("Should return value of attribute that contains 'o_b' and convert it to date with default format", function () {
            const key = "o_b",
                obj = {
                    condition: "contains",
                    type: "date"
                },
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "2020-04-14T11:00:00.000Z",
                    bar_foo: "bar_foo"
                },
                defaultFormat = "DD.MM.YYYY HH:mm:ss";

            expect(model.prepareGfiValueFromObject(key, obj, gfi)).to.equal(moment("2020-04-14T11:00:00.000Z").format(defaultFormat));
        });
        it("Should return value of attribute that contains 'o__b' and convert it to date with given format 'DD.MM.YYYY'", function () {
            const key = "o_b",
                obj = {
                    condition: "contains",
                    type: "date",
                    format: "DD.MM.YYYY"
                },
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "2020-04-14T11:00:00.000Z",
                    bar_foo: "bar_foo"
                };

            expect(model.prepareGfiValueFromObject(key, obj, gfi)).to.equal("14.04.2020");
        });
    });
    describe("getValueFromCondition", function () {
        it("Sould return first key matching the contains condition", function () {
            const key = "oo_",
                condition = "contains",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(model.getValueFromCondition(key, condition, gfi)).to.equal("foo_bar");
        });
        it("Sould return first key matching the startsWidth condition", function () {
            const key = "bar",
                condition = "startsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(model.getValueFromCondition(key, condition, gfi)).to.equal("bar");
        });
        it("Sould return first key matching the startsWidth condition", function () {
            const key = "bar_",
                condition = "startsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(model.getValueFromCondition(key, condition, gfi)).to.equal("bar_foo");
        });
        it("Sould return first key matching the endsWith condition", function () {
            const key = "foo",
                condition = "endsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(model.getValueFromCondition(key, condition, gfi)).to.equal("foo");
        });
        it("Sould return first key matching the endsWith condition", function () {
            const key = "_foo",
                condition = "endsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(model.getValueFromCondition(key, condition, gfi)).to.equal("bar_foo");
        });
    });
    describe("appendSuffix", function () {
        it("Should leave string value as is, when suffix is undefined", function () {
            expect(model.appendSuffix("test1", undefined)).to.equal("test1");
        });
        it("Should leave number value as is, when suffix is undefined", function () {
            expect(model.appendSuffix(123, undefined)).to.equal(123);
        });
        it("Should leave float value as is, when suffix is undefined", function () {
            expect(model.appendSuffix(12.3, undefined)).to.equal(12.3);
        });
        it("Should leave boolean value as is, when suffix is undefined", function () {
            expect(model.appendSuffix(true, undefined)).to.be.true;
        });
        it("Should append suffix", function () {
            expect(model.appendSuffix("test1", "suffix")).to.equal("test1 suffix");
        });
        it("Should turn number value into string and append suffix", function () {
            expect(model.appendSuffix(123, "suffix")).to.equal("123 suffix");
        });
        it("Should turn float value into string and append suffix", function () {
            expect(model.appendSuffix(12.3, "suffix")).to.equal("12.3 suffix");
        });
        it("Should turn boolean value into string and append suffix", function () {
            expect(model.appendSuffix(true, "suffix")).to.equal("true suffix");
        });
    });
});
