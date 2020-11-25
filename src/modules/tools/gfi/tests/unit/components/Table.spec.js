import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Table from "../../../components/templates/Table.vue";
import sinon from "sinon";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/templates/Table.vue", () => {

    it("should have a title", () => {
        const wrapper = shallowMount(Table, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            computed: {
                clickCoord: () => []
            },
            store: new Vuex.Store({
                namespaced: true,
                modules: {
                    MapMarker: {
                        namespaced: true,
                        actions: {
                            removePointMarker: sinon.stub(),
                            placingPointMarker: sinon.stub()
                        }
                    }
                }
            }),
            localVue
        });

        expect(wrapper.find(".gfi-title").text()).to.be.equal("Hallo");
    });

    it("should have the child component Default (-Theme)", () => {
        const wrapper = shallowMount(Table, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            computed: {
                clickCoord: () => []
            },
            store: new Vuex.Store({
                namespaced: true,
                modules: {
                    MapMarker: {
                        namespaced: true,
                        actions: {
                            removePointMarker: sinon.stub(),
                            placingPointMarker: sinon.stub()
                        }
                    }
                }
            }),
            localVue
        });

        expect(wrapper.findComponent({name: "Default"}).exists()).to.be.true;
    });

    it("should have a close button", async () => {
        const wrapper = shallowMount(Table, {
            propsData: {
                feature: {
                    getTheme: () => "Default",
                    getMimeType: () => "text/xml",
                    getTitle: () => "Hallo"
                }
            },
            computed: {
                clickCoord: () => []
            },
            store: new Vuex.Store({
                namespaced: true,
                modules: {
                    MapMarker: {
                        namespaced: true,
                        actions: {
                            removePointMarker: sinon.stub(),
                            placingPointMarker: sinon.stub()
                        }
                    }
                }
            }),
            localVue
        });

        expect(wrapper.find("span.glyphicon-remove").exists()).to.be.true;
    });

    it("should emitted close event if button is clicked", async () => {
        const wrapper = shallowMount(Table, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                computed: {
                    clickCoord: () => []
                },
                store: new Vuex.Store({
                    namespaced: true,
                    modules: {
                        MapMarker: {
                            namespaced: true,
                            actions: {
                                removePointMarker: sinon.stub(),
                                placingPointMarker: sinon.stub()
                            }
                        }
                    }
                }),
                localVue
            }),
            button = wrapper.find("span.glyphicon-remove");

        await button.trigger("click");
        expect(wrapper.emitted()).to.have.property("close");
        expect(wrapper.emitted().close).to.have.lengthOf(1);
    });

    it("should not emitted close event if clicked inside the content", async () => {
        const wrapper = shallowMount(Table, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                computed: {
                    clickCoord: () => []
                },
                store: new Vuex.Store({
                    namespaced: true,
                    modules: {
                        MapMarker: {
                            namespaced: true,
                            actions: {
                                removePointMarker: sinon.stub(),
                                placingPointMarker: sinon.stub()
                            }
                        }
                    }
                }),
                localVue
            }),
            modal = wrapper.find(".gfi-content");

        await modal.trigger("click");
        expect(wrapper.emitted()).to.not.have.property("close");
        expect(wrapper.emitted()).to.be.empty;
    });

    it("should rotates the gfi by 90 degrees if 'rotate-button' is clicked", async () => {
        const wrapper = shallowMount(Table, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                computed: {
                    clickCoord: () => []
                },
                store: new Vuex.Store({
                    namespaced: true,
                    modules: {
                        MapMarker: {
                            namespaced: true,
                            actions: {
                                removePointMarker: sinon.stub(),
                                placingPointMarker: sinon.stub()
                            }
                        }
                    }
                }),
                localVue
            }),
            button = wrapper.find("span.icon-turnarticle");

        await button.trigger("click");
        expect(wrapper.vm.rotateAngle).to.be.equal(-90);
    });

    it("should rotates the gfi to the starting position if 'rotate-button' clicked four times", async () => {
        const wrapper = shallowMount(Table, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                computed: {
                    clickCoord: () => []
                },
                store: new Vuex.Store({
                    namespaced: true,
                    modules: {
                        MapMarker: {
                            namespaced: true,
                            actions: {
                                removePointMarker: sinon.stub(),
                                placingPointMarker: sinon.stub()
                            }
                        }
                    }
                }),
                localVue
            }),
            button = wrapper.find("span.icon-turnarticle");

        await button.trigger("click");
        await button.trigger("click");
        await button.trigger("click");
        await button.trigger("click");
        expect(wrapper.vm.rotateAngle).to.be.equal(0);
    });

    it("should render the footer slot within .gfi-footer", () => {
        const wrapper = shallowMount(Table, {
                propsData: {
                    feature: {
                        getTheme: () => "Default",
                        getMimeType: () => "text/xml",
                        getTitle: () => "Hallo"
                    }
                },
                slots: {
                    footer: "<div>Footer</div>"
                },
                computed: {
                    clickCoord: () => []
                },
                store: new Vuex.Store({
                    namespaced: true,
                    modules: {
                        MapMarker: {
                            namespaced: true,
                            actions: {
                                removePointMarker: sinon.stub(),
                                placingPointMarker: sinon.stub()
                            }
                        }
                    }
                }),
                localVue
            }),
            footer = wrapper.find(".gfi-footer");

        expect(footer.text()).to.be.equal("Footer");
    });

});
