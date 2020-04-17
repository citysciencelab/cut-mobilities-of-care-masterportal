import mutations from "./mutations";

/**
 * This is here to test store/utils/composeModules.
 * However, these parameters will probably end up
 * as props and not as state.
 */
export default {
    namespaced: true,
    state: {
        name: null,
        glyphicon: null, // should be overridden
        onlyDesktop: false,
        isVisibleInMenu: true,
        renderToWindow: true, // should be added
        resizableWindow: false,
        keepOpen: false
    },
    mutations
};
