import Vuex from "vuex";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Attached from "../../../components/templates/Attached.vue";

const localVue = createLocalVue();

config.mocks.$t = key => key;
localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/Attached.vue", () => {

    it("should have a title", () => {
        const wrapper = shallowMount(Attached, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            components: {
                Default: {
                    template: "<span />"
                }
            },
            computed: {
                clickCoord: () => [],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            localVue
        });

        expect(wrapper.find(".gfi-header h5").text()).to.be.equal("Hallo");
    });

    it("should have the child component Default (-Theme)", () => {
        const wrapper = shallowMount(Attached, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            components: {
                Default: {
                    name: "Default",
                    template: "<span />"
                }
            },
            computed: {
                clickCoord: () => [],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            localVue
        });

        expect(wrapper.findComponent({name: "Default"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        const wrapper = shallowMount(Attached, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            components: {
                Default: {
                    template: "<span />"
                }
            },
            computed: {
                clickCoord: () => [],
                styleContent: () => [{
                    "max-width": "",
                    "max-height": ""
                }]
            },
            localVue
        });

        expect(wrapper.find("button.close").exists()).to.be.true;
    });


    it("should emitted close event if button is clicked", async () => {
        const wrapper = shallowMount(Attached, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                components: {
                    Default: {
                        template: "<span />"
                    }
                },
                computed: {
                    clickCoord: () => [],
                    styleContent: () => [{
                        "max-width": "",
                        "max-height": ""
                    }]
                },
                localVue
            }),
            button = wrapper.find(".close");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the content", async () => {
        const wrapper = shallowMount(Attached, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                components: {
                    Default: {
                        template: "<span />"
                    }
                },
                computed: {
                    clickCoord: () => [],
                    styleContent: () => [{
                        "max-width": "",
                        "max-height": ""
                    }]
                },
                localVue
            }),
            modal = wrapper.find(".gfi-content");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should render the footer slot within .gfi-footer", () => {
        const wrapper = shallowMount(Attached, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                components: {
                    Default: {
                        template: "<span />"
                    }
                },
                computed: {
                    clickCoord: () => [],
                    styleContent: () => [{
                        "max-width": "",
                        "max-height": ""
                    }]
                },
                slots: {
                    footer: "<div class=\"gfi-footer\">Footer</div>"
                },
                localVue
            }),
            footer = wrapper.find(".gfi-footer");

        expect(footer.text()).to.be.equal("Footer");
    });

});
