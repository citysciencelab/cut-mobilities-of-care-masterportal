import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import supplyCoordState from "./stateSupplyCoord";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(supplyCoordState),
    /**
     * Set currect projection to one in the list of projections.
     * @param {Object} state the state of supplyCoord-module
     * @param {Object[]} [projections=[]] list of available projections
     * @returns {void}
     */
    setProjections: (state, projections = []) => {
        const found = projections.filter(projection => projection.name === state.currentProjectionName);

        if (found.length === 0) {
            // EPSG:25832 must be the first one
            const firstProj = projections.find(proj => proj.name.indexOf("25832") > -1);

            if (firstProj) {
                const index = projections.indexOf(firstProj);

                projections.splice(index, 1);
                projections.unshift(firstProj);
            }
            state.currentProjectionName = projections[0]?.name;
            state.currentSelection = projections[0]?.name;
            state.currentProjection = projections[0];
        }
        state.projections = projections;
    }
};

export default mutations;
