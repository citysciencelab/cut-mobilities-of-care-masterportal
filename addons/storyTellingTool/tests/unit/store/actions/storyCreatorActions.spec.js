import {expect} from "chai";
import sinon from "sinon";
import JSZip from "jszip";

import actions from "../../../../store/actions/storyCreatorActions";

describe("addons/storyTellingTool/store/actions/storyCreatorActions.js", () => {
    let commit, createFolder, createFile, downloadZip;

    beforeEach(() => {
        commit = sinon.spy();
        createFolder = sinon.spy(JSZip.prototype, "folder");
        createFile = sinon.spy(JSZip.prototype, "file");
        downloadZip = sinon.spy(JSZip.prototype, "generateAsync");
    });

    afterEach(sinon.restore);

    describe("saveHtmlContent", () => {
        it("calls saveHtmlContent function and adds a new HTML content", () => {
            const chapterNumber = 2,
                stepNumber = 2,
                htmlContent = "<h1>HTML Content<h1>",
                htmlContentImages = [Symbol()],
                htmlContents = {
                    "step_1-1": "<h1>Chapter 1 Step 1<h1>",
                    "step_1-2": "<h1>Chapter 1 Step 2<h1>",
                    "step_2-1": "<h1>Chapter 2 Step 1<h1>"
                },
                htmlContentsImages = {
                    "step_1-2": [Symbol()],
                    "step_2-1": [Symbol(), Symbol()]
                },
                htmlFileName = actions.saveHtmlContent(
                    {
                        state: {
                            htmlContents,
                            htmlContentsImages
                        },
                        commit
                    },
                    {
                        chapterNumber,
                        stepNumber,
                        htmlContent,
                        htmlContentImages
                    }
                );

            // Update temporary HTML contents and images state
            expect(commit.callCount).to.equal(2);
            expect(commit.getCall(0).args[0]).to.eql("setHtmlContents");
            expect(commit.getCall(0).args[1]).to.eql({
                ...htmlContents,
                "step_2-2": htmlContent
            });
            expect(commit.getCall(1).args[0]).to.eql("setHtmlContentsImages");
            expect(commit.getCall(1).args[1]).to.eql({
                ...htmlContentsImages,
                "step_2-2": htmlContentImages
            });

            // Returns the html file name for the story json
            expect(htmlFileName).to.eql("step_2-2.html");
        });

        it("calls saveHtmlContent function and edits an existing HTML content", () => {
            const chapterNumber = 2,
                stepNumber = 2,
                htmlContent = "<h1>HTML Content<h1>",
                htmlContentImages = [Symbol()],
                htmlContents = {
                    "step_1-1": "<h1>Chapter 1 Step 1<h1>",
                    "step_1-2": "<h1>Chapter 1 Step 2<h1>",
                    "step_2-1": "<h1>Chapter 2 Step 1<h1>"
                },
                htmlContentsImages = {
                    "step_1-2": [Symbol()],
                    "step_2-1": [Symbol(), Symbol()]
                },
                previousHtmlReference = "step_1-2",
                htmlFileName = actions.saveHtmlContent(
                    {
                        state: {
                            htmlContents,
                            htmlContentsImages
                        },
                        commit
                    },
                    {
                        chapterNumber,
                        stepNumber,
                        htmlContent,
                        htmlContentImages,
                        previousHtmlReference
                    }
                );

            // Update temporary HTML contents and images state
            expect(commit.callCount).to.equal(2);
            expect(commit.getCall(0).args[0]).to.eql("setHtmlContents");
            expect(JSON.stringify(commit.getCall(0).args[1])).to.eql(
                JSON.stringify({
                    "step_1-1": "<h1>Chapter 1 Step 1<h1>",
                    "step_2-1": "<h1>Chapter 2 Step 1<h1>",
                    "step_2-2": htmlContent
                })
            );
            expect(commit.getCall(1).args[0]).to.eql("setHtmlContentsImages");
            expect(JSON.stringify(commit.getCall(1).args[1])).to.eql(
                JSON.stringify({
                    "step_2-1": [Symbol(), Symbol()],
                    "step_2-2": htmlContentImages
                })
            );

            // Returns the html file name for the story json
            expect(htmlFileName).to.eql("step_2-2.html");
        });
    });

    describe("addStoryChapter", () => {
        it("calls addStoryChapter function", () => {
            const newChapter = {chapterNumber: 2, chapterTitle: "Chapter 2"},
                chapters = [{chapterNumber: 1, chapterTitle: "Chapter 1"}];

            actions.addStoryChapter(
                {
                    state: {
                        storyConf: {
                            chapters
                        }
                    },
                    commit
                },
                newChapter
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setStoryConf");
            expect(commit.getCall(0).args[1]).to.eql({
                chapters: [...chapters, newChapter]
            });
        });
    });

    describe("saveStoryStep", () => {
        it("calls saveStoryStep function and adds a new step", () => {
            const step = {
                    associatedChapter: 2,
                    stepNumber: 2,
                    title: "Title"
                },
                steps = [
                    {associatedChapter: 1, stepNumber: 1, title: "A"},
                    {associatedChapter: 2, stepNumber: 1, title: "B"},
                    {associatedChapter: 2, stepNumber: 3, title: "C"},
                    {associatedChapter: 3, stepNumber: 1, title: "D"}
                ];

            actions.saveStoryStep(
                {
                    state: {
                        storyConf: {steps}
                    },
                    commit
                },
                {step}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setStoryConf");
            expect(commit.getCall(0).args[1]).to.eql({
                steps: [
                    {associatedChapter: 1, stepNumber: 1, title: "A"},
                    {associatedChapter: 2, stepNumber: 1, title: "B"},
                    step,
                    {associatedChapter: 2, stepNumber: 3, title: "C"},
                    {associatedChapter: 3, stepNumber: 1, title: "D"}
                ]
            });
        });

        it("calls saveStoryStep function and edits an existing step", () => {
            const step = {
                    associatedChapter: 2,
                    stepNumber: 2,
                    title: "Title"
                },
                previousStepReference = "2.3",
                steps = [
                    {associatedChapter: 1, stepNumber: 1, title: "A"},
                    {associatedChapter: 2, stepNumber: 1, title: "B"},
                    {associatedChapter: 2, stepNumber: 3, title: "C"},
                    {associatedChapter: 3, stepNumber: 1, title: "D"}
                ];

            actions.saveStoryStep(
                {
                    state: {
                        storyConf: {steps}
                    },
                    commit
                },
                {step, previousStepReference}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setStoryConf");
            expect(commit.getCall(0).args[1]).to.eql({
                steps: [
                    {associatedChapter: 1, stepNumber: 1, title: "A"},
                    {associatedChapter: 2, stepNumber: 1, title: "B"},
                    step,
                    {associatedChapter: 3, stepNumber: 1, title: "D"}
                ]
            });
        });
    });

    describe("deleteStoryStep", () => {
        it("calls deleteStoryStep function", () => {
            const associatedChapter = 2,
                stepNumber = 3,
                chapters = [
                    {chapterNumber: 1, chapterTitle: "Chapter 1"},
                    {chapterNumber: 2, chapterTitle: "Chapter 2"},
                    {chapterNumber: 3, chapterTitle: "Chapter 3"}
                ],
                steps = [
                    {associatedChapter: 1, stepNumber: 1},
                    {associatedChapter: 2, stepNumber: 1},
                    {associatedChapter: 2, stepNumber: 3},
                    {associatedChapter: 3, stepNumber: 1}
                ];

            actions.deleteStoryStep(
                {
                    state: {
                        storyConf: {chapters, steps}
                    },
                    commit
                },
                {associatedChapter, stepNumber}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setStoryConf");
            expect(commit.getCall(0).args[1]).to.eql({
                chapters,
                steps: [
                    {associatedChapter: 1, stepNumber: 1},
                    {associatedChapter: 2, stepNumber: 1},
                    {associatedChapter: 3, stepNumber: 1}
                ]
            });
        });

        it("calls deleteStoryStep function and deletes unused chapters", () => {
            const associatedChapter = 3,
                stepNumber = 1,
                chapters = [
                    {chapterNumber: 1, chapterTitle: "Chapter 1"},
                    {chapterNumber: 2, chapterTitle: "Chapter 2"},
                    {chapterNumber: 3, chapterTitle: "Chapter 3"}
                ],
                steps = [
                    {associatedChapter: 1, stepNumber: 1},
                    {associatedChapter: 2, stepNumber: 1},
                    {associatedChapter: 2, stepNumber: 3},
                    {associatedChapter: 3, stepNumber: 1}
                ];

            actions.deleteStoryStep(
                {
                    state: {
                        storyConf: {chapters, steps}
                    },
                    commit
                },
                {associatedChapter, stepNumber}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setStoryConf");
            expect(commit.getCall(0).args[1]).to.eql({
                chapters: [
                    {chapterNumber: 1, chapterTitle: "Chapter 1"},
                    {chapterNumber: 2, chapterTitle: "Chapter 2"}
                ],
                steps: [
                    {associatedChapter: 1, stepNumber: 1},
                    {associatedChapter: 2, stepNumber: 1},
                    {associatedChapter: 2, stepNumber: 3}
                ]
            });
        });
    });

    describe("downloadStoryFiles", () => {
        const storyConf = {
            name: "My Story",
            layers: [],
            chapters: [{chapterNumber: 1, chapterTitle: "Chapter 1"}],
            steps: [
                {associatedChapter: 1, stepNumber: 1},
                {associatedChapter: 1, stepNumber: 2}
            ]
        };

        it("calls downloadStoryFiles function and downloads a zip with only the story.json", () => {
            const htmlContents = {},
                htmlContentsImages = {};

            actions.downloadStoryFiles({
                state: {
                    storyConf,
                    htmlContents,
                    htmlContentsImages
                },
                commit
            });

            expect(createFolder.calledOnce).to.be.false;

            expect(createFile.calledOnce).to.be.true;
            // Add story.json
            expect(createFile.getCall(0).args[0]).to.eql("story.json");
            expect(createFile.getCall(0).args[1]).to.eql(
                JSON.stringify(storyConf)
            );

            // Download the story zip
            expect(downloadZip.calledOnce).to.be.true;
        });

        it("calls downloadStoryFiles function and downloads a zip with story.json and html files", () => {
            const htmlContents = {
                    "step_1-1": "<h1>Chapter 1 Step 1<h1>",
                    "step_1-2": "<h1>Chapter 1 Step 2<h1>",
                    "step_2-1": "<h1>Chapter 2 Step 1<h1>"
                },
                htmlContentsImages = {};

            actions.downloadStoryFiles({
                state: {
                    storyConf,
                    htmlContents,
                    htmlContentsImages
                },
                commit
            });

            // Create folder for html files
            expect(createFolder.calledOnce).to.be.true;
            expect(createFolder.getCall(0).args).to.eql(["story"]);

            expect(createFile.callCount).to.eql(4);
            // Add html files
            expect(createFile.getCall(0).args[0]).to.eql("story/step_1-1.html");
            expect(createFile.getCall(0).args[1]).to.eql(
                htmlContents["step_1-1"]
            );
            expect(createFile.getCall(1).args[0]).to.eql("story/step_1-2.html");
            expect(createFile.getCall(1).args[1]).to.eql(
                htmlContents["step_1-2"]
            );
            expect(createFile.getCall(2).args[0]).to.eql("story/step_2-1.html");
            expect(createFile.getCall(2).args[1]).to.eql(
                htmlContents["step_2-1"]
            );
            // Add story.json
            expect(createFile.getCall(3).args[0]).to.eql("story.json");
            expect(createFile.getCall(3).args[1]).to.eql(
                JSON.stringify({...storyConf, htmlFolder: "story"})
            );

            // Download the story zip
            expect(downloadZip.calledOnce).to.be.true;
        });

        it("calls downloadStoryFiles function and downloads a zip with story.json, html and image files", () => {
            const htmlContents = {
                    "step_1-1": "<h1>Chapter 1 Step 1<h1>",
                    "step_1-2":
                        "<h1>Chapter 1 Step 2<h1><img src=\"data:image/png;base64,IMAGE1\" />",
                    "step_2-1":
                        "<h1>Chapter 2 Step 1<h1><img src=\"data:image/png;base64,IMAGE2\" /><img src=\"data:image/png;base64,IMAGE3\" />"
                },
                htmlContentsImages = {
                    "step_1-2": [
                        {
                            dataUrl: "data:image/png;base64,IMAGE1",
                            fileExtension: "png"
                        }
                    ],
                    "step_2-1": [
                        {
                            dataUrl: "data:image/png;base64,IMAGE2",
                            fileExtension: "png"
                        },
                        {
                            dataUrl: "data:image/png;base64,IMAGE3",
                            fileExtension: "png"
                        }
                    ]
                };

            actions.downloadStoryFiles({
                state: {
                    storyConf,
                    htmlContents,
                    htmlContentsImages
                },
                commit
            });

            // Create folders for html and image files
            expect(createFolder.callCount).to.eql(3);
            expect(createFolder.getCall(0).args).to.eql(["story"]);
            expect(createFolder.getCall(1).args).to.eql(["story/images"]);
            expect(createFolder.getCall(2).args).to.eql(["story/images"]);

            expect(createFile.callCount).to.eql(7);
            // Add html and image files
            expect(createFile.getCall(0).args[0]).to.eql("story/step_1-1.html");
            expect(createFile.getCall(0).args[1]).to.eql(
                "<h1>Chapter 1 Step 1<h1>"
            );

            expect(createFile.getCall(1).args[0]).to.eql(
                "story/images/step_1-2_1.png"
            );
            expect(createFile.getCall(1).args[1]).to.eql("IMAGE1");
            expect(createFile.getCall(1).args[2]).to.eql({base64: true});
            expect(createFile.getCall(2).args[0]).to.eql("story/step_1-2.html");
            expect(createFile.getCall(2).args[1]).to.eql(
                "<h1>Chapter 1 Step 2<h1><img src=\"assets/story/images/step_1-2_1.png\" />"
            );

            expect(createFile.getCall(3).args[0]).to.eql(
                "story/images/step_2-1_1.png"
            );
            expect(createFile.getCall(3).args[1]).to.eql("IMAGE2");
            expect(createFile.getCall(3).args[2]).to.eql({base64: true});
            expect(createFile.getCall(4).args[0]).to.eql(
                "story/images/step_2-1_2.png"
            );
            expect(createFile.getCall(4).args[1]).to.eql("IMAGE3");
            expect(createFile.getCall(4).args[2]).to.eql({base64: true});
            expect(createFile.getCall(5).args[0]).to.eql("story/step_2-1.html");
            expect(createFile.getCall(5).args[1]).to.eql(
                "<h1>Chapter 2 Step 1<h1><img src=\"assets/story/images/step_2-1_1.png\" /><img src=\"assets/story/images/step_2-1_2.png\" />"
            );
            // Add story.json
            expect(createFile.getCall(6).args[0]).to.eql("story.json");
            expect(createFile.getCall(6).args[1]).to.eql(
                JSON.stringify({...storyConf, htmlFolder: "story"})
            );

            // Download the story zip
            expect(downloadZip.calledOnce).to.be.true;
        });
    });
});
