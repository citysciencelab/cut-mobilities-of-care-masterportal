import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import Flaecheninfo from "../../../components/Flaecheninfo.vue";

const localVue = createLocalVue();

localVue.use(Vuex);
describe("src/modules/tools/gfi/components/themes/flaecheninfo/components/Flaecheninfo.vue", () => {

    const ring = "POLYGON ((563096.043 5933356.232,563096.639 5933358.031,563097.273 5933356.634,563096.043 5933356.232))",
        props = {"flurstueck": "aValue", "gemarkung": "bValue", "amtliche_flaeche": "10", "wktgeom": ring},
        mappedProps = {"Flurstück": "aValue", "Gemarkung": "bValue", "Fläche_qm": "10", "Umringspolygon": ring},
        wrapper = shallowMount(Flaecheninfo, {
            propsData: {
                feature: {
                    getProperties: () => props,
                    getMappedProperties: () => mappedProps
                }
            },
            computed: {
                setShowMarker: () => sinon.stub
            },
            methods: {
                createReport: () => {
                    report = true;
                }
            },
            localVue
        });
    let report = false;

    it("should exist", () => {
        wrapper.vm.filterPropsAndHighlightRing();
        expect(wrapper.findAll("#flaecheninfo").at(0).exists()).to.be.true;
    });

    it("should contain gfi attributes", () => {
        wrapper.vm.filterPropsAndHighlightRing();
        expect(wrapper.findAll("td").at(0).text()).to.equal("Flurstück");
        expect(wrapper.findAll("td").at(1).text()).to.equal("aValue");
        expect(wrapper.findAll("td").at(2).text()).to.equal("Gemarkung");
        expect(wrapper.findAll("td").at(3).text()).to.equal("bValue");
        expect(wrapper.findAll("td").at(4).text()).to.equal("Fläche_qm");
        expect(wrapper.findAll("td").at(5).text()).to.equal("10");
    });

    it("should contain button that triggers report", async () => {
        let button = null;

        wrapper.vm.filterPropsAndHighlightRing();
        expect(report).to.be.false;
        button = wrapper.findAll("button").at(0);
        expect(button.exists()).to.be.true;
        button.trigger("click");
        await wrapper.vm.$nextTick();
        expect(report).to.be.true;

    });
    it("test method getCoordinates", () => {
        let result = wrapper.vm.getCoordinates(ring);

        expect(result).to.be.equal("563096.043 5933356.232 563096.639 5933358.031 563097.273 5933356.634 563096.043 5933356.232");
        result = wrapper.vm.getCoordinates(undefined);
        expect(result).to.be.equal("");
        result = wrapper.vm.getCoordinates(null);
        expect(result).to.be.equal("");
    });
    it("test method filterPropsAndHighlightRing", () => {
        wrapper.vm.filterPropsAndHighlightRing();
        expect(wrapper.vm.filteredProps).not.to.have.nested.property("Umringspolygon");
        expect(wrapper.vm.filteredProps).to.have.nested.property("Flurstück");
        expect(wrapper.vm.filteredProps).to.have.nested.property("Gemarkung");
        expect(wrapper.vm.filteredProps).to.have.nested.property("Fläche_qm");
    });


});
