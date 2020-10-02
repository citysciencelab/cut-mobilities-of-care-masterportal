import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import BildungsatlasStandorte from "../../components/BildungsatlasStandorte.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/bildungsatlas/components/BildungsatlasStandorte.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(BildungsatlasStandorte, {
            propsData: {
                feature: {
                    getProperties () {
                        return {
                            C_PrSt: "PrSt",
                            C_S_GTA: "GTS  mit Träger",
                            C_S_HNr: 38,
                            C_S_HomP: "http://www.schuleamsee-hamburg.de",
                            C_S_Name: "Schule am See",
                            C_S_Nr: 5075,
                            C_S_Nrvoll: "5075-0",
                            C_S_Ort: "Hamburg",
                            C_S_PLZ: 22309,
                            C_S_SF: "STS",
                            C_S_SF_Sta: "STS",
                            C_S_SG: 64001,
                            C_S_SI: 2,
                            C_S_Status: "staatl.",
                            C_S_Str: "Borchertring",
                            C_S_SuS: 405,
                            C_S_SuS_ES: 18,
                            C_S_SuS_PS: 140,
                            C_S_SuS_S1: 247,
                            C_S_SuS_S2: 0,
                            C_S_Traeg: null,
                            C_S_Zw_Nr: 0,
                            C_S_Zweig: "ja",
                            HNr_Haupts: 38,
                            PLZ_Haupts: 22309,
                            S_UTM_x: 570287.62,
                            S_UTM_y: 5941488.55,
                            SchPu_PrSt: 0,
                            SchPu_Sek: 0,
                            SchPu_beso: null,
                            Schule_ES: 18,
                            Schule_PS: 140,
                            Schule_S1: 298,
                            Schule_S2: 0,
                            Schule_SuS: 456,
                            Str_Haupts: "Borchertring",
                            fid: "C_Schulen_2017_pr_alle_neu.28",
                            styling: "default"
                        };
                    },
                    getGfiFormat () {
                        return {
                            gfiSubTheme: "BildungsatlasStandorte",
                            gfiBildungsatlasFormat: {
                                themeType: "5"
                            }
                        };
                    }
                },
                fixDataBug: value => value,
                getValueForBildungsatlas: value => "BA_Val_" + value,
                isActiveTab: value => value
            },
            localVue
        });
    });

    describe("template - header", () => {
        it("should create html with the expected school name as table title", () => {
            expect(wrapper.find(".tableStandort").findAll("th").at(0).text().trim()).to.equal("Schule am See");
        });
        it("should create html with the expected address", () => {
            expect(wrapper.find(".tableStandort").findAll("td").at(0).findAll("span").at(0).text()).to.equal("Borchertring 38");
            expect(wrapper.find(".tableStandort").findAll("td").at(0).findAll("span").at(1).text()).to.equal("22309 Hamburg");
        });
        it("should create html with the expected website as link with target _blank", () => {
            const aTag = wrapper.find(".tableWebsite").findAll("td").at(1).find("a");

            expect(aTag.attributes("href")).to.equal("http://www.schuleamsee-hamburg.de");
            expect(aTag.attributes("target")).to.equal("_blank");
            expect(aTag.text().trim()).to.equal("http://www.schuleamsee-hamburg.de");
        });
    });

    describe("template - render html with the exepcted data in the table", () => {
        it("should place Soziallindex", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(1).findAll("td").at(0).text()).to.equal("Sozialindex");
            expect(trList.at(1).findAll("td").at(1).text()).to.equal("2");
        });
        it("should place Schwerpunktschule", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(2).findAll("td").at(0).text()).to.equal("Schwerpunktschule");
            expect(trList.at(2).findAll("td").at(1).text()).to.equal("nein");
        });
        it("should place Schule mit Zweigstelle", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(3).findAll("td").at(0).text()).to.equal("Schule mit Zweigstelle");
            expect(trList.at(3).findAll("td").at(1).text()).to.equal("ja");
        });
        it("should place Schule mit Vorschulklasse", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(4).findAll("td").at(0).text()).to.equal("Schule mit Vorschulklasse");
            expect(trList.at(4).findAll("td").at(1).text()).to.equal("ja");
        });
        it("should place Schule mit Ganztagesangebot", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(5).findAll("td").at(0).text()).to.equal("Schule mit Ganztagesangebot");
            expect(trList.at(5).findAll("td").at(1).text()).to.equal("ja");
        });
        it("should place Anzahl Schüler am Standort", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(6).findAll("td").at(0).text()).to.equal("Anzahl Schüler am Standort");
            expect(trList.at(6).findAll("td").at(1).text()).to.equal("BA_Val_387");
        });
        it("should place davon in der Primarstufe", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(7).findAll("td").at(0).text()).to.equal("davon in der Primarstufe");
            expect(trList.at(7).findAll("td").at(0).attributes("class")).to.equal("sublist");
            expect(trList.at(7).findAll("td").at(1).text()).to.equal("BA_Val_140");
        });
        it("should place davon in der Sekundarstufe I", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(8).findAll("td").at(0).text()).to.equal("davon in der Sekundarstufe I");
            expect(trList.at(8).findAll("td").at(0).attributes("class")).to.equal("sublist");
            expect(trList.at(8).findAll("td").at(1).text()).to.equal("BA_Val_247");
        });
        it("should place davon in der Sekundarstufe II", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(9).findAll("td").at(0).text()).to.equal("davon in der Sekundarstufe II");
            expect(trList.at(9).findAll("td").at(0).attributes("class")).to.equal("sublist");
            expect(trList.at(9).findAll("td").at(1).text()).to.equal("BA_Val_0");
        });
        it("should place Gesamtanzahl der Schüler an allen Standorten", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(10).findAll("td").at(0).text()).to.equal("Gesamtanzahl der Schüler an allen Standorten");
            expect(trList.at(10).findAll("td").at(1).text()).to.equal("BA_Val_456");
        });
        it("should place davon in der Primarstufe", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(11).findAll("td").at(0).text()).to.equal("davon in der Primarstufe");
            expect(trList.at(11).findAll("td").at(0).attributes("class")).to.equal("sublist");
            expect(trList.at(11).findAll("td").at(1).text()).to.equal("BA_Val_140");
        });
        it("should place davon in der Sekundarstufe I", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(12).findAll("td").at(0).text()).to.equal("davon in der Sekundarstufe I");
            expect(trList.at(12).findAll("td").at(0).attributes("class")).to.equal("sublist");
            expect(trList.at(12).findAll("td").at(1).text()).to.equal("BA_Val_298");
        });
        it("should place davon in der Sekundarstufe II", () => {
            const trList = wrapper.find(".tableStandort").find("tbody").findAll("tr");

            expect(trList.at(13).findAll("td").at(0).text()).to.equal("davon in der Sekundarstufe II");
            expect(trList.at(13).findAll("td").at(0).attributes("class")).to.equal("sublist");
            expect(trList.at(13).findAll("td").at(1).text()).to.equal("BA_Val_0");
        });
    });
});
