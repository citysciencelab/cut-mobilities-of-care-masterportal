import {expect} from "chai";

import getProjections from "../../../../utils/download/getProjections";

describe("src/modules/tools/draw/utils/download/getProjections.js", () => {
    it("should return and object containing the parameters 'sourceProj' and 'destProj'", function () {
        const projections = getProjections("EPSG:25832", "EPSG:4326", "32");

        expect(projections).to.be.an("object");
        expect(projections).to.have.ownPropertyDescriptor("sourceProj");
        expect(projections).to.have.ownPropertyDescriptor("destProj");
    });
});
