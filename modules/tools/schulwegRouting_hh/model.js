define(function () {

    var Sidebar = Backbone.Model.extend({

        defaults: {
            schoolNames: [],
            streetNames: [],
            houseNumbers: []
        },

        initialize: function () {
            Radio.trigger("Sidebar", "toggle", true);
            this.listenTo(Radio.channel("Layer"), {
                "featuresLoaded": this.sortSchoolsByName
            });
            this.listenTo(Radio.channel("Gaz"), {
                "streetNames": function (value) {
                    this.setStreetNames(value);
                    this.findHousenumbers(value);
                },
                "houseNumbers": this.setHouseNumbers
            });
        },

        sortSchoolsByName: function (layerId, features) {
            var sortedFeatures;

            if (layerId === "8712") {
                sortedFeatures = _.sortBy(features, function (feature) {
                    return feature.get("schulname");
                });
                this.setSchoolNames(sortedFeatures);
            }
        },

        findHousenumbers: function (value) {
            if (value.length > 1) {
                this.setHouseNumbers([]);
            }
            else if (value.length === 1 && this.get("houseNumbers").length === 0) {
                Radio.trigger("Gaz", "findHouseNumbers", value[0]);
                // searchinhousenumber
                // console.log(this.get("houseNumbers"));
            }
            else if (value.length === 1) {
                // searchinhousenumber
                // console.log(this.get("houseNumbers"));
            }
        },

        setSchoolNames: function (value) {
            this.set("schoolNames", value);
        },

        setStreetNames: function (value) {
            this.set("streetNames", value);
        },

        setHouseNumbers: function (value) {
            this.set("houseNumbers", value);
        }
    });

    return Sidebar;
});
