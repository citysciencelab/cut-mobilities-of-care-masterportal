const getters = {
    masterPortalVersionNumber: state => state?.masterPortalVersionNumber,
    mobile: state => state.mobile,
    dpi: state => state.dpi,
    // configJS destructuring
    footerConfig: state => state?.configJs?.footer || null,
    // configJSON desctructuring
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,
    toolsConfig: state => state?.configJson?.Portalconfig?.menu?.tools?.children || null
};

export default getters;
