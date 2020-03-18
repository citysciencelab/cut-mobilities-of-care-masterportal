/**
 * @param {object} state state object
 * @returns {function} update function for mouse coordinate
 */
function makePointerMoveHandler (state) {
    return (evt) => {
        if (evt.dragging) {
            return;
        }
        state.mouseCoord = evt.coordinate;
    };
}

export default makePointerMoveHandler;
