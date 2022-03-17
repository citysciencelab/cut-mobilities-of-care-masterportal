import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import StoryTellingToolComponent from "../../../components/StoryTellingTool.vue";
import StoryTellingTool from "../../../store/StoryTellingTool";
import {storyTellingModes} from "../../../store/constantsStoryTellingTool";

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("addons/StoryTellingTool/components/StoryTellingTool.vue", () => {
    global.Config = {};
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        storyTellingTool: {
                            name:
                                "translate#additional:modules.tools.storyTellingTool.title",
                            glyphicon: "glyphicon-book"
                        }
                    }
                }
            }
        }
    };
    let store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        StoryTellingTool
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/StoryTellingTool/setActive", true);
    });

    it("renders the StoryTellingTool tool", () => {
        const wrapper = shallowMount(StoryTellingToolComponent, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-storyTellingTool").exists()).to.be.true;
        expect(wrapper.find("#tool-storyTellingTool-modeSelection").exists()).to
            .be.true;
    });

    it("do not render the StoryTellingTool tool if not active", () => {
        store.commit("Tools/StoryTellingTool/setActive", false);
        const wrapper = shallowMount(StoryTellingToolComponent, {
            store,
            localVue
        });

        expect(wrapper.find("#tool-storyTellingTool").exists()).to.be.false;
        expect(wrapper.find("#tool-storyTellingTool-modeSelection").exists()).to
            .be.false;
    });

    it("renders the UI of the story creator when selected", async () => {
        const wrapper = shallowMount(StoryTellingToolComponent, {
            store,
            localVue,
            stubs: {
                StoryCreator: true,
                StoryPlayer: true
            }
        });

        await wrapper.setData({mode: storyTellingModes.CREATE});

        expect(wrapper.find("#tool-storyTellingTool").exists()).to.be.true;
        expect(wrapper.find("#tool-storyTellingTool-modeSelection").exists()).to
            .be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.true;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.false;
    });

    it("renders the UI of the story player when selected", async () => {
        const wrapper = shallowMount(StoryTellingToolComponent, {
            store,
            localVue,
            stubs: {
                StoryCreator: true,
                StoryPlayer: true
            }
        });

        await wrapper.setData({
            mode: storyTellingModes.PLAY,
            storyConfPath: "/"
        });

        expect(wrapper.find("#tool-storyTellingTool").exists()).to.be.true;
        expect(wrapper.find("#tool-storyTellingTool-modeSelection").exists()).to
            .be.false;
        expect(wrapper.find("storycreator-stub").exists()).to.be.false;
        expect(wrapper.find("storyplayer-stub").exists()).to.be.true;
    });
});
