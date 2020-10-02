import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import BildungsatlasSchulenWohnort from "../../components/BildungsatlasSchulenWohnort.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("src/modules/tools/gfi/components/themes/bildungsatlas/components/BildungsatlasSchulenWohnort.vue", () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(BildungsatlasSchulenWohnort, {
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
                },
                isActiveTab: () => "data"
            },
            computed: {
                isMobile: () => false
            },
            localVue
        });
    });

    describe("showAllFeatures", () => {
        it("should call showAllFeatures on a layer if layer is selected", () => {
            /** Class representing a layer */
            const layer = new class {
                /**
                 * constructor
                 */
                constructor () {
                    this.success = false;
                }

                /**
                 * gets specific test data
                 * @param {*} foo identifier for data to call
                 * @returns {Boolean}  -
                 */
                get (foo) {
                    if (foo === "isSelected") {
                        return true;
                    }
                    return false;
                }

                /**
                 * to be called function - sets this.success to true
                 * @pre this.success is something
                 * @post this.success is true
                 * @returns {Void}  -
                 */
                showAllFeatures () {
                    this.success = true;
                }
            }();

            wrapper.vm.showAllFeatures(layer);
            expect(layer.success).to.be.true;
        });
        it("should not call showAllFeatures on a layer if layer is not selected", () => {
            const layer = new class {
                /**
                 * constructor
                 */
                constructor () {
                    this.failed = false;
                }

                /**
                 * gets specific test data
                 * @param {*} foo identifier for data to call
                 * @returns {Boolean}  -
                 */
                get (foo) {
                    if (foo === "isSelected") {
                        return false;
                    }
                    return true;
                }

                /**
                 * to be called function - sets this.failed to true
                 * @pre this.failed is something
                 * @post this.failed is true
                 * @returns {Void}  -
                 */
                showAllFeatures () {
                    this.failed = true;
                }
            }();

            wrapper.vm.showAllFeatures(layer);
            expect(layer.failed).to.be.false;
        });
    });

    describe("showFeaturesByIds", () => {
        it("should call showFeaturesByIds with given String[] featureIds on a layer if layer is selected", () => {
            const featureIds = ["baz", "qux"],
                layer = new class {
                    /**
                     * constructor
                     */
                    constructor () {
                        this.success = false;
                    }

                    /**
                     * gets specific test data
                     * @param {*} foo identifier for data to call
                     * @returns {Boolean}  -
                     */
                    get (foo) {
                        if (foo === "isSelected") {
                            return true;
                        }
                        return false;
                    }

                    /**
                     * to be called function - sets this.success to true if certain conditions are given
                     * @pre this.success is something
                     * @post this.success is either true or false
                     * @param {String[]} bar test value in this case an Array of Strings to check
                     * @returns {Void}  -
                     */
                    showFeaturesByIds (bar) {
                        this.success = bar && bar.length === 2 && bar[0] === "baz" && bar[1] === "qux";
                    }
                }();

            wrapper.vm.showFeaturesByIds(layer, featureIds);
            expect(layer.success).to.be.true;
        });
        it("should not call showFeaturesByIds with given String[] featureIds on a layer if layer is not selected", () => {
            const featureIds = ["baz", "qux"],
                layer = new class {
                    /**
                     * constructor
                     */
                    constructor () {
                        this.failed = false;
                    }

                    /**
                     * gets specific test data
                     * @param {*} foo identifier for data to call
                     * @returns {Boolean}  -
                     */
                    get (foo) {
                        if (foo === "isSelected") {
                            return false;
                        }
                        return true;
                    }

                    /**
                     * to be called function - sets this.failed to true
                     * @pre this.failed is something
                     * @post this.failed is true
                     * @returns {Void}  -
                     */
                    showFeaturesByIds () {
                        this.failed = true;
                    }
                }();

            wrapper.vm.showFeaturesByIds(layer, featureIds);
            expect(layer.failed).to.be.false;
        });
    });

    describe("getFeatureIds", () => {
        it("should add all ids (gotten by school.getId) of schools with the requested area code into the response array", () => {
            const UnitTestSchulenWohnortSchool = class {
                    /**
                     * constructor
                     * @param {Integer} id the id of the school as number
                     * @param {Integer} StatGeb_Nr the code of the district as number
                     * @param {*} someValue test value to be returned on specific conditions
                     */
                    constructor (id, StatGeb_Nr, someValue) {
                        this.id = id;
                        this.StatGeb_Nr = StatGeb_Nr;
                        this.someValue = someValue;
                    }

                    /**
                     * getter for this.someValue on certain conditions
                     * @param {*} key the key to get data if condition "SG_" + this.StatGeb_Nr is fulfilled this.someValue is returned
                     * @returns {*|Undefined}  returns this.someValue if condition is fulfilled, returns undefined if otherwise
                     */
                    get (key) {
                        if (key === "SG_" + this.StatGeb_Nr) {
                            return this.someValue;
                        }
                        return undefined;
                    }

                    /**
                     * getter for the id of the school
                     * @returns {Integer}  returns the value this.id set by the constructor
                     */
                    getId () {
                        return this.id;
                    }
                },
                schools = [
                    new UnitTestSchulenWohnortSchool(1, 123456789, 50),
                    new UnitTestSchulenWohnortSchool(2, 123456789, 25),
                    new UnitTestSchulenWohnortSchool(3, 987654321, 15),
                    new UnitTestSchulenWohnortSchool(4, 987654321, 10)
                ];

            expect(wrapper.vm.getFeatureIds(schools, 123456789)).to.deep.equal([1, 2]);
        });

        it("should return an empty array if schools looks somehow strange", () => {
            expect(wrapper.vm.getFeatureIds(undefined, 123456789)).to.be.empty;
            expect(wrapper.vm.getFeatureIds(false, 123456789)).to.be.empty;
            expect(wrapper.vm.getFeatureIds(null, 123456789)).to.be.empty;
            expect(wrapper.vm.getFeatureIds("foo", 123456789)).to.be.empty;
            expect(wrapper.vm.getFeatureIds(1234, 123456789)).to.be.empty;
            expect(wrapper.vm.getFeatureIds({}, 123456789)).to.be.empty;
            expect(wrapper.vm.getFeatureIds([1, 2, 3, 4])).to.be.empty;
        });
    });

    describe("getPercentageOfStudentsByStatGeb_Nr", () => {
        it("should return false if the school parameter is used inappropriately", () => {
            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr(undefined, 1234)).to.be.false;
            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr("foo", 1234)).to.be.false;
            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr(1234, 1234)).to.be.false;
            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr({}, 1234)).to.be.false;
            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr([], 1234)).to.be.false;
            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr(false, 1234)).to.be.false;
            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr(null, 1234)).to.be.false;
        });

        it("should return the expected value if called appropriately", () => {
            const StatGeb_Nr = 1234,
                school = {
                    get: function (foo) {
                        if (foo === "SG_1234") {
                            return "bar";
                        }
                        return undefined;
                    }
                };

            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr)).to.equal("bar");
        });
        it("should return false if called otherwise but also appropriately", () => {
            const StatGeb_Nr = 5678,
                school = {
                    get: function (foo) {
                        if (foo === "SG_1234") {
                            return "bar";
                        }

                        // as it is an instance of Feature school.get() returns undefined if foo is not found
                        return undefined;
                    }
                };

            expect(wrapper.vm.getPercentageOfStudentsByStatGeb_Nr(school, StatGeb_Nr)).to.be.false;
        });
    });


    describe("getDataForMouseHoverTemplate", () => {
        it("should return an object DataForMouseHoverTemplate with empty or default values if the school parameter is set inappropriately", () => {
            const schoolLevelTitle = "foo",
                expectation = {
                    schoolLevelTitle: "foo",
                    schoolName: "",
                    address: {
                        street: "",
                        houseNumber: "",
                        postalCode: "",
                        city: ""
                    },
                    numberOfStudents: "",
                    numberOfStudentsPrimary: "",
                    socialIndex: "",
                    percentageOfStudentsFromDistrict: 0,
                    numberOfStudentsFromDistrict: 0
                };

            expect(wrapper.vm.getDataForMouseHoverTemplate(undefined, schoolLevelTitle, 0, 0)).to.deep.equal(expectation);
            expect(wrapper.vm.getDataForMouseHoverTemplate(false, schoolLevelTitle, 0, 0)).to.deep.equal(expectation);
            expect(wrapper.vm.getDataForMouseHoverTemplate("bar", schoolLevelTitle, 0, 0)).to.deep.equal(expectation);
            expect(wrapper.vm.getDataForMouseHoverTemplate(1234, schoolLevelTitle, 0, 0)).to.deep.equal(expectation);
        });

        it("should return an object DataForMouseHoverTemplate based on given arguments, should calculate some properties correctly", () => {
            const numberOfStudentsInDistrict = 1000000,
                StatGeb_Nr = 123456789,
                schoolLevelTitle = "foo",
                school = {
                    get: function (foo) {
                        const data = {
                            "C_S_Name": "school title",
                            "C_S_Str": "the street",
                            "C_S_HNr": "the doornumber",
                            "C_S_PLZ": "the postal code",
                            "C_S_Ort": "the city",
                            "C_S_SuS": "total sum",
                            "C_S_SuS_PS": "total sum primary",
                            "C_S_SI": "the social index",
                            "SG_123456789": 50.4999
                        };

                        return data.hasOwnProperty(foo) ? data[foo] : false;
                    }
                },
                expectation = {
                    schoolLevelTitle: "foo",
                    schoolName: "school title",
                    address: {
                        street: "the street",
                        houseNumber: "the doornumber",
                        postalCode: "the postal code",
                        city: "the city"
                    },
                    numberOfStudents: "total sum",
                    numberOfStudentsPrimary: "total sum primary",
                    socialIndex: "the social index",
                    percentageOfStudentsFromDistrict: 50,
                    numberOfStudentsFromDistrict: 504999
                };

            expect(wrapper.vm.getDataForMouseHoverTemplate(school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict)).to.deep.equal(expectation);

        });
        it("should set the social index to 'nicht vergeben' on the rare occation that C_S_SI equals -1", () => {
            const school = {
                get: function (foo) {
                    if (foo === "C_S_SI") {
                        return -1;
                    }
                    return false;
                }
            };

            expect(wrapper.vm.getDataForMouseHoverTemplate(school, "bar", 0, 0)).to.deep.include({socialIndex: "nicht vergeben"});
        });
        it("should round the percentage of students at the school from the district correctly", () => {
            const numberOfStudentsInDistrict = 1000000,
                StatGeb_Nr = 123456789,
                schoolLevelTitle = "foo";
            let school,
                shouldInclude;

            school = {
                get: function (foo) {
                    if (foo === "SG_123456789") {
                        return 50.4999;
                    }
                    return false;
                }
            };
            shouldInclude = {percentageOfStudentsFromDistrict: 50};
            expect(wrapper.vm.getDataForMouseHoverTemplate(school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict)).to.deep.include(shouldInclude);

            school = {
                get: function (foo) {
                    if (foo === "SG_123456789") {
                        return 50.5;
                    }
                    return false;
                }
            };
            shouldInclude = {percentageOfStudentsFromDistrict: 51};
            expect(wrapper.vm.getDataForMouseHoverTemplate(school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict)).to.deep.include(shouldInclude);
        });
        it("should calculate and round the number of students from the district correctly", () => {
            const numberOfStudentsInDistrict = 1000000,
                StatGeb_Nr = 123456789,
                schoolLevelTitle = "foo";
            let school,
                shouldInclude;

            school = {
                get: function (foo) {
                    if (foo === "SG_123456789") {
                        return 50.4999499;
                    }
                    return false;
                }
            };
            shouldInclude = {numberOfStudentsFromDistrict: 504999};
            expect(wrapper.vm.getDataForMouseHoverTemplate(school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict)).to.deep.include(shouldInclude);

            school = {
                get: function (foo) {
                    if (foo === "SG_123456789") {
                        return 50.49995;
                    }
                    return false;
                }
            };
            shouldInclude = {numberOfStudentsFromDistrict: 505000};
            expect(wrapper.vm.getDataForMouseHoverTemplate(school, schoolLevelTitle, StatGeb_Nr, numberOfStudentsInDistrict)).to.deep.include(shouldInclude);
        });
    });

    describe("setGFIProperties", () => {
        it("should set default values of the model appropriately", () => {
            const allProperties = {
                C12_SuS: 1234,
                C32_SuS: 5678,
                StatGeb_Nr: "foo",
                ST_Name: "bar"
            };

            wrapper.vm.schoolLevels = {"primary": "Primarstufe", "secondary": "Sekundarstufe I"};

            wrapper.vm.setGFIProperties(allProperties, "primary", true);
            expect(wrapper.vm.themeType).to.equal("primary");
            expect(wrapper.vm.numberOfStudentsInDistrictFormated).to.equal("1.234");
            expect(wrapper.vm.StatGeb_Nr).to.equal("foo");
            expect(wrapper.vm.ST_Name).to.equal("bar");

            wrapper.vm.setGFIProperties(allProperties, "secondary", true);
            expect(wrapper.vm.themeType).to.equal("secondary");
            expect(wrapper.vm.numberOfStudentsInDistrictFormated).to.equal("5.678");
        });

        it("should round the number of students for themeType primary and secondary and add thousands points for the formated value", () => {
            const allProperties = {
                C12_SuS: 1234.5,
                C32_SuS: 5678.4999999
            };

            wrapper.vm.setGFIProperties(allProperties, "primary");
            expect(wrapper.vm.themeType).to.equal("primary");
            expect(wrapper.vm.numberOfStudentsInDistrictFormated).to.equal("1.235");

            wrapper.vm.setGFIProperties(allProperties, "secondary");
            expect(wrapper.vm.themeType).to.equal("secondary");
            expect(wrapper.vm.numberOfStudentsInDistrictFormated).to.equal("5.678");
        });
        it("should set numberOfStudentsInDistrict and numberOfStudentsInDistrictFormated only if themeType is primary or secondary, should left untouched if otherwise", () => {
            const allProperties = {
                C12_SuS: 1234,
                C32_SuS: 5678
            };

            wrapper.vm.numberOfStudentsInDistrictFormated = "foo";
            wrapper.vm.setGFIProperties(allProperties, "bar");
            expect(wrapper.vm.numberOfStudentsInDistrictFormated).to.equal("foo");
        });

        it("should change schoolLevelTitle only if themeType is a key of schoolLevels", () => {
            wrapper.vm.schoolLevels = {"foo": "bar", "baz": "qux"};

            wrapper.vm.setGFIProperties({}, "foo");
            expect(wrapper.vm.schoolLevelTitle).to.equal("bar");

            wrapper.vm.schoolLevelTitle = "foobar";
            wrapper.vm.setGFIProperties({}, "otherThemeType");
            expect(wrapper.vm.schoolLevelTitle).to.equal("foobar");
        });
        it("should set StatGeb_Nr only if StatGeb_Nr is available in allProperties", () => {
            wrapper.vm.StatGeb_Nr = "foobar";
            wrapper.vm.setGFIProperties({}, "foo");
            expect(wrapper.vm.StatGeb_Nr).to.equal("foobar");
        });
        it("should set ST_Name only if ST_Name is available in allProperties", () => {
            wrapper.vm.ST_Name = "foobar";
            wrapper.vm.setGFIProperties({}, "foo");
            expect(wrapper.vm.ST_Name).to.equal("foobar");
        });
    });
});
