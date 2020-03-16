import View from "@modules/searchbar/view.js";
import Model from "@modules/searchbar/model.js";
import {expect} from "chai";
import sinon from "sinon";

describe("modules/searchbar/view", function () {
    let view = {},
        showsMarker = true,
        showsPolygon = true;

    before(function () {
        view = new View(new Model());
        sinon.stub(Radio, "trigger").callsFake(function (channel, topic) {
            if (topic === "hideMarker") {
                showsMarker = false;
                return null;
            }
            else if (topic === "hidePolygon") {
                showsPolygon = false;
                return null;
            }
            return null;
        });
    });

    after(function () {
        sinon.restore();
    });

    describe("hideMarker", function () {
        it("should trigger events to hide markers", function () {
            view.hideMarker();
            expect(showsMarker).to.be.equal(false);
            expect(showsPolygon).to.be.equal(false);
        });
    });

    describe("deleteSearchString", function () {
        it("should set search in initial state", function () {
            showsMarker = true;
            showsPolygon = true;
            view.model.set("searchString", "value");
            view.deleteSearchString();
            expect(showsMarker).to.be.equal(false);
            expect(showsPolygon).to.be.equal(false);
            expect(view.model.get("searchString")).to.be.empty;
        });
    });
});
