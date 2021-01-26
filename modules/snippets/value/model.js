const SnippetValueModel = Backbone.Model.extend({
    defaults: {
        value: "",
        type: "",
        // translations
        deleteSelection: "",
        currentLng: ""
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.set({
            "deleteSelection": i18next.t("common:snippets.value.deleteSelection"),
            "currentLng": lng
        });
    },
    // setter for value
    setValue: function (value) {
        this.set("value", value);
    },

    setIsSelected: function (value) {
        this.set("isSelected", value);
    },
    getDisplayString: function () {
        let displayString = "";

        switch (this.get("type")) {
            case "boolean": {
                displayString = this.get("attr");
                break;
            }
            case "searchInMapExtent": {
                displayString = "Kartenausschnitt";
                break;
            }
            default: {
                displayString += this.get("value");
            }
        }
        return displayString;
    }
});

export default SnippetValueModel;
