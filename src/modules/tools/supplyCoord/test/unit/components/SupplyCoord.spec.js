import Vuex from "vuex";
import * as crs from "masterportalAPI/src/crs";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SupplyCoordComponent from "../../../components/SupplyCoord.vue";
import SupplyCoord from "../../../store/indexSupplyCoord";
import {expect} from "chai";
import sinon from "sinon";

const localVue = createLocalVue(),
    namedProjections = [
        ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
        ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
        ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
    ];

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("SupplyCoord.vue", () => {
    const mockMapGetters = {
            map: () => sinon.stub(),
            projection: () => sinon.stub(),
            mouseCoord: () => sinon.stub()
        },
        mockMapActions = {
            addPointerMoveHandler: sinon.stub(),
            removePointerMoveHandler: sinon.stub(),
            removeInteraction: sinon.stub(),
            addInteraction: sinon.stub()
        },
        mockMapMutations = {
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            coord:
                            {
                                "name": "translate#common:menu.tools.coord",
                                "glyphicon": "glyphicon-screenshot"
                            }
                        }
                    }
                }
            }
        };
    let store,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        SupplyCoord
                    }
                },
                Map: {
                    namespaced: true,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
        crs.registerProjections(namedProjections);
    });

    it("renders SupplyCoord", () => {
        store.commit("Tools/SupplyCoord/setActive", true);
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        expect(wrapper.find("#supply-coord").exists()).to.be.true;
    });

    it("not renders SupplyCoord", () => {
        store.commit("Tools/SupplyCoord/setActive", false);
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        expect(wrapper.find("#supply-coord").exists()).to.be.false;
    });

    it("has initially selected projection \"EPSG:25832\"", async () => {
        let options = null,
            selected = null;

        store.commit("Tools/SupplyCoord/setActive", true);
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equal(namedProjections.length);

        selected = options.filter(o => o.attributes().selected === "true");
        expect(selected.length).to.equal(1);
        expect(selected.at(0).attributes().value).to.equal("EPSG:25832");
    });
    it("method close sets active to false", async () => {
        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        wrapper.vm.close();
        await wrapper.vm.$nextTick();

        expect(store.state.Tools.SupplyCoord.active).to.be.false;
        expect(wrapper.find("#ssupply-coord").exists()).to.be.false;
    });
    it("method selectionChanged sets currentSelection", async () => {
        const value = "EPSG:25832",
            event = {
                target: {
                    value: value
                }
            };

        wrapper = shallowMount(SupplyCoordComponent, {store, localVue});

        wrapper.vm.selectionChanged(event);

        expect(store.state.Tools.SupplyCoord.currentSelection).to.be.equals(value);
    });

});
