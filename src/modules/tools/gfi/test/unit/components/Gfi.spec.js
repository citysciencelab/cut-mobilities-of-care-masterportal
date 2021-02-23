import Vuex from "vuex";
import {config, shallowMount, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import GfiComponent from "../../../components/Gfi.vue";
import Mobile from "../../../components/templates/Mobile.vue";
import moment from "moment";

const localVue = createLocalVue(),
    mockMutations = {
        setCurrentFeature: () => sinon.stub()
    },
    mockGetters = {
        desktopType: () => "",
        centerMapToClickPoint: () => sinon.stub(),
        active: () => true
    };

localVue.use(Vuex);
config.mocks.$t = key => key;

/**
 * Returns the store.
 * @returns {object} the store
 */
function getGfiStore () {
    return new Vuex.Store({
        namespaced: true,
        modules: {
            Tools: {
                namespaced: true,
                modules: {
                    Gfi: {
                        namespaced: true,
                        mutations: mockMutations,
                        getters: mockGetters
                    }
                }
            },
            Map: {
                namespaced: true,
                getters: {
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => sinon.stub()
                    }, {}],
                    size: sinon.stub(),
                    visibleLayerListWithChildrenFromGroupLayers: sinon.stub()
                }
            }
        },
        getters: {
            mobile: () => sinon.stub(),
            gfiWindow: () => "",
            isTableStyle: () => sinon.stub(),
            ignoredKeys: () => sinon.stub()
        }
    });
}


