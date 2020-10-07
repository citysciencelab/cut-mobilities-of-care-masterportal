import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Bildungsatlas from "../../components/Bildungsatlas.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/bildungsatlas/components/Bildungsatlas.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(Bildungsatlas, {
            propsData: {
                feature: {
                    getProperties () {
                        return {};
                    },
                    getGfiFormat () {
                        return {
                            gfiSubTheme: "gfiSubTheme"
                        };
                    }
                }
            },
            localVue
        });
    });

    describe("fixDataBug", () => {
        it("should change a value -0.0001 to 0", () => {
            expect(wrapper.vm.fixDataBug(-0.0001)).to.equal(0);
            expect(wrapper.vm.fixDataBug("-0.0001")).to.equal(0);
        });
        it("should let anything but -0.0001 as it is", () => {
            expect(wrapper.vm.fixDataBug(0.0001)).to.equal(0.0001);
            expect(wrapper.vm.fixDataBug("0.0001")).to.equal("0.0001");
            expect(wrapper.vm.fixDataBug(undefined)).to.equal(undefined);
            expect(wrapper.vm.fixDataBug(null)).to.equal(null);
            expect(wrapper.vm.fixDataBug("string")).to.equal("string");
        });
    });
    describe("getValueForBildungsatlas", () => {
        it("should return *g.F. if the value is null", () => {
            expect(wrapper.vm.getValueForBildungsatlas(null)).to.equal("*g.F.");
        });
        it("should return a number with thousandsSeparator and two decimal places by default", () => {
            expect(wrapper.vm.getValueForBildungsatlas(123456.789)).to.equal("123.456,79");
        });
        it("should return a negative number with thousandsSeparator and two decimal places by default", () => {
            expect(wrapper.vm.getValueForBildungsatlas(-123456.789)).to.equal("-123.456,79");
        });
        it("should return a number with thousandsSeparator and two decimal places followed by a % sign", () => {
            expect(wrapper.vm.getValueForBildungsatlas(123456.789, true)).to.equal("123.456,79%");
        });
        it("should return a number with thousandsSeparator and no decimal places", () => {
            expect(wrapper.vm.getValueForBildungsatlas(123456.789, false, 0)).to.equal("123.457");
        });
        it("should return a number with thousandsSeparator and no decimal places followed by a % sign", () => {
            expect(wrapper.vm.getValueForBildungsatlas(123456.789, true, 0)).to.equal("123.457%");
        });
        it("should remove zeros from the end of the decimal places", () => {
            expect(wrapper.vm.getValueForBildungsatlas(123456.701, true, 2)).to.equal("123.456,7%");
        });
    });
    describe("setActiveTab", () => {
        it("should set the internal value for activeTab", () => {
            wrapper.vm.activeTab = "nothing";
            wrapper.vm.setActiveTab("activeTab");
            expect(wrapper.vm.activeTab).to.equal("activeTab");
        });
    });
    describe("isActiveTab", () => {
        it("should check the internal value of activeTab", () => {
            wrapper.vm.setActiveTab("activeTab");

            expect(wrapper.vm.isActiveTab("activeTab")).to.be.true;
            expect(wrapper.vm.isActiveTab("something else")).to.be.false;
        });
    });

    describe("created", () => {
        it("should set the internal value of gfiSubTheme to the value found in the feature", () => {
            expect(wrapper.vm.gfiSubTheme).to.equal("gfiSubTheme");
        });
    });
    describe("nav-pills", () => {
        it("should initialize with a nav pill for data", () => {
            const dataTab = wrapper.find(".nav-pills").findAll("li").at(0).find("a");

            expect(dataTab.text()).to.equal("Daten");
        });
        it("should initialize with a nav pill for info", () => {
            const dataTab = wrapper.find(".nav-pills").findAll("li").at(1).find("a");

            expect(dataTab.text()).to.equal("Info");
        });
        it("should initialize active tab with value 'data'", () => {
            expect(wrapper.vm.activeTab).to.equal("data");
        });
        it("should switch the active tab if the info nav button is clicked", async () => {
            const infoTab = wrapper.find(".nav-pills").findAll("li").at(1).find("a");

            await infoTab.trigger("click");
            expect(wrapper.vm.activeTab).to.equal("info");
        });
        it("should switch back to 'data' if the data nav button is clicked", async () => {
            const infoTab = wrapper.find(".nav-pills").findAll("li").at(0).find("a");

            wrapper.vm.activeTab = "something";
            await infoTab.trigger("click");
            expect(wrapper.vm.activeTab).to.equal("data");
        });
    });
    describe("components", () => {
        it("should find the child component BildungsatlasBarchart", () => {
            const singleTestWrapper = shallowMount(Bildungsatlas, {
                propsData: {
                    feature: {
                        getProperties () {
                            return {};
                        },
                        getGfiFormat () {
                            return {
                                gfiSubTheme: "BildungsatlasBarchart"
                            };
                        }
                    }
                },
                localVue
            });

            expect(singleTestWrapper.findComponent({name: "BildungsatlasBarchart"}).exists()).to.be.true;
        });
    });

    describe("components", () => {
        it("should find the child component BildungsatlasSchulenWohnort", () => {
            const singleTestWrapper = shallowMount(Bildungsatlas, {
                propsData: {
                    feature: {
                        getProperties () {
                            return {};
                        },
                        getGfiFormat () {
                            return {
                                gfiSubTheme: "BildungsatlasSchulenWohnort"
                            };
                        }
                    }
                },
                localVue
            });

            expect(singleTestWrapper.findComponent({name: "BildungsatlasSchulenWohnort"}).exists()).to.be.true;
        });
    });

    describe("components", () => {
        it("should find the child component BildungsatlasSchulenEinzugsgebiete", () => {
            const singleTestWrapper = shallowMount(Bildungsatlas, {
                propsData: {
                    feature: {
                        getProperties () {
                            return {};
                        },
                        getGfiFormat () {
                            return {
                                gfiSubTheme: "BildungsatlasSchulenEinzugsgebiete"
                            };
                        }
                    }
                },
                localVue
            });

            expect(singleTestWrapper.findComponent({name: "BildungsatlasSchulenEinzugsgebiete"}).exists()).to.be.true;
        });
    });
});
