import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../store/actionsStoryTellingTool";
import initialState from "../../../store/stateStoryTellingTool";

describe("addons/storyTellingTool/store/actionsStoryTellingTool.js", () => {
    let commit;

    beforeEach(() => {
        commit = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("resetModule", () => {
        it("calls resetModule function", () => {
            actions.resetModule({
                initialState,
                commit
            });

            // Reset store data
            expect(commit.callCount).to.equal(4);
            expect(commit.getCall(0).args[0]).to.eql("setStoryConf");
            expect(commit.getCall(0).args[1]).to.eql(initialState.storyConf);
            expect(commit.getCall(1).args[0]).to.eql("setHtmlContents");
            expect(commit.getCall(1).args[1]).to.eql(initialState.htmlContents);
            expect(commit.getCall(2).args[0]).to.eql("setHtmlContentsImages");
            expect(commit.getCall(2).args[1]).to.eql(
                initialState.htmlContentsImages
            );
            expect(commit.getCall(3).args[0]).to.eql("setInitialWidth");
            expect(commit.getCall(3).args[1]).to.eql(initialState.initialWidth);
        });
    });
});
