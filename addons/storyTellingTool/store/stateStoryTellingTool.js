import {emptyStoryConf} from "./constantsStoryTellingTool";

/**
 * User type definition
 * @typedef {object} StoryTellingToolState
 * @property {string} id the ID of the story telling tool
 * @property {Object} storyConf the configuration of the story
 * @property {Object} htmlContents the HTML contents used for story creation
 * @property {Object} htmlContentsImages the HTML content images used for story creation
 * @property {boolean} active if true, the story telling tool will be rendered
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 * @property {Number} initialWidth Size of the sidebar when opening.
 * @property {Number} initialWidthMobile Mobile size of the sidebar when opening.
 * @property {object} config for story to display.
 */
const state = {
    id: "storyTellingTool",
    storyConf: {...emptyStoryConf},
    htmlContents: {},
    htmlContentsImages: {},
    // defaults for config.json parameters
    active: false,
    name: "Story Telling Tool",
    glyphicon: "glyphicon-book",
    renderToWindow: true,
    resizableWindow: true,
    isVisibleInMenu: true,
    deactivateGFI: true,
    initialWidth: 500,
    initialWidthMobile: 300
};

export default state;
