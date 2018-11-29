import {expect} from "chai";
import Model from "@modules/searchbar/specialWFS/model.js";

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
            expect(model.get("timeout")).to.equal(10000);
        });
        it("should set minchar", function () {
            expect(model.get("minChars")).to.equal(5);
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
