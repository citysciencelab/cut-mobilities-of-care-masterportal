define(function (require) {
    var ol = require("openlayers"),
        SchulwegRouting;

    SchulwegRouting = Backbone.Model.extend({

        defaults: {
            // names of all schools
            schoolNames: [],
            // names of streets found
            streetNameList: [],
            addressList: [],
            addressListFiltered: [],
            // route layer
            layer: {},
            isActive: false,
            id: "schulwegrouting",
            requests: []
        },

        initialize: function () {
            var model,
                testData;

            this.listenTo(Radio.channel("Layer"), {
                "featuresLoaded": function (layerId, features) {
                    if (layerId === "8712") {
                        this.setSchoolNames(this.sortSchoolsByName(features));
                        this.setLayer(Radio.request("Map", "createLayerIfNotExists", "school_route_layer"));
                        this.addRouteFeatures(this.get("layer").getSource());
                        this.get("layer").setStyle(this.routeStyle);
                    }
                }
            });
            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": this.activate,
                "deactivatedTool": this.deactivate
            });
            this.listenTo(Radio.channel("WPS"), {
                "response": this.parseWPSResponse
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
            testData = {
                "Schul-ID": {
                    dataType: "string",
                    value: "5742-0"
                },
                SchuelerStrasse: {
                    dataType: "string",
                    value: "Neuenfelder Straße"
                },
                SchuelerHausnr: {
                    dataType: "integer",
                    value: 19
                },
                SchuelerZusatz: {
                    dataType: "string",
                    value: ""
                },
                RouteAusgeben: {
                    dataType: "boolean",
                    value: 1
                },
                "tm_tag": {
                    dataType: "string",
                    value: "fast"
                }
            };
            this.get("requests").push("123456");
            Radio.trigger("WPS", "request", "1001", "123456", "schulwegrouting.fmw", testData);
        },
        parseWPSResponse: function (requestID, object, status) {
            if (this.isRoutingRequest(this.get("requests"), requestID)) {
                console.log(object);
            }
        },
        isRoutingRequest: function (ownRequests, requestID) {
            return _.contains(ownRequests, requestID);
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
         * @param {string} position - postion of the feature
         * @returns {void}
         */
        setRoutePositionById: function (featureId, source, position) {
            var coords = position.split(" "),
                geom = new ol.geom.Point([parseInt(coords[0], 10), parseInt(coords[1], 10)]);

            source.getFeatureById(featureId).setGeometry(geom);
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

        setSchoolNames: function (value) {
            this.set("schoolNames", value);
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
