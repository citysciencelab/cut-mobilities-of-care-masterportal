import {expect} from "chai";
import {hexToOlColor, parseColor, getStringColor, getDefaultCondition, setCesiumStyleColor, setCesiumStyleImage, setCesiumStyleText} from "@modules/core/modelList/layer/tilesetHelper.js";

describe("core/modelList/layer/tilesetHelper", function () {

    describe("hexToOlColor", () => {
        it("should convert a hex Color Value to a ol.Color type", () => {
            const olColor = hexToOlColor("#ff0000");

            expect(olColor).to.deep.equal([255, 0, 0, 1]);
        });

        it("should convert a 3 digit hex value to", () => {
            const olColor = hexToOlColor("#f00");

            expect(olColor).to.deep.equal([255, 0, 0, 1]);
        });

        it("should use alpha value if it exists", () => {
            const olColor = hexToOlColor("#ff0000", 0);

            expect(olColor).to.deep.equal([255, 0, 0, 0]);
        });
    });

    describe("parseColor", () => {
        it("should parse an array of color values", () => {
            const color = parseColor([255, 0, 0]),
                color2 = parseColor([255, 0, 0, 0.5]);

            expect(color).to.deep.equal([255, 0, 0, 1]);
            expect(color2).to.deep.equal([255, 0, 0, 0.5]);
        });

        it("should parse an hex value", () => {
            const color = parseColor("#ff0000"),
                color2 = parseColor("#0000ff");

            expect(color).to.deep.equal([255, 0, 0, 1]);
            expect(color2).to.deep.equal([0, 0, 255, 1]);
        });

        it("should parse an rgb color string", () => {
            const color = parseColor("rgb(0,255,0)");

            expect(color).to.deep.equal([0, 255, 0, 1]);
        });

        it("should parse an rgba color string", () => {
            const color = parseColor("rgba(0,255,0,0.4)");

            expect(color).to.deep.equal([0, 255, 0, 0.4]);
        });
    });

    describe("getStringColor", () => {
        it("should return an rgba Color String", () => {
            const color = getStringColor([255, 0, 0]),
                color2 = getStringColor([255, 0, 0, 0.5]);

            expect(color).to.equal("rgba(255,0,0,1)");
            expect(color2).to.equal("rgba(255,0,0,0.5)");
        });
    });

    describe("getDefaultCondition", () => {
        it("should return an array of Cesium Style Conditions Arrays", () => {
            const conditions = getDefaultCondition("olcs_font"),
                colorConditions = getDefaultCondition("olcs_color", true);

            expect(conditions[0]).to.deep.equal(["Boolean(${olcs_font})===true", "${olcs_font}"]);
            expect(conditions[1]).to.deep.equal(["true", "'bold 18px sans-serif'"]);

            expect(colorConditions[0]).to.deep.equal(["Boolean(${olcs_color})===true", "color(${olcs_color})"]);
            expect(colorConditions[1]).to.deep.equal(["true", "rgba(255,255,255,1)"]);
        });
    });

    describe("setCesiumStyleColor", () => {
        it("should set the default Color Conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleColor(vcsStyle, style);
            expect(style.color._conditions[0]).to.deep.equal(["Boolean(${olcs_color})===true", "color(${olcs_color})"]);
            expect(style.color._conditions[1]).to.deep.equal(["${olcs_geometryType}===3", "rgba(255,255,255,0.4)"]);
            expect(style.color._conditions[2]).to.deep.equal(["${olcs_geometryType}===2", "rgba(51,153,204,1)"]);
            expect(style.color._conditions[3]).to.deep.equal(["true", "rgba(255,255,255,0.4)"]);
        });

        it("should set the stroke Color condition for polylines", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    stroke: {
                        color: [255, 0, 0, 1]
                    }
                };

            setCesiumStyleColor(vcsStyle, style);
            expect(style.color._conditions[2]).to.deep.equal(["${olcs_geometryType}===2", "rgba(255,0,0,1)"]);
        });

        it("should set the color condition for fill points", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    image: {
                        fill: {
                            color: [0, 255, 0, 0.5]
                        },
                        radius: 15
                    }
                };

            setCesiumStyleColor(vcsStyle, style);
            expect(style.color._conditions[1]).to.deep.equal(["${olcs_geometryType}===3", "rgba(0,255,0,0.5)"]);
        });
        it("should set the fill color for polygons", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    fill: {
                        color: [0, 0, 255, 0.5]
                    }
                };

            setCesiumStyleColor(vcsStyle, style);
            expect(style.color._conditions[3]).to.deep.equal(["true", "rgba(0,0,255,0.5)"]);
        });
    });

    describe("setCesiumStyleImage", () => {
        it("should set the default scale conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleImage(vcsStyle, style);
            expect(style.scale._conditions[0]).to.deep.equal(["Boolean(${olcs_scale})===true", "${olcs_scale}"]);
            expect(style.scale._conditions[1]).to.deep.equal(["true", "1.0"]);
        });
        it("should set the scale conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    image: {
                        scale: "15"
                    }
                };

            setCesiumStyleImage(vcsStyle, style);
            expect(style.scale._conditions[1]).to.deep.equal(["true", "15"]);
        });
        it("should set the default pointOutlineWidth conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleImage(vcsStyle, style);
            expect(style.pointOutlineWidth._conditions[0]).to.deep.equal(["Boolean(${olcs_outlineWidth})===true", "${olcs_outlineWidth}"]);
            expect(style.pointOutlineWidth._conditions[1]).to.deep.equal(["true", "1"]);
        });
        it("should set the pointOutlineWidth conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    image: {
                        radius: "15",
                        stroke: {
                            width: 2
                        }
                    }
                };

            setCesiumStyleImage(vcsStyle, style);
            expect(style.pointOutlineWidth._conditions[1]).to.deep.equal(["true", "2"]);
        });
        it("should set the default pointOutlineColor conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleImage(vcsStyle, style);
            expect(style.pointOutlineColor._conditions[0]).to.deep.equal(["Boolean(${olcs_outlineColor})===true", "color(${olcs_outlineColor})"]);
            expect(style.pointOutlineColor._conditions[1]).to.deep.equal(["true", "rgba(0,0,0,1)"]);
        });
        it("should set the pointOutlineColor conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    image: {
                        stroke: {
                            color: [0, 255, 0, 0.5]
                        }
                    }
                };

            setCesiumStyleImage(vcsStyle, style);
            expect(style.pointOutlineColor._conditions[1]).to.deep.equal(["true", "rgba(0,255,0,0.5)"]);
        });
        it("should set the default pointSize conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleImage(vcsStyle, style);
            expect(style.pointSize._conditions[0]).to.deep.equal(["Boolean(${olcs_pointSize})===true", "${olcs_pointSize}"]);
            expect(style.pointSize._conditions[1]).to.deep.equal(["true", "9"]);
        });
        it("should set the pointSize conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    image: {
                        radius: 15,
                        stroke: {
                            width: 0
                        }
                    }
                };

            setCesiumStyleImage(vcsStyle, style);
            // pointSize is radius * 2 - stroke.width
            expect(style.pointSize._conditions[1]).to.deep.equal(["true", "30"]);
        });
        it("should set the default image conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleImage(vcsStyle, style);
            expect(style.image._conditions[0]).to.deep.equal(["Boolean(${olcs_image})===true", "${olcs_image}"]);
            expect(style.image._conditions[1]).to.deep.equal(["true", undefined]);
        });
        it("should set the image conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    image: {
                        src: "icon.png"
                    }
                };

            setCesiumStyleImage(vcsStyle, style);
            expect(style.image._conditions[1]).to.deep.equal(["true", "'icon.png'"]);
        });
    });
    describe("setCesiumStyleText", () => {
        it("should set the default font conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleText(vcsStyle, style);
            expect(style.font._conditions[0]).to.deep.equal(["Boolean(${olcs_font})===true", "${olcs_font}"]);
            expect(style.font._conditions[1]).to.deep.equal(["true", "'bold 18px sans-serif'"]);
        });
        it("should set the font conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    text: {
                        font: "bold 20px arial"
                    }
                };

            setCesiumStyleText(vcsStyle, style);
            expect(style.font._conditions[1]).to.deep.equal(["true", "'bold 20px arial'"]);
        });
        it("should set the default label conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelText._conditions[0]).to.deep.equal(["Boolean(${olcs_labelText})===true", "${olcs_labelText}"]);
            expect(style.labelText._conditions[1]).to.deep.equal(["true", undefined]);
        });
        it("should set the label conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    text: {
                        label: "label"
                    }
                };

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelText._conditions[1]).to.deep.equal(["true", "'label'"]);
        });
        it("should set the default labelColor conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelColor._conditions[0]).to.deep.equal(["Boolean(${olcs_fontColor})===true", "color(${olcs_fontColor})"]);
            expect(style.labelColor._conditions[1]).to.deep.equal(["true", "rgba(0,0,0,1)"]);
        });
        it("should set the labelColor conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    text: {
                        fill: {
                            color: [255, 0, 0, 1]
                        }
                    }
                };

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelColor._conditions[1]).to.deep.equal(["true", "rgba(255,0,0,1)"]);
        });
        it("should set the default labelOutlineWidth conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelOutlineWidth._conditions[0]).to.deep.equal(["Boolean(${olcs_fontOutlineWidth})===true", "${olcs_fontOutlineWidth}"]);
            expect(style.labelOutlineWidth._conditions[1]).to.deep.equal(["true", "1.0"]);
        });
        it("should set the labelOutlineWidth conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    text: {
                        stroke: {
                            width: "2"
                        }
                    }
                };

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelOutlineWidth._conditions[1]).to.deep.equal(["true", "2"]);
        });
        it("should set the default labelOutlineColor conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {};

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelOutlineColor._conditions[0]).to.deep.equal(["Boolean(${olcs_fontOutlineColor})===true", "color(${olcs_fontOutlineColor})"]);
            expect(style.labelOutlineColor._conditions[1]).to.deep.equal(["true", "rgba(255,255,255,1)"]);
        });
        it("should set the labelOutlineColor conditions", () => {
            const style = new Cesium.Cesium3DTileStyle({show: true}),
                vcsStyle = {
                    text: {
                        stroke: {
                            color: [255, 255, 0, 1]
                        }
                    }
                };

            setCesiumStyleText(vcsStyle, style);
            expect(style.labelOutlineColor._conditions[1]).to.deep.equal(["true", "rgba(255,255,0,1)"]);
        });
    });
});
