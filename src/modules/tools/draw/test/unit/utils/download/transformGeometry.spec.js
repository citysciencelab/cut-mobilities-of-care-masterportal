import {expect} from "chai";

import {transform, transformPoint} from "../../../../utils/download/transformGeometry";

describe("src/modules/tools/draw/utils/download/transformGeometry.js", () => {
    describe("transform", function () {
        it("should transform line coordinates from EPSG:25832 to EPSG:4326", function () {
            const coords = [
                [689800.1275079311, 5339513.679162612],
                [691403.501642109, 5339640.679094031],
                [691848.0014020792, 5340259.803759704]
            ];

            expect(transform(coords, false)).to.eql(
                [
                    [11.553402467114491, 48.18048612894288],
                    [11.575007532544808, 48.18114662023035],
                    [11.581260790292623, 48.18657710798541]
                ]
            );
        });
        it("should transform polygon coordinates from EPSG:25832 to EPSG:4326", function () {
            const coords = [[
                [689546.127645091, 5338656.429625526],
                [693324.3756048371, 5339497.804171184],
                [691609.8765306666, 5335989.431065706],
                [689546.127645091, 5338656.429625526]
            ]];

            expect(transform(coords, true)).to.eql(
                [[
                    [11.549606597773037, 48.17285700012215],
                    [11.600757126507961, 48.179280978813836],
                    [11.57613610823175, 48.148267667042006],
                    [11.549606597773037, 48.17285700012215]
                ]]
            );
        });
    });
    describe("transformPoint", function () {
        it("should transform point coordinates from EPSG:25832 to EPSG:4326", function () {
            const coords = [690054.1273707711, 5340593.1785796825];

            expect(transformPoint(coords)).to.eql([11.557298950358712, 48.19011266676286]);
        });
    });
});
