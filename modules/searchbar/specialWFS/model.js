define(function (require) {

    require("modules/searchbar/model");
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        SpecialWFSModel;

    SpecialWFSModel = Backbone.Model.extend({
        defaults: {
            minChars: 3,
            glyphicon: "glyphicon-home",
            wfsMembers: {}
        },

        /**
         * @description Initialisierung der wfsFeature Suche.
         * @param {Objekt} config - Das Konfigurationsarray für die specialWFS-Suche
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @param {Object[]} config.definitions - Definitionen der SpecialWFS.
         * @param {Object} config.definitions[].definition - Definition eines SpecialWFS.
         * @param {string} config.definitions[].definition.url - Die URL, des WFS
         * @param {string} config.definitions[].definition.data - Query string des WFS-Request
         * @param {string} config.definitions[].definition.name - Name der speziellen Filterfunktion (bplan|kita)
         */
         initialize: function (config) {
            if (config.minChars) {
                this.setMinChars(config.minChars);
            }
            // Jede Konfiguration eines SpecialWFS wird abgefragt
            _.each(config.definitions, function (definition) {
                this.requestWFS(definition);
            }, this);

            // set Listener
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search
            });
            this.listenTo(Radio.channel("SpecialWFS"), {
                "requestFeature": this.requestFeature
            });

            // initiale Suche
            if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
                this.search(Radio.request("ParametricURL", "getInitString"));
            }
        },

        /**
         * @description Suchfunktion, wird von Searchbar getriggert
         * @param {string} searchString - Der Suchstring.
         */
         search: function (searchString) {
            var simpleSearchString = this.simplifyString(searchString),
                searchStringRegExp = new RegExp(simpleSearchString),
                wfsMembers = this.getWfsMembers(),
                hits,
                elementName;

            if (searchString.length >= this.getMinChars()) {
                _.each(wfsMembers, function(elements) {
                    hits = _.filter(elements, function (element) {
                        elementName = this.simplifyString(element.name);
                        _.extend(element, {
                            triggerEvent: {
                                channel: "SpecialWFS",
                                event: "requestFeature"
                            }
                        });
                        return elementName.search(searchStringRegExp) !== -1; // Prüft ob der Suchstring ein Teilstring vom Namen ist
                    }, this);
                    Radio.trigger("Searchbar", "pushHits", "hitList", hits);
                }, this);
                Radio.trigger("Searchbar", "createRecommendedList");
            }
        },

        /**
         * @description Entfernt Sonderzeichen aus dem Suchstring
         * @param {string} searchString - Der Suchstring
         */
        simplifyString: function (searchString) {
            var value = searchString.toLowerCase(),
                value = value.replace(/\u00e4/g, "ae"),
                value = value.replace(/\u00f6/g, "oe"),
                value = value.replace(/\u00fc/g, "ue"),
                value = value.replace(/\u00df/g, "ss");

            return value;
        },

        /**
         * @description Die geom kann sehr komplex sein. Daher wird sie separat abgefragt.
         * @param  {string} feature, das geklickt worden ist mit filter
         */
        requestFeature: function (feature) {
            var data = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='" + feature.filter.typeName + "'><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>" + feature.filter.propertyName + "</ogc:PropertyName><ogc:Literal>" + feature.filter.literal + "</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter></wfs:Query></wfs:GetFeature>";

            $.ajax({
                url: feature.filter.url,
                data: data,
                context: this,
                type: "POST",
                success: this.extractGeom,
                timeout: 6000,
                contentType: "text/xml",
                error: function () {
                    console.error(textStatus +": " + url);
                    Radio.trigger("Alert", "alert", "Beim Abfragen der Koordinaten trat ein Fehler auf.");
                }
            });
        },

        extractGeom: function (response) {
            var posList = $(response).find("gml\\:posList, posList")[0],
                pos = $(response).find("gml\\:pos, pos")[0];

            if (posList) {
                Radio.trigger("MapMarker", "zoomTo", {
                    type: "default",
                    coordinate: this.getMinMax(posList)
                });
            }
            else {
                Radio.trigger("MapMarker", "zoomTo", {
                    type: "default",
                    coordinate: pos.textContent.split(" ")
                });
            }
        },

        getMinMax: function (textArray) {
            var coordinates = textArray.textContent.split(" "),
                coordinatesX = _.filter(coordinates, function(val, index){
                    return index % 2 === 0;
                }),
                coordinatesY = _.filter(coordinates, function(val, index){
                    return index % 2 !== 0;
                }),
                minX = _.min(coordinatesX),
                maxX = _.max(coordinatesX),
                minY = _.min(coordinatesY),
                maxY = _.max(coordinatesY);

            return [minX, minY, maxX, maxY];
        },

        /**
        * @description Methode zum Zurückschicken des gefundenen Plans an mapHandler.
        * @param {string} data - Die Data-XML.
        */
        getExtentFromBPlan: function (data) {
            Radio.trigger("MapMarker", "zoomToBPlan", data);
        },

        /**
         * @summary Liest das XML des WFS ein.
         * @description Diese Funktion setzt vorraus, dass die Features im root-Element des response-XML als direkte Child-Elemente gelistet sind. 
         * @description Der textContent jedes Elements eines Features wird für die Bezeichnung verwendet.
         * @param  {xml}
         * @return {[Object]} Datenobjekt zur Speicherung im Model
         */
        extractWFSMembers: function (data, type, url, glyphicon) {
            var rootElement = $(data).contents()[0],
                elements = $(rootElement).children(),
                feature, property,
                features = [];

            _.each(elements, function (element) {
                feature = $(element).children().first()[0];
                property = $(element).children().first().children().first()[0];

                if (feature && property) {
                    features.push({
                        id: _.uniqueId(type.toString()),
                        name: $(element).text().trim(),
                        type: type,
                        glyphicon: glyphicon,
                        filter: {
                            url: url,
                            typeName: feature.nodeName,
                            propertyName: property.nodeName,
                            literal: property.textContent
                        }
                    });
                }

            });

            return features;
        },

        /**
         * @description Fragt einen WFS nach Features ab und speichert die Ergebnisse im Model.
         * @param  {Object}
         */
        requestWFS: function (element) {
            var url = element.url,
                parameter = element.data,
                name = element.name,
                glyphicon = element.glyphicon ? element.glyphicon : this.getGlyphicon();

            $.ajax({
                url: url,
                data: parameter,
                context: this,
                type: "GET",
                success: function (data) {
                    var features = this.extractWFSMembers(data, name, url, glyphicon);

                    this.setWfsMembers(name, features);
                },
                timeout: 6000,
                contentType: "text/xml",
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error(textStatus +": " + url);
                }
            });
        },

        // getter for minChars
        getMinChars: function () {
            return this.get("minChars");
        },
        // setter for minChars
        setMinChars: function (value) {
            this.set("minChars", value);
        },

        // getter for RequestInfo
        getRequestInfo: function () {
            return this.get("requestInfo");
        },
        // setter for RequestInfo
        setRequestInfo: function (value) {
            this.set("requestInfo", value);
        },

        // getter for Glyphicon
        getGlyphicon: function () {
            return this.get("glyphicon");
        },

        // getter for wfsMembers
        getWfsMembers: function () {
            return this.get("wfsMembers");
        },
        // setter for wfsMembers
        setWfsMembers: function (key, values) {
            var wfsMembers = this.get("wfsMembers"),
                oldObj,
                oldValues,
                newObj;

            if (!_.has(wfsMembers, key)) {
                newObj = _.object([key], [values]);
                _.extend(wfsMembers, newObj);
            }
            else {
                oldObj = _.pick(wfsMembers, key);
                oldValues = _.values(oldObj)[0];
                newObj = _.object([key], [_.union(oldValues, values)]);
                wfsMembers = _.omit(wfsMembers, key);
                 _.extend(wfsMembers, newObj);
            }

            this.set("wfsMembers", wfsMembers);
        }
    });

    return SpecialWFSModel;
});
