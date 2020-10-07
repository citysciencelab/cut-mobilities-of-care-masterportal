import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import BildungsatlasSchulenEinzugsgebiete from "../../components/BildungsatlasSchulenEinzugsgebiete";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/bildungsatlas/components/BildungsatlasSchulenEinzugsgebiete.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(BildungsatlasSchulenEinzugsgebiete, {
            propsData: {
                feature: {
                    getProperties () {
                        return {
                            "C_S_HNr": "18",
                            "C_S_Name": "Katharinenschule in der Hafencity",
                            "C_S_Nr": 5101,
                            "C_S_Ort": "Hamburg",
                            "C_S_PLZ": "20457",
                            "C_S_SI": "4",
                            "C_S_Str": "Am Dalmannkai",
                            "C_S_SuS_ES": "41",
                            "C_S_SuS_PS": "256",
                            "C_S_SuS_S1": "0",
                            "C_S_SuS_S2": "0",
                            "extent": [565905.6000007964, 5933033.59994271, 565905.6000007964, 5933033.59994271],
                            "schoolKey": "primarySchoolsInArea",
                            "styling": "grundschule"
                        };
                    },
                    getGfiFormat () {
                        return {
                            gfiSubTheme: "BildungsatlasSchoolCatchmentArea"
                        };
                    }
                },
                isActiveTab: () => "data"
            },
            computed: {
                isMobile: () => false
            },
            localVue
        });
    });

    describe("parseGfiContent should parse testdata correctly", () => {
        it("should ignore missing values using defaults", () => {
            wrapper.vm.parseGfiContent({"allProperties": {}});
            expect(wrapper.vm.id).to.have.string("");
            expect(wrapper.vm.name).to.have.string("");
            expect(wrapper.vm.address).to.have.string("");
            expect(wrapper.vm.countStudents).to.have.string("");
            expect(wrapper.vm.countStudentsPrimary).to.have.string("");
            expect(wrapper.vm.countStudentsSecondary).to.have.string("");
            expect(wrapper.vm.socialIndex).to.have.string("");
            expect(wrapper.vm.schoolKey).to.have.string("");
        });
        it("should set all given values", () => {
            expect(wrapper.vm.id).to.equal(String(wrapper.vm.getProperties.C_S_Nr));
            expect(wrapper.vm.name).to.equal(wrapper.vm.getProperties.C_S_Name);
            expect(wrapper.vm.address).to.equal(wrapper.vm.getProperties.C_S_Str + " " + wrapper.vm.getProperties.C_S_HNr + ", " + wrapper.vm.getProperties.C_S_PLZ + " " + wrapper.vm.getProperties.C_S_Ort);
            expect(wrapper.vm.countStudents).to.equal(String(parseInt(wrapper.vm.getProperties.C_S_SuS_PS, 10) + parseInt(wrapper.vm.getProperties.C_S_SuS_S1, 10)));
            expect(wrapper.vm.countStudentsPrimary).to.equal(wrapper.vm.getProperties.C_S_SuS_PS);
            expect(wrapper.vm.countStudentsSecondary).to.equal(wrapper.vm.getProperties.C_S_SuS_S1);
            expect(wrapper.vm.socialIndex).to.equal(wrapper.vm.getProperties.C_S_SI);
            expect(wrapper.vm.schoolKey).to.equal(wrapper.vm.getProperties.schoolKey);
        });
    });

    describe("getText", () => {
        it("should calculate correct proportion and return text", () => {
            expect(wrapper.vm.getText(5, 100)).to.have.string("Anteil 5% (Anzahl: 5)");
        });
        it("should calculate correct proportion and return text", () => {
            expect(wrapper.vm.getText(1, 489)).to.have.string("Anteil 1% (Anzahl: 5)");
        });
    });

    describe("getCategory", () => {
        it("should return correct categories", () => {
            expect(wrapper.vm.getCategory(-2)).to.have.string("<5");
            expect(wrapper.vm.getCategory(8)).to.have.string("<10");
            expect(wrapper.vm.getCategory(14)).to.have.string("<15");
            expect(wrapper.vm.getCategory(30)).to.have.string(">=30");
            expect(wrapper.vm.getCategory(31)).to.have.string(">=30");
        });
    });

    describe("getEinzugsgebieteLayer", () => {
        it("should return false", () => {
            expect(wrapper.vm.getEinzugsgebieteLayer()).to.be.false;
        });
    });

    describe("getStatisticAreasLayer", () => {
        it("should return false", () => {
            expect(wrapper.vm.getStatisticAreasLayer()).to.be.false;
        });
    });

    describe("getStatisticAreasConfig", () => {
        it("should return false", () => {
            expect(wrapper.vm.getStatisticAreasConfig()).to.be.false;
        });
    });
});
