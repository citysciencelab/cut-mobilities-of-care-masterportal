define(function (require) {
    var expect = require("chai").expect,
        model,
        Model = require("../../../../../modules/tools/animation/model.js"),
        createFeature;

    createFeature = function (pendlerAnzahl, wohnort) {
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
        describe("prepareData", function () {
            before(function () {
                var featuresInput = [],
                    i;

                for (i = 7; i <= 11; i++) {
                    featuresInput.push(createFeature(i, "TestOrt" + i));
                }

                featuresInput.push(createFeature(9, "TestOrtDoppel"));

                model = new Model();

                model.preparePendlerLegend = function (features) {
                    // Überschreibe die Funktion mit einem Setter zur Abfrage des Ergebnisses
                    model.set("relevantFeatures", features);
                };
                model.createLineString = function () {
                    // Überschreibe Funktion mit Dummy
                };
                model.centerGemeindeAndSetMarker = function () {
                    // Überschreibe Funktion mit Dummy
                };

                model.set("lineFeatures", featuresInput);
                model.set("attrAnzahl", "pendlerAnzahl");
                model.set("attrGemeinde", "wohnort");

                model.set("trefferAnzahl", "top5");

                model.prepareData();
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
                    expect(feature.color).to.satisfy(function (expr) {
                        // Test for color to be a css color string
                        return (/rgba/).test(expr) || (/hsla/).test(expr);
                    });
                    colors.push(feature.color);
                });

                expect(_.uniq(colors).length).to.be.equal(colors.length);

            });
        });
    });
});
