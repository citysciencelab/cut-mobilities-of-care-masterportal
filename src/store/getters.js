export default {
    mobile: state => state.mobile,
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,
    toolsConfig: state => state?.configJson?.Portalconfig?.menu?.tools?.children || null
};
