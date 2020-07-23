/**
 * User type definition
 * @typedef {object} ScaleSwitcherState
 * @property {boolean} active if true, scaleSwitcher will rendered
 * @property {string} id id of the ScaleSwitcher component
 * @property {string} currentScale scale selected in ScaleSwitcher
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
    id: "scaleSwitcher",
    // defaults for config.json parameters
    name: "Maßstab umschalten",
    glyphicon: "glyphicon-resize-full",
    renderToWindow: true,
    resizableWindow: true,
    isActive: false,
    isVisibleInMenu: true,
    isRoot: false,
    parentId: "tool",
    type: "tool",
    deactivateGFI: false
};

export default state;
