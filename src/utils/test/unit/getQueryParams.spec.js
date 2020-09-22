import getQueryParams from "../../getQueryParams.js";
import {expect} from "chai";

describe("src/utils/getQueryParams.js", () => {
    it("should be an empty object by html input", () => {
        const query = "zoomtogeometry=<h3>Please%20login%20to%20proceed</h3>%20<form>Username:<br><input%20type%3D'username'%20name%3D'username'></br>Password:<br><input%20type%3D'password'%20name%3D'password'></br><br><input%20type%3D'submit'%20value%3D'Logon'></br>";

        expect(getQueryParams(query)).to.be.an("object").that.is.empty;
    });
    it("should be an empty object by iframe input", () => {
        const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com%20/>";

        expect(getQueryParams(query)).to.be.an("object").that.is.empty;
    });
    it("should be an empty object by iframe with content input", () => {
        const query = "zoomtogeometry=<iframe%20src%3dhttps://example.com>test</iframe%20>";

        expect(getQueryParams(query)).to.be.an("object").that.is.empty;
    });
    it("should be an object with key and value from input parameters without html", () => {
        const query = "isinitopen=supplycoord";

        expect(getQueryParams(query)).to.be.an("object").to.deep.equal({isinitopen: "supplycoord"});
    });
    it("should be an object with key and value by zoomtogeometry string without html input", () => {
        const query = "zoomtogeometry=bergedorf";

        expect(getQueryParams(query)).to.be.an("object").to.deep.equal({zoomtogeometry: "bergedorf"});
    });
    it("should be an object with keys and values by a large string without html input", () => {
        const query = "layerIDs=13032,12884,12883,16100,453,8712,1711&visibility=true,true,true,true,true,true,true&transparency=0,0,0,0,0,0,0&center=569591.1587110137,5939300.381241594&zoomlevel=5";

        expect(getQueryParams(query)).to.be.an("object").to.deep.equal({
            layerIDs: "13032,12884,12883,16100,453,8712,1711",
            visibility: "true,true,true,true,true,true,true",
            transparency: "0,0,0,0,0,0,0",
            center: "569591.1587110137,5939300.381241594",
            zoomlevel: "5"
        });
    });
});
