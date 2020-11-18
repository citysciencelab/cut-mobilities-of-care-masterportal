import Model from "@modules/tools/pendler/animation/model.js";
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

describe("Pendler-Animation", function () {
    describe("Verarbeitung der abgefragten Daten", function () {
        before(function () {
            const featuresInput = [];

            for (let i = 7; i <= 11; i++) {
                featuresInput.push(createTestFeature(i, "TestOrt" + i));
            }

            featuresInput.push(createTestFeature(9, "TestOrtDoppel"));

            model = new Model();

            model.createLineString = function (features) {
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

            model.set("trefferAnzahl", "top5");

            model.handleData();
        });

        it("Die Statistik wurde korrekt berechnet", function () {
            expect(model.get("maxVal")).to.be.equal(11);
            expect(model.get("minVal")).to.be.equal(8);
        });

        it("Es wurden nur die Top5 übernommen", function () {

            const top5PendlerAnzahlen = [],
                expectedTop5PendlerAnzahlen = [
                    11,
                    10,
                    9,
                    9,
                    8
                ];

            if (Array.isArray(model.get("relevantFeatures"))) {
                model.get("relevantFeatures").forEach(feature => {
                    top5PendlerAnzahlen.push(feature.get("pendlerAnzahl"));
                });
            }

            expect(top5PendlerAnzahlen).to.deep.equal(expectedTop5PendlerAnzahlen);
        });

        it("Jedem Feature wird eine eigene eindeutige Farbe zugewiesen", function () {
            const colors = [];

            if (Array.isArray(model.get("relevantFeatures"))) {
                model.get("relevantFeatures").forEach(feature => {
                    expect(feature.color).to.exist;
                    colors.push(feature.color);
                });
            }

            expect([...new Set(colors)].length).to.be.equal(colors.length);

        });

        it("Jedes Feature hat zur Darstellung in der Legende neben einem Namen auch das Attribut \"Pendler-Anzahl\" und eine Farbe", function () {
            const features = model.get("pendlerLegend");

            expect(features).to.have.lengthOf(5);

            features.forEach(feature => {
                expect(feature.name.length).to.be.above(0);
                expect(feature.color).to.exist;
                expect(feature.anzahlPendler).to.exist;
            });

            expect(features[0].anzahlPendler).to.equal("11");
            expect(features[1].anzahlPendler).to.equal("10");
            expect(features[2].anzahlPendler).to.equal("9");
            expect(features[3].anzahlPendler).to.equal("9");
            expect(features[4].anzahlPendler).to.equal("8");
        });
    });
});
