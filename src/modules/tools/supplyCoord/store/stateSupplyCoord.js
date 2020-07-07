/**
 * User type definition
 * @typedef {object} SupplyCoordState
 * @property {boolean} active if true, SupplyCoord will rendered
 * @property {string} id id of the SupplyCoord component
 * @property {module:ol/interaction/Pointer} selectPointerMove contains interaction listener to map
 * @property {object[]} projections list of available projections
 * @property {object} mapProjection projection of the map
 * @property {number[]} positionMapProjection position of the projection in the map
 * @property {boolean} updatePosition if true, position is updated in tool
 * @property {string} currentProjectionName name of the current projection
 * @property {object} currentProjection the current projection
 * @property {string} currentSelection currently selected projection value
 * @property {string} coordinatesEastingField label of the easting field
 * @property {string} coordinatesNorthingField label of the northing field
 * @property {string} name displayed as title (config-param)
 * @property {string} glyphicon icon next to title (config-param)
 * @property {boolean} renderToWindow if true, tool is rendered in a window, else in sidebar (config-param)
 * @property {boolean} resizableWindow if true, window is resizable (config-param)
 * @property {boolean} isActive if true, tool is initially shown (config-param)
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
 * @property {boolean} isRoot if true, tool is root (config-param)
 * @property {string} parentId id of parent item (config-param)
 * @property {boolean} type type of the item (config-param)
 * @property {boolean} deactivateGFI flag if tool should deactivate gfi (config-param)
 */
const state = {
    active: false,
    id: "coord",
    selectPointerMove: null,
    projections: [],
    mapProjection: null,
    positionMapProjection: [],
    updatePosition: true,
    currentProjectionName: "EPSG:25832",
    currentProjection: null,
    currentSelection: "EPSG:25832",
    coordinatesEastingField: "",
    coordinatesNorthingField: "",

    // defaults for config.json parameters
    name: "Koordinaten abfragen",
    glyphicon: "glyphicon-screenshot",
    renderToWindow: true,
    resizableWindow: true,
    isActive: false,
    isVisibleInMenu: true,
    isRoot: false,
    parentId: "tool",
    type: "tool",
    deactivateGFI: true
};

export default state;
