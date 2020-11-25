import Model from "@modules/tools/pendler/lines/model.js";
import {expect} from "chai";

let model;

/**
 * creates testFeature
 * @param {Integer} pendlerAnzahl Anzahl der Pendler
 * @param {String} wohnort Wohnort
 * @return {Object} get
 */
function createTestFeature (pendlerAnzahl, wohnort) {
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
}

describe("Pendler-Lines", function () {
    describe("Verarbeitung der abgefragten Daten", function () {
        before(function () {
            const featuresInput = [];

            for (let i = 2; i <= 11; i++) {
                featuresInput.push(createTestFeature(i, "TestOrt" + i));
            }

            featuresInput.push(createTestFeature(9, "TestOrtDoppel"));
            featuresInput.push(createTestFeature(7, "TestOrtTrippel"));
            featuresInput.push(createTestFeature(7, "TestOrtDoppel"));


            model = new Model();

            model.createFeatures = function (features) {
                // Überschreibe die Funktion mit einem Setter zur Abfrage des Ergebnisses
                model.set("relevantFeatures", features);
            };
            model.centerGemeinde = function () {
                // override function with dummy
            };
            model.zoomToExtentOfFeatureGroup = function () {
                // override function with dummy
            };

            model.set("lineFeatures", featuresInput);
            model.set("attrAnzahl", "pendlerAnzahl");
            model.set("attrGemeinde", "wohnort");

            model.set("trefferAnzahl", "top10");

            model.handleData();
        });

        it("Es wurden nur die Top10 übernommen", function () {

            const top10PendlerAnzahlen = [],
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

            if (Array.isArray(model.get("relevantFeatures"))) {
                model.get("relevantFeatures").forEach(feature => {
                    top10PendlerAnzahlen.push(feature.get("pendlerAnzahl"));
                });
            }

            expect(top10PendlerAnzahlen).to.deep.equal(expectedTop10PendlerAnzahlen);
        });

        it("Jedes Feature hat zur Darstellung in der Legende neben einem Namen auch das Attribut \"Pendler-Anzahl\"", function () {
            const features = model.get("pendlerLegend");

            expect(features).to.have.lengthOf(10);

            features.forEach(feature => {
                expect(feature.name.length).to.be.above(0);
                expect(feature.anzahlPendler).to.exist;
            });

            expect(features[0].anzahlPendler).to.equal("11");
            expect(features[1].anzahlPendler).to.equal("10");
            expect(features[2].anzahlPendler).to.equal("9");
            expect(features[3].anzahlPendler).to.equal("9");
            expect(features[4].anzahlPendler).to.equal("8");
            expect(features[5].anzahlPendler).to.equal("7");
            expect(features[6].anzahlPendler).to.equal("7");
            expect(features[7].anzahlPendler).to.equal("7");
            expect(features[8].anzahlPendler).to.equal("6");
            expect(features[9].anzahlPendler).to.equal("5");
        });
    });
});
