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
 * @property {boolean} isVisibleInMenu if true, tool is selectable in menu (config-param)
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
    isVisibleInMenu: true,
    deactivateGFI: false
};

export default state;
