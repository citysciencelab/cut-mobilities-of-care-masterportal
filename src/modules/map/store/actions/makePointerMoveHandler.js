/**
 * @param {Function} commit commit function
 * @returns {Function}  update function for mouse coordinate
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
