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
        it("should be true by string without html input", function () {
            const query = "isinitopen=measure";

            expect(model.checkisURLQueryValid(query)).to.be.true;
        });
    });
});
