import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../../store/actions/drawAndModifyActions";
import {interactionTypes} from "../../../../store/constantsMobilityDataDraw";

describe("addons/mobilityDataDraw/store/actions/drawAndModifyActions.js", () => {
    let commit, dispatch, addInteraction, removeInteraction, featureSet;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        addInteraction = sinon.spy();
        removeInteraction = sinon.spy();
        featureSet = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("addMobilityDataDrawInteractions", () => {
        it("calls addMobilityDataDrawInteractions function", () => {
            actions.addMobilityDataDrawInteractions({
                rootState: {Map: {map: {addInteraction}}},
                state: {
                    mobilityDataLayer: {getSource: () => Symbol()}
                },
                commit,
                dispatch
            });

            expect(commit.callCount).to.equal(2);
            expect(commit.getCall(0).args[0]).to.eql("setDrawLineInteraction");
            expect(typeof commit.getCall(0).args[1]).to.eql("object");
            expect(commit.getCall(1).args[0]).to.eql("setDrawPointInteraction");
            expect(typeof commit.getCall(1).args[1]).to.eql("object");

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql([
                "createMobilityDataDrawInteractionListeners"
            ]);

            // Add interactions to the current map instance
            expect(addInteraction.callCount).to.equal(2);
            expect(addInteraction.getCall(0).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(0).args[0]).to.eql("object");
            expect(addInteraction.getCall(1).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(1).args[0]).to.eql("object");
        });
    });

    describe("createMobilityDataDrawInteractionListeners", () => {
        it("calls createMobilityDataDrawInteractionListeners function and sets a drawend listener on the draw interaction", () => {
            const definedFunctions = {
                    drawend: []
                },
                drawLineInteraction = {
                    on: (key, f) => {
                        definedFunctions[key].push(f);
                    }
                };

            actions.createMobilityDataDrawInteractionListeners({
                state: {drawLineInteraction},
                dispatch
            });

            // Listener to stop drawing
            expect(definedFunctions.drawend).to.have.length(1);
        });
    });

    describe("removeMobilityDataDrawInteractions", () => {
        it("calls removeMobilityDataDrawInteractions function", () => {
            const drawLineInteractionSymbol = Symbol(),
                drawPointInteractionSymbol = Symbol();

            actions.removeMobilityDataDrawInteractions({
                rootState: {Map: {map: {removeInteraction}}},
                state: {
                    drawLineInteraction: drawLineInteractionSymbol,
                    drawPointInteraction: drawPointInteractionSymbol
                },
                commit
            });

            // Removes the interactions from the map
            expect(removeInteraction.callCount).to.equal(2);
            expect(removeInteraction.getCall(0).args).to.eql([
                drawLineInteractionSymbol
            ]);
            expect(removeInteraction.getCall(1).args).to.eql([
                drawPointInteractionSymbol
            ]);

            // Removes the interactions from state
            expect(commit.callCount).to.equal(2);
            expect(commit.getCall(0).args[0]).to.eql("setDrawLineInteraction");
            expect(commit.getCall(0).args[1]).to.eql(null);
            expect(commit.getCall(1).args[0]).to.eql("setDrawPointInteraction");
            expect(commit.getCall(1).args[1]).to.eql(null);
        });
    });

    describe("addAnnotationDrawInteraction", () => {
        it("calls addAnnotationDrawInteraction function and creates an annotation draw interaction", () => {
            const annotationsLayerSource = Symbol();

            actions.addAnnotationDrawInteraction({
                rootState: {Map: {map: {addInteraction}}},
                state: {
                    annotationsLayer: {
                        getSource: () => annotationsLayerSource
                    },
                    drawAnnotationInteraction: null
                },
                commit,
                dispatch
            });

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql(
                "setDrawAnnotationInteraction"
            );
            expect(typeof commit.getCall(0).args[1]).to.eql("object");

            expect(dispatch.callCount).to.equal(2);
            expect(dispatch.getCall(0).args).to.eql([
                "createAnnotationDrawInteractionListeners"
            ]);
            expect(dispatch.getCall(1).args[0]).to.eql("addSnapInteraction");
            expect(dispatch.getCall(1).args[1]).to.eql(annotationsLayerSource);

            // Add interaction to the current map instance
            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.getCall(0).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(0).args[0]).to.eql("object");
        });

        it("calls addAnnotationDrawInteraction function and updates the old annotation draw interaction", () => {
            const annotationsLayerSource = Symbol(),
                drawAnnotationInteractionSymbol = Symbol();

            actions.addAnnotationDrawInteraction({
                rootState: {Map: {map: {addInteraction}}},
                state: {
                    annotationsLayer: {
                        getSource: () => annotationsLayerSource
                    },
                    drawAnnotationInteraction: drawAnnotationInteractionSymbol
                },
                commit,
                dispatch
            });

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql(
                "setDrawAnnotationInteraction"
            );
            expect(typeof commit.getCall(0).args[1]).to.eql("object");

            expect(dispatch.callCount).to.equal(3);
            expect(dispatch.getCall(0).args).to.eql([
                "removeAnnotationDrawInteraction"
            ]);
            expect(dispatch.getCall(1).args).to.eql([
                "createAnnotationDrawInteractionListeners"
            ]);
            expect(dispatch.getCall(2).args[0]).to.eql("addSnapInteraction");
            expect(dispatch.getCall(2).args[1]).to.eql(annotationsLayerSource);

            // Add interaction to the current map instance
            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.getCall(0).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(0).args[0]).to.eql("object");
        });
    });

    describe("createAnnotationDrawInteractionListeners", () => {
        it("calls createAnnotationDrawInteractionListeners function and sets a drawend listener on the draw interaction", () => {
            const definedFunctions = {
                    drawend: []
                },
                drawAnnotationInteraction = {
                    on: (key, f) => {
                        definedFunctions[key].push(f);
                    }
                };

            actions.createAnnotationDrawInteractionListeners({
                state: {drawAnnotationInteraction},
                dispatch
            });

            // Listener to stop drawing
            expect(definedFunctions.drawend).to.have.length(1);
        });
    });

    describe("removeAnnotationDrawInteraction", () => {
        it("calls removeAnnotationDrawInteraction function", () => {
            const drawAnnotationInteractionSymbol = Symbol();

            actions.removeAnnotationDrawInteraction({
                rootState: {Map: {map: {removeInteraction}}},
                state: {
                    drawAnnotationInteraction: drawAnnotationInteractionSymbol
                },
                commit
            });

            // Removes the interaction from the map
            expect(removeInteraction.calledOnce).to.be.true;
            expect(removeInteraction.getCall(0).args).to.eql([
                drawAnnotationInteractionSymbol
            ]);

            // Removes the interaction from state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql(
                "setDrawAnnotationInteraction"
            );
            expect(commit.getCall(0).args[1]).to.eql(null);
        });
    });

    describe("addSnapInteraction", () => {
        it("calls addSnapInteraction function and creates a snap interaction", () => {
            actions.addSnapInteraction({
                rootState: {Map: {map: {addInteraction}}},
                state: {
                    mobilityDataLayer: {getSource: () => Symbol()},
                    snapInteraction: null
                },
                commit,
                dispatch
            });

            expect(dispatch.calledOnce).to.be.false;

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setSnapInteraction");
            expect(typeof commit.getCall(0).args[1]).to.eql("object");

            // Add interaction to the current map instance
            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.getCall(0).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(0).args[0]).to.eql("object");
        });

        it("calls addSnapInteraction function and updates the old snap interaction", () => {
            const snapInteractionSymbol = Symbol();

            actions.addSnapInteraction({
                rootState: {Map: {map: {addInteraction}}},
                state: {
                    mobilityDataLayer: {getSource: () => Symbol()},
                    snapInteraction: snapInteractionSymbol
                },
                commit,
                dispatch
            });

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args[0]).to.eql("removeSnapInteraction");

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setSnapInteraction");
            expect(typeof commit.getCall(0).args[1]).to.eql("object");

            // Add interaction to the current map instance
            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.getCall(0).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(0).args[0]).to.eql("object");
        });
    });

    describe("removeSnapInteraction", () => {
        it("calls removeSnapInteraction function", () => {
            const snapInteractionSymbol = Symbol();

            actions.removeSnapInteraction({
                rootState: {Map: {map: {removeInteraction}}},
                state: {
                    snapInteraction: snapInteractionSymbol
                },
                commit
            });

            // Removes the interaction from the map
            expect(removeInteraction.calledOnce).to.be.true;
            expect(removeInteraction.getCall(0).args).to.eql([
                snapInteractionSymbol
            ]);

            // Removes the interaction from state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setSnapInteraction");
            expect(commit.getCall(0).args[1]).to.eql(null);
        });
    });

    describe("addModifyInteraction", () => {
        it("calls addModifyInteraction function and creates a modify interaction", () => {
            const fakeFeature = {
                getGeometry: () => {
                    /* mocked feature's getGeometry function */
                },
                addEventListener: () => {
                    /* mocked feature's addEventListener function */
                }
            };

            actions.addModifyInteraction(
                {
                    rootState: {Map: {map: {addInteraction}}},
                    state: {
                        modifyInteraction: null
                    },
                    commit,
                    dispatch
                },
                fakeFeature
            );

            expect(dispatch.calledOnce).to.be.false;

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setModifyInteraction");
            expect(typeof commit.getCall(0).args[1]).to.eql("object");

            // Add interaction to the current map instance
            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.getCall(0).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(0).args[0]).to.eql("object");
        });

        it("calls addModifyInteraction function and updates the old modify interaction", () => {
            const modifyInteractionSymbol = Symbol(),
                fakeFeature = {
                    getGeometry: () => {
                        /* mocked feature's getGeometry function */
                    },
                    addEventListener: () => {
                        /* mocked feature's addEventListener function */
                    }
                };

            actions.addModifyInteraction(
                {
                    rootState: {Map: {map: {addInteraction}}},
                    state: {
                        modifyInteraction: modifyInteractionSymbol
                    },
                    commit,
                    dispatch
                },
                fakeFeature
            );

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args[0]).to.eql(
                "removeModifyInteraction"
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setModifyInteraction");
            expect(typeof commit.getCall(0).args[1]).to.eql("object");

            // Add interaction to the current map instance
            expect(addInteraction.calledOnce).to.be.true;
            expect(addInteraction.getCall(0).args.length).to.eql(1);
            expect(typeof addInteraction.getCall(0).args[0]).to.eql("object");
        });
    });

    describe("removeModifyInteraction", () => {
        it("calls removeModifyInteraction function", () => {
            const modifyInteractionSymbol = Symbol();

            actions.removeModifyInteraction({
                rootState: {Map: {map: {removeInteraction}}},
                state: {
                    modifyInteraction: modifyInteractionSymbol
                },
                commit
            });

            // Removes the interaction from the map
            expect(removeInteraction.calledOnce).to.be.true;
            expect(removeInteraction.getCall(0).args).to.eql([
                modifyInteractionSymbol
            ]);

            // Removes the interaction from state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setModifyInteraction");
            expect(commit.getCall(0).args[1]).to.eql(null);
        });
    });

    describe("startModifyingMobilityDataFeature", () => {
        it("calls startModifyingMobilityDataFeature and don't start modifying mode when feature wasn't found", () => {
            const mobilityData = [Symbol(), Symbol()];

            actions.startModifyingMobilityDataFeature(
                {
                    state: {
                        mobilityData
                    },
                    commit,
                    dispatch
                },
                5
            );

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.false;
        });

        it("calls startModifyingMobilityDataFeature and starts modifying mode for feature", () => {
            const drawLineInteraction = {setActive: sinon.spy()},
                drawPointInteraction = {setActive: sinon.spy()},
                mobilityData = [
                    {geometryIndex: 0, feature: {set: featureSet}},
                    {geometryIndex: 1, feature: {set: featureSet}},
                    {geometryIndex: 2, feature: {set: featureSet}}
                ],
                mobilityDataLayerSource = Symbol();

            actions.startModifyingMobilityDataFeature(
                {
                    state: {
                        drawLineInteraction,
                        drawPointInteraction,
                        mobilityData,
                        mobilityDataLayer: {
                            getSource: () => mobilityDataLayerSource
                        }
                    },
                    commit,
                    dispatch
                },
                1
            );

            // Enable modifying mode
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(interactionTypes.MODIFY);

            // Set modifying state of the feature
            expect(featureSet.calledOnce).to.be.true;
            expect(featureSet.getCall(0).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(0).args[1]).to.eql(true);

            // Disable draw interactions
            expect(drawLineInteraction.setActive.calledOnce).to.be.true;
            expect(drawLineInteraction.setActive.getCall(0).args[0]).to.eql(
                false
            );
            expect(drawPointInteraction.setActive.calledOnce).to.be.true;
            expect(drawPointInteraction.setActive.getCall(0).args[0]).to.eql(
                false
            );

            expect(dispatch.callCount).to.equal(2);
            // Add modify interaction for the selected feature
            expect(dispatch.getCall(0).args).to.eql([
                "addModifyInteraction",
                mobilityData[1].feature
            ]);
            // Update the snap interaction
            expect(dispatch.getCall(1).args[0]).to.eql("addSnapInteraction");
            expect(dispatch.getCall(1).args[1]).to.eql(mobilityDataLayerSource);
        });
    });

    describe("stopModifyingMobilityDataFeature", () => {
        it("calls stopModifyingMobilityDataFeature function", () => {
            const drawLineInteraction = {setActive: sinon.spy()},
                mobilityData = [
                    {geometryIndex: 0, feature: {set: featureSet}},
                    {geometryIndex: 1, feature: {set: featureSet}},
                    {geometryIndex: 2, feature: {set: featureSet}}
                ];

            actions.stopModifyingMobilityDataFeature({
                state: {drawLineInteraction, mobilityData},
                commit,
                dispatch
            });

            // Disable modifying mode
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(interactionTypes.DRAW);

            // Remove modifying state from all features again
            expect(featureSet.callCount).to.equal(3);
            expect(featureSet.getCall(0).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(0).args[1]).to.eql(false);
            expect(featureSet.getCall(1).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(1).args[1]).to.eql(false);
            expect(featureSet.getCall(2).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(2).args[1]).to.eql(false);

            // Remove modify interaction
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql([
                "removeModifyInteraction"
            ]);

            // Enable draw interactions again
            expect(drawLineInteraction.setActive.calledOnce).to.be.true;
            expect(drawLineInteraction.setActive.getCall(0).args[0]).to.eql(
                true
            );
        });
    });

    describe("startDrawingMobilityDataLocation", () => {
        it("calls startDrawingMobilityDataLocation function", () => {
            const definedFunctions = {
                    drawend: []
                },
                drawLineInteraction = {setActive: sinon.spy()},
                drawPointInteraction = {
                    setActive: sinon.spy(),
                    once: (key, f) => {
                        definedFunctions[key].push(f);
                    }
                },
                geometryIndex = 1,
                mobilityData = [
                    {geometryIndex: 0},
                    {geometryIndex: 1},
                    {geometryIndex: 2}
                ],
                mobilityDataLayerSource = Symbol();

            actions.startDrawingMobilityDataLocation(
                {
                    state: {
                        drawLineInteraction,
                        drawPointInteraction,
                        mobilityData,
                        mobilityDataLayer: {
                            getSource: () => mobilityDataLayerSource
                        }
                    },
                    commit,
                    dispatch
                },
                geometryIndex
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(interactionTypes.MODIFY);

            // Disable draw line interaction
            expect(drawLineInteraction.setActive.calledOnce).to.be.true;
            expect(drawLineInteraction.setActive.getCall(0).args[0]).to.eql(
                false
            );
            // Enable draw point interaction
            expect(drawPointInteraction.setActive.calledOnce).to.be.true;
            expect(drawPointInteraction.setActive.getCall(0).args[0]).to.eql(
                true
            );

            // Listener to stop drawing a the location
            expect(definedFunctions.drawend).to.have.length(1);

            // Update the snap interaction
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args[0]).to.eql("addSnapInteraction");
            expect(dispatch.getCall(0).args[1]).to.eql(mobilityDataLayerSource);
        });
    });

    describe("stopDrawingMobilityDataLocation", () => {
        it("calls stopDrawingMobilityDataLocation function", () => {
            const drawLineInteraction = {setActive: sinon.spy()},
                drawPointInteraction = {setActive: sinon.spy()},
                mobilityData = [
                    {geometryIndex: 0},
                    {geometryIndex: 1},
                    {geometryIndex: 2}
                ];

            actions.stopDrawingMobilityDataLocation({
                state: {
                    drawLineInteraction,
                    drawPointInteraction,
                    mobilityData
                },
                commit,
                dispatch
            });

            // Disable modifying mode
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(interactionTypes.DRAW);

            // Disable draw point interaction
            expect(drawPointInteraction.setActive.calledOnce).to.be.true;
            expect(drawPointInteraction.setActive.getCall(0).args[0]).to.eql(
                false
            );

            // Enable draw line interaction again
            expect(drawLineInteraction.setActive.calledOnce).to.be.true;
            expect(drawLineInteraction.setActive.getCall(0).args[0]).to.eql(
                true
            );
        });
    });

    describe("startModifyingAnnotationFeature", () => {
        it("calls startModifyingAnnotationFeature and don't start modifying mode when feature wasn't found", () => {
            const annotations = [Symbol(), Symbol()];

            actions.startModifyingAnnotationFeature(
                {
                    state: {
                        annotations
                    },
                    commit,
                    dispatch
                },
                5
            );

            expect(commit.calledOnce).to.be.false;
            expect(dispatch.calledOnce).to.be.false;
        });

        it("calls startModifyingAnnotationFeature and starts modifying mode for feature", () => {
            const drawAnnotationInteraction = {setActive: sinon.spy()},
                annotations = [
                    {geometryIndex: 0, feature: {set: featureSet}},
                    {geometryIndex: 1, feature: {set: featureSet}},
                    {geometryIndex: 2, feature: {set: featureSet}}
                ],
                annotationsLayerSource = Symbol();

            actions.startModifyingAnnotationFeature(
                {
                    state: {
                        drawAnnotationInteraction,
                        annotations,
                        annotationsLayer: {
                            getSource: () => annotationsLayerSource
                        }
                    },
                    commit,
                    dispatch
                },
                1
            );

            // Enable modifying mode
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(interactionTypes.MODIFY);

            // Set modifying state of the feature
            expect(featureSet.calledOnce).to.be.true;
            expect(featureSet.getCall(0).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(0).args[1]).to.eql(true);

            // Disable draw interaction
            expect(drawAnnotationInteraction.setActive.calledOnce).to.be.true;
            expect(
                drawAnnotationInteraction.setActive.getCall(0).args[0]
            ).to.eql(false);

            expect(dispatch.callCount).to.equal(2);
            // Add modify interaction for the selected feature
            expect(dispatch.getCall(0).args).to.eql([
                "addModifyInteraction",
                annotations[1].feature
            ]);
            // Update the snap interaction
            expect(dispatch.getCall(1).args[0]).to.eql("addSnapInteraction");
            expect(dispatch.getCall(1).args[1]).to.eql(annotationsLayerSource);
        });
    });

    describe("stopModifyingAnnotationFeature", () => {
        it("calls stopModifyingAnnotationFeature function", () => {
            const drawAnnotationInteraction = {setActive: sinon.spy()},
                annotations = [
                    {geometryIndex: 0, feature: {set: featureSet}},
                    {geometryIndex: 1, feature: {set: featureSet}},
                    {geometryIndex: 2, feature: {set: featureSet}}
                ];

            actions.stopModifyingAnnotationFeature({
                state: {drawAnnotationInteraction, annotations},
                commit,
                dispatch
            });

            // Disable modifying mode
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(interactionTypes.DRAW);

            // Remove modifying state from all features again
            expect(featureSet.callCount).to.equal(3);
            expect(featureSet.getCall(0).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(0).args[1]).to.eql(false);
            expect(featureSet.getCall(1).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(1).args[1]).to.eql(false);
            expect(featureSet.getCall(2).args[0]).to.eql("isModifying");
            expect(featureSet.getCall(2).args[1]).to.eql(false);

            // Remove modify interaction
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql([
                "removeModifyInteraction"
            ]);

            // Enable draw interaction again
            expect(drawAnnotationInteraction.setActive.calledOnce).to.be.true;
            expect(
                drawAnnotationInteraction.setActive.getCall(0).args[0]
            ).to.eql(true);
        });
    });
});
