import getters from "./gettersTitle";
// TODO it's probably simpler to have this information as selectors from the store.state.configJSON
export default {
    namespaced: true,
    state: {
        link: undefined,
        toolTip: undefined,
        logo: undefined,
        title: undefined,
        LogoLink: undefined,
        PortalTitle: undefined,
        LogoToolTip: undefined,
        tooltip: undefined,
        PortalLogo: undefined
    },
    getters
};
