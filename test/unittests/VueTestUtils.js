import "regenerator-runtime/runtime";
import {expect} from "chai";
/**
 * Helper for testing action with expected mutations.
 * Mocks the commit and calls the action and checks the expexted mutations.
 * @param {*} action will be called the action with mocked store and arguments
 * @param {*} payload the action is called with
 * @param {*} state the action is called with
 * @param {*} expectedMutations mutations expected to call
 * @param {*} done will be called if finished or fails
 * @returns {void}
 */
export default function testAction (action, payload, state, expectedMutations, done) {
    let commit = null,
        count = 0;

    // mock commit
    /* eslint-disable no-shadow */
    commit = (type, payload) => {
        const mutation = expectedMutations[count];

        try {
            expect(type).to.equal(mutation.type);
            expect(payload).to.deep.equal(mutation.payload);
        }
        catch (error) {
            done(error);
        }

        count++;
        if (count >= expectedMutations.length) {
            done();
        }
    };

    // call the action with mocked store and arguments
    action({commit, state}, payload);

    // check if no mutations should have been dispatched
    if (expectedMutations.length === 0) {
        expect(count).to.equal(0);
        done();
    }
}
