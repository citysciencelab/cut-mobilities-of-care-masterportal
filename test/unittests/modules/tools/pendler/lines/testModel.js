import {expect} from "chai";
import Model from "@modules/tools/pendler/lines/model.js";

var model, createTestFeature;

createTestFeature = function (pendlerAnzahl, wohnort) {
    return {
        "get": function (value) {
            switch (value) {
                case "pendlerAnzahl":
                    return pendlerAnzahl;
                case "wohnort":
                    return wohnort;
                default:
                    return null;
            }
        }
    };
};

describe("Pendler-Lines", function () {
    describe("Verarbeitung der abgefargten Daten", function () {
        before(function () {
            var featuresInput = [],
                i;

            for (i = 2; i <= 11; i++) {
                featuresInput.push(createTestFeature(i, "TestOrt" + i));
            }

            featuresInput.push(createTestFeature(9, "TestOrtDoppel"));
            featuresInput.push(createTestFeature(7, "TestOrtTrippel"));
            featuresInput.push(createTestFeature(7, "TestOrtDoppel"));


            model = new Model();

            // eslint-disable-next-line no-unused-vars
            model.createFeatures = function (features) {
                // Überschreibe die Funktion mit einem Setter zur Abfrage des Ergebnisses
                model.set("relevantFeatures", features);
            };

            // eslint-disable-next-line no-unused-vars
            model.centerGemeinde = function (setMarker) {
                // Überschreibe Funktion mit Dummy
            };

            model.set("lineFeatures", featuresInput);
            model.set("attrAnzahl", "pendlerAnzahl");
            model.set("attrGemeinde", "wohnort");

            model.set("trefferAnzahl", "top10");

            model.handleData();
        });

        it("Es wurden nur die Top10 übernommen", function () {

            var top10PendlerAnzahlen = [],
                expectedTop10PendlerAnzahlen = [
                    11,
                    10,
                    9,
                    9,
                    8,
                    7,
                    7,
                    7,
                    6,
                    5
                ];

            _.forEach(model.get("relevantFeatures"), function (feature) {
                top10PendlerAnzahlen.push(feature.get("pendlerAnzahl"));
            });

            expect(top10PendlerAnzahlen).to.deep.equal(expectedTop10PendlerAnzahlen);
        });

        it("Jedes Feature hat zur Darstellung in der Legende neben einem Namen auch das Attribut \"Pendler-Anzahl\"", function () {

            expect(model.get("pendlerLegend")).to.have.lengthOf(10);

            _.forEach(model.get("pendlerLegend"), function (feature) {
                expect(feature.name.length).to.be.above(0);
                expect(feature.anzahlPendler).to.be.above(0);
            });
        });
    });
});
