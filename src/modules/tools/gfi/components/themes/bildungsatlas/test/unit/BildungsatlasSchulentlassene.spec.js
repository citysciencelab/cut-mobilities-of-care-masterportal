import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import BildungsatlasSchulentlassene from "../../components/BildungsatlasSchulentlassene.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/bildungsatlas/components/BildungsatlasSchulentlassene.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(BildungsatlasSchulentlassene, {
            propsData: {
                feature: {
                    getGfiFormat () {
                        return {
                            gfiSubTheme: "BildungsatlasSchulentlassene",
                            gfiBildungsatlasFormat: {
                                layerType: "stadtteil",
                                themeType: "Abi"
                            }
                        };
                    },
                    getProperties () {
                        return {
                            B_Name: "Eimsbüttel",
                            B_Nr: "3",
                            Bezirk_Nr: "3",
                            C12_SuS: 1132,
                            C12_SuS_B: "8443",
                            C12_SuS_FHH: "64611",
                            C32_GY: 58.5457,
                            C32_GY_B: "56.9849",
                            C32_GY_FHH: "45.638",
                            C32_SO: 1.5742,
                            C32_SO_B: "1.6721",
                            C32_SO_FHH: "2.8813",
                            C32_STS: 36.5067,
                            C32_STS_B: "40.0425",
                            C32_STS_FHH: "51.0108",
                            C32_SuS: 1334,
                            C32_SuS_B: "11303",
                            C32_SuS_FHH: "92596",
                            C41_Abi: 65.0943,
                            C41_Abi_2010: "60.38961039",
                            C41_Abi_2011: "61.988304094",
                            C41_Abi_2012: "77.205882353",
                            C41_Abi_2013: "68.1318681318681",
                            C41_Abi_2014: "66.8141592920354",
                            C41_Abi_2015: "63.4782608695652",
                            C41_Abi_2016: "65.0943",
                            C41_Abi_B: "64.9003",
                            C41_Abi_FHH: "57.2389",
                            C41_RS: "14.6226",
                            C41_RS_B: "15.1626",
                            C41_RS_FHH: "18.8876",
                            C41_mHS: "16.5094",
                            C41_mHS_B: "16.7366",
                            C41_mHS_FHH: "18.4652",
                            C41_oHS: 3.7736,
                            C41_oHS_2010: "4.5454545455",
                            C41_oHS_2011: "7.0175438596",
                            C41_oHS_2012: "1.4705882353",
                            C41_oHS_2013: "3.2967032967033",
                            C41_oHS_2014: "3.53982300884956",
                            C41_oHS_2015: "5.21739130434783",
                            C41_oHS_2016: "3.7736",
                            C41_oHS_B: "3.2004",
                            C41_oHS_FHH: "5.4083",
                            C42_Abi_2010: "25.24",
                            C42_Abi_2011: "27.57",
                            C42_Abi_2012: "26.22",
                            C42_Abi_2013: "28.75",
                            C42_Abi_2014: "33.05",
                            C42_Abi_2015: "31.03",
                            C42_Abi_2016: "28.79",
                            C42_ESA_2010: "5.16",
                            C42_ESA_2011: "7.28",
                            C42_ESA_2012: "3",
                            C42_ESA_2013: "5.1",
                            C42_ESA_2014: "8.32",
                            C42_ESA_2015: "5.1",
                            C42_ESA_2016: "7.3",
                            C42_MSA_2010: "9.5",
                            C42_MSA_2011: "6.5",
                            C42_MSA_2012: "4.24",
                            C42_MSA_2013: "6.96",
                            C42_MSA_2014: "6.35",
                            C42_MSA_2015: "10.2",
                            C42_MSA_2016: "6.47",
                            C42_oSA_2010: "1.9",
                            C42_oSA_2011: "3.12",
                            C42_oSA_2012: "0.5",
                            C42_oSA_2013: "1.39",
                            C42_oSA_2014: "1.75",
                            C42_oSA_2015: "2.55",
                            C42_oSA_2016: "1.67",
                            OBJECTID: 37,
                            ST_Name: "Lokstedt",
                            SR_Name: "Lokstedt-Nord",
                            ST_Nr: "305",
                            Stadtteil_Nr: "305",
                            fid: "Stadtteile_basis.36",
                            styling: "<75"
                        };
                    }
                },
                fixDataBug: value => value,
                getValueForBildungsatlas: value => "BA_TestVal_" + String(value),
                isActiveTab: value => value
            },
            localVue
        });
    });

    describe("createDataForTable", () => {
        it("should create an object for the table with the given properties for Abi & stadtteil", () => {
            const properties = wrapper.vm.feature.getProperties(),
                themeType = "Abi",
                layerType = "stadtteil",
                result = wrapper.vm.createDataForTable(themeType, layerType, properties),
                expected = {
                    titleRow: [
                        {title: "Abi/FH", desc: "Anteil der Schulentlassenen mit Abitur/Fachhochschulreife"},
                        {title: "MSA", desc: "Anteil der Schulentlassenen mit mittlerem Schulabschluss"},
                        {title: "ESA", desc: "Anteil der Schulentlassenen mit erstem allgemeinbildenden Schulabschluss"}
                    ],
                    dataRows: [
                        ["Lokstedt", "BA_TestVal_65.0943", "BA_TestVal_14.6226", "BA_TestVal_16.5094"],
                        ["Eimsbüttel", "BA_TestVal_64.9003", "BA_TestVal_15.1626", "BA_TestVal_16.7366"],
                        ["Hamburg", "BA_TestVal_57.2389", "BA_TestVal_18.8876", "BA_TestVal_18.4652"]
                    ]
                };

            expect(result).to.deep.equal(expected);
        });
        it("should create an object for the table with the given properties for Abi & sozialraum", () => {
            const properties = wrapper.vm.feature.getProperties(),
                themeType = "Abi",
                layerType = "sozialraum",
                result = wrapper.vm.createDataForTable(themeType, layerType, properties),
                expected = {
                    titleRow: [
                        {title: "Abi/FH", desc: "Anteil der Schulentlassenen mit Abitur/Fachhochschulreife"},
                        {title: "MSA", desc: "Anteil der Schulentlassenen mit mittlerem Schulabschluss"},
                        {title: "ESA", desc: "Anteil der Schulentlassenen mit erstem allgemeinbildenden Schulabschluss"}
                    ],
                    dataRows: [
                        ["Lokstedt-Nord", "BA_TestVal_65.0943", "BA_TestVal_14.6226", "BA_TestVal_16.5094"],
                        ["Eimsbüttel", "BA_TestVal_64.9003", "BA_TestVal_15.1626", "BA_TestVal_16.7366"],
                        ["Hamburg", "BA_TestVal_57.2389", "BA_TestVal_18.8876", "BA_TestVal_18.4652"]
                    ]
                };

            expect(result).to.deep.equal(expected);
        });
        it("should create an object for the table with the given properties for oHS & stadtteil", () => {
            const properties = wrapper.vm.feature.getProperties(),
                themeType = "oHS",
                layerType = "stadtteil",
                result = wrapper.vm.createDataForTable(themeType, layerType, properties),
                expected = {
                    titleRow: [
                        {title: "oSA", desc: "Anteil der Schulentlassenen ohne ersten allgemeinbildenden Schulabschluss"},
                        {title: "ESA", desc: "Anteil der Schulentlassenen mit erstem allgemeinbildenden Schulabschluss"},
                        {title: "MSA", desc: "Anteil der Schulentlassenen mit mittlerem Schulabschluss"}
                    ],
                    dataRows: [
                        ["Lokstedt", "BA_TestVal_3.7736", "BA_TestVal_16.5094", "BA_TestVal_14.6226"],
                        ["Eimsbüttel", "BA_TestVal_3.2004", "BA_TestVal_16.7366", "BA_TestVal_15.1626"],
                        ["Hamburg", "BA_TestVal_5.4083", "BA_TestVal_18.4652", "BA_TestVal_18.8876"]
                    ]
                };

            expect(result).to.deep.equal(expected);
        });
        it("should create an object for the table with the given properties for oHS & sozialraum", () => {
            const properties = wrapper.vm.feature.getProperties(),
                themeType = "oHS",
                layerType = "sozialraum",
                result = wrapper.vm.createDataForTable(themeType, layerType, properties),
                expected = {
                    titleRow: [
                        {title: "oSA", desc: "Anteil der Schulentlassenen ohne ersten allgemeinbildenden Schulabschluss"},
                        {title: "ESA", desc: "Anteil der Schulentlassenen mit erstem allgemeinbildenden Schulabschluss"},
                        {title: "MSA", desc: "Anteil der Schulentlassenen mit mittlerem Schulabschluss"}
                    ],
                    dataRows: [
                        ["Lokstedt-Nord", "BA_TestVal_3.7736", "BA_TestVal_16.5094", "BA_TestVal_14.6226"],
                        ["Eimsbüttel", "BA_TestVal_3.2004", "BA_TestVal_16.7366", "BA_TestVal_15.1626"],
                        ["Hamburg", "BA_TestVal_5.4083", "BA_TestVal_18.4652", "BA_TestVal_18.8876"]
                    ]
                };

            expect(result).to.deep.equal(expected);
        });
    });
    describe("createDataBarchart", () => {
        it("should create chartjs data for the barchart for themeType Abi", () => {
            const properties = wrapper.vm.feature.getProperties(),
                themeType = "Abi",
                result = wrapper.vm.createDataBarchart(themeType, properties),
                expected = {
                    labels: ["2010", "2011", "2012", "2013", "2014", "2015", "2016"],
                    datasets: [{
                        // test fixed color values for customer
                        backgroundColor: "#d76629",
                        hoverBackgroundColor: "#337ab7",
                        borderWidth: 0,
                        data: [
                            "60.38961039",
                            "61.988304094",
                            "77.205882353",
                            "68.1318681318681",
                            "66.8141592920354",
                            "63.4782608695652",
                            "65.0943"
                        ]
                    }]
                };

            expect(result).to.deep.equal(expected);
        });
        it("should create chartjs data for the barchart for themeType oHS", () => {
            const properties = wrapper.vm.feature.getProperties(),
                themeType = "oHS",
                result = wrapper.vm.createDataBarchart(themeType, properties),
                expected = {
                    labels: ["2010", "2011", "2012", "2013", "2014", "2015", "2016"],
                    datasets: [{
                        // test fixed color values for customer
                        backgroundColor: "#d76629",
                        hoverBackgroundColor: "#337ab7",
                        borderWidth: 0,
                        data: [
                            "4.5454545455",
                            "7.0175438596",
                            "1.4705882353",
                            "3.2967032967033",
                            "3.53982300884956",
                            "5.21739130434783",
                            "3.7736"
                        ]
                    }]
                };

            expect(result).to.deep.equal(expected);
        });
    });
    describe("createDataLinechart", () => {
        it("should create chartjs data for the linechart with the given colors", () => {
            const properties = wrapper.vm.feature.getProperties(),
                result = wrapper.vm.createDataLinechart(properties),
                expected = {
                    labels: ["2010", "2011", "2012", "2013", "2014", "2015", "2016"],
                    datasets: [
                        {
                            label: "Abi/FH: Abitur/Fachhochschulreife",
                            data: ["25.24", "27.57", "26.22", "28.75", "33.05", "31.03", "28.79"],
                            backgroundColor: "#d73027",
                            borderColor: "#d73027",
                            spanGaps: false,
                            fill: false,
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 4,
                            lineTension: 0
                        },
                        {
                            label: "MSA: mittlerer Schulabschluss",
                            data: ["9.5", "6.5", "4.24", "6.96", "6.35", "10.2", "6.47"],
                            backgroundColor: "#542788",
                            borderColor: "#542788",
                            spanGaps: false,
                            fill: false,
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 4,
                            lineTension: 0
                        },
                        {
                            label: "ESA: erster allgemeinbildender Schulabschluss",
                            data: ["5.16", "7.28", "3", "5.1", "8.32", "5.1", "7.3"],
                            backgroundColor: "#fc8d59",
                            borderColor: "#fc8d59",
                            spanGaps: false,
                            fill: false,
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 4,
                            lineTension: 0
                        },
                        {
                            label: "oSA: ohne ersten allgemeinbildenden Schulabschluss",
                            data: ["1.9", "3.12", "0.5", "1.39", "1.75", "2.55", "1.67"],
                            backgroundColor: "#91bfdb",
                            borderColor: "#91bfdb",
                            spanGaps: false,
                            fill: false,
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 4,
                            lineTension: 0
                        },
                        {
                            label: "Anzahl aller Schulentlassenen",
                            data: ["41.80", "44.47", "33.96", "42.20", "49.47", "48.88", "44.23"],
                            backgroundColor: "#337ab7",
                            borderColor: "#337ab7",
                            spanGaps: false,
                            fill: false,
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 4,
                            lineTension: 0
                        }
                    ]
                };

            expect(result).to.deep.equal(expected);
        });
    });
});

