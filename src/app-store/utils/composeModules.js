/**
 * @param {String} fieldName name of the modules' field to merge
 * @param {Object[]} modules modules to compose; later appearing modules override
 * @returns {Object} composed entry for a field of the modules
 */
function composeField (fieldName, modules) {
    return modules
        .map(m => m[fieldName])
        .reduce((accumulator, field) => ({
            ...accumulator,
            ...field
        }), {});
}

/**
 * Composes a vuex module from a given array of modules.
 * @param {Object[]} modules modules to compose; later appearing modules override
 * @returns {Object} composed module
 */
export default function (modules) {
    return {
        namespaced: true,
        state: composeField("state", modules),
        getters: composeField("getters", modules),
        mutations: composeField("mutations", modules),
        actions: composeField("actions", modules)
    };
}

/*
    Module inheritance requirement solved with composition instead.
    Only works for simple stuff where state/getters/mutations/actions are not further nested.
    TODO What's a use-case for this?

    Example:

    // moduleOne.js
    export default {
        name: "One",
        state: { a: 0, b: 1 },
        mutations: { setA (a) { state.a = a } }
    }

    // moduleTwo.js
    import moduleOne from "./moduleOne.js"
    import {composeModules} from "../utils/composeModules.js"

    export default {
        name: "Two",
        ...composeModules([moduleOne, {
            state: { a: 1, b: 0 },
            mutations: { setB (b) { state.b = b } }
        }])
    }

    // import from "./moduleTwo.js" yields
    {
        name: "Two",
        state: { a: 1, b: 0 },
        mutations: {
            setA (a) { state.a = a },
            setB (b) { state.b = b }
        }
    }
*/
