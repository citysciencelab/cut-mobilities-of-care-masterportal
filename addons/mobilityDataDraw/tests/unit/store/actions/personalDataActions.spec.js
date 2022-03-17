import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../../store/actions/personalDataActions";

describe("addons/mobilityDataDraw/store/actions/personalDataActions.js", () => {
    let commit;

    beforeEach(() => {
        commit = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("setAge", () => {
        it("calls setAge function", () => {
            const age = "30 – 39";

            actions.setAge(
                {
                    state: {
                        personalData: {}
                    },
                    commit
                },
                age
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({age});
        });
    });

    describe("setGender", () => {
        it("calls setGender function", () => {
            const gender = "female";

            actions.setGender(
                {
                    state: {
                        personalData: {}
                    },
                    commit
                },
                gender
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({gender});
        });
    });

    describe("setMaritalStatus", () => {
        it("calls setMaritalStatus function", () => {
            const maritalStatus = "single";

            actions.setMaritalStatus(
                {
                    state: {
                        personalData: {}
                    },
                    commit
                },
                maritalStatus
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({maritalStatus});
        });
    });

    describe("setEmploymentStatus", () => {
        it("calls setEmploymentStatus function", () => {
            const employmentStatus = "employment status";

            actions.setEmploymentStatus(
                {
                    state: {
                        personalData: {}
                    },
                    commit
                },
                employmentStatus
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({employmentStatus});
        });
    });

    describe("setHouseholdIncome", () => {
        it("calls setHouseholdIncome function", () => {
            const householdIncome = "€€€";

            actions.setHouseholdIncome(
                {
                    state: {
                        personalData: {}
                    },
                    commit
                },
                householdIncome
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({householdIncome});
        });
    });

    describe("addPersonInNeed", () => {
        it("calls addPersonInNeed function", () => {
            actions.addPersonInNeed(
                {
                    state: {
                        personalData: {personsInNeed: [{}]}
                    },
                    commit
                },
                {}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({
                personsInNeed: [{},{}]
            });
        });
    });

    describe("setPersonInNeedName", () => {
        it("calls setPersonInNeedName function", () => {
            const personInNeedName = "Person in need";

            actions.setPersonInNeedName(
                {
                    state: {
                        personalData: {personsInNeed: [{}]}
                    },
                    commit
                },
                {event: {target: {value: personInNeedName}}, personInNeedIndex: 0}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({
                personsInNeed: [{name: personInNeedName}]
            });
        });
    });

    describe("setPersonInNeedClass", () => {
        it("calls setPersonInNeedClass function", () => {
            const personInNeedClass = "A";

            actions.setPersonInNeedClass(
                {
                    state: {
                        personalData: {personsInNeed: [{}, {}]}
                    },
                    commit
                },
                {personInNeedClass, personInNeedIndex: 1}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({
                personsInNeed: [{},{personInNeedClass}]
            });
        });
    });

    describe("setPersonInNeedAge", () => {
        it("calls setPersonInNeedAge function", () => {
            const personInNeedAge = "> 80";

            actions.setPersonInNeedAge(
                {
                    state: {
                        personalData: {personsInNeed: [{}]}
                    },
                    commit
                },
                {personInNeedAge, personInNeedIndex: 0}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({
                personsInNeed: [{age: personInNeedAge}]
            });
        });
    });

    describe("setSameHousehold", () => {
        it("calls setSameHousehold function", () => {
            const isSameHousehold = false;

            actions.setSameHousehold(
                {
                    state: {
                        personalData: {personsInNeed: [{}, {}, {}, {}]}
                    },
                    commit
                },
                {event: {target: {checked: isSameHousehold}}, personInNeedIndex: 2}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({
                personsInNeed: [{}, {}, {isSameHousehold}, {}]
            });
        });
    });

    describe("setAdditional", () => {
        it("calls setAdditional function", () => {
            const additional = "Lorem ipsum dolot sit amet";

            actions.setAdditional(
                {
                    state: {
                        personalData: {}
                    },
                    commit
                },
                {target: {value: additional}}
            );

            expect(commit.calledOnce).to.be.true;
            expect(commit.getCall(0).args[0]).to.eql("setPersonalData");
            expect(commit.getCall(0).args[1]).to.eql({additional});
        });
    });
});
