import "../model";

const SpecialWFSModel = Backbone.Model.extend({
    defaults: {
        minChars: 3,
        glyphicon: "glyphicon-home",
        wfsMembers: {},
        timeout: 6000
    },

    /**
     * @description Initialisierung der wfsFeature Suche.
     * @param {Objekt} config - Das Konfigurationsarray für die specialWFS-Suche
     * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
     * @param {integer} [config.timeout=6000] - Timeout der Ajax-Requests im Millisekunden.
     * @param {Object[]} config.definitions - Definitionen der SpecialWFS.
     * @param {Object} config.definitions[].definition - Definition eines SpecialWFS.
     * @param {string} config.definitions[].definition.url - Die URL, des WFS
     * @param {string} config.definitions[].definition.data - Query string des WFS-Request
     * @param {string} config.definitions[].definition.name - MetaName der Kategorie für Vorschlagssuche
     * @param {string} [config.definitions[].definition.glyphicon="glyphicon-home"] - Name des Glyphicon für Vorschlagssuche
     * @returns {void}
     */
    initialize: function (config) {
        if (config.minChars) {
            this.setMinChars(config.minChars);
        }
        if (config.timeout) {
            this.setTimeout(config.timeout);
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
     * Durchsucht ein Object, bestehend aus Objekten, bestehend aus Array of Objects nach name
     * @param  {string} searchString Der Suchstring
     * @param  {object} masterObject wfsMembers
     * @return {object}              Suchtreffer
     */
    collectHits: function (searchString, masterObject) {
        var simpleSearchString = this.simplifyString(searchString),
            searchStringRegExp = new RegExp(simpleSearchString),
            masterObjectHits = [],
            elementsHits,
            elementName;

        _.each(masterObject, function (elements) {
            elementsHits = _.filter(elements, function (element) {
                elementName = this.simplifyString(element.name);
                _.extend(element, {
                    triggerEvent: {
                        channel: "SpecialWFS",
                        event: "requestFeature"
                    }
                });
                return elementName.search(searchStringRegExp) !== -1; // Prüft ob der Suchstring ein Teilstring vom Namen ist
            }, this);

            if (elementsHits.length > 0) {
                masterObjectHits.push(elementsHits);
            }
        }, this);

        return masterObjectHits;
    },

    /**
     * @description Suchfunktion, wird von Searchbar getriggert
     * @param {string} searchString - Der Suchstring.
     * @returns {void}
     */
    search: function (searchString) {
        var wfsMembers = this.get("wfsMembers"),
            minChars = this.get("minChars"),
            hits;

        if (searchString.length < minChars) {
            Radio.trigger("Searchbar", "abortSearch", "specialWFS");
            return;
        }
        hits = this.collectHits(searchString, wfsMembers);
        if (hits.length > 0) {
            Radio.trigger("Searchbar", "pushHits", "hitList", hits);
            Radio.trigger("Searchbar", "createRecommendedList", "specialWFS");
        }
        else {
            Radio.trigger("Searchbar", "abortSearch", "specialWFS");
        }
    },

    /**
     * @description Entfernt Sonderzeichen aus dem Suchstring
     * @param {string} searchString - Der Suchstring
     * @returns {void}
     */
    simplifyString: function (searchString) {
        var value = searchString.toLowerCase().replace(/\u00e4/g, "ae").replace(/\u00f6/g, "oe").replace(/\u00fc/g, "ue").replace(/\u00df/g, "ss");

        return value;
    },

    /**
     * @description Die geom kann sehr komplex sein. Daher wird sie separat abgefragt.
     * @param  {string} feature, das geklickt worden ist mit filter
     * @returns {void}
     */
    requestFeature: function (feature) {
        var data = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='" + feature.filter.typeName + "'><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>" + feature.filter.propertyName + "</ogc:PropertyName><ogc:Literal>" + _.escape(feature.filter.literal) + "</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter></wfs:Query></wfs:GetFeature>";

        $.ajax({
            url: feature.filter.url,
            data: data,
            context: this,
            type: "POST",
            success: this.zoomTo,
            timeout: this.get("timeout"),
            contentType: "text/xml",
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(textStatus + ": " + errorThrown);
                Radio.trigger("Alert", "alert", "Beim Abfragen der Koordinaten trat ein Fehler auf.");
            }
        });
    },

    /**
     * @description Durchsucht die Response auf Koordinatenangaben
     * @param {xml} response Response des Requests
     * @returns {number[]}  Extent oder Koordinate
     */
    extractGeom: function (response) {
        var posList = $(response).find("gml\\:posList, posList")[0],
            pos = $(response).find("gml\\:pos, pos")[0],
            coordinate = posList ? posList.textContent : pos.textContent;

        return coordinate;
    },

    /**
     * Triggert den zoom
     * @param  {number[]} response Extent oder Koordinate
     * @return {void}
     */
    zoomTo: function (response) {
        var coordinate = this.extractGeom(response);

        Radio.trigger("MapMarker", "zoomTo", {
            type: "default",
            coordinate: coordinate
        });
    },

    /**
     * @summary Liest das XML des WFS ein.
     * @description Diese Funktion setzt vorraus, dass die Features im root-Element des response-XML als direkte Child-Elemente gelistet sind.         * @description Der textContent jedes Elements eines Features wird für die Bezeichnung verwendet.
     * @param  {xml} data Response des requests
     * @param {string} type MetaName bzw. Kategorie für Suchtreffer
     * @param {string} url URL des Dienstes
     * @param {string} glyphicon Glyphicon für Suchtreffer
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
     * @param  {object} element Konfiguration eines SpecialWFS aus config
     * @returns {void}
     */
    requestWFS: function (element) {
        var url = element.url,
            parameter = element.data,
            name = element.name,
            glyphicon = element.glyphicon ? element.glyphicon : this.get("glyphicon");

        $.ajax({
            url: url,
            data: parameter,
            context: this,
            type: "GET",
            success: function (data) {
                var features = this.extractWFSMembers(data, name, url, glyphicon);

                this.setWfsMembers(name, features);
            },
            timeout: this.get("timeout"),
            contentType: "text/xml",
            error: function (jqXHR, textStatus) {
                console.error(textStatus + ": " + url);
            }
        });
    },

    /**
     * Fügt einem Objekt untergeordnete Objekte hinzu bzw. ergänzt diese
     * @param {string} key          Name des Objekt
     * @param {string[]} values     Werte des Objekts
     * @param {object} masterObject Übergeordnetes Objekt dem die untergeordneten Objekte zugefügt werden sollen
     * @return {object} ergänztes MasterObjekt
     */
    addObjectsInObject: function (key, values, masterObject) {
        var master = masterObject,
            oldObj,
            oldValues,
            newObj;

        if (!_.has(master, key)) {
            newObj = _.object([key], [values]);
            _.extend(master, newObj);
        }
        else {
            oldObj = _.pick(master, key);
            oldValues = _.values(oldObj)[0];
            newObj = _.object([key], [_.union(oldValues, values)]);
            master = _.omit(master, key);
            _.extend(master, newObj);
        }

        return master;
    },

    // setter for minChars
    setMinChars: function (value) {
        this.set("minChars", value);
    },

    // setter for RequestInfo
    setRequestInfo: function (value) {
        this.set("requestInfo", value);
    },

    // setter for wfsMembers
    setWfsMembers: function (key, values) {
        var wfsMembers = this.get("wfsMembers"),
            newWfsMembers = this.addObjectsInObject(key, values, wfsMembers);

        this.set("wfsMembers", newWfsMembers);
    },

    // setter for timeout
    setTimeout: function (value) {
        this.set("timeout", value);
    }
});

export default SpecialWFSModel;
