import getQueryParams from "../../getQueryParams.js";
import {expect} from "chai";

describe("getqueryParams", function () {
    it("should be an empty object by html input", function () {
        const query = "zoomtogeometry=<h3>Please%20login%20to%20proceed</h3>%20<form>Username:<br><input%20type%3D'username'%20name%3D'username'></br>Password:<br><input%20type%3D'password'%20name%3D'password'></br><br><input%20type%3D'submit'%20value%3D'Logon'></br>";

        expect(getQueryParams(query)).to.be.an("object").that.is.empty;
    });
    it("should be an object with key and value from input parameters without html", function () {
        const query = "isinitopen=supplycoord";

        expect(getQueryParams(query)).to.be.an("object").to.deep.equal({isinitopen: "supplycoord"});
    });
});
