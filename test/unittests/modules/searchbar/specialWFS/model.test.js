import {expect} from "chai";
import Model from "@modules/searchbar/specialWFS/model.js";

describe("modules/searchbar/specialWFS", function () {
    var model = {},
    config = {
        "minChars": 5,
        "maxFeatures": 1,
        "timeout": 10000,
        "definitions": [
        {
            "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
            "typeName": "app:mrh_row_bplan",
            "propertyNames": ["app:name"],
            "name": "B-Plan"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_festgestellt",
            "propertyNames": ["app:planrecht"],
            "geometryName": "app:geom",
            "name": "festgestellt"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_imverfahren",
            "propertyNames": ["app:plan"],
            "geometryName": "app:the_geom",
            "name": "im Verfahren"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_KitaEinrichtung",
            "typeName": "app:KitaEinrichtungen",
            "propertyNames": ["app:Name"],
            "name": "Kita"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Stoerfallbetriebe",
            "typeName": "app:stoerfallbetrieb",
            "propertyNames": ["app:standort"],
            "name": "Störfallbetrieb"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_festgestellt&propertyName=planrecht",
            "name": "festgestellt"
        }]
    };

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
        it("should set maxFeatures", function () {
            expect(model.get("maxFeatures")).to.equal(1);
        });
        it("should have definitions length of 6", function () {
            expect(model.get("definitions").length).to.equal(6);
        });
        it("should have set definition url", function () {
            expect(model.get("definitions")[0].url).to.equal("/geodienste_hamburg_de/MRH_WFS_Rotenburg");
        });
        it("should have set definition typeName", function () {
            expect(model.get("definitions")[0].typeName).to.equal("app:mrh_row_bplan");
        });
        it("should have set definition name", function () {
            expect(model.get("definitions")[0].name).to.equal("B-Plan");
        });
        it("should have set definition propertyNames", function () {
            expect(model.get("definitions")[0].propertyNames).to.be.an("array").that.includes("app:name");
        });
        it("should have set deprecated propertyNames", function () {
            expect(model.get("definitions")[5].propertyNames).to.be.an("array").that.includes("planrecht");
        });
        it("should have set deprecated typeName", function () {
            expect(model.get("definitions")[5].typeName).to.equal("prosin_festgestellt");
        });
        it("should set geometryName", function () {
           expect(model.get("definitions")[2].geometryName).to.equal("app:the_geom");
           expect(model.get("definitions")[1].geometryName).to.equal("app:geom");
        });
        it("should have set deprecated typeName", function () {
            expect(model.get("definitions")[5].typeName).to.equal("prosin_festgestellt");
        });
    });

    describe("getWFS110Xml", function () {
        it("should return WFS POST string", function () {
            expect(model.getWFS110Xml(model.get("definitions")[0], "Ham")).to.equal("<?xml version=\'1.0\' encoding=\'UTF-8\'?><wfs:GetFeature service=\'WFS\' xmlns:wfs=\'http://www.opengis.net/wfs\' xmlns:ogc=\'http://www.opengis.net/ogc\' xmlns:gml=\'http://www.opengis.net/gml\' traverseXlinkDepth=\'*\' version=\'1.1.0\'><wfs:Query typeName=\'app:mrh_row_bplan\'><wfs:PropertyName>app:name</wfs:PropertyName><wfs:PropertyName>app:geom</wfs:PropertyName><wfs:maxFeatures>1</wfs:maxFeatures><ogc:Filter><ogc:PropertyIsLike matchCase=\'false\' wildCard=\'*\' singleChar=\'#\' escapeChar=\'!\'><ogc:PropertyName>app:name</ogc:PropertyName><ogc:Literal>*Ham*</ogc:Literal></ogc:PropertyIsLike></ogc:Filter></wfs:Query></wfs:GetFeature>");
        });
    });
});
