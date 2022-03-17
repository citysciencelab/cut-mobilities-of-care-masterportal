import {expect} from "chai";
import getters from "../../../store/gettersStoryTellingTool";
import stateStoryTellingTool from "../../../store/stateStoryTellingTool";
import {emptyStoryConf} from "../../../store/constantsStoryTellingTool";

const {
    id,
    storyConf,
    htmlContents,
    htmlContentsImages,
    active,
    name,
    glyphicon,
    renderToWindow,
    resizableWindow,
    isVisibleInMenu,
    deactivateGFI,
    initialWidth,
    initialWidthMobile
} = getters;

describe("addons/StoryTellingTool/store/gettersStoryTellingTool", function () {
    it("returns the id from state", function () {
        expect(id(stateStoryTellingTool)).to.equals("storyTellingTool");
    });
    it("returns the storyConf from state", function () {
        expect(JSON.stringify(storyConf(stateStoryTellingTool))).to.equals(
            JSON.stringify(emptyStoryConf)
        );
    });
    it("returns the htmlContents from state", function () {
        expect(JSON.stringify(htmlContents(stateStoryTellingTool))).to.equals(
            JSON.stringify({})
        );
    });
    it("returns the htmlContentsImages from state", function () {
        expect(
            JSON.stringify(htmlContentsImages(stateStoryTellingTool))
        ).to.equals(JSON.stringify({}));
    });

    describe("testing default values", function () {
        it("returns the active default value from state", function () {
            expect(active(stateStoryTellingTool)).to.be.false;
        });
        it("returns the name default value from state", function () {
            expect(name(stateStoryTellingTool)).to.be.equals(
                "Story Telling Tool"
            );
        });
        it("returns the glyphicon default value from state", function () {
            expect(glyphicon(stateStoryTellingTool)).to.equals(
                "glyphicon-book"
            );
        });
        it("returns the renderToWindow default value from state", function () {
            expect(renderToWindow(stateStoryTellingTool)).to.be.true;
        });
        it("returns the resizableWindow default value from state", function () {
            expect(resizableWindow(stateStoryTellingTool)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", function () {
            expect(isVisibleInMenu(stateStoryTellingTool)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", function () {
            expect(deactivateGFI(stateStoryTellingTool)).to.be.true;
        });
        it("returns the initialWidth default value from state", function () {
            expect(initialWidth(stateStoryTellingTool)).to.equals(500);
        });
        it("returns the initialWidthMobile default value from state", function () {
            expect(initialWidthMobile(stateStoryTellingTool)).to.equals(300);
        });
    });
});
