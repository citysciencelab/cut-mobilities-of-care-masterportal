/**
 * Since all tools share a common base object according to config.json.md,
 * all tools may have these ...spread in as first props if config.json is
 * fed as to example component BackForward.
 */
export default {
    name: {type: String, required: true},
    glyphicon: {type: String, required: false},
    onlyDesktop: {type: Boolean, default: false},
    isVisibleInMenu: {type: Boolean, default: true},
    renderToWindow: {type: Boolean, default: true},
    resizableWindow: {type: Boolean, default: false},
    keepOpen: {type: Boolean, default: false}
};
