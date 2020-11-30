import {expect} from "chai";
import {getWKTGeom} from "../../getWKTGeom.js";

describe("src/utils/getWKTGeom.js", () => {
    it("should return a feature with geometryType and POLYGON coordinates", () => {
        const content = ["570374.959", "5936460.361", "570369.316", "5936458.5", "570364.706", "5936473.242", "570370.393", "5936474.993", "570374.959", "5936460.361"],
            geometryType = "POLYGON";

        expect(getWKTGeom(content, geometryType)).is.not.undefined;
        expect(getWKTGeom(content, geometryType).getGeometry()).is.not.undefined;
        expect(getWKTGeom(content, geometryType).getGeometry().getCoordinates()).to.deep.equal([[
            [570374.959, 5936460.361],
            [570369.316, 5936458.5],
            [570364.706, 5936473.242],
            [570370.393, 5936474.993],
            [570374.959, 5936460.361]
        ]]);
    });

    it("should return a feature with geometryType and POINT coordinates", () => {
        const content = ["570374.959", "5936460.361"],
            geometryType = "POINT";

        expect(getWKTGeom(content, geometryType)).is.not.undefined;
        expect(getWKTGeom(content, geometryType).getGeometry()).is.not.undefined;
        expect(getWKTGeom(content, geometryType).getGeometry().getCoordinates()).to.deep.equal(
            [570374.959, 5936460.361]
        );
    });

    it("should return a feature with POLYGON coordinates by given content as object", () => {
        const content = {
            geometryType: "POLYGON",
            coordinate: ["570374.959", "5936460.361", "570369.316", "5936458.5", "570364.706", "5936473.242", "570370.393", "5936474.993", "570374.959", "5936460.361"]
        };

        expect(getWKTGeom(content)).is.not.undefined;
        expect(getWKTGeom(content).getGeometry()).is.not.undefined;
        expect(getWKTGeom(content).getGeometry().getCoordinates()).to.deep.equal([[
            [570374.959, 5936460.361],
            [570369.316, 5936458.5],
            [570364.706, 5936473.242],
            [570370.393, 5936474.993],
            [570374.959, 5936460.361]
        ]]);
    });

    it("should return a feature with MULTIPOLYGON coordinates by given content as object", () => {
        const content = {
            geometryType: "MULTIPOLYGON",
            coordinate: [
                ["570374.959", "5936460.361", "570369.316", "5936458.5", "570364.706", "5936473.242", "570370.393", "5936474.993", "570374.959", "5936460.361"],
                ["556622.043", "5935346.022", "556605.381", "5935347.509", "556583.860", "5935349.429", "556562.872", "5935351.302", "556562.855", "5935344.371", "556604.117", "5935340.974", "556622.043", "5935339.707", "556622.043", "5935346.022"]
            ],
            interiorGeometry: []
        };

        expect(getWKTGeom(content)).is.not.undefined;
        expect(getWKTGeom(content).getGeometry()).is.not.undefined;
        expect(getWKTGeom(content).getGeometry().getCoordinates()).to.deep.equal([
            [
                [
                    [570374.959, 5936460.361],
                    [570369.316, 5936458.5],
                    [570364.706, 5936473.242],
                    [570370.393, 5936474.993],
                    [570374.959, 5936460.361]
                ]
            ],
            [
                [
                    [556622.043, 5935346.022],
                    [556605.381, 5935347.509],
                    [556583.860, 5935349.429],
                    [556562.872, 5935351.302],
                    [556562.855, 5935344.371],
                    [556604.117, 5935340.974],
                    [556622.043, 5935339.707],
                    [556622.043, 5935346.022]
                ]
            ]
        ]);
    });
});
