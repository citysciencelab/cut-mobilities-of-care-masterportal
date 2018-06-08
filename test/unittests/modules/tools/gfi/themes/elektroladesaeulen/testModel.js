define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../../../../modules/tools/gfi/themes/elektroladesaeulen/model.js"),
        model;

    before(function () {
        model = new Model();
    });

    describe("tools/gfi/themes/elektroladesaeulen", function () {

        describe("splitProperties", function () {
            it("should return an empty object for undefined input", function () {
                expect(model.splitProperties(undefined)).to.be.an("object").that.is.empty;
            });
            it("should return an empty object for empty object input", function () {
                expect(model.splitProperties({})).to.be.an("object").that.is.empty;
            });
            it("should return an object with values as array for object with Pipes input", function () {
                var properties = {
                    Stecker: "Typ2/Schuko | Typ2/Schuko",
                    DatastreamID: "100 | 200"
                };

                expect(model.splitProperties(properties))
                    .to.nested.include({"Stecker[0]": "Typ2/Schuko"})
                    .and.to.nested.include({"Stecker[1]": "Typ2/Schuko"})
                    .and.to.nested.include({"DatastreamID[0]": "100"})
                    .and.to.nested.include({"DatastreamID[1]": "200"});
            });
            it("should return an empty object for incorrect object without Pipes input", function () {
                var properties = {
                    Stecker: "Typ2/Schuko",
                    DatastreamID: 100
                };

                expect(model.splitProperties(properties)).to.be.an("object")
                    .to.nested.include({"Stecker[0]": "Typ2/Schuko"})
                    .and.to.nested.include({"DatastreamID[0]": "100"});
            });
            it("should return an empty object for incorrect object with values as array and object input", function () {
                var properties = {
                    Stecker: ["Typ2/Schuko"],
                    DatastreamID: {a: "b"}
                };

                expect(model.splitProperties(properties)).to.be.an("object")
                    .to.nested.include({"Stecker[0]": "Typ2/Schuko"})
                    .and.to.nested.include({"DatastreamID[0]": ""});
            });
        });
        describe("createGfiHeadingChargingStation", function () {
            it("should return an object with keys and blank values for undefined input", function () {
                expect(model.createGfiHeadingChargingStation(undefined)).to.be.an("object").that.includes({
                    StandortID: "",
                    Adresse: "",
                    Eigentümer: ""
                });
            });
            it("should return an object with keys and blank values for empty object input", function () {
                expect(model.createGfiHeadingChargingStation({})).to.be.an("object").that.includes({
                    StandortID: "",
                    Adresse: "",
                    Eigentümer: ""
                });
            });
            it("should return an object with adress as object for correct object input", function () {
                var allProperties = {
                    chargings_station_nr: ["100", "100"],
                    location_name: ["Musterstrasse", "Musterstrasse"],
                    postal_code: ["99999", "99999"],
                    city: ["Hamburg", "Hamburg"],
                    owner: ["Mustermann", "Mustermann"]
                };

                expect(model.createGfiHeadingChargingStation(allProperties)).to.be.an("object").that.includes({
                    StandortID: "100",
                    Adresse: "Musterstrasse, 99999 Hamburg",
                    Eigentümer: "Mustermann"
                });
            });
            it("should return an object with adress as object for correct object input", function () {
                var allProperties = {
                    chargings_station_nr: [100],
                    dd: ["Musterstrasse", "Musterstrasse"],
                    thtbeefvvw: ["99999", "99999"],
                    city: ["Hamburg", "Hamburg"],
                    owner: ["Mustermann"]
                };

                expect(model.createGfiHeadingChargingStation(allProperties)).to.be.an("object").that.includes({
                    StandortID: "100",
                    Adresse: "",
                    Eigentümer: "Mustermann"
                });
            });
        });
        describe("createGfiTableHeadingChargingStation", function () {
            it("should return an empty array for undefined input", function () {
                expect(model.createGfiTableHeadingChargingStation(undefined)).to.be.an("array").that.is.empty;
            });
            it("should return an empty array for empty object input", function () {
                expect(model.createGfiTableHeadingChargingStation({})).to.be.an("array").that.is.empty;
            });
            it("should return an array with Ladezeiten for correct object input", function () {
                var allProperties = {
                    sms_no_charging_station: ["1001", "1002"]
                };
                expect(model.createGfiTableHeadingChargingStation(allProperties)).to.be.an("array").that.includes("Ladepunkt: 1001", "Ladepunkt: 1002");
            });
            it("should return an empty array for incorrect object input", function () {
                var allProperties = {
                    sms_noa_chargiaasng_station: ["1001", "1002"]
                };
                expect(model.createGfiTableHeadingChargingStation(allProperties)).to.be.an("array").that.is.empty;
            });
        });
        describe("changeStateToGerman", function () {
            it("should return an empty object for undefined input", function () {
                expect(model.changeStateToGerman(undefined)).to.be.an("object").that.is.empty;
            });
            it("should return an empty object for empty object input", function () {
                expect(model.changeStateToGerman({})).to.be.an("object").that.is.empty;
            });
        });
    });
});
