const getters = {
    mobile: state => state.mobile,
    dpi: state => state.dpi,
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,
    toolsConfig: state => state?.configJson?.Portalconfig?.menu?.tools?.children || null
};

export default getters;
