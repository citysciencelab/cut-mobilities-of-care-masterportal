import {expect} from "chai";
import Model from "@modules/tools/pendler/animation/model.js";

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

describe("Pendler-Animation", function () {
    describe("Verarbeitung der abgefragten Daten", function () {
        before(function () {
            var featuresInput = [],
                i;

            for (i = 7; i <= 11; i++) {
                featuresInput.push(createTestFeature(i, "TestOrt" + i));
            }

            featuresInput.push(createTestFeature(9, "TestOrtDoppel"));

            model = new Model();

            model.createLineString = function (features) {
                // Überschreibe die Funktion mit einem Setter zur Abfrage des Ergebnisses
                model.set("relevantFeatures", features);
            };
            model.centerGemeinde = function () {
                // Überschreibe Funktion mit Dummy
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

            var top5PendlerAnzahlen = [],
                expectedTop5PendlerAnzahlen = [
                    11,
                    10,
                    9,
                    9,
                    8
                ];

            _.forEach(model.get("relevantFeatures"), function (feature) {
                top5PendlerAnzahlen.push(feature.get("pendlerAnzahl"));
            });

            expect(top5PendlerAnzahlen).to.deep.equal(expectedTop5PendlerAnzahlen);
        });

        it("Jedem Feature wird eine eigene eindeutige Farbe zugewiesen", function () {

            var colors = [];

            _.forEach(model.get("relevantFeatures"), function (feature) {
                expect(feature.color).to.exist;
                colors.push(feature.color);
            });

            expect(_.uniq(colors).length).to.be.equal(colors.length);

        });

        it("Jedes Feature hat zur Darstellung in der Legende neben einem Namen auch das Attribut \"Pendler-Anzahl\" und eine Farbe", function () {

            expect(model.get("pendlerLegend")).to.have.lengthOf(5);

            _.forEach(model.get("pendlerLegend"), function (feature) {
                expect(feature.name.length).to.be.above(0);
                expect(feature.color).to.exist;
                expect(feature.anzahlPendler).to.be.above(0);
            });
        });
    });
});
