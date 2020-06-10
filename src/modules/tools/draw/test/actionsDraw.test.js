import sinon from "sinon";
import {expect} from "chai";
import actions from "../store/actionsDraw";

describe("actionsDraw", () => {
    describe("addInteraction", () => {
        it("calls map's addInteraction function with a given interaction", () => {
            const addInteraction = sinon.spy(),
                interactionSymbol = Symbol();

            actions.addInteraction({
                rootState: {Map: {map: {addInteraction}}}
            }, interactionSymbol);

            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.args[0][0]).to.equal(interactionSymbol);
        });
    });
    describe("clearLayer", () => {
        it("calls the clear function of the state's layer", () => {
            const clear = sinon.spy(),
                state = {layer: {
                    getSource: () => ({clear})
                }};

            actions.clearLayer({state});

            expect(clear.calledOnce).to.be.true;
        });
    });
    describe("createDrawInteractionAndAddToMap", () => {
        /**
         * @param {String} id id to use for drawType
         * @returns {object} a mocked state for this test
         */
        function getState (id) {
            return {
                layer: {
                    getSource: () => ({})
                },
                drawType: {
                    id,
                    geometry: ""
                },
                symbol: {}
            };
        }

        const activeSymbol = Symbol(),
            maxFeaturesSymbol = Symbol();

        it("commits and dispatches as expected", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy();

            actions.createDrawInteractionAndAddToMap({state: getState("drawCircle"), commit, dispatch}, {active: activeSymbol, maxFeatures: maxFeaturesSymbol});

            // commits setDrawInteraction
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.eql("setDrawInteraction");
            expect(typeof commit.firstCall.args[1]).to.eql("object");

            // dispatches interaction-related actions
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "draw", active: activeSymbol}]);
            expect(dispatch.secondCall.args).to.eql(["createDrawInteractionListener", {doubleCircle: false, drawInteraction: "", maxFeatures: maxFeaturesSymbol}]);
            expect(dispatch.thirdCall.args[0]).to.eql("addInteraction");
            expect(typeof dispatch.thirdCall.args[1]).to.eql("object");
        });

        it("commits and dispatches a second set of information for drawDoubleCircle", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy();

            actions.createDrawInteractionAndAddToMap({state: getState("drawDoubleCircle"), commit, dispatch}, {active: activeSymbol, maxFeatures: maxFeaturesSymbol});

            // commits setDrawInteraction
            expect(commit.calledTwice).to.be.true;
            expect(commit.args[0][0]).to.eql("setDrawInteraction");
            expect(typeof commit.args[0][1]).to.eql("object");
            expect(commit.args[1][0]).to.eql("setDrawInteractionTwo");
            expect(typeof commit.args[1][1]).to.eql("object");

            // dispatches interaction-related actions
            expect(dispatch.callCount).to.equal(6);
            expect(dispatch.args[0]).to.eql(["manipulateInteraction", {interaction: "draw", active: activeSymbol}]);
            expect(dispatch.args[1]).to.eql(["createDrawInteractionListener", {doubleCircle: false, drawInteraction: "", maxFeatures: maxFeaturesSymbol}]);
            expect(dispatch.args[2][0]).to.eql("addInteraction");
            expect(typeof dispatch.args[2][1]).to.eql("object");
            expect(dispatch.args[3]).to.eql(["manipulateInteraction", {interaction: "draw", active: activeSymbol}]);
            expect(dispatch.args[4]).to.eql(["createDrawInteractionListener", {doubleCircle: true, drawInteraction: "Two", maxFeatures: maxFeaturesSymbol}]);
            expect(dispatch.args[5][0]).to.eql("addInteraction");
            expect(typeof dispatch.args[5][1]).to.eql("object");
        });
    });
    describe("createDrawInteractionListener", () => {
        let definedFunctions, dispatch, state;

        beforeEach(() => {
            definedFunctions = {
                drawstart: [],
                drawend: []
            };
            dispatch = sinon.spy();
            state = {
                drawInteraction: {
                    on: (key, f) => {
                        definedFunctions[key].push(f);
                    }
                }
            };
        });

        afterEach(sinon.restore);

        it("defines a drawstart and drawend function on the interaction", () => {
            actions.createDrawInteractionListener({state, dispatch}, {
                doubleCircle: false,
                drawInteraction: ""
            });

            expect(definedFunctions.drawstart).to.have.length(1);
            expect(definedFunctions.drawend).to.have.length(1);
        });

        it("defines a second drawstart function when maxFeatures is set", () => {
            actions.createDrawInteractionListener({state, dispatch}, {
                doubleCircle: false,
                drawInteraction: "",
                maxFeatures: 5
            });

            expect(definedFunctions.drawstart).to.have.length(2);
            expect(definedFunctions.drawend).to.have.length(1);
        });

        it("enables the drawend to dispatch and uses the correct parameters", () => {
            const doubleCircleSymbol = Symbol(),
                geoJSONSymbol = Symbol(),
                set = sinon.spy();

            // always return this; it's grabbed once and forwarded to Radio later
            dispatch = sinon.spy(() => geoJSONSymbol);

            actions.createDrawInteractionListener({state, dispatch}, {
                doubleCircle: doubleCircleSymbol,
                drawInteraction: ""
            });

            sinon.stub(Radio, "trigger").callsFake(sinon.fake());

            Config.inputMap = {targetprojection: "mock"};
            definedFunctions.drawend[0]({feature: {set}});
            delete Config.inputMap;

            expect(set.calledWith("styleId")).to.be.true;
            expect(dispatch.calledWith("cancelDrawWithoutGUI")).to.be.true;
            expect(dispatch.calledWith("editFeaturesWithoutGUI")).to.be.true;
            expect(dispatch.calledWithMatch(
                "downloadFeaturesWithoutGUI",
                {
                    prmObject: {"targetProjection": "mock"},
                    currentFeature: {set}
                }
            )).to.be.true;
            expect(Radio.trigger.calledWith(
                "RemoteInterface", "postMessage", {"drawEnd": geoJSONSymbol})
            ).to.be.true;
        });

        it("enables the drawstart to dispatch and uses the correct parameters", () => {
            const doubleCircleSymbol = Symbol();

            actions.createDrawInteractionListener({state, dispatch}, {
                doubleCircle: doubleCircleSymbol,
                drawInteraction: ""
            });

            definedFunctions.drawstart[0]();

            expect(dispatch.calledWithMatch("drawInteractionOnDrawEvent", {drawInteraction: "", doubleCircle: doubleCircleSymbol})).to.be.true;
        });

        it("enables the maxFeatures drawstart to dispatch does so on maxFeatures reached", () => {
            let featureArray = [];

            sinon.stub(Radio, "trigger").callsFake(sinon.fake());

            state.layer = {
                getSource: () => ({
                    getFeatures: () => featureArray
                })
            };

            actions.createDrawInteractionListener({state, dispatch}, {
                doubleCircle: Symbol(),
                drawInteraction: "",
                maxFeatures: 5
            });

            // nothing happens if array has okay length
            definedFunctions.drawstart[1]();
            expect(Radio.trigger.notCalled).to.be.true;
            expect(dispatch.notCalled).to.be.true;

            // make array surpass maxFeatures length to test calls
            featureArray = [0, 1, 2, 3, 4];

            definedFunctions.drawstart[1]();
            expect(Radio.trigger.called).to.be.true;
            expect(dispatch.called).to.be.true;
            /* NOTE: i18next isn't actually working in tests yet, so here undefined
             * is compared with undefined - works, but has limited meaning */
            expect(Radio.trigger.calledWith("Alert", "alert", i18next.t("common:modules.tools.draw.limitReached", {count: 5}))).to.be.true;
            expect(dispatch.calledWith("manipulateInteraction", {interaction: "draw", active: false})).to.be.true;
        });
    });
    describe("createModifyInteractionAndAddToMap", () => {
        it("commits and dispatches as expected", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    layer: {getSource: () => ({
                        getFeatures: () => [],
                        addEventListener: () => ({})
                    })}
                },
                activeSymbol = Symbol();

            actions.createModifyInteractionAndAddToMap(
                {state, commit, dispatch},
                activeSymbol
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setModifyInteraction");
            expect(typeof commit.firstCall.args[1]).to.equal("object");
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["manipulateInteraction", {interaction: "modify", active: activeSymbol}]);
            expect(dispatch.secondCall.args).to.eql(["createModifyInteractionListener"]);
            expect(dispatch.thirdCall.args[0]).to.eql("addInteraction");
            expect(typeof dispatch.thirdCall.args[1]).to.eql("object");
        });
    });
    // createModifyInteractionListener
    // createSelectInteractionAndAddToMap
    // createSelectionInteractionListener
    // drawInteractionOnDrawEvent
    // manipulateInteraction
    // redoLastStep
    // removeInteraction
    // resetModule
    // setActive
    // setCircleInnerDiameter
    // setCircleMethod
    // setCircleOuterDiameter
    // setColor
    // setColorContour
    // setDrawType
    // setFont
    // setFontSize
    // setOpacity
    // setOpacityContour
    // setPointSize
    // setStrokeWidth
    // setSymbol
    // setText
    // setUnit
    // startDownloadTool
    // toggleInteraction
    // undoLastStep
    // uniqueID
    // updateDrawInteraction
    // updateRedoArray
    // cancelDrawWithoutGUI
    // downloadFeaturesWithoutGUI
    // downloadViaRemoteInterface
    // editFeaturesWithoutGUI
    // initializeWithoutGUI
});
