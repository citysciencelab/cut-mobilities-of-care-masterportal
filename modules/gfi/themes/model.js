define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        Moment = require("moment"),
        ol = require("openlayers"),
        Theme;

    Theme = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            // ist das Theme sichtbar
            isVisible: false,
            // Layername = Theme Titel
            name: undefined,
            // Theme hat GFI-Attribute abgefragt und bearbeitet
            isReady: false,
            // Info-Format für WMS-GFI
            infoFormat: undefined
        },

        // Setter
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },

        // Getter
        getName: function () {
            return this.get("name");
        },

        getGfiContent: function () {
            return this.get("gfiContent");
        },


        /**
         *
         */
        requestFeatures: function () {
            if (this.get("typ") === "WMS") {
                if (this.get("infoFormat") === "text/html") {
                    this.openHTMLContent();
                }
                else {
                    this.setWMSPopupContent();
                }
            }
            else {
                this.getGFIFeatureContent();
            }
        },

        openHTMLContent: function () {
            var url;
            // Für das Bohrdatenportal werden die GFI-Anfragen in einem neuen Fenster geöffnet, gefiltert nach der ID aus dem DM.
            if (this.get("featureCount")) {
                var featurecount = "&FEATURE_COUNT=";

                featurecount = featurecount.concat(this.get("featureCount").toString());
                url = this.get("gfiUrl").concat(featurecount);
            }
            if (this.get("id") === "2407" || this.get("id") === "4423") {
                window.open(url, "weitere Informationen", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700");
            }
            else {
                var gfiFeatures = {"html": this.get("gfiUrl")};

                $.ajax({
                    url: Radio.request("Util", "getProxyURL", this.get("gfiUrl")),
                    async: false,
                    type: "GET",
                    context: this,
                    success: function (data) {
                        if ($(data).find("tbody").children().length > 1 === true) {
                            this.set("gfiContent", [gfiFeatures]);
                        }
                        this.set("isReady", true);
                    }
                });
            }
        },

        getGFIFeatureContent: function () {
            var gfiContent;

            gfiContent = this.translateGFI([this.get("feature").getProperties()], this.get("gfiAttributes"));
            gfiContent = this.getManipulateDate(gfiContent);
            this.set("gfiContent", gfiContent);
            this.set("isReady", true);
        },

        setWMSPopupContent: function () {
            var url,
                data = "FEATURE_COUNT=" + this.get("featureCount").toString(),
                pgfi = [];

            if (this.get("gfiUrl").search(location.host) === -1) {
                url = Radio.request("Util", "getProxyURL", this.get("gfiUrl"));
            }
            else {
                url = this.get("gfiUrl");
            }
            url = url.replace(/SLD_BODY\=.*?\&/, "");
            ++this.requestCount;
            $.ajax({
                url: url,
                data: data,
                async: true,
                type: "GET",
                context: this, // das model
                success: function (data) {
                    var gfiList = [],
                        gfiFormat ,
                        gfiFeatures;

                    // handle non text/xml responses arriving as string
                    if (_.isString(data)) {
                        data = $.parseXML(data);
                    }

                    // parse result, try built-in ol-format first
                    gfiFormat = new ol.format.WMSGetFeatureInfo();
                    // das reverse wird fürs Planportal gebraucht SD 18.01.2016
                    gfiFeatures = gfiFormat.readFeatures(data, {
                        dataProjection: Config.view.proj
                    }).reverse();

                    // ESRI is not parsed by the ol-format
                    if (_.isEmpty(gfiFeatures)) {
                        if (data.getElementsByTagName("FIELDS")[0] !== undefined) {
                            _.each(data.getElementsByTagName("FIELDS"), function (element) {
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
                    else { // OS (deegree, UMN, Geoserver) is parsed by ol-format
                        _.each(gfiFeatures, function (feature) {
                            gfiList.push(feature.getProperties());
                        });
                    }

                    if (gfiList) {
                        pgfi = this.translateGFI(gfiList, this.get("gfiAttributes"), this.get("gfiTheme"), "WMS");
                        pgfi = this.getManipulateDate(pgfi);
                    }

                    if (gfiList.length > 0) {
                        // this.pushGFIContent(pgfi);
                        this.set("gfiContent", pgfi);
                    }
                    this.set("isReady", true);
                },
                error: function (jqXHR, textStatus) {
                    alert("Ajax-Request " + textStatus);
                }
            });
        },

        isValidKey: function (key) {
            var ignoredKeys = Config.ignoredKeys;

            if (_.indexOf(ignoredKeys, key.toUpperCase()) !== -1) {
                return false;
            }
            return true;
        },
        /** helper function: check, if str has a valid value */
        isValidValue: function (str) {
            if (str && _.isString(str) && str !== "" && str.toUpperCase() !== "NULL") {
                return true;
            }
            return false;
        },

        /** helper function: first letter upperCase, _ becomes " " */
        beautifyString: function (str) {
            return str.substring(0, 1).toUpperCase() + str.substring(1).replace("_", " ");
        },
        translateGFI: function (gfiList, gfiAttributes, theme, typ) {
            var pgfi = [];

            _.each(gfiList, function (element) {
                var preGfi = {},
                    gfi = {};

                // get rid of invalid keys and keys with invalid values; trim values
                _.each(element, function (value, key) {
                    if (theme === "table") {
                        if (this.isValidKey(key)) {
                            preGfi[key] = value;
                        }
                    }
                    else {
                        if (this.isValidKey(key) && this.isValidValue(value)) {
                            preGfi[key] = value.trim();
                        }
                    }
                }, this);
                if (gfiAttributes === "showAll") {
                    // beautify keys
                    _.each(preGfi, function (value, key) {
                        var key;

                        key = this.beautifyString(key);
                        gfi[key] = value;
                    }, this);
                    // im IE müssen die Attribute für WMS umgedreht werden
                 if (Radio.request("Util", "isInternetExplorer") !== false && typ === "WMS") {
                        var keys = [],
                            values = [];

                        _.each (gfi, function (value, key) {
                            keys.push(key);
                            values.push(value);
                        }, this);
                        keys.reverse();
                        values.reverse();
                        gfi = _.object(keys, values);
                     }
                }
                else {
                    // map object keys to gfiAttributes from layer model

//                    _.each(preGfi, function (value, key) {
//                        key = gfiAttributes[key];
//                        if (key) {
//                            gfi[key] = value;
//                        }
//                    });
                    _.each(gfiAttributes, function (value, key) {
                        key = preGfi[key];
                        if (key) {
                            gfi[value] = key;
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
         * Guckt alle Werte durch und prüft, ob es sich dabei um ein ISO8601-konformes Datum handelt.
         * Falls ja, wird es in das Format DD.MM.YYYY umgewandelt.
         * @param  {object} content - GFI Attribute
         * @return {object} content
         */
        getManipulateDate: function (content) {
            _.each(content, function (element) {
                _.each(element, function (value, key, list) {
                    if (Moment(value, Moment.ISO_8601, true).isValid() === true) {
                        list[key] = Moment(value).format("DD.MM.YYYY");
                    }
                });
            });
            return content;
        }
    });

    return Theme;
});
