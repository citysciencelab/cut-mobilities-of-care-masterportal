// import sinon from "sinon";
// import {expect} from "chai";
// import actions from "../store/actionsDraw";
// import testAction from "../../../../../test/unittests/VueTestUtils";

/*

--> sinon.spy für die dispatches, da promise returned und man merkt, ob diese Dinge aufgerufen werden
const dispatch = sinon.spy(() => new Promise((resolve, reject) => resolve("drawInteraction")))
const commit auch spy

expect(commitSpy.hasBeenCalled).to.be.true
expect(commitSpy.firstCall.arguments).to.eql([1, 1])
*/

describe("actionsDraw", () => {
    // addInteraction
    // clearLayer
    // createDrawInteraction
    // createDrawInteractionAndAddToMap
    /* describe.only("createDrawInteractionAndAddToMap", () => {
        it("should do stuff", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {};

            actions.createDrawInteractionAndAddToMap({state, commit, dispatch}, {active: true});

            expect(commit.calledOnce).to.be.true;
            expect(dispatch.calledThrice).to.be.true;
            expect(commit.args[0][0]).to.eql("setDrawInteraction");
            expect(typeof commit.args[0][1]).to.eql("object");
            // TODO: selbe dinge für dispatch Sachen
        });
    });*/
    // createDrawInteractionListener
    // createModifyInteractionAndAddToMap
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
