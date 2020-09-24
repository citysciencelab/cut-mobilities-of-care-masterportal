import {expect} from "chai";
import uniqueId from "../../uniqueId";

describe("src/utils/uniqueId.js", () => {
    it("should increment the uniqueId internaly", () => {

        const currentId = uniqueId(),
            expectedId = String(parseInt(currentId, 10) + 1);

        expect(currentId).to.not.be.NaN;
        expect(uniqueId()).to.equal(expectedId);
    });
    it("should prefix the id with the given prefix", () => {
        const currentId = uniqueId(),
            prefix = "foo",
            expectedId = prefix + String(parseInt(currentId, 10) + 1);

        expect(currentId).to.not.be.NaN;
        expect(uniqueId(prefix)).to.equal(expectedId);
    });
    it("should increment the same id independent of the UniqueIds instance", () => {
        /**
         * Used to test instance independent incrementing
         */
        class UniqueId {
            /**
             * Generate a globally-unique id for client-side models or DOM elements that need one. If prefix is passed, the id will be appended to it.
             * @param {String} [prefix=""] prefix for the id
             * @returns {String}  a globally-unique id
             */
            getUniqueId (prefix) {
                return uniqueId(prefix);
            }
        }
        const currentId = uniqueId(),
            expectedId = String(parseInt(currentId, 10) + 1),
            modelB = new UniqueId();

        expect(currentId).to.not.be.NaN;
        expect(modelB.getUniqueId()).to.equal(expectedId);
    });
});
