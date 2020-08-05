import FeatureListerView from "@modules/tools/featureLister/view.js";
import FeatureListerModel from "@modules/tools/featureLister/model.js";
import {expect} from "chai";
import sinon from "sinon";

describe("featurelister", function () {
    let view;

    beforeEach(function () {
        view = new FeatureListerView({
            model: new FeatureListerModel()
        });
        view.$el.html("<ul class=\"featurelist-details-ul\"></ul>");
    });

    afterEach(function () {
        sinon.restore();
    });

    describe("the change to details with \"showFeatureProps\" ", function () {
        it("should change the content of the list item to a clickable anchor if it begins with 'http'", function () {
            const prop = {
                Webseite: "http://test.example.com"
            };

            view.model.set("featureProps", prop);
            sinon.stub(view, "switchTabToDetails");
            view.showFeatureProps();

            expect(view.$el.find(".featurelist-details-li").eq(1).html()).to.be.equal("<a href=\"http://test.example.com\" target=\"_blank\">http://test.example.com</a>");
        });
        it("should change the content of the list item to a clickable anchor if it begins with 'https'", function () {
            const prop = {
                Webseite: "https://test.example.com"
            };

            view.model.set("featureProps", prop);
            sinon.stub(view, "switchTabToDetails");
            view.showFeatureProps();

            expect(view.$el.find(".featurelist-details-li").eq(1).html()).to.be.equal("<a href=\"https://test.example.com\" target=\"_blank\">https://test.example.com</a>");
        });
        it("should change the content of the list item to a clickable anchor if it ends with '.html' and doesn't have a '/' before it", function () {
            const prop = {
                Webseite: "test.example.com/index.html"
            };

            view.model.set("featureProps", prop);
            sinon.stub(view, "switchTabToDetails");
            view.showFeatureProps();

            expect(view.$el.find(".featurelist-details-li").eq(1).html()).to.be.equal("<a href=\"test.example.com/index.html\" target=\"_blank\">test.example.com/index.html</a>");
        });
        it("should not change the content of the list item to a clickable anchor if it neither starts with 'http' or 'https' nor ends with '.html'", function () {
            const prop = {
                Webseite: "test.example.com"
            };

            view.model.set("featureProps", prop);
            sinon.stub(view, "switchTabToDetails");
            view.showFeatureProps();

            expect(view.$el.find(".featurelist-details-li").eq(1).html()).to.be.equal("test.example.com");
        });
        it("should not change the content of the list item to a clickable anchor if '.html' is somewhere in the URL (not the end) and it neither starts with 'http' or 'https' nor ends with '.html'", function () {
            const prop = {
                Webseite: "test.html.com"
            };

            view.model.set("featureProps", prop);
            sinon.stub(view, "switchTabToDetails");
            view.showFeatureProps();

            expect(view.$el.find(".featurelist-details-li").eq(1).html()).to.be.equal("test.html.com");
        });
        it("should not change the content of the list item to a clickable anchor if it ends with '.html' but has a '/' directly before it", function () {
            const prop = {
                Webseite: "test.example.com/.html"
            };

            view.model.set("featureProps", prop);
            sinon.stub(view, "switchTabToDetails");
            view.showFeatureProps();

            expect(view.$el.find(".featurelist-details-li").eq(1).html()).to.be.equal("test.example.com/.html");
        });
    });
});
