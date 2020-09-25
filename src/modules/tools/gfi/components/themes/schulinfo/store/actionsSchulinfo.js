import themeConfig from "../themeConfig.json";

const actions = {
    assignFeatureProperties ({commit}, feature) {
        const topics = JSON.parse(JSON.stringify(themeConfig)).themen,
            assignedFeatureProperties = [];

        topics.forEach(topic => {
            topic.attributes = Object.entries(feature.getProperties())
                .filter(([key]) => topic.attributes.includes(key))
                .map(([key, value]) => {
                    return {attributeName: key,
                        attributeValue: value
                    };
                });

            if (topic.attributes.length > 0) {
                assignedFeatureProperties.push(topic);
            }
        });

        commit("setAssignedFeatureProperties", assignedFeatureProperties);
    },

    toggleSelectedCategory ({state, commit}, event) {
        const properties = state.assignedFeatureProperties,
            propertyToSelect = properties.find(property => property.name === event.target.value);

        properties.forEach(property => {
            property.isSelected = false;
        });
        propertyToSelect.isSelected = true;

        event.target.parentNode.children.forEach(child => child.classList.remove("btn-select"));
        event.target.classList.add("btn-select");

        commit("setAssignedFeatureProperties", properties);

    }
};

export default actions;
