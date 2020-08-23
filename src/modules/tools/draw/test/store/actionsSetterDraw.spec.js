import sinon from "sinon";
import {expect} from "chai";
import actions from "../../store/actionsDraw";

describe("actionsSetterDraw", () => {
    let commit, dispatch, state, target;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("setActive", () => {
        let active,
            request,
            trigger;

        beforeEach(() => {
            request = sinon.spy(() => ({}));
            trigger = sinon.spy();
            state = {
                withoutGUI: false
            };
            sinon.stub(Radio, "request").callsFake(request);
            sinon.stub(Radio, "trigger").callsFake(trigger);
        });

        it("should commit as intended if 'active' is false", () => {
            active = false;

            actions.setActive({state, commit, dispatch}, active);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setActive", false]);
            expect(dispatch.notCalled).to.be.true;
            expect(trigger.calledOnce).to.be.true;
            expect(trigger.firstCall.args).to.eql(["RemoteInterface", "postMessage", {"initDrawTool": true}]);
        });
        it("should commit and dispatch as intended if 'active' is true", () => {
            active = true;

            actions.setActive({state, commit, dispatch}, active);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setActive", true]);
            expect(commit.secondCall.args[0]).to.equal("setLayer");
            expect(typeof commit.secondCall.args[1]).to.equal("object");
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true}]);
            expect(dispatch.secondCall.args).to.eql(["createSelectInteractionAndAddToMap", false]);
            expect(dispatch.thirdCall.args).to.eql(["createModifyInteractionAndAddToMap", false]);
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.eql(["Map", "createLayerIfNotExists", "import_draw_layer"]);
            expect(trigger.calledOnce).to.be.true;
            expect(trigger.firstCall.args).to.eql(["RemoteInterface", "postMessage", {"initDrawTool": true}]);
        });
        it("should commit and dispatch as intended if 'active' and 'withoutGUI' are true", () => {
            active = true;
            state.withoutGUI = true;

            actions.setActive({state, commit, dispatch}, active);

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setActive", true]);
            expect(commit.secondCall.args[0]).to.equal("setLayer");
            expect(typeof commit.secondCall.args[1]).to.equal("object");
            expect(dispatch.callCount).to.equal(4);
            expect(dispatch.firstCall.args).to.eql(["createDrawInteractionAndAddToMap", {active: true}]);
            expect(dispatch.secondCall.args).to.eql(["createSelectInteractionAndAddToMap", false]);
            expect(dispatch.thirdCall.args).to.eql(["createModifyInteractionAndAddToMap", false]);
            expect(dispatch.lastCall.args).to.eql(["toggleInteraction", "draw"]);
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.eql(["Map", "createLayerIfNotExists", "import_draw_layer"]);
            expect(trigger.calledOnce).to.be.true;
            expect(trigger.firstCall.args).to.eql(["RemoteInterface", "postMessage", {"initDrawTool": true}]);
        });
    });
    describe("setCircleInnerDiameter", () => {
        it("should commit as intended", () => {
            state = {unit: "m"};
            target = {value: "42.5"};

            actions.setCircleInnerDiameter({state, commit}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCircleInnerDiameter", 42.5]);
        });
    });
    describe("setCircleMethod", () => {
        it("should commit as intended", () => {
            const method = Symbol();

            target = {options: [{value: method}], selectedIndex: 0};

            actions.setCircleMethod({commit}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCircleMethod", method]);
        });
    });
    describe("setCircleOuterDiameter", () => {
        it("should commit as intended", () => {
            state = {unit: "m"};
            target = {value: "42.5"};

            actions.setCircleOuterDiameter({state, commit}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setCircleOuterDiameter", 42.5]);
        });
    });
    describe("setColor", () => {
        it("should commit as intended", () => {
            state = {opacity: 3};
            target = {options: [{value: "0,1,2"}], selectedIndex: 0};

            actions.setColor({state, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setColor", [0, 1, 2, 3]]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setColorContour", () => {
        it("should commit as intended", () => {
            state = {opacityContour: 3};
            target = {options: [{value: "0,1,2"}], selectedIndex: 0};

            actions.setColorContour({state, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setColorContour", [0, 1, 2, 3]]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setDrawType", () => {
        const geometry = Symbol();

        it("should commit as intended", () => {
            const id = Symbol();

            target = {options: [{id: id, value: geometry}], selectedIndex: 0};
            actions.setDrawType({commit, dispatch}, {target});

            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setFreeHand", false]);
            expect(commit.secondCall.args).to.eql(["setCircleMethod", "interactive"]);
            expect(commit.thirdCall.args).to.eql(["setDrawType", {id, geometry}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
        it("should commit 'true' to 'setFreeHand' if the id of the selectedElement equals 'drawCurve'", () => {
            target = {options: [{id: "drawCurve", value: geometry}], selectedIndex: 0};
            actions.setDrawType({commit, dispatch}, {target});

            expect(commit.calledWithExactly("setFreeHand", true)).to.be.true;
        });
        it("should commit 'defined' to 'setCircleMethod' if the id of the selectedElement equals 'drawDoubleCircle'", () => {
            target = {options: [{id: "drawDoubleCircle", value: geometry}], selectedIndex: 0};
            actions.setDrawType({commit, dispatch}, {target});

            expect(commit.calledWithExactly("setCircleMethod", "defined")).to.be.true;
        });
        it("should commit 'interactive' to 'setCircleMethod' if the id of the selectedElement equals anything other than 'drawDoubleCircle'", () => {
            const id = Symbol();

            target = {options: [{id, value: geometry}], selectedIndex: 0};
            actions.setDrawType({commit, dispatch}, {target});

            expect(commit.calledWithExactly("setCircleMethod", "interactive")).to.be.true;
        });
    });
    describe("setFont", () => {
        it("should commit as intended", () => {
            target = {options: [{value: "Arial"}], selectedIndex: 0};

            actions.setFont({commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setFont", "Arial"]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setFontSize", () => {
        it("should commit as intended", () => {
            target = {options: [{value: 16}], selectedIndex: 0};

            actions.setFontSize({commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setFontSize", 16]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setOpacity", () => {
        it("should commit as intended", () => {
            state = {color: [0, 1, 2]};
            target = {options: [{value: "3.5"}], selectedIndex: 0};

            actions.setOpacity({state, commit, dispatch}, {target});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setOpacity", 3.5]);
            expect(commit.secondCall.args).to.eql(["setColor", [0, 1, 2, 3.5]]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setOpacityContour", () => {
        it("should commit as intended", () => {
            state = {colorContour: [0, 1, 2]};
            target = {options: [{value: "3.5"}], selectedIndex: 0};

            actions.setOpacityContour({state, commit, dispatch}, {target});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args).to.eql(["setOpacityContour", 3.5]);
            expect(commit.secondCall.args).to.eql(["setColorContour", [0, 1, 2, 3.5]]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setPointSize", () => {
        it("should commit as intended", () => {
            target = {options: [{value: "6"}], selectedIndex: 0};

            actions.setPointSize({commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setPointSize", 6]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setStrokeWidth", () => {
        it("should commit as intended", () => {
            target = {options: [{value: "6"}], selectedIndex: 0};

            actions.setStrokeWidth({commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setStrokeWidth", 6]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setSymbol", () => {
        it("should commit as intended", () => {
            const myIcon = Symbol(),
                otherIcon = Symbol(),
                getters = {iconList: [{id: otherIcon}, {id: myIcon}]};

            target = {options: [{value: myIcon}], selectedIndex: 0};

            actions.setSymbol({commit, dispatch, getters}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setSymbol", {id: myIcon}]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setText", () => {
        it("should commit as intended", () => {
            target = {value: "My Text"};

            actions.setText({commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setText", "My Text"]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["updateDrawInteraction"]);
        });
    });
    describe("setUnit", () => {
        it("should commit as intended", () => {
            const circleInnerDiameter = Symbol(),
                circleOuterDiameter = Symbol();

            state = {circleInnerDiameter, circleOuterDiameter};
            target = {options: [{value: "km"}], selectedIndex: 0};

            actions.setUnit({state, commit, dispatch}, {target});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setUnit", "km"]);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["setCircleInnerDiameter", {target: {value: circleInnerDiameter}}]);
            expect(dispatch.secondCall.args).to.eql(["setCircleOuterDiameter", {target: {value: circleOuterDiameter}}]);
        });
    });
});
