define(function (require) {
    var expect = require("chai").expect,
        Model = require("../../../../modules/searchbar/specialWFS/model.js");

    describe("modules/searchbar/specialWFS", function () {
        var model = {},
            config = {
                "minChars": 5,
                "timeout": 10000,
                "definitions": [
                    {
                        "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
                        "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=app:mrh_row_bplan&propertyName=name",
                        "name": "B-Plan"
                    },
                    {
                        "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                        "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_festgestellt&propertyName=planrecht",
                        "name": "festgestellt"
                    },
                    {
                        "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                        "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_imverfahren&propertyName=plan",
                        "name": "im Verfahren"
                    },
                    {
                        "url": "/geodienste_hamburg_de/HH_WFS_KitaEinrichtung",
                        "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=app:KitaEinrichtungen&propertyName=app:Name",
                        "name": "Kita"
                    },
                    {
                        "url": "/geodienste_hamburg_de/HH_WFS_Stoerfallbetriebe",
                        "data": "service=WFS&request=GetFeature&version=1.1.0&typeName=app:stoerfallbetrieb&propertyName=app:standort",
                        "name": "Störfallbetrieb"
                    }
                ]
            },
            thema1 = [{
                filter: "blah",
                glyphicon: "glyphicon-home",
                id: "Störfallbetrieb6088",
                name: "Shell Deutschland Oil GmbH, GLC Nord",
                type: "Störfallbetrieb"
            },
            {
                filter: "blahbl",
                glyphicon: "glyphicon-home",
                id: "Störfallbetrieb601458",
                name: "Oesterreichische Holding",
                type: "Störfallbetrieb"
            }],
            thema2 = [{
                filter: "blah",
                glyphicon: "glyphicon-home",
                id: "Störfallbetrieb6089",
                name: "Lufthansa Technik Aktiengesellschaft",
                type: "Störfallbetrieb"
            }];

        before(function () {
            model = new Model(config);
        });

        describe("config", function () {
            it("should set timeout", function () {
                expect(model.getTimeout()).to.equal(10000);
            });
            it("should set minchar", function () {
                expect(model.getMinChars()).to.equal(5);
            });
        });

        describe("simplifyString", function () {
            it("should simplify Umlaute", function () {
                expect(model.simplifyString("ßäöü")).to.be.an("string").that.equals("ssaeoeue");
            });
            it("should lowerCase", function () {
                expect(model.simplifyString("ABC")).to.be.an("string").that.equals("abc");
            });
        });

        describe("getMinMax", function () {
            var element = "573719.685 5941416.185 573775.882 5941416.276 573897.845 5941418.233 573909.224 5941417.989 573920.601 5941417.681 573931.976 5941417.307 573960.551 5941415.984 573960.158 5941406.122 573954.677 5941402.464 573950.327 5941385.969 573948.355 5941338.889 573952.284 5941322.768 573956.542 5941302.848 573961.710 5941278.666 573968.400 5941247.365 573971.087 5941234.791 573995.526 5941240.014 573997.996 5941228.457 574003.776 5941201.406 574009.765 5941173.382 574015.039 5941148.701 574020.214 5941124.481 574026.166 5941096.631 574030.859 5941074.670 574035.325 5941053.769 574040.877 5941027.785 574043.010 5941017.805 574002.303 5941009.010 573984.382 5941005.138 573977.743 5941003.704 573954.864 5940998.762 573934.150 5940994.287 573937.393 5940979.268 573944.007 5940948.643 573941.644 5940947.875 573932.373 5940945.889 573904.610 5940939.940 573894.260 5940937.723 573891.812 5940936.293 573877.929 5940928.180 573857.127 5940924.066 573847.045 5940922.072 573810.653 5940914.875 573810.620 5940914.868 573806.396 5940914.034 573805.846 5940913.925 573796.425 5940912.168 573789.463 5940945.660 573785.708 5940963.725 573779.431 5940993.920 573774.283 5941018.684 573768.343 5941047.260 573765.321 5941061.796 573758.558 5941094.329 573757.053 5941101.570 573742.031 5941171.006 573729.569 5941230.140 573718.060 5941283.639 573714.164 5941301.228 573709.243 5941318.110 573703.149 5941334.605 573695.914 5941350.632 573663.450 5941414.925 573719.685 5941416.185";

            it("should return min and max values of posList Element", function () {
                expect(model.getMinMax(element)).to.be.an("array").to.include.ordered.members([
                    "573663.450", "5940912.168", "574043.010", "5941418.233"
                ]);
            });
        });

        describe("addObjectsInObject", function () {
            var temp1, temp2, temp3;

            it("should create Object in Object", function () {
                temp1 = model.addObjectsInObject("thema1", thema1, {});
                expect(temp1).to.have.deep.property("thema1");
                expect(temp1.thema1).to.be.an("array").to.have.lengthOf(2);
            });
            it("should add other Object in Object", function () {
                temp2 = model.addObjectsInObject("thema2", thema2, temp1);
                expect(temp2).to.have.deep.property("thema1");
                expect(temp2).to.have.deep.property("thema2");
                expect(temp2.thema2).to.be.an("array").to.have.lengthOf(1);
            });
            it("should add Object in added Object", function () {
                temp3 = model.addObjectsInObject("thema2", thema1, temp2);
                expect(temp3).to.have.deep.property("thema1");
                expect(temp3).to.have.deep.property("thema2");
                expect(temp3.thema1).to.be.an("array").to.have.lengthOf(2);
                expect(temp3.thema2).to.be.an("array").to.have.lengthOf(3);
            });
        });

        describe("collectHits", function () {
            var temp1, temp2;

            it("should find expected results", function () {
                temp1 = model.addObjectsInObject("thema1", thema1, {});
                temp2 = model.addObjectsInObject("thema2", thema2, temp1);
                expect(model.collectHits("Lufthansa", temp2)).to.be.an("array").to.have.lengthOf(1);
            });

            it("should find umlauts as well", function () {
                temp1 = model.addObjectsInObject("thema1", thema1, {});
                expect(model.collectHits("Österre", temp1)).to.be.an("array").to.have.lengthOf(1);
            });

            it("should be case insensitive", function () {
                temp1 = model.addObjectsInObject("thema1", thema1, {});
                expect(model.collectHits("österre", temp1)).to.be.an("array").to.have.lengthOf(1);
            });
        });
    });
});
