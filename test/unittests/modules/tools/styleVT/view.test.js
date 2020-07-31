import StyleVT from "@modules/tools/styleVT/view.js";
const {expect} = require("chai"),
    sinon = require("sinon"),

    NoStyleableLayersTemplate = Symbol(),
    Template = Symbol();

/**
 * Context mock function.
 * @param {*[]} vectorTileLayerList list of mock layers
 * @returns {object} context object
 */
function createContext (vectorTileLayerList) {
    return {
        model: {
            toJSON: () => ({vectorTileLayerList}),
            get: key => ({isActive: true})[key]
        },
        setElement: sinon.fake(),
        $el: {html: sinon.spy()},
        delegateEvents: sinon.fake(),
        templateNoStyleableLayers: sinon.spy(() => NoStyleableLayersTemplate),
        template: sinon.spy(() => Template)
    };
}

describe("tools/styleVT/view", function () {
    it("renders the NoStyleableLayers view if no layers available", function () {
        const context = createContext([]),
            {template, templateNoStyleableLayers, $el} = context;

        StyleVT.prototype.render.call(context);

        expect(template.notCalled).to.be.true;
        expect(templateNoStyleableLayers.calledOnce).to.be.true;
        expect($el.html.calledOnce && $el.html.calledWith(NoStyleableLayersTemplate));
    });

    it("renders the regular view if layers available", function () {
        const context = createContext([1, 2, 3]),
            {template, templateNoStyleableLayers, $el} = context;

        StyleVT.prototype.render.call(context);

        expect(template.calledOnce).to.be.true;
        expect(templateNoStyleableLayers.notCalled).to.be.true;
        expect($el.html.calledOnce && $el.html.calledWith(Template));
    });
});
