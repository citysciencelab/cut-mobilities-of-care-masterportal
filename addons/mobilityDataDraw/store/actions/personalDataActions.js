import stateMobilityDataDraw from "../stateMobilityDataDraw";

const initialState = JSON.parse(JSON.stringify(stateMobilityDataDraw));

/**
 * Sets the age
 *
 * @param {Object} context actions context object.
 * @param {String} age the selected age value.
 * @returns {void}
 */
function setAge ({state, commit}, age) {
    commit("setPersonalData", {...state.personalData, age});
}

/**
 * Sets the gender
 *
 * @param {Object} context actions context object.
 * @param {String} gender the selected gender value.
 * @returns {void}
 */
function setGender ({state, commit}, gender) {
    commit("setPersonalData", {...state.personalData, gender});
}

/**
 * Sets the marital status
 *
 * @param {Object} context actions context object.
 * @param {String} maritalStatus the selected maritalStatus value.
 * @returns {void}
 */
function setMaritalStatus ({state, commit}, maritalStatus) {
    commit("setPersonalData", {...state.personalData, maritalStatus});
}

/**
 * Sets the employment
 *
 * @param {Object} context actions context object.
 * @param {String} employmentStatus the selected employment value.
 * @returns {void}
 */
function setEmploymentStatus ({state, commit}, employmentStatus) {
    commit("setPersonalData", {...state.personalData, employmentStatus});
}

/**
 * Sets the household income
 *
 * @param {Object} context actions context object.
 * @param {String} householdIncome the selected householdIncome value.
 * @returns {void}
 */
function setHouseholdIncome ({state, commit}, householdIncome) {
    commit("setPersonalData", {
        ...state.personalData,
        householdIncome
    });
}

/**
 * Adds a person in need
 *
 * @param {Object} context actions context object.
 * @param {Object} personInNeed the personInNeed to add.
 * @returns {void}
 */
function addPersonInNeed ({state, commit}, personInNeed) {
    const personsInNeed = state.personalData.personsInNeed;

    commit("setPersonalData", {
        ...state.personalData,
        personsInNeed: [...personsInNeed, personInNeed]
    });
}

/**
 * Remove a person in need
 *
 * @param {Object} context actions context object.
 * @param {Object} personInNeedIndex index of the personInNeed to remove.
 * @returns {void}
 */
 function removePersonInNeed ({state, commit}, personInNeedIndex) {
    const personsInNeed = state.personalData.personsInNeed.filter(
        (_, index) => personInNeedIndex !== index
    );

    commit("setPersonalData", {
        ...state.personalData,
        personsInNeed: personsInNeed.length
            ? [...personsInNeed]
            : initialState.personalData.personsInNeed
    });
}

/**
 * Sets the name of the person in need
 *
 * @param {Object} context actions context object.
 * @param {{event, personInNeedIndex}} event event fired by changing the input for personInNeedName, personInNeedIndex index of personInNeed.
 * @returns {void}
 */
function setPersonInNeedName ({state, commit}, {event, personInNeedIndex}) {
    const personsInNeed = state.personalData.personsInNeed;
    personsInNeed[personInNeedIndex] = {
        ...personsInNeed[personInNeedIndex],
        name: event.target.value
    };

    commit("setPersonalData", {
        ...state.personalData,
        personsInNeed: [...personsInNeed]
    });
}

/**
 * Sets the class of the person in need
 *
 * @param {Object} context actions context object.
 * @param {{personInNeedClass, personInNeedIndex}} personInNeedClass the selected personInNeedClass value, personInNeedIndex index of personInNeed.
 * @returns {void}
 */
function setPersonInNeedClass (
    {state, commit},
    {personInNeedClass, personInNeedIndex}
) {
    const personsInNeed = state.personalData.personsInNeed;
    personsInNeed[personInNeedIndex] = {
        ...personsInNeed[personInNeedIndex],
        personInNeedClass
    };

    commit("setPersonalData", {
        ...state.personalData,
        personsInNeed: [...personsInNeed]
    });
}

/**
 * Sets the age of the person in need
 *
 * @param {Object} context actions context object.
 * @param {{personInNeedAge, personInNeedIndex}} personInNeedAge the selected personInNeedAge value, personInNeedIndex index of personInNeed.
 * @returns {void}
 */
function setPersonInNeedAge (
    {state, commit},
    {personInNeedAge, personInNeedIndex}
) {
    const personsInNeed = state.personalData.personsInNeed;
    personsInNeed[personInNeedIndex] = {
        ...personsInNeed[personInNeedIndex],
        age: personInNeedAge
    };

    commit("setPersonalData", {
        ...state.personalData,
        personsInNeed: [...personsInNeed]
    });
}

/**
 * Sets the same household flag
 *
 * @param {Object} context actions context object.
 * @param {{event, personInNeedIndex}} event fired by changing the input for sameHousehold, personInNeedIndex index of personInNeed.
 * @returns {void}
 */
function setSameHousehold ({state, commit}, {event, personInNeedIndex}) {
    const personsInNeed = state.personalData.personsInNeed;
    personsInNeed[personInNeedIndex] = {
        ...personsInNeed[personInNeedIndex],
        isSameHousehold: event.target.checked
    };

    commit("setPersonalData", {
        ...state.personalData,
        personsInNeed: [...personsInNeed]
    });
}

/**
 * Sets the additional text
 *
 * @param {Object} context actions context object.
 * @param {Event} event event fired by changing the input for additional.
 * @returns {void}
 */
function setAdditional ({state, commit}, event) {
    commit("setPersonalData", {
        ...state.personalData,
        additional: event.target.value
    });
}

export default {
    setAge,
    setGender,
    setMaritalStatus,
    setEmploymentStatus,
    setHouseholdIncome,
    addPersonInNeed,
    removePersonInNeed,
    setPersonInNeedName,
    setPersonInNeedClass,
    setPersonInNeedAge,
    setSameHousehold,
    setAdditional
};
