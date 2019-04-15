import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo.js";
import * as moment from "moment";

const Theme = Backbone.Model.extend(/** @lends ThemeModel.prototype */{
    /**
     * @class ThemeModel
     * @extends GFI
     * @memberof GFI.Themes
     * @constructs
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @fires Util#RadioRequestUtilGetProxyURL
     * @fires Util#RadioRequestUtilGetIgnoredKeys
     */
    defaults: {
        // ist das Theme sichtbar
        isVisible: false,
        // Layername = Theme Titel
        name: undefined,
        // Theme hat GFI-Attribute abgefragt und bearbeitet
        isReady: false,
        // Info-Format für WMS-GFI
        infoFormat: undefined,
        // GFI Attribute
        gfiContent: undefined,
        // uiStyle Setting
        uiStyle: "default"
    },

    /**
     * Requestor for feature informations on all layer types
     * @returns {void}
     */
    requestFeatureInfos: function () {
        if (this.get("typ") === "WMS" || this.get("typ") === "GROUP") {
            if (this.get("infoFormat") === "text/html") {
                // Für das Bohrdatenportal werden die GFI-Anfragen in einem neuen Fenster geöffnet, gefiltert nach der ID aus dem DM.
                if (this.get("id") === "2407" || this.get("id") === "4423") {
                    this.getWmsHtmlGfi(this.parseWmsBohrdatenGfi);
                }
                else {
                    this.getWmsHtmlGfi(this.parseWmsHtmlGfi);
                }
            }
            else {
                this.getWmsGfi(this.parseWmsGfi);
            }
        }
        else if (this.get("typ") === "Cesium3DTileFeature") {
            this.getCesium3DTileFeatureGfi();
        }
        else {
            this.getVectorGfi();
        }
    },

    /**
     * Requestor function for GFI of WMS layers with infoFormat "text/html"
     * @param   {function} successFunction function to be called after successfull request
     * @returns {void}
     */
    getWmsHtmlGfi: function (successFunction) {
        $.ajax({
            url: Radio.request("Util", "getProxyURL", this.get("gfiUrl")),
            context: this,
            success: successFunction,
            error: this.gfiErrorHandler
        });
    },

    /**
     * Parse response for Bohrdatenportal
     * @param   {string} data string to be parsed as html
     * @returns {void}
     */
    parseWmsBohrdatenGfi: function (data) {
        var domNodes = $.parseHTML(data);

        // bei domNodes.length < 3 = nur der xml-header (?xml version='1.0' encoding='UTF-8'?) ohne html
        if (domNodes.length > 3) {
            window.open(this.get("gfiUrl"), "weitere Informationen", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700");
        }
        this.setIsReady(true);
    },

    /**
     * Parse response for WMS as text/html
     * @param   {string} data response as html
     * @returns {void}
     */
    parseWmsHtmlGfi: function (data) {
        var gfiFeatures = {"html": this.get("gfiUrl")};

        if ($(data).find("tbody").children().length > 1) {
            this.set("gfiContent", [gfiFeatures]);
        }
        this.setIsReady(true);
    },

    /**
     * Requestor function for GFI of WMS layers
     * @param   {function} successFunction function to be called after successfull request
     * @returns {void}
     */
    getWmsGfi: function (successFunction) {
        var url = Radio.request("Util", "getProxyURL", this.get("gfiUrl"));

        url = url.replace(/SLD_BODY=.*?&/, "");
        $.ajax({
            url: url,
            context: this,
            success: successFunction,
            error: this.gfiErrorHandler
        });
    },

    /**
     * Error handler for unanswered GFI requests
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @param   {object} jqXHR error object
     * @returns {void}
     */
    gfiErrorHandler: function (jqXHR) {
        console.warn("Error occured requesting GFI with status '" + jqXHR.status + "' and errorMessage '" + jqXHR.statusText + "'");
        Radio.trigger("Alert", "Das Objekt kann derzeit nicht abgefragt werden. Bitte versuchen Sie es zu einem späteren Zeitpunkt erneut.");
    },

    /**
     * Gibt mehrfach belegte Attributnamen in XML-Features zurück.
     * @param   {xml}       node    Feature-Node
     * @returns {string[]}          Attributnamen
     */
    getMultiTags: function (node) {
        var tagNameList = _.map(node.firstElementChild.children, function (element) {
                return element.tagName;
            }),
            tagNameListSorted = _.sortBy(tagNameList, function (name) {
                return name;
            }),
            multiTags = tagNameListSorted.filter(function (tagName, index, list) {
                return tagName === list[index + 1];
            }),
            multiTagsUnique = _.uniq(multiTags);

        return multiTagsUnique;
    },

    /**
     * Ersetzt die multiTags eines Features durch einen Tag mit akkumuliertem Value
     * @param   {string[]} multiTags mehrfache Tags in einem Feature
     * @param   {xml} childNode Feature-Node
     * @returns {void}
     */
    replaceMultiNodes: function (multiTags, childNode) {
        _.each(multiTags, function (tagName) {
            var nodeList = childNode.getElementsByTagName(tagName),
                nodeListValue = _.map(nodeList, function (node) {
                    return node.innerHTML;
                }),
                firstNode = nodeList[0],
                i;

            firstNode.innerHTML = JSON.stringify({
                multiTag: nodeListValue
            });
            for (i = nodeList.length - 1; i >= 1; i--) {
                childNode.firstElementChild.removeChild(nodeList[i]);
            }
        });
    },

    /**
     * Replace multi attributes of a feature
     * @param   {xml}   xml GFI
     * @returns {void}
     */
    parseMultiElementNodes: function (xml) {
        var childNodes = $(xml).find("msGMLOutput,gml\\:featureMember,featureMember");

        // Schleife über alle Features des GFI
        _.each(childNodes, function (childNode) {
            // Suche nach doppelten Attributnamen
            var multiTags = this.getMultiTags(childNode);

            // Ersetze die betroffenen Attribute pro Feature
            this.replaceMultiNodes(multiTags, childNode);
        }, this);

    },

    /**
     * Parse feature info response of a WMS
     * @param {(string|xml)}    data   response to parse
     * @returns {void}
     */
    parseWmsGfi: function (data) {
        var gfiList = [],
            gfiFormat,
            pgfi = [],
            gfiFeatures,
            dat = _.isString(data) ? $.parseXML(data) : data; // handle non text/xml responses arriving as string

        this.parseMultiElementNodes(dat);
        // parse result, try built-in Ol-format first
        gfiFormat = new WMSGetFeatureInfo();
        // das reverse wird fürs Planportal gebraucht SD 18.01.2016
        gfiFeatures = gfiFormat.readFeatures(dat, {
            dataProjection: Config.view.proj
        }).reverse();

        // ESRI is not parsed by the Ol-format
        if (_.isEmpty(gfiFeatures)) {
            if (dat.getElementsByTagName("FIELDS")[0] !== undefined) {
                _.each(dat.getElementsByTagName("FIELDS"), function (element) {
                    var gfi = {};

                    _.each(element.attributes, function (attribute) {
                        var key = attribute.localName;

                        if (this.isValidValue(attribute.value)) {
                            gfi[key] = attribute.value;
                        }
                        else if (this.isValidValue(attribute.textContent)) {
                            gfi[key] = attribute.textContent;
                        }
                        else {
                            gfi[key] = "";
                        }
                    }, this);

                    gfiList.push(gfi);
                }, this);
            }
        }
        else { // OS (deegree, UMN, Geoserver) is parsed by Ol-format
            _.each(gfiFeatures, function (feature) {
                gfiList.push(feature.getProperties());
            });
        }

        if (gfiList.length > 0) {
            pgfi = this.translateGFI(gfiList, this.get("gfiAttributes"));
            pgfi = this.getManipulateDate(pgfi);
            if (this.get("gfiTheme") !== "table") {
                this.cloneCollModels(pgfi);
            }

            this.setGfiContent(pgfi);
        }
        this.setIsReady(true);
    },
    /**
     * Klont die Models in der Collection, wenn ein Dienst mehr als ein Feature bei der GFI-Abfrage zurückliefert.
     * @param {object} pgfi - pgfi
     * @returns {void}
     */
    cloneCollModels: function (pgfi) {
        var clone;

        _.each(pgfi, function (singlePgfi, index) {
            if (index > 0) {
                clone = this.clone();

                clone.set("gfiContent", [singlePgfi]);
                clone.set("id", _.uniqueId());
                clone.set("isReady", true);
                if (this.get("gfiTheme") === "trinkwasser") {
                    clone.splitContent();
                }
                this.collection.add(clone);
            }
        }, this);
    },

    /**
     * @todo add jsdoc info about this function
     * @returns {void}
     */
    getCesium3DTileFeatureGfi: function () {
        var gfiContent;

        gfiContent = this.translateGFI([this.get("attributes")], this.get("gfiAttributes"));
        gfiContent = this.getManipulateDate(gfiContent);
        this.setGfiContent(gfiContent);
        this.setIsReady(true);
    },

    /**
     * @todo add jsdoc info about this function
     * @returns {void}
     */
    getVectorGfi: function () {
        var gfiContent,
            gfiFeatureList = this.get("gfiFeatureList");

        if (!_.isEmpty(gfiFeatureList)) {
            gfiContent = this.translateGFI([gfiFeatureList[0].getProperties()], this.get("gfiAttributes"));
            gfiContent = this.getManipulateDate(gfiContent);

            this.setGfiContent(_.extend(gfiContent, {
                allProperties: gfiFeatureList[0].getProperties()
            }));
            this.setIsReady(true);
        }
    },

    /**
     * Setter for isVisible
     * @param {boolean} value Value for isVsible
     * @returns {void}
     */
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },

    /**
     * Setter for gfiContent
     * @param {object} value Value for gfiContent
     * @returns {void}
     */
    setGfiContent: function (value) {
        this.setUiStyle(Radio.request("Util", "getUiStyle"));
        this.set("gfiContent", value);
    },

    /**
     * Setter for isReady
     * @param {boolean} value Value for isReady
     * @returns {void}
     */
    setIsReady: function (value) {
        this.set("isReady", value);
    },

    /**
     * Checks validity of a key according to configured list of ignored keys
     * @param {string}      key         Name of the key
     * @returns {boolean}   isValidKey  returns the validita of a key
     */
    isValidKey: function (key) {
        var ignoredKeys = Config.ignoredKeys ? Config.ignoredKeys : Radio.request("Util", "getIgnoredKeys");

        if (_.indexOf(ignoredKeys, key.toUpperCase()) !== -1) {
            return false;
        }

        return true;
    },

    /**
     * checks if the value is a string or array and if it is a string,
     * whether the value is unequal to NULL or an empty string
     * @param {(string|Array)} value - value
     * @returns {boolean} true or false
     */
    isValidValue: function (value) {
        if (value && _.isString(value) && value !== "" && value.toUpperCase() !== "NULL") {
            return true;
        }
        else if (_.isArray(value)) {
            return true;
        }
        else if (_.isNumber(value)) {
            return true;
        }
        return false;
    },

    /**
     * helper function: first letter upperCase, _ becomes " "
     * @param {string} str String to be beautified
     * @returns {void}
     */
    beautifyString: function (str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1).replace("_", " ");
    },

    /**
     * helper function to provide information about a "multiTag" attribute on a non parsed JSON string
     * @param {string} str JSON string to parse and to check
     * @returns {void}
     */
    isMultiTag: function (str) {
        var test;

        try {
            test = JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        if (_.isObject(test) && _.has(test, "multiTag")) {
            return true;
        }
        return false;
    },

    /**
      * Selector of feature infos to show
      * @param   {object[]}         gfiList        gfiList list array with feature infos
      * @param   {(string|object)}  gfiAttributes  Flag to describe necessary gfi infos "ignore" || "showAll" or specific list of objects
      * @returns {object[]}         pgfi           List of objects
      */
    translateGFI: function (gfiList, gfiAttributes) {
        var pgfi = [];

        if (gfiAttributes === "ignore") {
            return pgfi;
        }

        _.each(gfiList, function (element) {
            var preGfi = {},
                gfi = {};

            // get rid of invalid keys and keys with invalid values; trim values
            _.each(element, function (value, key) {
                var valueName = value;

                if (this.get("gfiTheme") === "table") {
                    if (this.isValidKey(key)) {
                        preGfi[key] = valueName;
                    }
                }
                else if (this.isValidKey(key) && this.isValidValue(valueName)) {
                    if (this.isMultiTag(value)) {
                        valueName = JSON.parse(valueName).multiTag;
                    }
                    if (_.isArray(valueName)) {
                        valueName = valueName.join("</br>");
                    }
                    preGfi[key] = _.isString(valueName) ? valueName.trim() : valueName;
                }
            }, this);
            if (gfiAttributes === "showAll") {
                // beautify keys
                _.each(preGfi, function (value, key) {
                    var keyName = this.beautifyString(key);

                    gfi[keyName] = value;
                }, this);
            }
            else {
                preGfi = this.allKeysToLowerCase(preGfi);
                _.each(gfiAttributes, function (value, key) {
                    var name = preGfi[key.toLowerCase()];

                    if (name) {
                        gfi[value] = name;
                    }
                });
            }
            if (_.isEmpty(gfi) !== true) {
                pgfi.push(gfi);
            }
        }, this);

        return pgfi;
    },

    /**
     * set all keys from object to lowercase
     * @param {object} obj - key value pairs
     * @returns {object} obj with lowercase keys
     */
    allKeysToLowerCase: function (obj) {
        var lowerObj = {};

        _.each(obj, function (value, key) {
            lowerObj[key.toLowerCase()] = value;
        });

        return lowerObj;
    },

    /**
     * Guckt alle Werte durch und prüft, ob es sich dabei um ein "DD-MM-YYYY"-konformes Datum handelt.
     * Falls ja, wird es in das Format DD.MM.YYYY umgewandelt.
     * @param  {object} content - GFI Attribute
     * @return {object} content
     */
    getManipulateDate: function (content) {
        _.each(content, function (element) {
            _.each(element, function (value, key, list) {
                if (moment(value, "DD-MM-YYYY", true).isValid() === true) {
                    list[key] = moment(value).format("DD.MM.YYYY");
                }
            });
        });
        return content;
    },

    /**
     * Setter for uiStyle
     * @param {string} value Value for uiStyle
     * @returns {void}
     */
    setUiStyle: function (value) {
        this.set("uiStyle", value);
    }
});

export default Theme;
