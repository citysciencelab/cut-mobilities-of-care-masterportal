import {expect} from "chai";
import StyleWMS from "@modules/tools/styleWMS/view.js";
import StyleWMSModel from "@modules/tools/styleWMS/model.js";

describe("tools/styleWMS/view", function () {
    var styleWMS;

    before(function () {
        var errors,
            node,
            i;

        errors = [
            {
                minText: "Bitte tragen Sie eine natürliche Zahl ein.",
                minIndex: 1
            },
            {
                maxText: "Bitte tragen Sie eine natürliche Zahl ein.",
                maxIndex: 2
            },
            {
                colorText: "Bitte wählen Sie eine Farbe aus.",
                colorIndex: 3
            },
            {
                rangeText: "Überprüfen Sie die Werte.",
                rangeIndex: 4
            },
            {
                intersectText: "Überprüfen Sie die Werte. Wertebereiche dürfen sich nicht überschneiden.",
                intersectIndex: 6,
                prevIndex: 5
            }
        ];

        styleWMS = new StyleWMS({model: new StyleWMSModel()});

        // prepare html body
        for (i = 0; i < 10; i++) {
            node = $("<div class='form-group'></div>");

            node.append("<div><input class='start-range" + i + "' ></div>");
            node.append("<div><input class='stop-range" + i + "'></div>");
            node.append("<div><div><input class='selected-color" + i + "'></div></div>");

            styleWMS.$el.append(node);
        }

        styleWMS.model.set("errors", errors);

        styleWMS.showErrorMessages();
    });

    describe("Error list should include", function () {

        it("NAN value for minimum", function () {
            expect(styleWMS.$el.find(".start-range1").parent().hasClass("has-error")).to.be.equal(true);
            expect(styleWMS.$el.find(".start-range1").next("span.error").html()).to.be.equal("Bitte tragen Sie eine natürliche Zahl ein.");
        });

        it("NAN value for maximum", function () {
            expect(styleWMS.$el.find(".stop-range2").parent().hasClass("has-error")).to.be.equal(true);
            expect(styleWMS.$el.find(".stop-range2").next("span.error").html()).to.be.equal("Bitte tragen Sie eine natürliche Zahl ein.");
        });

        it("missing color", function () {
            expect(styleWMS.$el.find(".selected-color3").parent().hasClass("has-error")).to.be.equal(true);
            expect(styleWMS.$el.find(".selected-color3").parent().next("span.error").html()).to.be.equal("Bitte wählen Sie eine Farbe aus.");
        });

        it("minimum greater than maximum", function () {
            expect(styleWMS.$el.find(".start-range4").parent().hasClass("has-error")).to.be.equal(true);
            expect(styleWMS.$el.find(".stop-range4").parent().hasClass("has-error")).to.be.equal(true);
            expect(styleWMS.$el.find(".start-range4").next("span.error").html()).to.be.equal("Überprüfen Sie die Werte.");
        });

        it("intersecting intervalls", function () {
            expect(styleWMS.$el.find(".start-range6").parent().hasClass("has-error")).to.be.equal(true);
            expect(styleWMS.$el.find(".start-range6").next("span.error").html()).to.be.equal("Überprüfen Sie die Werte. Wertebereiche dürfen sich nicht überschneiden.");

            expect(styleWMS.$el.find(".stop-range5").parent().hasClass("has-error")).to.be.equal(true);
            expect(styleWMS.$el.find(".stop-range5").next("span.error").html()).to.be.equal("Überprüfen Sie die Werte. Wertebereiche dürfen sich nicht überschneiden.");
        });

    });

});
