import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../../store/actions/dailyRoutineActions";
import initialState from "../../../../store/stateMobilityDataDraw";

describe("addons/mobilityDataDraw/store/actions/dailyRoutineActions.js", () => {
    const fakeLayer = {
            setStyle: () => {
                /* mocked layer's setStyle function */
            }
        },
        fakeSource = {
            getFeatureById: () => {
                /* mocked source's getFeatureById function */
            },
            removeFeature: () => {
                /* mocked source's removeFeature function */
            }
        },
        fakeFeature = {
            get: () => {
                /* mocked features's get function */
            },
            setId: () => {
                /* mocked features's setId function */
            }
        };
    let commit,
        dispatch,
        featureSet,
        sourceGetFeatureByIdStub,
        sourceRemoveFeatureStub,
        featureSetIdStub;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        featureSet = sinon.spy();
        sourceGetFeatureByIdStub = sinon
            .stub(fakeSource, "getFeatureById")
            .callsFake(() => Symbol());
        sourceRemoveFeatureStub = sinon.stub(fakeSource, "removeFeature");
        featureSetIdStub = sinon.stub(fakeFeature, "setId");
        sinon.stub(Radio, "request").callsFake(() => fakeLayer);
    });

    afterEach(sinon.restore);

    describe("initializeDailyRoutineView", () => {
        it("calls initializeDailyRoutineView function", () => {
            const mobilityDataLayerSource = Symbol();

            actions.initializeDailyRoutineView({
                state: {
                    mobilityDataLayer: {
                        getSource: () => mobilityDataLayerSource
                    }
                },
                commit,
                dispatch
            });

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityDataLayer");
            expect(commit.getCall(0).args[1]).to.eql(fakeLayer);

            expect(dispatch.callCount).to.equal(2);
            expect(dispatch.getCall(0).args).to.eql([
                "addMobilityDataDrawInteractions"
            ]);
            expect(dispatch.getCall(1).args[0]).to.eql("addSnapInteraction");
            expect(dispatch.getCall(1).args[1]).to.eql(mobilityDataLayerSource);
        });
    });

    describe("cleanUpDailyRoutineView", () => {
        it("calls cleanUpDailyRoutineView function", () => {
            actions.cleanUpDailyRoutineView({
                commit,
                dispatch
            });

            expect(dispatch.callCount).to.equal(2);
            // Unselect all mobility data features
            expect(dispatch.getCall(0).args).to.eql([
                "selectMobilityDataFeature"
            ]);
            // Remove mobility data draw interactions
            expect(dispatch.getCall(1).args).to.eql([
                "removeMobilityDataDrawInteractions"
            ]);

            // Reset interaction state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(
                initialState.currentInteraction
            );
        });
    });

    describe("setMobilityMode", () => {
        it("calls setMobilityMode function", () => {
            const value = "train";

            actions.setMobilityMode(
                {
                    commit
                },
                {target: {value}}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityMode");
            expect(commit.getCall(0).args[1]).to.eql(value);
        });
    });

    describe("toggleWeekday", () => {
        it("calls toggleWeekday function and adds value to the state", () => {
            const value = "1";

            actions.toggleWeekday(
                {
                    state: {weekdays: [0, 2]},
                    commit
                },
                {target: {value}}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setWeekdays");
            expect(commit.getCall(0).args[1]).to.eql([0, 2, 1]);
        });

        it("calls toggleWeekday function and removes value from the state", () => {
            const value = "2";

            actions.toggleWeekday(
                {
                    state: {weekdays: [0, 2]},
                    commit
                },
                {target: {value}}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setWeekdays");
            expect(commit.getCall(0).args[1]).to.eql([0]);
        });
    });

    describe("setMobilityDataProperties", () => {
        it("calls setMobilityDataProperties function to update the mobility mode of the mobility data and map feature", () => {
            const geometryIndex = 1,
                feature = {set: featureSet},
                mobilityMode = "car",
                mobilityData = [
                    {geometryIndex: 0, feature},
                    {geometryIndex: 1, feature},
                    {geometryIndex: 2, feature}
                ];

            actions.setMobilityDataProperties(
                {
                    state: {mobilityData},
                    commit
                },
                {
                    geometryIndex,
                    feature,
                    mobilityMode
                }
            );

            // Update the mobility mode in the map feature
            expect(featureSet.calledOnce).to.be.true;
            expect(featureSet.getCall(0).args[0]).to.eql("mobilityMode");
            expect(featureSet.getCall(0).args[1]).to.eql(mobilityMode);

            // Update the mobility mode in the state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1]).to.eql([
                {geometryIndex: 0, feature},
                {geometryIndex: 1, feature, mobilityMode},
                {geometryIndex: 2, feature}
            ]);
        });

        it("calls setMobilityDataProperties function to update the start time of the mobility data", () => {
            const geometryIndex = 1,
                feature = {set: featureSet},
                startTime = "11:00",
                mobilityData = [
                    {geometryIndex: 0, feature},
                    {geometryIndex: 1, feature},
                    {geometryIndex: 2, feature}
                ];

            actions.setMobilityDataProperties(
                {
                    state: {mobilityData},
                    commit
                },
                {
                    geometryIndex,
                    startTime
                }
            );

            expect(featureSet.callCount).to.equal(0);

            // Update the start time in the state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1]).to.eql([
                {geometryIndex: 0, feature},
                {geometryIndex: 1, feature, startTime},
                {geometryIndex: 2, feature}
            ]);
        });

        it("calls setMobilityDataProperties function to update the end time of the mobility data", () => {
            const geometryIndex = 1,
                feature = {set: featureSet},
                endTime = "23:00",
                mobilityData = [
                    {geometryIndex: 0, feature},
                    {geometryIndex: 1, feature},
                    {geometryIndex: 2, feature}
                ];

            actions.setMobilityDataProperties(
                {
                    state: {mobilityData},
                    commit
                },
                {
                    geometryIndex,
                    endTime
                }
            );

            expect(featureSet.callCount).to.equal(0);

            // Update the end time in the state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1]).to.eql([
                {geometryIndex: 0, feature},
                {geometryIndex: 1, feature, endTime},
                {geometryIndex: 2, feature}
            ]);
        });

        it("calls setMobilityDataProperties function to update the title of the mobility data", () => {
            const geometryIndex = 1,
                feature = {set: featureSet},
                title = "test title",
                mobilityData = [
                    {geometryIndex: 0, feature},
                    {geometryIndex: 1, feature},
                    {geometryIndex: 2, feature}
                ];

            actions.setMobilityDataProperties(
                {
                    state: {mobilityData},
                    commit
                },
                {
                    geometryIndex,
                    title
                }
            );

            expect(featureSet.callCount).to.equal(0);

            // Update the title in the state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1]).to.eql([
                {geometryIndex: 0, feature},
                {geometryIndex: 1, feature, title},
                {geometryIndex: 2, feature}
            ]);
        });

        it("calls setMobilityDataProperties function to update the comment of the mobility data", () => {
            const geometryIndex = 1,
                feature = {set: featureSet},
                comment = "test comment",
                mobilityData = [
                    {geometryIndex: 0, feature},
                    {geometryIndex: 1, feature},
                    {geometryIndex: 2, feature}
                ];

            actions.setMobilityDataProperties(
                {
                    state: {mobilityData},
                    commit
                },
                {
                    geometryIndex,
                    comment
                }
            );

            expect(featureSet.callCount).to.equal(0);

            // Update the comment in the state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1]).to.eql([
                {geometryIndex: 0, feature},
                {geometryIndex: 1, feature, comment},
                {geometryIndex: 2, feature}
            ]);
        });
    });

    describe("setSummary", () => {
        it("calls setSummary function", () => {
            const value = "summary test";

            actions.setSummary(
                {
                    commit
                },
                {target: {value}}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setSummary");
            expect(commit.getCall(0).args[1]).to.eql(value);
        });
    });

    describe("selectMobilityDataFeature", () => {
        it("calls selectMobilityDataFeature function", () => {
            const mobilityData = [
                {
                    geometryIndex: 0,
                    feature: {set: featureSet}
                },
                {
                    geometryIndex: 1,
                    feature: {set: featureSet}
                },
                {
                    geometryIndex: 2,
                    feature: {set: featureSet}
                }
            ];

            actions.selectMobilityDataFeature(
                {
                    state: {mobilityData}
                },
                1
            );

            expect(featureSet.callCount).to.equal(3);
            expect(featureSet.getCall(0).args[0]).to.eql("isSelected");
            expect(featureSet.getCall(0).args[1]).to.eql(false);
            expect(featureSet.getCall(1).args[0]).to.eql("isSelected");
            expect(featureSet.getCall(1).args[1]).to.eql(true);
            expect(featureSet.getCall(2).args[0]).to.eql("isSelected");
            expect(featureSet.getCall(2).args[1]).to.eql(false);
        });
    });

    describe("addFeatureToMobilityData", () => {
        it("calls addFeatureToMobilityData function and adds mobility data", () => {
            const mobilityData = [{geometryIndex: 0}, {geometryIndex: 1}];

            actions.addFeatureToMobilityData(
                {
                    state: {mobilityData},
                    commit,
                    dispatch
                },
                fakeFeature
            );

            // Sets the id for the new mobility data feature
            expect(featureSetIdStub.calledOnce).to.be.true;
            expect(featureSetIdStub.getCall(0).args).to.eql([2]);

            // Add mobility data to state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1].length).to.eql(
                mobilityData.length + 1
            );

            // Select the newly added mobility data feature
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args[0]).to.eql(
                "selectMobilityDataFeature"
            );
            expect(dispatch.getCall(0).args[1]).to.eql(mobilityData.length);
        });
    });

    describe("addLocationToMobilityData", () => {
        it("calls addLocationToMobilityData function and adds mobility data", () => {
            const mobilityData = [
                {geometryIndex: 0},
                {geometryIndex: 1},
                {geometryIndex: 2}
            ];

            actions.addLocationToMobilityData(
                {
                    state: {mobilityData},
                    commit,
                    dispatch
                },
                1
            );

            // Add mobility data to state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1].length).to.eql(
                mobilityData.length + 1
            );
            expect(
                commit
                    .getCall(0)
                    .args[1].map(({geometryIndex}) => geometryIndex)
            ).to.eql([0, 3, 1, 2]);

            expect(dispatch.callCount).to.equal(2);
            // Select the newly added mobility data feature
            expect(dispatch.getCall(0).args[0]).to.eql(
                "selectMobilityDataFeature"
            );
            expect(dispatch.getCall(0).args[1]).to.eql(mobilityData.length);
            // Starts drawing location mode
            expect(dispatch.getCall(1).args[0]).to.eql(
                "startDrawingMobilityDataLocation"
            );
            expect(dispatch.getCall(1).args[1]).to.eql(mobilityData.length);
        });
    });

    describe("deleteMobilityDataFeature", () => {
        it("calls deleteMobilityDataFeature function", () => {
            const mobilityData = [
                    {geometryIndex: 0},
                    {geometryIndex: 1},
                    {geometryIndex: 2}
                ],
                geometryIndex = 1;

            actions.deleteMobilityDataFeature(
                {
                    state: {
                        mobilityDataLayer: {
                            getSource: () => fakeSource
                        },
                        mobilityData
                    },
                    commit,
                    dispatch
                },
                geometryIndex
            );

            // Remove the feature from the map
            expect(sourceGetFeatureByIdStub.calledOnce).to.be.true;
            expect(sourceGetFeatureByIdStub.getCall(0).args).to.eql([
                geometryIndex
            ]);
            expect(sourceRemoveFeatureStub.calledOnce).to.be.true;
            expect(sourceRemoveFeatureStub.getCall(0).args.length).to.eql(1);

            // Update the mobility data state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(0).args[1].length).to.eql(
                mobilityData.length - 1
            );
            expect(
                commit.getCall(0).args[1].map(data => data.geometryIndex)
            ).to.eql([0, 2]);

            // Unselect the mobility data feature
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql([
                "selectMobilityDataFeature"
            ]);
        });
    });
});
