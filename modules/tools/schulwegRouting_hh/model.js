define(function (require) {
    var ol = require("openlayers"),
        $ = require("jquery"),
        momentJS = require("moment"),
        SchulwegRouting;

    SchulwegRouting = Backbone.Model.extend({

        defaults: {
            // ol-features of all schools
            schoolList: [],
            selectedSchool: {},
            // names of streets found
            startAddress: {},
            streetNameList: [],
            addressList: [],
            addressListFiltered: [],
            // route layer
            layer: {},
            isActive: false,
            id: "schulwegrouting",
            requestIDs: [],
            useRegionalSchool: false,
            routeResult: {},
            routeDescription: []
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
        printRoute: function () {
            var map = Radio.request("Map", "createScreenshot"),
                address = this.get("startAddress"),
                school = this.get("selectedSchool"),
                route = this.get("routeResult"),
                date = momentJS(new Date()).format("DD.MM.YYYY"),
                pdfDef = this.createPDFDef(map, address, school, route, date);

            Radio.trigger("BrowserPrint", "print", "Ihr_Schulweg", pdfDef, "download");
        },
        createPDFDef: function (map, address, school, route, date) {
            var addr = address.street + " " + address.number + address.affix,
                schoolname = school.get("schulname") + ", " + route.SchuleingangTyp + " (" + route.SchuleingangAdresse + ")",
                routeDesc = this.createRouteDesc(route.routenbeschreibung.part),
                defs = {
                    pageSize: "A4",
                    pageOrientation: "portrait",
                    content: [
                        {
                            text: [
                                {
                                    text: "Schulwegrouting",
                                    style: ["header", "bold", "center"]
                                },
                                {
                                    text: " (Stand: " + date + ")",
                                    style: ["normal", "center"]
                                }
                            ]
                        },
                        {
                            image: map,
                            fit: [500, 500],
                            style: "image"
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
                                color: "gray"
                            }]
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
                    ],
                    footer: function (currentPage, pageCount) {
                        var footer = [
                            {
                                text: currentPage.toString() + " / " + pageCount,
                                style: ["normal", "center"]
                            },
                            {
                                text: "Geoinformationen © Landesbetrieb Geoinformation und Vermessung, www.geoinfo.hamburg.de",
                                style: ["small", "center"]
                            }];

                        return footer;
                    },
                    styles: {
                        header: {
                            fontSize: 18
                        },
                        subheader: {
                            fontSize: 14,
                            margin: [0, 10]
                        },
                        normal: {
                            fontSize: 12
                        },
                        bold: {
                            bold: true
                        },
                        small: {
                            fontSize: 10
                        },
                        image: {
                            margin: [0, 10],
                            alignment: "left"
                        },
                        onGrey: {
                            margin: [10, 10]
                        },
                        center: {
                            alignment: "center"
                        }
                    }
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
            var schoolID = $(xml).find("gages\\:grundschulnr")[0].textContent + "-0";

            if (this.get("useRegionalSchool") === true) {
                this.trigger("updateSelectedSchool", schoolID);
                this.selectSchool(this.get("schoolList"), schoolID);
                this.prepareRequest(this.get("startAddress"));
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

            if (!_.isUndefined(address) && schoolID.length > 0) {
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
            Radio.trigger("Map", "zoomToExtent", geometry.getExtent());
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
            return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "rgba(225, 0, 25, 0.6)",
                    width: 6
                })
            });
        },
        resetRoute: function () {
            var features = this.get("layer").getSource().getFeatures();

            this.removeGeomFromFeatures(features);
            this.trigger("resetRouteResult");
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
        setUseRegionalSchool: function (value) {
            this.set("useRegionalSchool", value);
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
