import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../../store/actions/annotationsActions";
import initialState from "../../../../store/stateMobilityDataDraw";

describe("addons/mobilityDataDraw/store/actions/annotationsActions.js", () => {
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

    describe("initializeAnnotationsView", () => {
        it("calls initializeAnnotationsView function", () => {
            const annotationsLayerSource = Symbol();

            actions.initializeAnnotationsView({
                state: {
                    annotationsLayer: {
                        getSource: () => annotationsLayerSource
                    }
                },
                commit,
                dispatch
            });

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setAnnotationsLayer");
            expect(commit.getCall(0).args[1]).to.eql(fakeLayer);

            expect(dispatch.callCount).to.equal(2);
            expect(dispatch.getCall(0).args).to.eql([
                "addAnnotationDrawInteraction"
            ]);
            expect(dispatch.getCall(1).args[0]).to.eql("addSnapInteraction");
            expect(dispatch.getCall(1).args[1]).to.eql(annotationsLayerSource);
        });
    });

    describe("cleanUpAnnotationsView", () => {
        it("calls cleanUpAnnotationsView function", () => {
            actions.cleanUpAnnotationsView({
                commit,
                dispatch
            });

            expect(dispatch.callCount).to.equal(2);
            // Unselect all annotation features
            expect(dispatch.getCall(0).args).to.eql([
                "selectAnnotationFeature"
            ]);
            // Remove annotation draw interaction
            expect(dispatch.getCall(1).args).to.eql([
                "removeAnnotationDrawInteraction"
            ]);

            // Reset interaction state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setCurrentInteraction");
            expect(commit.getCall(0).args[1]).to.eql(
                initialState.currentInteraction
            );
        });
    });

    describe("setDrawingMode", () => {
        it("calls setDrawingMode function", () => {
            const value = "LineString";

            actions.setDrawingMode(
                {
                    commit,
                    dispatch
                },
                {target: {value}}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setDrawingMode");
            expect(commit.getCall(0).args[1]).to.eql(value);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql([
                "addAnnotationDrawInteraction"
            ]);
        });
    });

    describe("setAnnotationProperties", () => {
        it("calls setAnnotationProperties function to update the title of the annotation", () => {
            const geometryIndex = 1,
                title = "test title",
                annotations = [
                    {geometryIndex: 0},
                    {geometryIndex: 1},
                    {geometryIndex: 2}
                ];

            actions.setAnnotationProperties(
                {
                    state: {annotations},
                    commit
                },
                {
                    geometryIndex,
                    title
                }
            );

            // Update the title in the state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setAnnotations");
            expect(commit.getCall(0).args[1]).to.eql([
                {geometryIndex: 0},
                {geometryIndex: 1, title},
                {geometryIndex: 2}
            ]);
        });

        it("calls setAnnotationProperties function to update the comment of the annotation", () => {
            const geometryIndex = 1,
                comment = "test comment",
                annotations = [
                    {geometryIndex: 0},
                    {geometryIndex: 1},
                    {geometryIndex: 2}
                ];

            actions.setAnnotationProperties(
                {
                    state: {annotations},
                    commit
                },
                {
                    geometryIndex,
                    comment
                }
            );

            // Update the comment in the state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setAnnotations");
            expect(commit.getCall(0).args[1]).to.eql([
                {geometryIndex: 0},
                {geometryIndex: 1, comment},
                {geometryIndex: 2}
            ]);
        });
    });

    describe("selectAnnotationFeature", () => {
        it("calls selectAnnotationFeature function", () => {
            const annotations = [
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

            actions.selectAnnotationFeature(
                {
                    state: {annotations}
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

    describe("addFeatureToAnnotation", () => {
        it("calls addFeatureToAnnotation function and adds an annotation", () => {
            const annotations = [{geometryIndex: 0}, {geometryIndex: 1}];

            actions.addFeatureToAnnotation(
                {
                    state: {annotations},
                    commit,
                    dispatch
                },
                fakeFeature
            );

            // Sets the id for the new annotation feature
            expect(featureSetIdStub.calledOnce).to.be.true;
            expect(featureSetIdStub.getCall(0).args).to.eql([2]);

            // Add annotation to state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setAnnotations");
            expect(commit.getCall(0).args[1].length).to.eql(
                annotations.length + 1
            );

            // Select the newly added annotation feature
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args[0]).to.eql(
                "selectAnnotationFeature"
            );
            expect(dispatch.getCall(0).args[1]).to.eql(annotations.length);
        });
    });

    describe("deleteAnnotation", () => {
        it("calls deleteAnnotation function", () => {
            const annotations = [
                    {geometryIndex: 0},
                    {geometryIndex: 1},
                    {geometryIndex: 2}
                ],
                geometryIndex = 1;

            actions.deleteAnnotation(
                {
                    state: {
                        annotationsLayer: {
                            getSource: () => fakeSource
                        },
                        annotations
                    },
                    commit,
                    dispatch
                },
                geometryIndex
            );

            // Remove the annotation from the map
            expect(sourceGetFeatureByIdStub.calledOnce).to.be.true;
            expect(sourceGetFeatureByIdStub.getCall(0).args).to.eql([
                geometryIndex
            ]);
            expect(sourceRemoveFeatureStub.calledOnce).to.be.true;
            expect(sourceRemoveFeatureStub.getCall(0).args.length).to.eql(1);

            // Update the annotations state
            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setAnnotations");
            expect(commit.getCall(0).args[1].length).to.eql(
                annotations.length - 1
            );
            expect(
                commit.getCall(0).args[1].map(data => data.geometryIndex)
            ).to.eql([0, 2]);

            // Unselect the annotation
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.getCall(0).args).to.eql([
                "selectAnnotationFeature"
            ]);
        });
    });
});
