import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo.js";
import * as moment from "moment";

const Theme = Backbone.Model.extend({
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
        gfiContent: undefined
    },

    requestFeatureInfos: function () {
        if (this.get("typ") === "WMS" || this.get("typ") === "GROUP") {
            if (this.get("infoFormat") === "text/html") {
                this.getWmsHtmlGfi();
            }
            else {
                this.getWmsGfi(this.parseWmsGfi);
            }
        }
        else {
            this.getVectorGfi();
        }
    },

    getWmsHtmlGfi: function () {
        var gfiFeatures;

        // Für das Bohrdatenportal werden die GFI-Anfragen in einem neuen Fenster geöffnet, gefiltert nach der ID aus dem DM.
        if (this.get("id") === "2407" || this.get("id") === "4423") {
            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("gfiUrl")),
                context: this,
                success: function (data) {
                    var domNodes = $.parseHTML(data);

                    // bei domNodes.length < 3 = nur der xml-header (?xml version='1.0' encoding='UTF-8'?) ohne html
                    if (domNodes.length > 3) {
                        window.open(this.get("gfiUrl"), "weitere Informationen", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700");
                    }
                    this.setIsReady(true);
                }
            });
        }
        else {
            gfiFeatures = {"html": this.get("gfiUrl")};

            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("gfiUrl")),
                context: this,
                success: function (data) {
                    if (this.$(data).find("tbody").children().length > 1) {
                        this.set("gfiContent", [gfiFeatures]);
                    }
                    this.setIsReady(true);
                }
            });
        }
    },

    getWmsGfi: function (successFunction) {
        var url = Radio.request("Util", "getProxyURL", this.get("gfiUrl"));

        url = url.replace(/SLD_BODY=.*?&/, "");
        $.ajax({
            url: url,
            context: this,
            success: successFunction,
            error: function (jqXHR, textStatus) {
                Radio.trigger("Alert", "alert", "Ajax-Request " + textStatus);
            }
        });
    },

    parseWmsGfi: function (data) {
        var gfiList = [],
            gfiFormat,
            pgfi = [],
            gfiFeatures,
            dat = _.isString(data) ? $.parseXML(data) : data; // handle non text/xml responses arriving as string

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
    // Setter
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },

    setGfiContent: function (value) {
        this.set("gfiContent", value);
    },

    setIsReady: function (value) {
        this.set("isReady", value);
    },

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
     * @param {String|Array} value - value
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

    // helper function: first letter upperCase, _ becomes " "
    beautifyString: function (str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1).replace("_", " ");
    },
    translateGFI: function (gfiList, gfiAttributes) {
        var pgfi = [];

        _.each(gfiList, function (element) {
            var preGfi = {},
                gfi = {},
                keys = [],
                values = [];

            // get rid of invalid keys and keys with invalid values; trim values
            _.each(element, function (value, key) {
                var valueName = value;

                if (this.get("gfiTheme") === "table") {
                    if (this.isValidKey(key)) {
                        preGfi[key] = valueName;
                    }
                }
                else if (this.isValidKey(key) && this.isValidValue(valueName)) {
                    if (_.isArray(valueName)) {
                        valueName = valueName.toString().replace(/,/g, ", ");
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
                // im IE müssen die Attribute für WMS umgedreht werden
                if (Radio.request("Util", "isInternetExplorer") !== false && this.get("typ") === "WMS") {
                    _.each(gfi, function (value, key) {
                        keys.push(key);
                        values.push(value);
                    }, this);
                    keys.reverse();
                    values.reverse();
                    gfi = _.object(keys, values);
                }
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
    }
});

export default Theme;
