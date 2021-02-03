import getQueryParams from "../utils/getQueryParams";

export default {
    masterPortalVersionNumber: state => state?.masterPortalVersionNumber,
    mobile: state => state.mobile,
    dpi: state => state.dpi,
    idCounter: state => state?.idCounter,
    // configJS destructuring
    footerConfig: state => state?.configJs?.footer || null,
    loaderText: state => state?.configJs?.loaderText || "",
    scaleLineConfig: state => state?.configJs?.scaleLine || null,
    uiStyle: state => (getQueryParams()?.uiStyle || state?.configJs?.uiStyle)?.toUpperCase(),
    // gfiWindow is deprecated in the next major-release
    gfiWindow: state => state?.configJs.gfiWindow,
    ignoredKeys: state => state?.configJs.ignoredKeys || [],
    // metadata is deprecated in the next major-relase, because it is only used for proxyUrl
    metadata: state => state?.configJs.metadata || {},
    // proxyHost is deprecated in the next major-release
    proxyHost: state => state?.configJs?.proxyHost || "",
    // configJSON desctructuring
    portalTitle: state => state?.configJson?.Portalconfig?.portalTitle?.title || null,
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,
    legendConfig: state => state?.configJson?.Portalconfig?.menu.legend || null,
    menuConfig: state => state?.configJson?.Portalconfig?.menu || null,
    portalConfig: state => state?.configJson?.Portalconfig || null,
    imagePath: state => state?.configJs.wfsImgPath || null,

    /**
     * recursively read out the menu config for tools
     * Is used to determine whether a component should be loaded
     * Does not assign Config Attributes to the module
     * @param {Object} state the store state
     * @param {Object} getters the store getters
     * @param {Object} [module=state?.configJson?.Portalconfig?.menu] the nested object used for recursion
     * @returns {Object} all tools as key: value pairs
     */
    toolsConfig: (state, getters) => (module = state?.configJson?.Portalconfig?.menu) => {
        let tools = {};

        for (const key in module) {
            let tool;

            if (module[key].type === "tool") {
                tool = {[key]: module[key]};
            }
            else if (module[key].children) {
                tool = getters.toolsConfig(module[key].children);
            }
            tools = {
                ...tools,
                ...tool
            };
        }

        return tools;
    },

    /**
     * recursively returns one tool's config by ID
     * @param {Object} state the store state
     * @param {Object} getters the store getters
     * @param {Object} [module=state?.configJson?.Portalconfig?.menu] the nested object used for recursion
     * @returns {Object} the tool config object
     */
    toolConfig: (state, getters) => (id, module = state?.configJson?.Portalconfig?.menu) => {
        let tool = module?.[id];

        for (const key in module) {
            if (tool) {
                return tool;
            }
            else if (module[key].children) {
                tool = getters.toolConfig(id, module[key].children);
            }
        }
        return tool;
    },

    /**
     * checks if the simple style is set in the query params or in the config.js
     * @param {Object} state - the store state
     * @returns {Boolean} true if simple style is set otherwise false
     */
    isSimpleStyle: (state) => {
        if (state?.queryParams?.style) {
            return state.queryParams.style === "simple";
        }
        else if (state?.configJs?.uiStyle === "simple") {
            return true;
        }
        return false;
    },

    /**
     * checks if the table style is set in the query params or in the config.js
     * @param {Object} state - the store state
     * @returns {Boolean} true if table style is set otherwise false
     */
    isTableStyle: (state) => {
        if (state?.queryParams?.style) {
            return state.queryParams.style === "table";
        }
        else if (state?.configJs?.uiStyle === "table") {
            return true;
        }
        return false;
    },
    /**
     * checks if the param useVectorStyleBeta is available in config.js and returns the value
     * @param {object} state - the store state
     * @returns {boolean} true useVectorStyleBeta is set to true
     */
    useVectorStyleBeta: (state) => {
        if (typeof state?.configJs?.useVectorStyleBeta === "boolean") {
            return state.configJs.useVectorStyleBeta;
        }
        return false;
    },

    /**
     * checks if the default style is set
     * @param {Object} state - the store state
     * @param {Object} getters - the store getters
     * @param {Boolean} getters.isSimpleStyle -
     * @param {Boolean} getters.isTableStyle -
     * @returns {Boolean} false if simple style or table style is set otherwise true
     */
    isDefaultStyle: (state, {isSimpleStyle, isTableStyle}) => {
        return !isSimpleStyle && !isTableStyle;
    }
};

