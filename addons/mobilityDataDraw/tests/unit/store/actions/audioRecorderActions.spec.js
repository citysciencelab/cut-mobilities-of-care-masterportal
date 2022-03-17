import { expect } from "chai";
import sinon from "sinon";

import actions from "../../../../store/actions/audioRecorderActions";

describe("addons/mobilityDataDraw/store/actions/audioRecorderActions.js", () => {
    let commit;

    beforeEach(() => {
        commit = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("startRecording", () => {
        it("calls startRecording function", () => {
            const startStub = sinon.spy();

            actions.startRecording(
                {
                    state: {
                        audioRecords: [
                            {
                                isRecording: false
                            },
                            {
                                isRecording: false
                            }
                        ],
                        audioRecorder: {
                            start: startStub
                        }
                    },
                    commit
                },
                1
            );

            expect(startStub.calledOnce).to.be.true;

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setAudioRecords");
            expect(commit.getCall(0).args[1][0].isRecording).to.be.false;
            expect(commit.getCall(0).args[1][1].isRecording).to.be.true;
        });

        it("calls startRecording function and doesn't do anything if there isn't any audioRecorder yet", () => {
            actions.startRecording(
                {
                    state: { audioRecorder: null },
                    commit
                },
                1
            );

            expect(commit.calledOnce).to.be.false;
        });
    });

    describe("stopRecording", () => {
        it("calls stopRecording function", () => {
            const stopStub = sinon.spy();

            actions.stopRecording(
                {
                    state: {
                        audioRecords: [
                            {
                                isRecording: false
                            }
                        ],
                        audioRecorder: {
                            stop: stopStub
                        }
                    },
                    commit
                },
                0
            );

            expect(stopStub.calledOnce).to.be.true;
        });
    });
});
