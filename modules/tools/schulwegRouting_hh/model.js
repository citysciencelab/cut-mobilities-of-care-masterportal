define(function () {

    var Sidebar = Backbone.Model.extend({

        defaults: {
            // names of all schools
            schoolNames: [],
            // names of streets found
            streetNames: [],
            houseNumbers: [],
            // list of hits that are displayed
            hitList: []
        },

        initialize: function () {
            Radio.trigger("Sidebar", "toggle", true);
            this.listenTo(Radio.channel("Layer"), {
                "featuresLoaded": this.sortSchoolsByName
            });
            this.listenTo(Radio.channel("Gaz"), {
                "streetNames": function (value) {
                    if (value.length === 1) {
                        this.setStreetNames(value);
                        if (this.get("houseNumbers").length === 0) {
                            Radio.trigger("Gaz", "findHouseNumbers", value[0]);
                        }
                        else {
                            this.findHousenumbers(this.get("houseNumbers"));
                        }
                    }
                    else if (value.length > 0) {
                        this.setHouseNumbers([]);
                        this.setStreetNames(value);
                    }
                    else {
                        this.findHousenumbers(this.get("houseNumbers"));
                    }
                },
                "houseNumbers": function (value) {
                    this.setHouseNumbers(value);
                    this.findHousenumbers(value);
                }
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

        searchAddress: function (value) {
            Radio.trigger("Gaz", "findStreets", value);
            this.setSearchString(value);
        },

        findHousenumbers: function (houseNumbers) {
            var t = _.filter(houseNumbers, function (houseNumber) {
                var st = this.get("streetNames")[0].replace(/ /g, "") + houseNumber.number + houseNumber.affix;
                return st.search(this.get("searchStringRegExp")) !== -1;
            }, this);
            this.setHitList(t);
        },

        setSchoolNames: function (value) {
            this.set("schoolNames", value);
        },

        setStreetNames: function (value) {
            this.set("streetNames", value);
        },

        setHouseNumbers: function (value) {
            this.set("houseNumbers", value);
        },

        setSearchString: function (value) {
            this.set("searchStringRegExp", new RegExp(value.replace(/ /g, ""), "i")); // Erst join dann als regulärer Ausdruck
        },

        setHitList: function (value) {
            this.set("hitList", value);
        }
    });

    return Sidebar;
});
