import {expect} from "chai";
import Model from "@modules/tools/gfi/themes/dipas/model.js";

let model, iconPath, valueStyle;

before(function () {
    model = new Model();
    iconPath = "http://geoportal-hamburg.de/lgv-beteiligung/icons/einzelmarker_dunkel.png";
    valueStyle = [];
});

describe("tools/gfi/themes/dipas/model.js", function () {
    describe("the iconPathOld should show the right name with path", function () {
        it("should show the default name with path", function () {
            valueStyle = [];

            model.fetchIconPathDeprecated(iconPath, valueStyle);
            expect(model.get("iconPath")).to.equal(iconPath);
        });

        it("should show the parsed name with path", function () {
            valueStyle = [
                {
                    "styleFieldValue": "Wohnen",
                    "color": "#E20613",
                    "imageName": "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png",
                    "imageScale": "0.5"
                }
            ];
            iconPath = "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png";

            model.fetchIconPathDeprecated(iconPath, valueStyle);
            expect(model.get("iconPath")).to.equal(iconPath);
        });
    });

    describe("the iconPath should show the right name with path", function () {
        it("should show the default name with path", function () {
            valueStyle = [];

            model.fetchIconPath(iconPath, valueStyle);
            expect(model.get("iconPath")).to.equal(iconPath);
        });

        it("should show the parsed name with path", function () {
            valueStyle = [{
                "conditions": {
                    "properties": {
                        "Thema": "Wohnen"
                    }
                },
                "style": {
                    "imageName": "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png"
                }
            }];
            iconPath = "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png";

            model.fetchIconPath(iconPath, valueStyle);
            expect(model.get("iconPath")).to.equal(iconPath);
        });
    });
});
