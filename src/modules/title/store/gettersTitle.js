export default {
    title: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.title) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.title;
        }
        return undefined;
    },
    logo: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.logo) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.logo;
        }
        return undefined;
    },
    link: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.link) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.link;
        }
        return undefined;
    },
    toolTip: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.toolTip) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.toolTip;
        }
        return undefined;
    }
};
