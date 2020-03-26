export default {
    mobile: state => state.mobile,
    languageConfig: state => state?.configJs?.portalLanguage,
    controlsConfig: state => state?.configJson?.Portalconfig?.controls || null,
    toolsConfig: state => state?.configJson?.Portalconfig?.menu?.tools?.children || null
};
