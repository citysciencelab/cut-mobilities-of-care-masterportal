import Tool from "../../core/modelList/tool/model";
import BuildSpecModel from "../print_/buildSpec";
import SnippetCheckboxModel from "../../snippets/checkbox/model";
import {Circle as CircleStyle, Fill, Stroke, Style} from "ol/style.js";
import {MultiLineString, Point} from "ol/geom.js";
import {WKT} from "ol/format.js";
import Feature from "ol/Feature.js";
import {search} from "masterportalAPI";
import {setGazetteerUrl} from "masterportalAPI";

const SchulwegRouting = Tool.extend(/** @lends SchulwegRouting.prototype */{

    defaults: _.extend({}, Tool.prototype.defaults, {
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
        layer: undefined,
        isActive: false,
        routeResult: {},
        routeDescription: [],
        checkBoxHVV: undefined,
        renderToSidebar: true,
        renderToWindow: false,
        glyphicon: "glyphicon-filter",
        serviceId: "88"
    }),

    /**
     * @class SchulwegRouting
     * @extends Tool
     * @memberof Tools.SchulwegRouting_hh
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("SchulwegRouting"),
            gazService = Radio.request("RestReader", "getServiceById", this.get("serviceId"));

        this.superInitialize();

        if (gazService) {
            setGazetteerUrl(gazService.get("url"));
        }

        this.setCheckBoxHVV(new SnippetCheckboxModel({
            isSelected: false,
            label: "HVV Verkehrsnetz"
        }));

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
                    this.setLayer(Radio.request("Map", "createLayerIfNotExists", "school_route_layer"));
                    this.addRouteFeatures(this.get("layer").getSource());
                    this.get("layer").setStyle(this.routeStyle);
                    this.setSchoolList(this.sortSchoolsByName(features));
                    if (this.get("isActive") === true) {
                        this.trigger("render");
                    }
                }
            }
        });

        this.listenTo(this.get("checkBoxHVV"), {
            "valuesChanged": this.toggleHVVLayer
        });

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value && _.isUndefined(this.get("layer"))) {
                    this.setLayer(Radio.request("Map", "createLayerIfNotExists", "school_route_layer"));
                    this.addRouteFeatures(this.get("layer").getSource());
                    this.get("layer").setStyle(this.routeStyle);
                }
            }
        });

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId, features) {
                if (layerId === this.get("layerId")) {
                    this.setSchoolList(this.sortSchoolsByName(features));
                }
            }
        });
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

    printRouteMapFish: function () {
        var visibleLayerList = Radio.request("Map", "getLayers").getArray().filter(function (layer) {
                return layer.getVisible() === true;
            }),
            address = this.get("startAddress"),
            school = this.get("selectedSchool"),
            route = this.get("routeResult"),
            routeDesc = this.prepareRouteDesc(this.get("routeDescription")),
            attr = {
                "layout": "A4 Hochformat",
                "outputFormat": "pdf",
                "attributes": {
                    "title": "Schulwegrouting",
                    "length": route.kuerzesteStrecke + "m",
                    "address": address.name,
                    "school": school.get("schulname") + ", " + route.SchuleingangTyp + " (" + route.SchuleingangAdresse + ")",
                    "map": {
                        "dpi": 96,
                        "projection": Radio.request("MapView", "getProjection").getCode(),
                        "center": Radio.request("MapView", "getCenter"),
                        "scale": Radio.request("MapView", "getOptions").scale
                    },
                    "datasource": [{
                        "table": {
                            "columns": ["index", "description"],
                            "data": routeDesc
                        }
                    }]
                }
            },
            buildSpec = new BuildSpecModel(attr);

        buildSpec.buildLayers(visibleLayerList);
        buildSpec = buildSpec.toJSON();
        buildSpec = _.omit(buildSpec, "uniqueIdList");
        Radio.trigger("Print", "createPrintJob", "schulwegrouting", encodeURIComponent(JSON.stringify(buildSpec)), "pdf");
    },

    prepareRouteDesc: function (routeDesc) {
        var data = [];

        _.each(routeDesc, function (route, index) {
            data.push([String(index + 1), route.anweisung]);
        });
        return data;
    },

    handleResponse: function (response, status) {
        var parsedData;

        this.toggleLoader(false);
        if (status === 200) {
            if (_.has(response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData, "Schulweg")) {
                parsedData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.Schulweg.Ergebnis;
                if (parsedData.ErrorOccured === "yes") {
                    this.handleWPSError(parsedData);
                }
                else {
                    this.handleSuccess(parsedData);
                }
            }
            else {
                Radio.trigger("Alert", "alert", "<b>Entschuldigung</b><br>"
                    + "Routing konnte nicht berechnet werden, mit folgender Fehlermeldung:<br><br>"
                    + "<i>" + response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData.serviceResponse.statusInfo.message + "</i><br><br>"
                    + "Bitte wenden Sie sich mit dieser Fehlermeldung an den Administrator.");
            }
        }
        else {
            this.handleWPSError("Routing kann nicht durchgeführt werden.<br>Bitte versuchen Sie es später erneut (Status: " + status + ").");
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
        if (!_.isArray(routeDescription)) {
            routeDescription = [routeDescription];
        }
        this.setRouteDescription(routeDescription);
        this.trigger("togglePrintEnabled", true);
    },

    /**
     * Search for school.
     * @param {String} address address for searching school
     * @returns {void}
     */
    findRegionalSchool: function (address) {
        if (address !== "") {
            search(address, {
                map: Radio.request("Map", "getMap"),
                searchAddress: true
            }).then(hits => this.parseRegionalSchool(hits));
        }
    },

    parseRegionalSchool: function (addresses) {
        let school,
            primarySchoolId,
            schoolWithAdress;

        if (addresses.length > 0) {
            primarySchoolId = addresses[0].properties.grundschulnr + "-0";
            school = this.filterSchoolById(this.get("schoolList"), primarySchoolId);
            this.setRegionalSchool(school);
            schoolWithAdress = school.get("schulname") + ", " + school.get("adresse_strasse_hausnr");
            this.setSchoolWithAdress(schoolWithAdress);
            this.trigger("updateRegionalSchool", schoolWithAdress);
        }
        else {
            this.setRegionalSchool({});
            this.trigger("updateRegionalSchool", "Keine Schule gefunden!");
        }
    },

    /**
     * creates one MultiLineString geometry from the routing parts.
     * @param {object[]} routeParts - the routing parts including wkt geometry
     * @returns {ol.geom.MultiLineString} multiLineString - the route geometry
     */
    parseRoute: function (routeParts) {
        var wktParser = new WKT(),
            multiLineString = new MultiLineString({});

        if (_.isArray(routeParts)) {
            routeParts.forEach(function (routePart) {
                multiLineString.appendLineString(wktParser.readGeometry(routePart.wkt));
            });
        }
        else {
            multiLineString.appendLineString(wktParser.readGeometry(routeParts.wkt));
        }
        return multiLineString;
    },

    /**
     * Prepares an address and a school for calculating the school route.
     * @param {Object} address An address to route from.
     * @fires Tools.GFI#RadioTriggerGFISetVisible
     * @returns {void}
     */
    prepareRequest: function (address) {
        const schoolID = !_.isEmpty(this.get("selectedSchool")) ? this.get("selectedSchool").get("schul_id") : "";
        let requestObj = {},
            addressHouseNumberComplete,
            addressStreet;

        if (Object.keys(address).length !== 0 && schoolID.length > 0) {
            addressHouseNumberComplete = address.properties.hausnummerkomplett ? address.properties.hausnummerkomplett : "";
            addressStreet = address.name.substring(0, address.name.length - addressHouseNumberComplete.length - 1);

            Radio.trigger("GFI", "setIsVisible", false);
            requestObj = this.setObjectAttribute(requestObj, "Schul-ID", "string", schoolID);
            requestObj = this.setObjectAttribute(requestObj, "SchuelerStrasse", "string", addressStreet);
            requestObj = this.setObjectAttribute(requestObj, "SchuelerHausnr", "integer", parseInt(address.houseNumber, 10));
            requestObj = this.setObjectAttribute(requestObj, "SchuelerZusatz", "string", address.houseNumberSupplement);
            requestObj = this.setObjectAttribute(requestObj, "RouteAusgeben", "boolean", 1);
            requestObj = this.setObjectAttribute(requestObj, "tm_tag", "string", "fast");

            this.sendRequest(requestObj);
        }
    },

    /**
     * Starts a WPS to determine a way to school.
     * @param {Object} requestObj contains parameters to determine the way to school
     * @fires Core#RadioTriggerWPSRequest
     * @returns {void}
     */
    sendRequest: function (requestObj) {
        this.toggleLoader(true);
        Radio.trigger("WPS", "request", "1001", "schulwegrouting_wps.fmw", requestObj, this.handleResponse.bind(this));
    },

    toggleLoader: function (show) {
        if (show) {
            Radio.trigger("Util", "showLoader");
        }
        else {
            Radio.trigger("Util", "hideLoader");
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

    isRoutingRequest: function (ownRequests, requestID) {
        return _.contains(ownRequests, requestID);
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
        return schoolList.find(school => school.get("schul_id") === schoolId);
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
                this.searchHouseNumbers(streetNameList[0]);
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

    /**
     * Searches for street names in the gazetter via the Masterportal API.
     * The search is only executed if the string does not end with a blank.
     * @param {String} searchAddress String to be searched for in gazetter.
     * @fires Core#RadioRequestMapGetMap
     * @returns {void}
     */
    searchAddress: function (searchAddress) {
        const addressList = this.get("addressList");

        if (!(/[ \f\t\v]$/).test(searchAddress)) {
            search(searchAddress, {
                map: Radio.request("Map", "getMap"),
                searchStreets: true
            }).then(hits => {
                const hitNames = hits.map(hit => hit.name);

                this.startSearch(hitNames.sort(), addressList);
            });
        }
        else {
            this.startSearch([], addressList);
        }

        this.setSearchRegExp(searchAddress);
    },

    /**
     * Searches for house numbers for a given street name in the gazetter via the Masterportal API.
     * @param {String} searchAddress String to be searched for in gazetter.
     * @fires Core#RadioRequestMapGetMap
     * @fires Core#RadioRequestUtilSort
     * @returns {void}
     */
    searchHouseNumbers: function (searchAddress) {
        search(searchAddress, {
            map: Radio.request("Map", "getMap"),
            searchStreets: true,
            searchHouseNumbers: true
        }).then(hits => {
            const hitsWithoutStreets = this.removeStreetsFromAddressList(hits),
                preparedList = this.prepareAddressList(hitsWithoutStreets),
                sortedPreparedList = Radio.request("Util", "sort", preparedList, "houseNumber", "houseNumberSupplement");

            this.setAddressList(sortedPreparedList);
            this.setAddressListFiltered(this.filterAddressList(this.get("addressList"), this.get("searchRegExp")));
        });

        this.setSearchRegExp(searchAddress);
    },

    /**
     * finds a specific address in the address list and calls 'setGeometryByFeatureId' for the startPoint
     * will be executed after a click on a address in the hitList
     * @param {string} searchString -
     * @param {object[]} addressListFiltered - filtered list of addresses
     * @returns {void}
     */
    selectStartAddress: function (searchString, addressListFiltered) {
        const startAddress = addressListFiltered.find(address => address.name === searchString);

        this.setStartAddress(startAddress);
        this.setGeometryByFeatureId("startPoint", this.get("layer").getSource(), startAddress.geometry);
    },

    /**
     * Filters streets from the address list.
     * @param {Object[]} addressList - list of addresses
     * @returns {Object[]} addressList without streets
     */
    removeStreetsFromAddressList: function (addressList) {
        return addressList.filter(address => address.type !== "street");
    },

    /**
     * Extends the addresses by house number and house number supplement
     * and overwrites the geometry with an ol.point.
     * @param {Object[]} addressList - list of addresses
     * @returns {Object[]} extended addressList
     */
    prepareAddressList: function (addressList) {
        addressList.forEach(address => {
            address.geometry = new Point([parseInt(address.geometry.coordinates[0], 10), parseInt(address.geometry.coordinates[1], 10)]);
            address.houseNumber = address.properties.hausnummer ? address.properties.hausnummer._ : "";
            address.houseNumberSupplement = address.properties.hausnummernzusatz ? address.properties.hausnummernzusatz._ : "";
        });

        return addressList;
    },

    /**
     * filters the addresses by the search RegExp
     * @param {object[]} addressList - list of addresses
     * @param {RegExp} searchRegExp -
     * @returns {object[]} filtered list of addresses
     */
    filterAddressList: function (addressList, searchRegExp) {
        return addressList.filter(address => address.name.search(searchRegExp) !== -1);
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
            var feature = new Feature();

            feature.setId(id);
            feature.set("styleId", id);
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
            Radio.trigger("Map", "zoomToExtent", source.getExtent());
        }
        Radio.trigger("MapView", "setZoomLevelDown");
    },

    /**
     * sets the style for the route features
     * @param {ol.Feature} feature -
     * @returns {ol.Style} feature style
     */
    routeStyle: function (feature) {
        if (feature.getGeometry() instanceof Point) {
            return [
                new Style({
                    image: new CircleStyle({
                        radius: 18,
                        stroke: new Stroke({
                            color: feature.getId() === "startPoint" ? [0, 92, 169, 1] : [225, 0, 25, 1],
                            width: 3
                        }),
                        fill: new Fill({
                            color: [255, 255, 255, 0]
                        })
                    })
                }),
                new Style({
                    image: new CircleStyle({
                        radius: 4,
                        fill: new Fill({
                            color: feature.getId() === "startPoint" ? [0, 92, 169, 1] : [225, 0, 25, 1]
                        })
                    })
                })
            ];
        }
        return new Style({
            stroke: new Stroke({
                color: [225, 0, 25, 0.6],
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

    /**
     * Searches all streets that contain the string
     * @param {String} evtValue - input streetname
     * @returns {array} targetList
     */
    filterStreets: function (evtValue) {
        var streetNameList = this.get("streetNameList"),
            targetStreet = evtValue.split(" ")[0],
            targetList = [];

        _.each(streetNameList, function (street) {
            var streetNameParts = _.contains(street, " ") ? street.split(" ") : [street],
                resultStreets = streetNameParts.filter(function (part) {
                    return part.toLowerCase() === targetStreet.toLowerCase();
                }, this);

            if (!_.isEmpty(resultStreets)) {
                targetList.push(street);
            }
        }, this);

        return targetList;
    },

    setCheckBoxHVV: function (value) {
        this.set("checkBoxHVV", value);
    },

    setSchoolList: function (value) {
        this.set("schoolList", value);
    },

    setStreetNameList: function (value) {
        this.set("streetNameList", value);
    },

    setAddressList: function (value) {
        this.set("addressList", value);
    },

    setSearchRegExp: function (value) {
        this.set("searchRegExp", new RegExp(value.replace(/ /g, " "), "i"));
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
    },
    setSchoolWithAdress: function (value) {
        this.set("schoolWithAdress", value);
    },
    setPrintRoute: function (value) {
        this.set("printRoute", value);
    }
});

export default SchulwegRouting;
