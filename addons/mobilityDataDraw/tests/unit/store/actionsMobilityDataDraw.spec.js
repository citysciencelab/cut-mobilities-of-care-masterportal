import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../store/actionsMobilityDataDraw";
import initialState from "../../../store/stateMobilityDataDraw";

import personApi from "../../../api/sendPersonalData";
import entryApi from "../../../api/sendEntry";

describe("addons/mobilityDataDraw/store/actionsMobilityDataDraw.js", () => {
    let commit, dispatch, sendPersonalDataStub, sendEntryStub;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        sendPersonalDataStub = sinon.stub(personApi, "sendPersonalData");
        sendEntryStub = sinon.stub(entryApi, "sendEntry");

        sinon.stub(Radio, "trigger");
        sinon.stub(console, "error");
    });

    afterEach(sinon.restore);

    describe("submitPersonalData", () => {
        it("calls submitPersonalData function", async () => {
            const personalData = [Symbol(), Symbol()];

            sendPersonalDataStub
                .withArgs(personalData)
                .returns(Promise.resolve({personId: 1}));

            actions.submitPersonalData({
                state: {
                    personalData
                }
            });

            expect(sendPersonalDataStub.calledOnce).to.be.true;
            expect(sendPersonalDataStub.getCall(0).args).to.eql([personalData]);
        });
    });

    describe("submitDrawnData", () => {
        it("calls submitDrawnData function", async () => {
            const personId = 1,
                summary = "description text",
                weekdays = [2, 3],
                mobilityData = [Symbol(), Symbol()],
                annotations = [Symbol()],
                audioRecordBlob = Symbol(),
                entry = {
                    personId,
                    description: summary,
                    weekdays,
                    mobilityFeatures: mobilityData,
                    annotationFeatures: annotations
                };

            sendEntryStub.returns(Promise.resolve({entryId: 1}));

            actions.submitDrawnData({
                state: {
                    personId,
                    summary,
                    weekdays,
                    mobilityData,
                    annotations,
                    audioRecordBlob
                }
            });

            expect(sendEntryStub.calledOnce).to.be.true;
            expect(sendEntryStub.getCall(0).args).to.eql([entry]);
        });
    });

    describe("resetDrawnData", () => {
        it("calls resetDrawnData function", () => {
            const fakeClearMobilityData = sinon.spy(),
                fakeClearAnnotations = sinon.spy();

            actions.resetDrawnData({
                initialState,
                state: {
                    mobilityDataLayer: {
                        getSource: () => ({clear: fakeClearMobilityData})
                    },
                    annotationsLayer: {
                        getSource: () => ({clear: fakeClearAnnotations})
                    }
                },
                commit
            });

            expect(commit.callCount).to.equal(7);
            // Reset mobility data
            expect(commit.getCall(0).args[0]).to.eql("setMobilityMode");
            expect(commit.getCall(0).args[1]).to.eql(initialState.mobilityMode);
            expect(commit.getCall(1).args[0]).to.eql("setWeekdays");
            expect(commit.getCall(1).args[1]).to.eql(initialState.weekdays);
            expect(commit.getCall(2).args[0]).to.eql("setMobilityData");
            expect(commit.getCall(2).args[1]).to.eql(initialState.mobilityData);
            expect(commit.getCall(3).args[0]).to.eql("setSummary");
            expect(commit.getCall(3).args[1]).to.eql(initialState.summary);
            // Reset annotations
            expect(commit.getCall(4).args[0]).to.eql("setDrawingMode");
            expect(commit.getCall(4).args[1]).to.eql(initialState.drawingMode);
            expect(commit.getCall(5).args[0]).to.eql("setAnnotations");
            expect(commit.getCall(5).args[1]).to.eql(initialState.annotations);
            // Reset audio recorder
            expect(commit.getCall(6).args[0]).to.eql("setAudioRecordBlob");
            expect(commit.getCall(6).args[1]).to.eql(
                initialState.audioRecordBlob
            );

            // Clear map layers
            expect(fakeClearMobilityData.calledOnce).to.be.true;
            expect(fakeClearAnnotations.calledOnce).to.be.true;
        });
    });

    describe("resetModule", () => {
        it("calls resetModule function", () => {
            actions.resetModule({
                initialState,
                commit,
                dispatch
            });

            expect(dispatch.callCount).to.equal(3);
            // Remove interactions from the map
            expect(dispatch.getCall(0).args).to.eql([
                "removeModifyInteraction"
            ]);
            expect(dispatch.getCall(1).args).to.eql(["removeSnapInteraction"]);
            // Reset drawn data
            expect(dispatch.getCall(2).args).to.eql(["resetDrawnData"]);

            expect(commit.callCount).to.equal(3);
            // Reset personal data
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql(initialState.personalData);
            expect(commit.getCall(1).args[0]).to.eql("setPersonId");
            expect(commit.getCall(1).args[1]).to.eql(initialState.personId);
            // Reset view
            expect(commit.getCall(2).args[0]).to.eql("setView");
            expect(commit.getCall(2).args[1]).to.eql(initialState.view);
        });
    });
});
