const getters = {
    mobile: state => state.mobile,
    controls: state => state?.configJson?.Portalconfig?.controls || null,
    tools: state => state?.configJson?.Portalconfig?.menu?.tools?.children || null
};

export default getters;
