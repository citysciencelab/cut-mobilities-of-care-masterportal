import {expect} from "chai";
import {createIconStyle} from "../../../../utils/style/createIconStyle";

describe("src/modules/tools/draw/utils/style/createIconStyle.js", () => {
    let iconPath;

    before(function () {
        iconPath = "/test/unittests/resources/icons/";
    });

    describe("createIconStyle", () => {
        it("the result color should be the same as the input color for a symbol of type image whereas the opacity is saved in a different parameter", () => {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    id: "iconCloud",
                    type: "image",
                    value: iconPath + "cloud.png"
                },
                zIndex = 0,
                result = createIconStyle(color, "", pointSize, symbol, zIndex);

            expect(result.getImage().getOpacity()).to.equal(color[3]);
        });
        it("the result path to the image should be the same as the input path", () => {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    caption: i18next.t("common:modules.tools.draw.iconList.iconCloud"),
                    type: "image",
                    value: iconPath + "cloud.png"
                },
                zIndex = 0,
                result = createIconStyle(color, "", pointSize, symbol, zIndex);

            expect(result.getImage().getSrc()).to.equal(symbol.value);
        });
        it("value without path shall result in imgPath + value", () => {
            // Image from https://material.io/resources/icons/?icon=cloud&style=baseline
            const color = [0, 0, 0, 1],
                imgPath = "https://geodienste.hamburg.de/lgv-config/img",
                pointSize = 16,
                symbol = {
                    caption: i18next.t("common:modules.tools.draw.iconList.iconCloud"),
                    type: "image",
                    value: "cloud.png"
                },
                zIndex = 0,
                result = createIconStyle(color, imgPath, pointSize, symbol, zIndex);

            expect(result.getImage().getSrc()).to.equal(imgPath + symbol.value);
        });
        it("the method should throw an Error if the symbol is not of type \"image\"", () => {
            const color = [0, 0, 0, 1],
                pointSize = 16,
                symbol = {
                    id: "Image",
                    type: "my_personal_image",
                    value: iconPath + "my_personal_image.png"
                },
                zIndex = 0;

            expect(() => createIconStyle(color, "", pointSize, symbol, zIndex)).to.throw(Error, `Draw: The given type ${symbol.type} of the symbol is not supported!`);
        });
    });
});
