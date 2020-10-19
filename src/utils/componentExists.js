/**
 * Checks for an Id whether a component exists.
 * @param {String} componentId - Id of the component.
 * @returns {Boolean} Component exist
 */
function componentExists (componentId) {
    return Boolean(Radio.request("ModelList", "getModelByAttributes", {id: componentId}));
}

export default componentExists;
