define(function (require) {
    var ol = require("openlayers"),
        $ = require("jquery"),
        SnippetCheckboxModel = require("modules/snippets/checkbox/model"),
        SchulwegRouting;

    SchulwegRouting = Backbone.Model.extend({

        defaults: {
            id: "",
            layerId: "",
            // ol-features of all schools
            schoolList: [],
            // the regional school in charge
            regionalSchool: {},
            selectedSchool: {},
            // names of streets found
            startAddress: {},
            streetNameList: [],
            addressList: [],
            addressListFiltered: [],
            // route layer
            layer: {},
            isActive: false,
            requestIDs: [],
            routeResult: {},
            routeDescription: [],
            checkBoxHVV: new SnippetCheckboxModel({
                isSelected: false,
                label: "HVV Verkehrsnetz"
            })
        },

        initialize: function () {
            var layerModel,
                channel = Radio.channel("SchulwegRouting"),
                model;

            this.listenTo(channel, {
                "selectSchool": function (schoolId) {
                    this.trigger("updateSelectedSchool", schoolId);
                    this.selectSchool(this.get("schoolList"), schoolId);
                    this.prepareRequest(this.get("startAddress"));
                }
            }, this);

            this.listenTo(Radio.channel("Layer"), {
                "featuresLoaded": function (layerId, features) {
                    if (layerId === this.get("layerId")) {
                        this.setSchoolList(this.sortSchoolsByName(features));
                        if (this.get("isActive") === true) {
                            this.trigger("render");
                            // this.setIsActive(false);
                            // this.setIsActive(true);
                        }
                    }
                }
            });

            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": this.activate,
                "deactivatedTool": this.deactivate
            });
            this.listenTo(Radio.channel("WPS"), {
                "response": this.handleResponse
            });

            this.listenTo(Radio.channel("Gaz"), {
                "streetNames": function (streetNameList) {
                    this.startSearch(streetNameList, this.get("addressList"));
                },
                "houseNumbers": function (houseNumberList) {
                    this.setAddressList(this.prepareAddressList(houseNumberList, this.get("streetNameList")));
                    this.setAddressListFiltered(this.filterAddressList(this.get("addressList"), this.get("searchRegExp")));
                },
                "getAdress": this.parseRegionalSchool
            });
            this.listenTo(this.get("checkBoxHVV"), {
                "valuesChanged": this.toggleHVVLayer
            });

            this.setLayer(Radio.request("Map", "createLayerIfNotExists", "school_route_layer"));
            this.addRouteFeatures(this.get("layer").getSource());
            this.get("layer").setStyle(this.routeStyle);
            this.setDefaults();
            layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});
            if (!_.isUndefined(layerModel)) {
                this.setSchoolList(this.sortSchoolsByName(layerModel.get("layer").getSource().getFeatures()));
            }
            if (Radio.request("ParametricURL", "getIsInitOpen") === "SCHULWEGROUTING") {
                // model in modellist gets activated.
                // And there the "Tool", "activatedTool" is triggered where this model listens to.
                model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("id")});
                model.setIsActive(true);
            }
        },
        toggleHVVLayer: function (value) {
            Radio.trigger("ModelList", "setModelAttributesById", "1935geofox-bus", {
                isSelected: value,
                isVisibleInMap: value
            });
            Radio.trigger("ModelList", "setModelAttributesById", "1935geofox_BusName", {
                isSelected: value,
                isVisibleInMap: value
            });
            Radio.trigger("ModelList", "setModelAttributesById", "1935geofox-bahn", {
                isSelected: value,
                isVisibleInMap: value
            });
            Radio.trigger("ModelList", "setModelAttributesById", "1935geofox_Faehre", {
                isSelected: value,
                isVisibleInMap: value
            });
            Radio.trigger("ModelList", "setModelAttributesById", "1933geofox_stations", {
                isSelected: value,
                isVisibleInMap: value
            });
        },

        setDefaults: function () {
            var config = Radio.request("Parser", "getItemByAttributes", {id: "schulwegrouting"});

            _.each(config, function (value, key) {
                this.set(key, value);
            }, this);
        },

        printRoute: function () {
            var address = this.get("startAddress"),
                school = this.get("selectedSchool"),
                route = this.get("routeResult"),
                routeDesc = this.get("routeDescription"),
                filename = "Schulweg_zu_" + school.get("schulname"),
                mapCanvas = document.getElementsByTagName("canvas")[0],
                screenshotMap = mapCanvas.toDataURL("image/png"),
                title = "Schulwegrouting",
                pdfDef = this.createPDFDef(screenshotMap, address, school, route, routeDesc);

            Radio.trigger("BrowserPrint", "print", filename, pdfDef, title, "download");
        },
        createPDFDef: function (screenshotMap, address, school, route, routeDescription) {
            var addr = address.street + " " + address.number + address.affix,
                schoolname = school.get("schulname") + ", " + route.SchuleingangTyp + " (" + route.SchuleingangAdresse + ")",
                routeDesc = this.createRouteDesc(routeDescription),
                defs = {
                    pageSize: "A4",
                    pageOrientation: "portrait",
                    content: [
                        {
                            image: screenshotMap,
                            fit: [500, 500],
                            style: ["image", "center"]
                        },
                        {
                            text: "Zusammenfassung:",
                            style: "subheader"
                        },
                        {
                            canvas: [{
                                type: "rect",
                                x: 0,
                                y: 0,
                                w: 500,
                                h: 90,
                                r: 0,
                                color: "#e5e5e5"
                            }],
                            style: "center"
                        },
                        {
                            text: [
                                {text: "Die Gesamtlänge beträgt ", style: "normal"},
                                {text: route.kuerzesteStrecke + "m.\n", style: ["normal", "bold"]},
                                {text: "von:\n", style: "small"},
                                {text: addr + "\n", style: ["normal", "bold"]},
                                {text: "nach:\n", style: "small"},
                                {text: schoolname + "\n", style: ["normal", "bold"]}
                            ],
                            relativePosition: {
                                x: 0,
                                y: -90
                            },
                            style: ["onGrey", "center"],
                            pageBreak: "after"
                        },
                        {
                            text: "Routenbeschreibung:",
                            style: "subheader"
                        },
                        {
                            ol: routeDesc
                        }
                    ]
                };

            return defs;
        },
        createRouteDesc: function (routeDescArray) {
            return _.pluck(routeDescArray, "anweisung");
        },
        handleResponse: function (requestID, response, status) {
            var parsedData;

            if (this.isRoutingRequest(this.get("requestIDs"), requestID)) {
                this.toggleLoader(false);
                this.removeId(this.get("requestIDs"), requestID);
                if (status === 200) {
                    parsedData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.Schulweg.Ergebnis;
                    if (parsedData.ErrorOccured === "yes") {
                        this.handleWPSError(parsedData);
                    }
                    else {
                        this.handleSuccess(parsedData);
                    }
                }
                else {
                    this.handleWPSError("Routing kann nicht durchgeführt werden.<br>Bitte versuchen Sie es später erneut (Status: " + status + ").");
                }
            }
        },
        handleWPSError: function (response) {
            Radio.trigger("Alert", "alert", JSON.stringify(response));
            this.resetRoute();
        },
        handleSuccess: function (response) {
            var routeGeometry = this.parseRoute(response.route.edge),
                routeDescription = response.routenbeschreibung.part;

            this.setGeometryByFeatureId("route", this.get("layer").getSource(), routeGeometry);
            response.kuerzesteStrecke = Radio.request("Util", "punctuate", response.kuerzesteStrecke);
            this.setRouteResult(response);
            this.setRouteDescription(routeDescription);
            this.trigger("togglePrintEnabled", true);
        },
        findRegionalSchool: function (address) {
            var gazAddress = {};

            if (!_.isEmpty(address)) {
                gazAddress.streetname = address.street;
                gazAddress.housenumber = address.number;
                gazAddress.affix = address.affix;
                Radio.trigger("Gaz", "adressSearch", gazAddress);
            }
        },
        parseRegionalSchool: function (xml) {
            var schoolId,
                school;

            if ($(xml).find("gages\\:grundschulnr").length > 0) {
                schoolId = $(xml).find("gages\\:grundschulnr")[0].textContent + "-0";
                school = this.filterSchoolById(this.get("schoolList"), schoolId);
                this.setRegionalSchool(school);
                this.trigger("updateRegionalSchool", school.get("schulname"));
            }
            else {
                this.setRegionalSchool({});
                this.trigger("updateRegionalSchool", "Keine Schule gefunden!");
            }
        },

        /**
         * creates one MultiLineString geometry from the routing parts
         * @param {object[]} routeParts - the routing parts including wkt geometry
         * @returns {ol.geom.MultiLineString} multiLineString - the route geometry
         */
        parseRoute: function (routeParts) {
            var wktParser = new ol.format.WKT(),
                multiLineString = new ol.geom.MultiLineString();

            routeParts.forEach(function (routePart) {
                multiLineString.appendLineString(wktParser.readGeometry(routePart.wkt));
            });
            return multiLineString;
        },
        prepareRequest: function (address) {
            var schoolID = !_.isEmpty(this.get("selectedSchool")) ? this.get("selectedSchool").get("schul_id") : "",
                requestID = _.uniqueId("schulwegrouting_"),
                requestObj = {};

            if (Object.keys(address).length !== 0 && schoolID.length > 0) {
                requestObj = this.setObjectAttribute(requestObj, "Schul-ID", "string", schoolID);
                requestObj = this.setObjectAttribute(requestObj, "SchuelerStrasse", "string", address.street);
                requestObj = this.setObjectAttribute(requestObj, "SchuelerHausnr", "integer", parseInt(address.number, 10));
                requestObj = this.setObjectAttribute(requestObj, "SchuelerZusatz", "string", address.affix);
                requestObj = this.setObjectAttribute(requestObj, "RouteAusgeben", "boolean", 1);
                requestObj = this.setObjectAttribute(requestObj, "tm_tag", "string", "fast");

                this.sendRequest(requestID, requestObj);
            }
        },
        sendRequest: function (requestID, requestObj) {
            this.get("requestIDs").push(requestID);
            this.toggleLoader(true);
            Radio.trigger("WPS", "request", "1001", requestID, "schulwegrouting.fmw", requestObj);
        },
        toggleLoader: function (show) {
            if (show) {
                $("#loader").show();
            }
            else {
                $("#loader").hide();
            }
        },
        setObjectAttribute: function (object, attrName, dataType, value) {
            var dataObj = {
                dataType: dataType,
                value: value
            };

            object[attrName] = dataObj;
            return object;
        },
        removeId: function (requests, requestId) {
            var index = requests.indexOf(requestId);

            if (index > -1) {
                requests.splice(index, 1);
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
         * filters the schools by id. returns the first hit
         * @param {ol.feature[]} schoolList - features of all schools
         * @param {string} schoolId - id of the school feature
         * @returns {ol.feature} -
         */
        filterSchoolById: function (schoolList, schoolId) {
            return _.find(schoolList, function (school) {
                return school.get("schul_id") === schoolId;
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
                    this.setAddressListFiltered(this.filterAddressList(addressList, this.get("searchRegExp")));
                }
            }
            else if (streetNameList.length > 0) {
                this.setAddressList([]);
                this.setAddressListFiltered([]);
                this.setStreetNameList(streetNameList);
            }
            else {
                filteredAddressList = this.filterAddressList(addressList, this.get("searchRegExp"));

                this.setAddressListFiltered(filteredAddressList);
                if (filteredAddressList.length === 1) {
                    this.setStartAddress(filteredAddressList[0]);
                    this.setGeometryByFeatureId("startPoint", this.get("layer").getSource(), filteredAddressList[0].geometry);
                }
            }
        },

        searchAddress: function (value) {
            Radio.trigger("Gaz", "findStreets", value);
            this.setSearchRegExp(value);
        },

        /**
         * finds a specific address in the address list and calls 'setGeometryByFeatureId' for the startPoint
         * will be executed after a click on a address in the hitList
         * @param {string} searchString -
         * @param {object[]} addressListFiltered - filtered list of addresses
         * @returns {void}
         */
        selectStartAddress: function (searchString, addressListFiltered) {
            var startAddress = _.find(addressListFiltered, function (address) {
                return address.joinAddress === searchString.replace(/ /g, "");
            });

            this.setStartAddress(startAddress);
            this.setGeometryByFeatureId("startPoint", this.get("layer").getSource(), startAddress.geometry);
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

                address.geometry = new ol.geom.Point([parseInt(coords[0], 10), parseInt(coords[1], 10)]);
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
         * finds the selected school, sets the school and sets the endpoint geometry
         * @param {ol.feature[]} schoolList - features of all schools
         * @param {string} schoolId - id of the school feature
         * @returns {void}
         */
        selectSchool: function (schoolList, schoolId) {
            var school = this.filterSchoolById(schoolList, schoolId);

            this.setSelectedSchool(school);
            this.setGeometryByFeatureId("endPoint", this.get("layer").getSource(), school.getGeometry());
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
         * sets the geometry for the route features and zoom to the feature extent
         * @param {string} featureId - id of the feature (startPoint | endPoint)
         * @param {ol.source} source - vector source of the route layer
         * @param {string} geometry - geometry of the feature
         * @returns {void}
         */
        setGeometryByFeatureId: function (featureId, source, geometry) {
            source.getFeatureById(featureId).setGeometry(geometry);
            if (geometry.getType() === "Point") {
                Radio.trigger("MapView", "setCenter", geometry.getCoordinates(), 6);
            }
            else {
                Radio.trigger("Map", "zoomToExtent", geometry.getExtent());
            }
        },

        /**
         * sets the style for the route features
         * @param {ol.Feature} feature -
         * @returns {ol.Style} feature style
         */
        routeStyle: function (feature) {
            if (feature.getGeometry() instanceof ol.geom.Point) {
                return [
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 18,
                            stroke: new ol.style.Stroke({
                                color: feature.getId() === "startPoint" ? "#005ca9" : "#e10019",
                                width: 3
                            }),
                            fill: new ol.style.Fill({
                                color: "rgba(255, 255, 255, 0)"
                            })
                        })
                    }),
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 4,
                            fill: new ol.style.Fill({
                                color: feature.getId() === "startPoint" ? "#005ca9" : "#e10019"
                            })
                        })
                    })
                ];
            }
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "rgba(225, 0, 25, 0.6)",
                    width: 6
                })
            });
        },
        resetRoute: function () {
            var features = this.get("layer").getSource().getFeatures();

            this.setStartAddress({});
            this.setSelectedSchool({});
            this.setAddressListFiltered([]);
            this.removeGeomFromFeatures(features);
            this.trigger("resetRouteResult");
            this.trigger("togglePrintEnabled", false);
        },
        removeGeomFromFeatures: function (features) {
            _.each(features, function (feature) {
                feature.unset("geometry");
            });
        },

        setSchoolList: function (value) {
            this.set("schoolList", value);
        },
        getIsActive: function () {
            return this.get("isActive");
        },
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

        setAddressListFiltered: function (value) {
            this.set("addressListFiltered", value);
        },
        setLayer: function (layer) {
            this.set("layer", layer);
        },
        setRegionalSchool: function (value) {
            this.set("regionalSchool", value);
        },
        setSelectedSchool: function (value) {
            this.set("selectedSchool", value);
        },
        setStartAddress: function (value) {
            this.set("startAddress", value);
        },
        setRouteResult: function (value) {
            this.set("routeResult", value);
        },
        setRouteDescription: function (value) {
            this.set("routeDescription", value);
        }
    });

    return SchulwegRouting;
});
