/**
 * @param {function} commit commit function
 * @returns {function} update function for mouse coordinate
 */
function makePointerMoveHandler (commit) {
    return (evt) => {
        if (evt.dragging) {
            return;
        }
        commit("setMouseCoord", evt.coordinate);
    };
}

export default makePointerMoveHandler;
