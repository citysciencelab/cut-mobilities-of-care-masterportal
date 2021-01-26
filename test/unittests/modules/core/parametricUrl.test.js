import {expect} from "chai";
import Model from "@modules/core/parametricURL.js";

describe("core/parametricURL", function () {
    let model;

    before(function () {
        model = new Model();
    });

    describe("checkisURLQueryValid", function () {
        it("should be false by html input", function () {
            const query = "zoomtogeometry=<h3>Please%20login%20to%20proceed</h3>%20<form>Username:<br><input%20type%3D'username'%20name%3D'username'></br>Password:<br><input%20type%3D'password'%20name%3D'password'></br><br><input%20type%3D'submit'%20value%3D'Logon'></br>";

            expect(model.checkisURLQueryValid(query)).to.be.false;
        });
        it("should be false by iframe html input", function () {
            const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com%20/>";

            expect(model.checkisURLQueryValid(query)).to.be.false;
        });
        it("should be false by iframe with content input", function () {
            const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com>test</iframe%20>";

            expect(model.checkisURLQueryValid(query)).to.be.false;
        });
        it("should be true by zoomtogeometry string without html input", function () {
            const query = "zoomtogeometry=bergedorf";

            expect(model.checkisURLQueryValid(query)).to.be.true;
        });
        it("should be true by isinitopen string without html input", function () {
            const query = "isinitopen=measure";

            expect(model.checkisURLQueryValid(query)).to.be.true;
        });
        it("should be true by a large string without html input", function () {
            const query = "layerIDs=13032,12884,12883,16100,453,8712,1711&visibility=true,true,true,true,true,true,true&transparency=0,0,0,0,0,0,0&center=569591.1587110137,5939300.381241594&zoomlevel=5";

            expect(model.checkisURLQueryValid(query)).to.be.true;
        });
    });
});
