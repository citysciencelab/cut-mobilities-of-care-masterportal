export default {
    state: {
        link: "https://geoinfo.hamburg.de",
        toolTip: "Landesbetrieb Geoinformation und Vermessung",
        logo: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/hh-logo.png",
        title: "Masterportal"
    },
    mutations: {
        /**
         * Overwrites the state-values with the values specified in the config.json.
         * But only if they are configured.
         * @param {object} state - vuex store
         * @param {object} configJson - config.json
         * @returns {void}
         */
        setDefaultParameters (state, configJson) {
            if (configJson.hasOwnProperty("portalTitle") === true) {
                for (const [key, value] of Object.entries(configJson.portalTitle)) {
                    if (configJson.portalTitle.hasOwnProperty(String(key))) {
                        state[key] = value;
                    }
                    if (key === "tooltip") {
                        console.warn("Attribute 'tooltip' is deprecated. Please use 'toolTip' instead.");
                    }
                }
            }
            if (configJson.hasOwnProperty("PortalTitle") === true) {
                state.title = configJson.PortalTitle;
            }
            if (configJson.hasOwnProperty("PortalLogo") === true) {
                state.logo = configJson.PortalLogo;
                console.warn("Attribute 'PortalLogo' is deprecated. Please use Object 'portalTitle' and the attribute 'title' instead.");
            }
            if (configJson.hasOwnProperty("LogoLink") === true) {
                state.link = configJson.LogoLink;
                console.warn("Attribute 'LogoLink' is deprecated. Please use Object 'portalTitle' and the attribute 'link' instead.");
            }
            if (configJson.hasOwnProperty("LogoToolTip") === true) {
                state.toolTip = configJson.LogoToolTip;
                console.warn("Attribute 'LogoToolTip' is deprecated. Please use Object 'portalTitle' and the attribute 'toolTip' instead.");
            }
        }
    }
};
