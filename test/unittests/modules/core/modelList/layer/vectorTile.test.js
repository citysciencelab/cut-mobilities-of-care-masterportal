import VectorTileModel from "@modules/core/modelList/layer/vectorTile.js";
import {expect} from "chai";
import sinon from "sinon";

import * as stylefunction from "ol-mapbox-style/dist/stylefunction";

const vtStyles = [
        {name: "Layer One", id: "l1"},
        {name: "Layer Two", id: "l2"}
    ],
    vtStylesDefaultL2 = [
        {name: "Layer One", id: "l1"},
        {name: "Layer Two", id: "l2", defaultStyle: true}
    ];

describe("core/modelList/layer/vectorTile", function () {
    afterEach(sinon.restore);

    describe("isStyleValid", function () {
        it("returns true only if required fields all exist", function () {
            const {isStyleValid} = VectorTileModel.prototype;

            expect(isStyleValid(undefined)).to.be.false;
            expect(isStyleValid({})).to.be.false;
            expect(isStyleValid({version: 4})).to.be.false;
            expect(isStyleValid({layers: []})).to.be.false;
            expect(isStyleValid({sources: []})).to.be.false;
            expect(isStyleValid({version: 3, layers: [], sources: {}})).to.be.true;
        });
    });

    describe("setStyleById", function () {
        /** @returns {object} mock context for setStyleById */
        function makeContext () {
            return {
                get: key => ({vtStyles})[key],
                setStyleByDefinition: sinon.spy(() => Symbol.for("Promise"))
            };
        }

        it("finds a style definition by id and uses setStyleByDefinition with it", function () {
            const {setStyleById} = VectorTileModel.prototype,
                context = makeContext(),
                returnValue = setStyleById.call(context, "l2");

            expect(context.setStyleByDefinition.calledOnce).to.be.true;
            expect(context.setStyleByDefinition.calledWith(vtStyles[1])).to.be.true;
            expect(returnValue).to.equal(Symbol.for("Promise"));
        });

        it("returns rejecting Promise if key not found", function (done) {
            const {setStyleById} = VectorTileModel.prototype,
                context = makeContext(),
                returnValue = setStyleById.call(context, "l3");
            let caught = false;

            expect(context.setStyleByDefinition.notCalled).to.be.true;
            returnValue
                // expect rejection
                .catch(() => {
                    caught = true;
                })
                .finally(() => {
                    expect(caught).to.be.true;
                    done();
                })
                // forward if falsely not rejected
                .catch(err => done(err));
        });
    });

    describe("setStyleByDefinition", function () {
        /* in case there ever exists a global fetch during testing,
         * it is swapped here - just in case ... */
        let fetch = null;

        beforeEach(function () {
            fetch = global.fetch;
        });

        afterEach(function () {
            sinon.restore();
            global.fetch = fetch;
        });

        const validStyle = {
                version: 8,
                layers: [],
                sources: {}
            },
            invalidStyle = {
                version: 8,
                sources: {}
            };

        /**
         * @param {function} done mocha callback done
         * @returns {object} mock context for setStyleById
         */
        function makeContext (done) {
            return {
                isStyleValid: VectorTileModel.prototype.isStyleValid,
                get: key => ({layer: Symbol.for("layer")})[key],
                set: sinon.spy((key, value) => {
                    expect(stylefunction.default.calledOnce).to.be.true;
                    expect(stylefunction.default.calledWith(
                        Symbol.for("layer"), validStyle, undefined
                    )).to.be.true;

                    expect(key).to.equal("selectedStyleID");
                    expect(value).to.equal("l0");

                    done();
                })
            };
        }

        it("retrieves json from url, checks it, and sets id to layer and model", function (done) {
            sinon.stub(stylefunction, "default");
            global.fetch = sinon.spy(() => new Promise(r => r({
                json: () => new Promise(ir => ir(validStyle))
            })));

            const {setStyleByDefinition} = VectorTileModel.prototype,
                context = makeContext(done);

            setStyleByDefinition.call(context, {id: "l0", url: "example.com/root.json"});
        });

        it("rejects invalid json", function (done) {
            sinon.stub(stylefunction, "default");
            global.fetch = sinon.spy(() => new Promise(r => r({
                json: () => new Promise(ir => ir(invalidStyle))
            })));

            const {setStyleByDefinition} = VectorTileModel.prototype,
                context = makeContext(done);

            setStyleByDefinition
                .call(context, {id: "l0", url: "example.com/root.json"})
                .catch(() => done());
        });
    });

    describe("setConfiguredLayerStyle", function () {
        /**
         * @param {object} params parameter object
         * @param {?object} params.styleId style id from config.json
         * @param {?string} params.givenVtStyles style set from services.json to use
         * @param {function} params.done to be called finally
         * @returns {object} mock context for setStyleById
         */
        function makeContext ({styleId, givenVtStyles, done}) {
            return {
                isStyleValid: VectorTileModel.prototype.isStyleValid,
                get: key => ({
                    styleId,
                    isSelected: Symbol.for("visibility"),
                    vtStyles: givenVtStyles
                })[key],
                set: sinon.spy(),
                setStyleById: sinon.spy(() => new Promise(r => r())),
                setStyleByDefinition: sinon.spy(() => new Promise(r => r())),
                setVisible: sinon.spy(v => {
                    expect(v).to.equal(Symbol.for("visibility"));
                    done();
                })
            };
        }

        it("uses config.json style first", function (done) {
            const context = makeContext({styleId: "lConfigJson", givenVtStyles: vtStylesDefaultL2, done}),
                {set} = context;

            VectorTileModel.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "lConfigJson")).to.be.true;
        });

        it("uses services.json default style second", function (done) {
            const context = makeContext({givenVtStyles: vtStylesDefaultL2, done}),
                {set, setStyleByDefinition} = context;

            VectorTileModel.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "l2")).to.be.true;
            expect(setStyleByDefinition.calledOnce).to.be.true;
            expect(setStyleByDefinition.calledWith(vtStylesDefaultL2[1])).to.be.true;
        });

        it("uses services.json first style third", function (done) {
            const context = makeContext({givenVtStyles: vtStyles, done}),
                {set, setStyleByDefinition} = context;

            VectorTileModel.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "l1")).to.be.true;
            expect(setStyleByDefinition.calledOnce).to.be.true;
            expect(setStyleByDefinition.calledWith(vtStyles[0])).to.be.true;
        });

        it("does not apply any style else and warns in console", function () {
            const context = makeContext({givenVtStyles: []}),
                {set, setStyleById, setStyleByDefinition} = context;

            sinon.stub(console, "warn");

            VectorTileModel.prototype.setConfiguredLayerStyle.call(context);

            expect(set.notCalled).to.be.true;
            expect(setStyleById.notCalled).to.be.true;
            expect(setStyleByDefinition.notCalled).to.be.true;
            expect(console.warn.calledOnce).to.be.true;
        });
    });
});
