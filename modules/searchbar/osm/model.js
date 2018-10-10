define(function (require) {
    var $ = require("jquery"),
        OsmModel;

    require("modules/searchbar/model");

    OsmModel = Backbone.Model.extend({
        defaults: {
            minChars: 3,
            osmServiceUrl: "",
            limit: 50,
            street: "",
            states: "",
            searchParams: [],
            classes: [],
            ajaxRequest: null
        },
        /**
         * @description Initialisierung der OSM Suche
         * @param {Object} config - Das Konfigurationsobjet der OSM Suche.
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @param {string} config.osmServiceUrl - ID aus rest-services für URL.
         * @param {integer} [config.limit=50] - Anzahl der über angefragten Vorschläge.
         * @param {string}  [osm.states=""] - Liste der Bundesländer für die Trefferauswahl.
         * @returns {void}
         */
        initialize: function (config) {
            var service = Radio.request("RestReader", "getServiceById", config.serviceId);

            if (!_.isUndefined(config.minChars)) {
                this.setMinChars(config.minChars);
            }
            if (!_.isUndefined(service) && !_.isUndefined(service.get("url"))) {
                this.setOsmServiceUrl(service.get("url"));
            }
            if (!_.isUndefined(config.limit)) {
                this.setLimit(config.limit);
            }
            // über den Parameter "states" kann in der configdatei die Suche auf ander Bundesländer erweitert werden
            // Der Eintrag in "states" muss ein string mit den gewünschten Ländern von "address.state" der Treffer sein...
            if (!_.isUndefined(config.states)) {
                this.setStates(config.states);
            }

            if (!_.isUndefined(config.classes)) {
                this.setClasses(config.classes);
            }

            if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
                this.search(Radio.request("ParametricURL", "getInitString"));
            }
            this.listenTo(Radio.channel("Searchbar"), {
                // "search": this.search
                "searchAll": this.search
            });
        },
        /**
         * Einstieg fuer die Suche...
         * Wird von der Searchbar getriggert.
         * @param {string} searchString -
         * @returns {void}
         */
        search: function (searchString) {

            if (searchString.length >= this.get("minChars")) {
                Radio.trigger("Searchbar", "removeHits", "hitList", {type: "OpenStreetMap"});
                this.suggestByOSM(searchString);
            }
            else {
                Radio.trigger("Searchbar", "abortSearch", "osm");
            }
        },
        /**
         * Suchstring (Strasse HsNr) durch Anwender aufgebaut...
         * @param {string} searchString -
         * @returns {void}
         */
        suggestByOSM: function (searchString) {
            var request,
                searchStrings = [],
                tmp = searchString.split(",");

            _.each(tmp, function (elem) {
                if (elem.indexOf(" ") > -1) {
                    _.each(elem.split(" "), function (elem2) {
                        if (elem2.trim().length > 0) {
                            this.push(elem2);
                        }
                    }, this);
                }
                else {
                    this.push(elem);
                }
            }, searchStrings);

            this.setSearchParams(searchStrings);

            request = "countrycodes=de&format=json&polygon=0&addressdetails=1&extratags=1&limit=" + this.get("limit");
            request = request + "&q=" + encodeURIComponent(searchString);

            this.sendRequest(this.get("osmServiceUrl"), request, this.pushSuggestions);
        },

        /**
         * Treffer der ersten Suche auswerten; Angebotsliste erstellen
         * [pushSuggestions description]
         * @param  {[type]} data [description]
         * @returns {void}
         */
        pushSuggestions: function (data) {
            var display,
                metaName,
                bbox,
                north,
                east,
                upper,
                lower,
                center,
                weg;

            _.each(data, function (hit) {
                if (this.get("states").length === 0 || this.get("states").includes(hit.address.state)) {
                    if (this.isSearched(hit, this.get("searchParams"))) {
                        weg = hit.address.road || hit.address.pedestrian;
                        display = hit.address.city || hit.address.city_district || hit.address.town || hit.address.village;
                        if (!_.isUndefined(weg)) {
                            display = display + ", " + weg;
                            if (!_.isUndefined(hit.address.house_number)) {
                                display = display + " " + hit.address.house_number;
                            }
                        }

                        // Tooltip
                        metaName = display;
                        if (!_.isUndefined(hit.address.postcode) && !_.isUndefined(hit.address.state)) {
                            metaName = metaName + ", " + hit.address.postcode + " " + hit.address.state;
                            if (!_.isUndefined(hit.address.suburb)) {
                                metaName = metaName + " (" + hit.address.suburb + ")";
                            }
                        }

                        bbox = hit.boundingbox;
                        if (!_.isUndefined(hit.address.house_number)) {
                            // Zentrum der BoundingBox ermitteln und von lat/lon ins Zielkoordinatensystem transformieren...
                            north = (parseFloat(bbox[0]) + parseFloat(bbox[1])) / 2.0;
                            east = (parseFloat(bbox[2]) + parseFloat(bbox[3])) / 2.0;
                            center = Radio.request("CRS", "transformToMapProjection", "WGS84", [east, north]);
                        }
                        else {
                            upper = Radio.request("CRS", "transformToMapProjection", "WGS84", [parseFloat(bbox[3]), parseFloat(bbox[1])]);
                            lower = Radio.request("CRS", "transformToMapProjection", "WGS84", [parseFloat(bbox[2]), parseFloat(bbox[0])]);
                            center = [
                                lower[0],
                                lower[1],
                                upper[0],
                                upper[1]
                            ];
                        }
                        Radio.trigger("Searchbar", "pushHits", "hitList", {
                            name: display,
                            metaName: metaName,
                            type: "OpenStreetMap",
                            osm: true,
                            glyphicon: "glyphicon-road",
                            id: _.uniqueId("osmSuggest"),
                            marker: hit.class === "building",
                            coordinate: center
                        });
                    }
                }
            }, this);
            Radio.trigger("Searchbar", "createRecommendedList", "osm");
        },

        /**
         * stellt fest, ob Das Ergebnis alle eingegebenen Parameter enthält
         * @param  {[object]} searched Das zu untersuchende Suchergebnis
         * @param  {[array]} params Das Ergebnis aufgesplittet
         * @returns {boolean} true | false
         */
        isSearched: function (searched, params) {
            var hits = [],
                address = searched.address;

            if (this.canShowHit(searched)) {

                _.each(params, function (param) {
                    if ((_.has(address, "house_number") && address.house_number !== null && address.house_number.toLowerCase() === param.toLowerCase()) ||
                        (_.has(address, "road") && address.road !== null && address.road.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                        (_.has(address, "pedestrian") && address.pedestrian !== null && address.pedestrian.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                        (_.has(address, "city") && address.city !== null && address.city.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                        (_.has(address, "city_district") && address.city_district !== null && address.city_district.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                        (_.has(address, "town") && address.town !== null && address.town.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                        (_.has(address, "village") && address.village !== null && address.village.toLowerCase().indexOf(param.toLowerCase()) > -1) ||
                        (_.has(address, "suburb") && address.suburb !== null && address.suburb.toLowerCase().indexOf(param.toLowerCase()) > -1)
                    ) {
                        hits.push(param);
                    }
                });
            }

            return params.length === hits.length;
        },

        /**
         * stellt fest ob der Treffer von den Parametern angezeigt wird oder nicht
         * @param  {[type]} hit [description] Suchtreffer
         * @returns {boolean} true | false
         */
        canShowHit: function (hit) {
            var result = false,
                classesToShow = this.get("classes");

            if (classesToShow.length === 0) {
                return true;
            }

            _.each(classesToShow, function (classToShow) {
                if (hit.class === classToShow || !_.isUndefined(hit.extratags[classToShow])) {
                    result = true;
                }
            });

            return result;
        },

        /**
         * @description Abortet ggf. vorhandenen Request und initiiert neuen Request
         * @param {String} url - URL the request is sent to.
         * @param {String} data - Data to be sent to the server
         * @param {function} successFunction - A function to be called if the request succeeds
         * @returns {void}
         */
        sendRequest: function (url, data, successFunction) {
            var ajax = this.get("ajaxRequest");

            if (!_.isNull(ajax)) {
                ajax.abort();
                this.polishAjax();
            }
            this.ajaxSend(url, data, successFunction);
        },

        /**
         * @description Fphrt einen HTTP-GET-Request aus und speichert dessen id
         * @param  {[type]} url             [description]
         * @param  {[type]} data            [description]
         * @param  {[type]} successFunction [description]
         * @return {[type]}                 [description]
         */
        ajaxSend: function (url, data, successFunction) {
            this.setAjaxRequest($.ajax({
                url: url,
                data: data,
                dataType: "json",
                context: this,
                type: "GET",
                success: successFunction,
                timeout: 6000,
                error: function (err) {
                    if (err.status !== 0) { // Bei abort keine Fehlermeldung
                        this.showError(err);
                    }
                    Radio.trigger("Searchbar", "abortSearch", "osm");
                },
                complete: function () {
                    this.polishAjax();
                }
            }));
        },

        /**
         * Triggert die Darstellung einer Fehlermeldung
         * @param {object} err Fehlerobjekt aus Ajax-Request
         * @returns {void}
         */
        showError: function (err) {
            var detail = err.statusText && err.statusText !== "" ? err.statusText : "";

            Radio.trigger("Alert", "alert", "OpenStreetMap-Suche nicht erreichbar. " + detail);
        },

        polishAjax: function () {
            this.setAjaxRequest(null);
        },

        setInUse: function (value) {
            this.set("inUse", value);
        },

        setOsmServiceUrl: function (value) {
            this.set("osmServiceUrl", value);
        },

        setLimit: function (value) {
            this.set("limit", value);
        },

        setStates: function (value) {
            this.set("states", value);
        },

        setStreet: function (value) {
            this.set("street", value);
        },

        setSearchParams: function (value) {
            this.set("searchParams", value);
        },

        setClasses: function (value) {
            this.set("classes", value.split(","));
        },

        setMinChars: function (value) {
            this.set("minChars", value);
        },

        // setter for ajaxRequest
        setAjaxRequest: function (value) {
            this.set("ajaxRequest", value);
        }
    });

    return OsmModel;
});
