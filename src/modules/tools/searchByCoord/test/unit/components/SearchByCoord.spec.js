import Vuex from "vuex";
import {expect} from "chai";
import {config, shallowMount, createLocalVue} from "@vue/test-utils";
import SearchByCoordComponent from "../../../components/SearchByCoord.vue";
import SearchByCoord from "../../../store/indexSearchByCoord";

const localVue = createLocalVue(),
    etrs89Coord = ["5935103,67", "564459.13"],
    etrs89ErrCoordNorthing = ["5935103,67", "qwertz"],
    etrs89ErrCoordEasting = ["qwertz", "564459.13"],
    wgs84Coord = ["9° 30` 50``", "53° 10' 55\""],
    wgs84ErrCoordNorthing = ["9° 59' 50", "qwertz"],
    wgs84ErrCoordEasting = ["qwertz", "53° 33` 25"],
    wgsDezimalCoord = ["53.5555°", "10,01234"],
    wgsDezimalErrCoordNorthing = ["53.5555°", "qwertz"],
    wgsDezimalErrCoordEasting = ["qwertz","10,01234"],
    undefCoord = [];

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/supplyCoord/components/SearchByCoord.vue", () => {
    const mockConfigJson = {
        Portalconfig: {
            menu: {
                tools: {
                    children: {
                        searchByCoord:
                            {
                                "name": "translate#common:menu.tools.searchByCoord",
                                "glyphicon": "glyphicon-record",
                                "renderToWindow": true
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
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        SearchByCoord
                    }
                },
                Map: {
                    namespaced: true
                }
            },
            state: {
                configJson: mockConfigJson
            }
        });
    });

    it("renders SearchByCoord", () => {
        store.commit("Tools/SearchByCoord/setActive", true);
        wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

        expect(wrapper.find("#search-by-coord").exists()).to.be.true;
    });

    it("not renders SearchByCoord", () => {
        store.commit("Tools/SearchByCoord/setActive", false);
        wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

        expect(wrapper.find("#search-by-coord").exists()).to.be.false;
    });
    describe("SearchByCoord.vue methods", () => {
        it("close sets active to false", async () => {
            wrapper = shallowMount(SearchByCoordComponent, {store, localVue});

            wrapper.vm.close();
            await wrapper.vm.$nextTick();

            expect(store.state.Tools.SearchByCoord.active).to.be.false;
            expect(wrapper.find("#supply-coord").exists()).to.be.false;
        });
        it("method validateInput validates the user-input", () => {
            const coordSystem = "EPSG:25832",
                coordinates = etrs89Coord;

            wrapper = shallowMount(SearchByCoordComponent, {store, localVue});
            wrapper.vm.setExample(coordSystem);
            expect(store.state.Tools.SearchByCoord.coordinatesEastingExample).to.be.equals("564459.13");
        });
    });
});
