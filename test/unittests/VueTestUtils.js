import "regenerator-runtime/runtime";
import {expect} from "chai";
/**
 * Helper for testing action with expected mutations.
 * Mocks the commit and calls the action and checks the expexted mutations.
 * @param {function} action will be called the action with mocked store and arguments
 * @param {object} payload the action is called with
 * @param {object} state the action is called with
 * @param {object} rootState app's root state
 * @param {array.<object>} expectedMutationsAndActions mutations expected to call and actions expected to dispatch
 * @param {object} getters mocks for the expected getters to be called
 * @param {function} done will be called if finished or fails
 * @returns {void}
 */
export default function testAction (action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done) {
    let commit = null,
        dispatch = null,
        count = 0;

    // mock dispatch
    /* eslint-disable no-shadow */
    dispatch = (type, payload) => {
        const action = expectedMutationsAndActions[count];

        if (action.dispatch === true) {
            try {
                expect(type).to.equal(action.type);
                expect(payload).to.deep.equal(action.payload);
            }
            catch (error) {
                done(error);
            }

            count++;
            if (count >= expectedMutationsAndActions.length) {
                done();
            }
        }
    };

    // mock commit
    /* eslint-disable no-shadow */
    commit = (type, payload) => {
        const mutation = expectedMutationsAndActions[count];

        try {
            expect(type).to.equal(mutation.type);
            expect(payload).to.deep.equal(mutation.payload);
        }
        catch (error) {
            done(error);
        }

        count++;
        if (count >= expectedMutationsAndActions.length) {
            done();
        }
    };

    // call the action with mocked store and arguments
    action({commit, dispatch, state, rootState, getters}, payload);

    // check if no mutations should have been dispatched
    if (expectedMutationsAndActions.length === 0) {
        expect(count).to.equal(0);
        done();
    }
}
