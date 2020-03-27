export default {
    mobile: state => state.mobile,
    masterPortalVersionNumber: state => state.masterPortalVersionNumber,
    footerConfig: state => state?.configJs?.footer || null,
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,
    toolsConfig: state => state?.configJson?.Portalconfig?.menu?.tools?.children || null
};
