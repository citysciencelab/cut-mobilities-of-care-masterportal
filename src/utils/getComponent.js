/**
 * Returns the component for the given id.
 * @param {String} componentId - Id of the component.
 * @returns {Object} the Component
 */
function getComponent (componentId) {
    return Radio.request("ModelList", "getModelByAttributes", {id: componentId});
}

export default getComponent;
