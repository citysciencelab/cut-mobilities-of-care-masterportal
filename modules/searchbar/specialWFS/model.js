import "../model";

const SpecialWFSModel = Backbone.Model.extend({
    defaults: {
        minChars: 3,
        glyphicon: "glyphicon-home",
        geometryName: "app:geom",
        maxFeatures: 20,
        timeout: 6000,
        definitions: null
    },

    /**
     * @description Initialisierung der wfsFeature Suche.
     * @param {Objekt} config - Das Konfigurationsarray für die specialWFS-Suche
     * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
     * @param {integer} [config.timeout=6000] - Timeout der Ajax-Requests im Millisekunden.
     * @param {Object[]} config.definitions - Definitionen der SpecialWFS.
     * @param {Object} config.definitions[].definition - Parameter eines WFS
     * @param {string} config.definitions[].definition.url - URL des WFS
     * @param {string} config.definitions[].definition.data - Query string des WFS-Request deprecated
     * @param {string} config.definitions[].definition.name - MetaName der Kategorie für Vorschlagssuche
     * @param {string} config.definitions[].definition.typeName - Layername des WFS Dienstes
     * @param {string} [config.definitions[].definition.geometryName="app:geom"] - Name des Attributs mit Geometrie
     * @param {integer} [config.definitions[].definition.maxFeatures="20"] - Anzahl der vom Dienst maximal zurückgegebenen Features
     * @param {string_} [config.definitions[].definition.glyphicon="glyphicon-home"] - Name des Glyphicon für Vorschlagssuche
     * @param {strings[]} config.definitions[].definition.propertyNames - Name der Attribute die zur Suche ausgewertet werden
     * @returns {void}
     */
    initialize: function (config) {
        if (config.minChars) {
            this.setMinChars(config.minChars);
        }
        if (config.timeout) {
            this.setTimeout(config.timeout);
        }
        if (config.maxFeatures) {
            this.setMaxFeatures(config.maxFeatures);
        }
        this.setDefinitions(config.definitions);

        // set Listener
        this.listenTo(Radio.channel("Searchbar"), {
            "search": this.search
        });

        // initiale Suche
        if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
            this.search(Radio.request("ParametricURL", "getInitString"));
        }
    },

    /*
    * setter for definitions
    * @param {object[]} value definitions aus config.json
    * @returns {void}
    */
    setDefinitions: function (values) {
        var definitions = [];

        _.each(values, function (value) {
            var definition = value;

            // @deprecated since 3.0.0
            if (_.has(value, "data")) {
                definition = _.extend(value, this.getDataParameters(value));
            }

            if (_.has(definition, "typeName") === false || _.has(definition, "propertyNames") === false) {
                console.error("SpecialWFS: Ignoriere specialWFS-Definition aufgrund fehlender Parameter.");
                return undefined;
            }

            definitions.push(definition);
            return undefined;
        }, this);

        this.set("definitions", definitions);
    },

    /**
     * Extrahiert die Parameter für POST-Request und gibt diese zurück.
     * @deprecated Parameterübergabe zukünftig in Objekt. Aktuell auch noch aus string. Ablösung mit 3.0.0
     * @param   {string}    value   Konfiguration aus config.json
     * @returns {object}            aufbereitetes Objekt zur WFS Abfrage
     */
    getDataParameters: function (value) {
        var parameters = {};

        value.data.split("&").forEach(function (keyValue) {
            parameters[keyValue.split("=")[0].toUpperCase()] = decodeURIComponent(keyValue.split("=")[1]);
        });

        if (_.has(parameters, "TYPENAMES") === false || _.has(parameters, "PROPERTYNAME") === false) {
            console.error("SpecialWFS: Ignoriere specialWFS-Definition aufgrund fehlender Parameter.");
            return undefined;
        }

        return {
            propertyNames: parameters.PROPERTYNAME.split(","),
            typeName: parameters.TYPENAMES,
            geometryName: value.geometryName ? value.geometryName : "app:geom"
        };
    },

    /**
     * Erzeugt einen POST Request zur Suche in den definierten WFS 1.1.0
     * @param   {string} searchString Searchstring aus der Suchleiste
     * @returns {void}
     */
    search: function (searchString) {
        var definitions = this.get("definitions");

        if (searchString.length >= this.get("minChars")) {
            _.each(definitions, function (def) {
                $.ajax({
                    url: def.url,
                    data: this.getWFS110Xml(def, searchString),
                    context: this,
                    type: "POST",
                    success: function (data) {
                        this.fillHitList(data, def);
                    },
                    timeout: this.get("timeout"),
                    contentType: "text/xml",
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error(textStatus + ": " + errorThrown);
                    }
                });
            }, this);
        }
    },

    /**
     * Erstellt XML für einen WFS 1.1.0 POST Request
     * @param   {Object} definition    Definition aus Konfiguration
     * @param   {string} searchString  Suchstring
     * @returns {string}               XML String
     */
    getWFS110Xml: function (definition, searchString) {
        var typeName = definition.typeName,
            propertyNames = definition.propertyNames,
            geometryName = definition.geometryName ? definition.geometryName : this.get("geometryName"),
            maxFeatures = definition.maxFeatures ? definition.maxFeatures : this.get("maxFeatures"),
            data, propertyName;

        data = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS'";
        data += " xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'>";
        data += "<wfs:Query typeName='" + typeName + "'>";
        for (propertyName of propertyNames) {
            data += "<wfs:PropertyName>" + propertyName + "</wfs:PropertyName>";
        }
        data += "<wfs:PropertyName>" + geometryName + "</wfs:PropertyName>";
        data += "<wfs:maxFeatures>" + maxFeatures + "</wfs:maxFeatures>";
        data += "<ogc:Filter>";
        if (propertyNames.length > 1) {
            data += "<ogc:Or>";
        }
        for (propertyName of propertyNames) {
            data += "<ogc:PropertyIsLike wildCard='*' singleChar='#' escapeChar='!'><ogc:PropertyName>" + propertyName + "</ogc:PropertyName><ogc:Literal>*" + _.escape(searchString) + "*</ogc:Literal></ogc:PropertyIsLike>";
        }
        if (propertyNames.length > 1) {
            data += "</ogc:Or>";
        }
        data += "</ogc:Filter></wfs:Query></wfs:GetFeature>";

        return data;
    },

    /**
     * @summary Liest das XML des WFS 1.1.0 ein und triggert das Füllen der hitList
     * @description Diese Funktion setzt vorraus, dass die Features im root-Element des response-XML als direkte Child-Elemente gelistet sind.         * @description Der textContent jedes Elements eines Features wird für die Bezeichnung verwendet.
     * @param  {xml} data Response des requests
     * @param {Object} definition Definition aus Konfiguration
     * @returns {void}
     */
    fillHitList: function (data, definition) {
        var type = definition.name,
            typeName = definition.typeName,
            propertyNames = definition.propertyNames,
            geometryName = definition.geometryName ? definition.geometryName : this.get("geometryName"),
            glyphicon = definition.glyphicon ? definition.glyphicon : this.get("glyphicon"),
            elements = data.children[0].children,
            element, typeElement, identifier, geom;

        for (element of elements) {
            typeElement = element.getElementsByTagName(typeName);
            if (typeElement.length > 0) {
                if (typeElement[0].getElementsByTagName(propertyNames).length > 0 && typeElement[0].getElementsByTagName(geometryName).length > 0) {
                    identifier = typeElement[0].getElementsByTagName(propertyNames)[0].textContent;
                    geom = typeElement[0].getElementsByTagName(geometryName)[0].textContent;

                    // "Hitlist-Objekte"
                    Radio.trigger("Searchbar", "pushHits", "hitList", {
                        id: _.uniqueId(type.toString()),
                        name: identifier.trim(),
                        type: type,
                        coordinate: geom.trim().split(" "),
                        glyphicon: glyphicon
                    });
                }
            }
            else {
                console.error("Antwort eines specialWFS konnte nicht verarbeitet werden");
                console.error(element);
            }
        }
        Radio.trigger("Searchbar", "createRecommendedList", "specialWFS");
    },

    // setter for minChars
    setMinChars: function (value) {
        this.set("minChars", value);
    },

    // setter for timeout
    setTimeout: function (value) {
        this.set("timeout", value);
    },

    /*
    * setter for maxFeatures
    * @param {integer} value maxFeatures
    * @returns {void}
    */
    setMaxFeatures: function (value) {
        this.set("maxFeatures", value);
    }
});

export default SpecialWFSModel;
