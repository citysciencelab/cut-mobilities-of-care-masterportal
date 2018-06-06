define(function (require) {
    var ol = require("openlayers"),
        SchulwegRouting;

    SchulwegRouting = Backbone.Model.extend({

        defaults: {
            // ol-features of all schools
            schoolList: [],
            // names of streets found
            streetNameList: [],
            addressList: [],
            addressListFiltered: [],
            // route layer
            layer: {},
            isActive: false,
            id: "schulwegrouting"
        },

        initialize: function () {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: "8712"}),
                model;

            this.listenTo(Radio.channel("Layer"), {
                "featuresLoaded": function (layerId, features) {
                    if (layerId === "8712") {
                        this.setSchoolList(this.sortSchoolsByName(features));
                    }
                }
            });

            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": this.activate,
                "deactivatedTool": this.deactivate
            });
            this.listenTo(Radio.channel("Gaz"), {
                "streetNames": function (streetNameList) {
                    this.startSearch(streetNameList, this.get("addressList"));
                },
                "houseNumbers": function (houseNumberList) {
                    this.setAddressList(this.prepareAddressList(houseNumberList, this.get("streetNameList")));
                    this.setFilteredAddressList(this.filterAddressList(this.get("addressList"), this.get("searchRegExp")));
                }
            });
            if (Radio.request("ParametricURL", "getIsInitOpen") === "SCHULWEGROUTING") {
                // model in modellist gets activated.
                // And there the "Tool", "activatedTool" is triggered where this model listens to.
                model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("id")});
                model.setIsActive(true);
            }

            this.setLayer(Radio.request("Map", "createLayerIfNotExists", "school_route_layer"));
            this.addRouteFeatures(this.get("layer").getSource());
            this.get("layer").setStyle(this.routeStyle);
            if (!_.isUndefined(layerModel)) {
                this.setSchoolList(this.sortSchoolsByName(layerModel.get("layer").getSource().getFeatures()));
            }
        },

        activate: function (id) {
            if (this.get("id") === id) {
                this.setIsActive(true);
            }
        },
        deactivate: function (id) {
            if (this.get("id") === id) {
                this.setIsActive(false);
            }
        },

        /**
         * sorts the school features by name
         * @param {ol.feature[]} features - school features
         * @return {ol.feature[]} sorted schools features by name
         */
        sortSchoolsByName: function (features) {
            return _.sortBy(features, function (feature) {
                return feature.get("schulname");
            });
        },

        /**
         * filters the schools by id. returns the first hit
         * @param {ol.feature[]} schoolList - features of all schools
         * @param {string} schoolId - id of the school feature
         * @returns {ol.feature} -
         */
        filterSchoolById: function (schoolList, schoolId) {
            return _.find(schoolList, function (school) {
                return school.getId() === schoolId;
            });
        },

        /**
         * performs the address search depending on the individual cases
         * @param {string[]} streetNameList - response from Gazetteer
         * @param {object[]} addressList - list of addresses
         * @return {void}
         */
        startSearch: function (streetNameList, addressList) {
            var filteredAddressList;

            if (streetNameList.length === 1) {
                this.setStreetNameList(streetNameList);
                if (addressList.length === 0) {
                    Radio.trigger("Gaz", "findHouseNumbers", streetNameList[0]);
                }
                else {
                    this.setFilteredAddressList(this.filterAddressList(addressList, this.get("searchRegExp")));
                }
            }
            else if (streetNameList.length > 0) {
                this.setAddressList([]);
                this.setFilteredAddressList([]);
                this.setStreetNameList(streetNameList);
            }
            else {
                filteredAddressList = this.filterAddressList(addressList, this.get("searchRegExp"));

                this.setFilteredAddressList(filteredAddressList);
                if (filteredAddressList.length === 1) {
                    this.setRoutePositionById("startPoint", this.get("layer").getSource(), filteredAddressList[0].position);

                }
            }
        },

        searchAddress: function (value) {
            Radio.trigger("Gaz", "findStreets", value);
            this.setSearchRegExp(value);
        },

        /**
         * extends the addresses by streets and joinAddresses
         * @param {object[]} addressList - list of addresses
         * @param {string[]} streetNameList - list of street names
         * @returns {object[]} extended addressList
         */
        prepareAddressList: function (addressList, streetNameList) {
            addressList.forEach(function (address) {
                var coords = address.position.split(" ");

                address.position = [parseInt(coords[0], 10), parseInt(coords[1], 10)];
                address.street = streetNameList[0];
                address.joinAddress = address.street.replace(/ /g, "") + address.number + address.affix;
            }, this);

            return addressList;
        },

        /**
         * filters the addresses by the search RegExp
         * @param {object[]} addressList - list of addresses
         * @param {RegExp} searchRegExp -
         * @returns {object[]} filtered list of addresses
         */
        filterAddressList: function (addressList, searchRegExp) {
            return _.filter(addressList, function (address) {
                return address.joinAddress.search(searchRegExp) !== -1;
            }, this);
        },

        /**
         * finds the selected school and sets the route endpoint
         * @param {ol.feature[]} schoolList - features of all schools
         * @param {string} schoolId - id of the school feature
         * @returns {void}
         */
        selectSchool: function (schoolList, schoolId) {
            var school = this.filterSchoolById(schoolList, schoolId),
                coordinates = school.getGeometry().getCoordinates();

            coordinates.pop();
            this.setRoutePositionById("endPoint", this.get("layer").getSource(), coordinates);
        },

        /**
         * add features with an id to the route layer
         * @param {ol.source} source - vector source of the route layer
         * @returns {void}
         */
        addRouteFeatures: function (source) {
            ["startPoint", "endPoint", "route"].forEach(function (id) {
                var feature = new ol.Feature();

                feature.setId(id);
                source.addFeature(feature);
            }, this);
        },

        /**
         * sets the position for the route features
         * @param {string} featureId - id of the feature (startPoint | endPoint)
         * @param {ol.source} source - vector source of the route layer
         * @param {string} coordinates - postion of the feature
         * @returns {void}
         */
        setRoutePositionById: function (featureId, source, coordinates) {
            var geom = new ol.geom.Point(coordinates);

            source.getFeatureById(featureId).setGeometry(geom);
            Radio.trigger("MapView", "setCenter", coordinates);
        },

        /**
         * sets the style for the route features
         * @param {ol.Feature} feature -
         * @returns {ol.Style} feature style
         */
        routeStyle: function (feature) {
            if (feature.getGeometry() instanceof ol.geom.Point) {
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 12,
                        fill: new ol.style.Fill({
                            color: feature.getId() === "startPoint" ? "#005ca9" : "#e10019"
                        }),
                        stroke: new ol.style.Stroke({
                            color: "#ffffff",
                            width: 3
                        })
                    }),
                    text: new ol.style.Text({
                        text: feature.getId() === "startPoint" ? "A" : "B",
                        scale: 1.5,
                        fill: new ol.style.Fill({
                            color: "#ffffff"
                        })
                    })
                });
            }
            return null;
        },

        setSchoolList: function (value) {
            this.set("schoolList", value);
        },

        // getter for isActive
        getIsActive: function () {
            return this.get("isActive");
        },
        // setter for isActive
        setIsActive: function (value) {
            var model;

            this.set("isActive", value);
            if (!value) {
                // tool model aus modellist auf inactive setzen
                model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("id")});

                model.setIsActive(false);
            }
        },

        setStreetNameList: function (value) {
            this.set("streetNameList", value);
        },

        setAddressList: function (value) {
            this.set("addressList", value);
        },

        setSearchRegExp: function (value) {
            this.set("searchRegExp", new RegExp(value.replace(/ /g, ""), "i"));
        },

        setFilteredAddressList: function (value) {
            this.set("addressListFiltered", value);
        },

        /**
         * @param {ol.layer} layer -
         * @returns {void}
         */
        setLayer: function (layer) {
            this.set("layer", layer);
        }
    });

    return SchulwegRouting;
});
