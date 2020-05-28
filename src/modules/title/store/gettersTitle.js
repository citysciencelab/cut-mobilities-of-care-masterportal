export default {
    title: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.title) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.title;
        }
        else if (rootState?.configJson?.Portalconfig?.portalTitle?.PortalTitle) {
            console.warn(
                "Attribute PortalTitle is deprecated. Please use Object portalTitle and the attribute title instead."
            );
            return rootState?.configJson?.Portalconfig?.portalTitle?.PortalTitle;
        }
        return undefined;
    },
    logo: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.logo) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.logo;
        }
        else if (rootState?.configJson?.Portalconfig?.portalTitle?.PortalLogo) {
            console.warn(
                "Attribute PortalLogo is deprecated. Please use Object portalTitle and the attribute logo instead."
            );
            return rootState?.configJson?.Portalconfig?.portalTitle?.PortalLogo;
        }
        return undefined;
    },
    link: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.link) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.link;
        }
        else if (rootState?.configJson?.Portalconfig?.portalTitle?.LogoLink) {
            console.warn(
                "Attribute LogoLink is deprecated. Please use Object portalTitle and the attribute link instead."
            );
            return rootState?.configJson?.Portalconfig?.portalTitle?.LogoLink;
        }
        return undefined;
    },
    toolTip: (state, getters, rootState) => {
        if (rootState?.configJson?.Portalconfig?.portalTitle?.toolTip) {
            return rootState?.configJson?.Portalconfig?.portalTitle?.toolTip;
        }
        else if (rootState?.configJson?.Portalconfig?.portalTitle?.tooltip) {
            console.warn(
                "Attribute tooltip is deprecated. Please use Object portalTitle and the attribute toolTip instead."
            );
            return rootState?.configJson?.Portalconfig?.portalTitle?.tooltip;
        }
        else if (rootState?.configJson?.Portalconfig?.portalTitle?.LogoToolTip) {
            console.warn(
                "Attribute LogoToolTip is deprecated. Please use Object portalTitle and the attribute toolTip instead."
            );
            return rootState?.configJson?.Portalconfig?.portalTitle?.LogoToolTip;
        }
        return undefined;
    }
};
