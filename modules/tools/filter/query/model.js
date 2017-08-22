define(function (require) {

    var SnippetDropdownModel = require("modules/Snippets/dropDown/model"),
        QueryModel;

    QueryModel = Backbone.Model.extend({
        // initialize: function () {
            // interaktion mit modellist query hinzufügen(sichtbare layer) und entfernen
            // console.log(this);
        // },

        createSnippets: function (typeMap) {
            _.each(typeMap, function (type) {
                this.createSnippet(type);
            }, this);

        },

        createSnippet: function (attr) {
            // console.log(this.get("snippets").length);
            if (attr.type === "string") {
                this.get("snippets").add(new SnippetDropdownModel(attr));
            }
            else if (attr.type === "integer") {
                // console.log("integer");
            }
            // console.log(this.get("snippets"));
        },

        createTypeMap: function (resp) {
            var typeMap = this.parseResponse(resp);

            typeMap = this.trimAttributes(typeMap);
            typeMap = this.mapDisplayNames(typeMap);
            typeMap = this.setValues(typeMap);
            this.setTypeMap(typeMap);
            // console.log(typeMap);
            this.createSnippets(typeMap);
            // isLayerVisible und isSelected
            if (this.get("isSelected") === true) {
                this.trigger("renderSubViews");
            }
        },

        trimAttributes: function (typeMap) {
            if (this.has("attributeList") === true) {
                typeMap = _.filter(typeMap, function (elem) {
                    return _.contains(this.get("attributeList").attributesNames, elem.name);
                }, this);
            }

            return typeMap;
        },

        mapDisplayNames: function (typeMap) {
            var displayNames = Radio.request("RawLayerList", "getDisplayNamesOfFeatureAttributes", this.get("layerId"));

            if (_.isUndefined(displayNames) === false) {
                _.each(typeMap, function (elem) {
                    if (_.has(displayNames, elem.name) === true) {
                        elem.displayName = displayNames[elem.name];
                    }
                    else {
                        elem.displayName = elem.name;
                    }
                });
            }

            return typeMap;
        },

        setTypeMap: function (value) {
            this.set("typeMap", value);
        },

        setIsSelected: function (value) {
            this.set("isSelected", value);
        }
    });

    return QueryModel;
});
