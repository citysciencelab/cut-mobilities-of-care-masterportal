define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/core/crs.js");

    describe("core/CRS", function () {
        var model;

        before(function () {
            model = new Model();
        });

        describe("has correct namedProjections from config", function () {
            it("getNamedProjections", function () {
                expect(model.get("namedProjections")).to.have.lengthOf(2);
            });
        });
        describe("returns correct proj4 format", function () {
            it("getProjection for EPSG:31461", function () {
                expect(model.getProjection("EPSG:31461")).to.not.be.empty;
                expect(model.getProjection("EPSG:31461")).to.deep.equal({
                    datumCode: "potsdam",
                    ellps: "bessel",
                    k0: 1,
                    lat0: 0,
                    long0: 0.05235987755982989,
                    no_defs: true,
                    projName: "tmerc",
                    title: "Gauß 3° Bessel",
                    units: "m",
                    x0: 1500000,
                    y0: 0
                });
            });
            it("returns 2 proj4 from config", function () {
                expect(model.getProjections()).to.have.lengthOf(2);
                expect(model.getProjections()[0]).to.have.property("title", "Gauß 3° Bessel");
                expect(model.getProjections()[1]).to.have.property("title", "Gauß 6° Bessel");
            });
        });
        describe("transforms coordinates correctly", function () {
            var par = {
                fromCRS: "EPSG:31461",
                toCRS: "EPSG:31462",
                point: [1958828.57, 5960028.02]
            };

            it("transforms from EPSG:31461 to EPSG:31462", function () {
                expect(model.transform(par)).to.have.lengthOf(2);
                expect(model.transform(par)[0]).to.equal(2760384.0229459424);
                expect(model.transform(par)[1]).to.equal(5944842.574243492);
            });
        });
    });
});