describe("src/modules/tools/gfi/components/Gfi.vue", () => {

    it("should find the child component Mobile", () => {
        const wrapper = shallowMount(GfiComponent, {store: getGfiStore, localVue});

        expect(wrapper.findComponent({name: "Mobile"}).exists()).to.be.true;
    });

    it("should find the child component Attached", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                isTable: () => false,
                desktopType: () => "attached",
                active: () => true,
                gfiFeatures: () => [{
                    getGfiUrl: () => null
                }],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "Attached"}).exists()).to.be.true;
    });

    it("should find the child component Detached", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                desktopType: () => "",
                active: () => true,
                isTable: () => false,
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub()
                }],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "Detached"}).exists()).to.be.true;
    });

    it("should find the child component Table", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                desktopType: () => "",
                active: () => true,
                isTable: () => true,
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub()
                }],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "Table"}).exists()).to.be.true;
    });

    it("no child component should be found if gfi is not activated", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                active: () => false,
                gfiFeatures: () => null,
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "Mobile"}).exists()).to.be.false;
        expect(wrapper.findComponent({name: "Detached"}).exists()).to.be.false;
    });

    it("no child component should be found if gfi has no features", () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => true,
                active: () => true,
                gfiFeatures: () => [],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.findComponent({name: "Mobile"}).exists()).to.be.false;
        expect(wrapper.findComponent({name: "Detached"}).exists()).to.be.false;
    });

    it("the close-event should call setGfiFeatures commit", async () => {
        const mockMapMutations = {
                setGfiFeatures: sinon.stub()
            },
            mockGfiMutations = {
                setCurrentFeature: sinon.stub()
            },
            mockGfiGetters = {
                desktopType: () => sinon.stub()
            },
            store = new Vuex.Store({
                modules: {
                    Map: {
                        namespaced: true,
                        mutations: mockMapMutations,
                        getters: {
                            gfiFeatures: () => [{
                                getTheme: () => "default",
                                getTitle: () => "Feature 1",
                                getMimeType: () => "text/html",
                                getGfiUrl: () => null,
                                getMappedProperties: () => null,
                                getAttributesToShow: () => sinon.stub(),
                                getProperties: () => {
                                    return {};
                                },
                                getlayerId: () => null,
                                getFeatures: () => sinon.stub()
                            }, {}],
                            mapSize: sinon.stub(),
                            visibleLayerListWithChildrenFromGroupLayers: sinon.stub()
                        }
                    },
                    Tools: {
                        namespaced: true,
                        modules: {
                            Gfi: {
                                namespaced: true,
                                mutations: mockGfiMutations,
                                getters: mockGfiGetters
                            }
                        }
                    }
                },
                getters: {
                    isMobile: () => sinon.stub(),
                    gfiWindow: () => "",
                    isTable: () => sinon.stub(),
                    ignoredKeys: () => sinon.stub()
                }
            }),
            wrapper = mount(GfiComponent, {
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                computed: {
                    isMobile: () => true,
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getProperties: () => sinon.stub()
                    },
                    {
                        getTheme: () => "default",
                        getTitle: () => "Hallo2",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getProperties: () => sinon.stub()
                    }],
                    mapSize: () => []
                },
                localVue,
                store
            });

        await wrapper.findComponent(Mobile).vm.$emit("close");
        expect(mockMapMutations.setGfiFeatures.calledOnce).to.be.true;
    });

    it("should set pagerIndex to zero if gfiFeatures change", () => {
        const wrapper = shallowMount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => false,
                active: () => true,
                mapSize: () => [],
                gfiFeatures: () => "Test"
            },
            store: getGfiStore,
            localVue
        });

        wrapper.vm.$options.watch.gfiFeatures.call(wrapper.vm, null);
        expect(wrapper.vm.pagerIndex).to.equal(0);
    });

    it("should display the footer", () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => sinon.stub()
                    },
                    {}],
                    mapSize: () => []
                },
                store,
                localVue
            });

        expect(wrapper.find(".pager-left").exists()).to.be.true;
        expect(wrapper.find(".pager-right").exists()).to.be.true;
    });

    it("should display the next feature if pager-right is clicked", async () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    desktopType: () => "",
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getMappedProperties: () => null,
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => sinon.stub()
                    },
                    {
                        getTheme: () => "default",
                        getTitle: () => "Feature 2",
                        getMimeType: () => "text/html",
                        getGfiUrl: () => null,
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getlayerId: () => null,
                        getFeatures: () => sinon.stub()
                    }],
                    mapSize: () => []
                },
                store,
                localVue
            });

        await wrapper.find(".pager-right").trigger("click");
        expect(wrapper.find(".modal-title").text()).to.equal("Feature 2");
    });

    it("should display the previous feature if pager-left is clicked", async () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    desktopType: () => "",
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getGfiUrl: () => null,
                        getMimeType: () => "text/html",
                        getAttributesToShow: () => sinon.stub(),
                        getMappedProperties: () => null,
                        getProperties: () => {
                            return {};
                        },
                        getFeatures: () => sinon.stub()
                    },
                    {
                        getTheme: () => "default",
                        getTitle: () => "Feature 2",
                        getGfiUrl: () => null,
                        getMimeType: () => "text/html",
                        getAttributesToShow: () => sinon.stub(),
                        getMappedProperties: () => null,
                        getProperties: () => {
                            return {};
                        },
                        getFeatures: () => sinon.stub()
                    }],
                    mapSize: () => []
                },
                store,
                localVue
            });

        wrapper.setData({pagerIndex: 1});
        await wrapper.find(".pager-left").trigger("click");
        expect(wrapper.find(".modal-title").text()).to.equal("Feature 1");
    });

    it("should disabled left pager if pagerIndex is zero", () => {
        const wrapper = mount(GfiComponent, {
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getAttributesToShow: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => sinon.stub(),
                    "attributesToShow": sinon.stub()
                },
                {}],
                mapSize: () => []
            },
            store: getGfiStore(),
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.true;
    });

    it("should enabled right pager if pagerIndex is zero", () => {
        const store = getGfiStore(),
            wrapper = mount(GfiComponent, {
                computed: {
                    isMobile: () => true,
                    desktopType: () => "",
                    active: () => true,
                    gfiFeatures: () => [{
                        getTheme: () => "default",
                        getTitle: () => "Feature 1",
                        getGfiUrl: () => null,
                        getMimeType: () => "text/html",
                        getAttributesToShow: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        },
                        getFeatures: () => sinon.stub()
                    },
                    {}],
                    mapSize: () => []
                },
                store,
                localVue
            });

        expect(wrapper.find(".pager-right").classes("disabled")).to.be.false;
    });

    it("should disabled right pager if pagerIndex === gfiFeatures.length - 1", () => {
        const wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{}, {
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getMappedProperties: () => null,
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => sinon.stub()
                }],
                mapSize: () => []
            },
            store: getGfiStore(),
            localVue
        });

        expect(wrapper.find(".pager-right").classes("disabled")).to.be.true;
    });

    it("should enable left pager if pagerIndex === gfiFeatures.length - 1", () => {
        const wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{}, {
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getMappedProperties: () => null,
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => sinon.stub()
                }],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.false;
    });


    it("should enable left pager and right pager if pagerIndex is between zero and gfiFeature.length - 1", () => {
        const wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            computed: {
                isMobile: () => true,
                desktopType: () => "",
                active: () => true,
                gfiFeatures: () => [{}, {
                    getTheme: () => "default",
                    getTitle: () => "Feature 1",
                    getGfiUrl: () => null,
                    getMimeType: () => "text/html",
                    getMappedProperties: () => null,
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: () => sinon.stub()
                }, {}],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        expect(wrapper.find(".pager-left").classes("disabled")).to.be.false;
        expect(wrapper.find(".pager-right").classes("disabled")).to.be.false;
    });

    it("should find a new detached component, if componentKey was changed", async () => {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => false,
                desktopType: () => "",
                active: () => true,
                isTable: () => false,
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    }
                }],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });
        let firstDetachedComponent = "",
            secondDetachedComponent = "";

        firstDetachedComponent = wrapper.findComponent({name: "Detached"});
        await wrapper.setData({componentKey: true});
        secondDetachedComponent = wrapper.findComponent({name: "Detached"});

        expect(firstDetachedComponent.exists()).to.be.false;
        expect(secondDetachedComponent.exists()).to.be.true;
    });

    describe("prepareGfiValue", function () {
        it("Should return the value of given key", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "bar";

            expect(wrapper.vm.prepareGfiValue(gfi, key)).to.equal("foo");
        });
        it("Should return the value of given key if key is an object path", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "@barfoo.firstLevel";

            expect(wrapper.vm.prepareGfiValue(gfi, key)).to.equal("foobar");
        });
        it("Should return undefined for key that is not in gfi", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "foobar";

            expect(wrapper.vm.prepareGfiValue(gfi, key)).to.be.undefined;
        });
        it("should return a value to a key regardless of upper and lower case", function () {
            const wrapper = shallowMount(GfiComponent, {store: getGfiStore, localVue}),
                gfi = {
                    Test1: "Test1 Value",
                    TEST2: "Test2 Value"
                },
                key1 = "Test1",
                key2 = "Test2",
                key3 = "TEST1";

            expect(wrapper.vm.prepareGfiValue(gfi, key1)).equals(gfi.Test1);
            expect(wrapper.vm.prepareGfiValue(gfi, key2)).equals(gfi.TEST2);
            expect(wrapper.vm.prepareGfiValue(gfi, key3)).equals(gfi.Test1);
        });
    });
    describe("getValueFromPath", function () {
        it("Should return object on firstLevel attribute", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: "foobar"
                    }
                },
                key = "@barfoo.firstLevel";

            expect(wrapper.vm.getValueFromPath(gfi, key)).to.equal("foobar");
        });
        it("Should return object on secondLevel attribute", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: "foobar"
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel";

            expect(wrapper.vm.getValueFromPath(gfi, key)).to.equal("foobar");
        });
        it("Should return object on secondLevel attribute and array position 1", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: ["foobar", "barfoo"]
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel.0";

            expect(wrapper.vm.getValueFromPath(gfi, key)).to.equal("foobar");
        });
        it("Should return object on secondLevel attribute and array position 2", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: ["foobar", "barfoo"]
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel.1";

            expect(wrapper.vm.getValueFromPath(gfi, key)).to.equal("barfoo");
        });
        it("Should return object on secondLevel attribute and object in array position 0", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                gfi = {
                    foo: "bar",
                    bar: "foo",
                    barfoo: {
                        firstLevel: {
                            secondLevel: [
                                {
                                    thirdLevel: "foobar"
                                }
                            ]
                        }
                    }
                },
                key = "@barfoo.firstLevel.secondLevel.0.thirdLevel";

            expect(wrapper.vm.getValueFromPath(gfi, key)).to.equal("foobar");
        });
    });
    describe("prepareGfiValueFromObject", function () {
        it("Should return value of attribute that starts with 'foo_' and append 'mySuffix'", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "foo_",
                obj = {
                    condition: "startsWith",
                    suffix: "mySuffix"
                },
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(wrapper.vm.prepareGfiValueFromObject(key, obj, gfi)).to.equal("foo_bar mySuffix");
        });
        it("Should return value of attribute that contains 'o_b' and convert it to date with default format", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "o_b",
                obj = {
                    condition: "contains",
                    type: "date"
                },
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "2020-04-14T11:00:00.000Z",
                    bar_foo: "bar_foo"
                },
                defaultFormat = "DD.MM.YYYY HH:mm:ss";

            expect(wrapper.vm.prepareGfiValueFromObject(key, obj, gfi)).to.equal(moment("2020-04-14T11:00:00.000Z").format(defaultFormat));
        });
        it("Should return value of attribute that contains 'o__b' and convert it to date with given format 'DD.MM.YYYY'", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "o_b",
                obj = {
                    condition: "contains",
                    type: "date",
                    format: "DD.MM.YYYY"
                },
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "2020-04-14T11:00:00.000Z",
                    bar_foo: "bar_foo"
                };

            expect(wrapper.vm.prepareGfiValueFromObject(key, obj, gfi)).to.equal("14.04.2020");
        });
    });
    describe("getValueFromCondition", function () {
        it("Sould return first key matching the contains condition", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "oo_",
                condition = "contains",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(wrapper.vm.getValueFromCondition(key, condition, gfi)).to.equal("foo_bar");
        });
        it("Sould return first key matching the startsWidth condition", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => [],
                        getProperties: () => sinon.stub()
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "bar",
                condition = "startsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(wrapper.vm.getValueFromCondition(key, condition, gfi)).to.equal("bar");
        });
        it("Sould return first key matching the startsWidth condition", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => []
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "bar_",
                condition = "startsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(wrapper.vm.getValueFromCondition(key, condition, gfi)).to.equal("bar_foo");
        });
        it("Sould return first key matching the endsWith condition", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => []
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "foo",
                condition = "endsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(wrapper.vm.getValueFromCondition(key, condition, gfi)).to.equal("foo");
        });
        it("Sould return first key matching the endsWith condition", function () {
            const wrapper = shallowMount(GfiComponent, {
                    computed: {
                        isMobile: () => true,
                        active: () => true,
                        gfiFeatures: () => [{
                            getGfiUrl: () => null,
                            getFeatures: () => sinon.stub()
                        }],
                        mapSize: () => []
                    },
                    store: getGfiStore,
                    localVue
                }),
                key = "_foo",
                condition = "endsWith",
                gfi = {
                    foo: "foo",
                    bar: "bar",
                    foo_bar: "foo_bar",
                    bar_foo: "bar_foo"
                };

            expect(wrapper.vm.getValueFromCondition(key, condition, gfi)).to.equal("bar_foo");
        });
    });
    describe("appendSuffix", function () {
        const wrapper = shallowMount(GfiComponent, {
            computed: {
                isMobile: () => true,
                active: () => true,
                gfiFeatures: () => [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub()
                }],
                mapSize: () => []
            },
            store: getGfiStore,
            localVue
        });

        it("Should leave string value as is, when suffix is undefined", function () {
            expect(wrapper.vm.appendSuffix("test1", undefined)).to.equal("test1");
        });
        it("Should leave number value as is, when suffix is undefined", function () {
            expect(wrapper.vm.appendSuffix(123, undefined)).to.equal(123);
        });
        it("Should leave float value as is, when suffix is undefined", function () {
            expect(wrapper.vm.appendSuffix(12.3, undefined)).to.equal(12.3);
        });
        it("Should leave boolean value as is, when suffix is undefined", function () {
            expect(wrapper.vm.appendSuffix(true, undefined)).to.be.true;
        });
        it("Should append suffix", function () {
            expect(wrapper.vm.appendSuffix("test1", "suffix")).to.equal("test1 suffix");
        });
        it("Should turn number value into string and append suffix", function () {
            expect(wrapper.vm.appendSuffix(123, "suffix")).to.equal("123 suffix");
        });
        it("Should turn float value into string and append suffix", function () {
            expect(wrapper.vm.appendSuffix(12.3, "suffix")).to.equal("12.3 suffix");
        });
        it("Should turn boolean value into string and append suffix", function () {
            expect(wrapper.vm.appendSuffix(true, "suffix")).to.equal("true suffix");
        });
    });
});
