define(function (require) {

    var SnippetDropdownModel = require("modules/Snippets/dropDown/model"),
        QueryModel;

    QueryModel = Backbone.Model.extend({
        defaults: {
            snippets: new Backbone.Collection()
        },
        initialize: function () {
            // interaktion mit modellist query hinzufügen(sichtbare layer) und entfernen
            console.log(this);
        },

        createSnippets: function (typeMap) {
            _.each(typeMap, function (type) {
                this.createSnippet(type);
            }, this);

        },

        createSnippet: function (attr) {
            if (attr.type === "string") {
                this.get("snippets").add(new SnippetDropdownModel(attr));
            }
            else if (attr.type === "integer") {
                console.log("integer");
            }
            console.log(this.get("snippets"));
        },

        createTypeMap: function (resp) {
            var typeMap = this.parseResponse(resp);

            typeMap = this.trimAttributes(typeMap);
            typeMap = this.mapDisplayNames(typeMap);
            typeMap = this.setValues(typeMap);
            this.setTypeMap(typeMap);
            if (this.get("isVisible") === true) {
                this.createSnippets(typeMap);
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
        }
    });

    return QueryModel;
});
