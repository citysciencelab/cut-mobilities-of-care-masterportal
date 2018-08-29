define(function (require) {

    var Tool = require("modules/core/modelList/tool/model"),
        CompareFeaturesModel;

    CompareFeaturesModel = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            // true if the tool is activated
            // isActivated: false,
            // all comparable features
            featureList: [],
            // the comparable features group by layer
            groupedFeatureList: [],
            // layer id of the displayed features
            layerId: undefined,
            // number of features to be displayed per layer
            numberOfFeaturesToShow: 3,
            // number of attributes to be displayed
            numberOfAttributesToShow: 12
        }),
        initialize: function () {
            var channel = Radio.channel("CompareFeatures");

            channel.on({
                "setIsActivated": this.setIsActive,
                "addFeatureToList": this.addFeatureToList,
                "removeFeatureFromList": this.removeFeatureFromList
            }, this);
        },

        /**
         * adds a feature to the featureList if possible
         * @param {ol.feature} feature - feature to be compared
         * @returns {void}
         */
        addFeatureToList: function (feature) {
            if (!this.isFeatureListFull(feature.get("layerId"), this.get("groupedFeatureList"), this.get("numberOfFeaturesToShow"))) {
                this.setLayerId(feature.get("layerId"));
                this.setFeatureIsOnCompareList(feature, true);
                this.beautifyAttributeValues(feature);
                this.get("featureList").push(feature);
                // after the list has been updated, it is regrouped
                this.setGroupedFeatureListByLayer(this.groupedFeaturesBy(this.get("featureList"), "layerId"));
            }
            this.trigger("renderFeedbackModal", feature);
        },

        /**
         * removes a features from the featureList and sets the features attrbiute 'isOnCompareList' to false
         * @param {ol.feature} featureToRemoved - feature to be removed form the featureList
         * @returns {void}
         */
        removeFeatureFromList: function (featureToRemoved) {
            var featureIndex = _.findIndex(this.get("featureList"), function (feature) {
                return feature.getId() === featureToRemoved.getId();
            });

            if (featureIndex !== -1) {
                this.setFeatureIsOnCompareList(featureToRemoved, false);
                this.get("featureList").splice(featureIndex, 1);
                // after the list has been updated, it is regrouped
                this.setGroupedFeatureListByLayer(this.groupedFeaturesBy(this.get("featureList"), "layerId"));
            }
        },

        /**
         * prepares the list for rendering using the 'gfiAttributes'
         * creates a JSON where an object matches to a row
         * one object attribute is created for each feature (column)
         * @param {object} gfiAttributes -
         *@param {object} themeConfig attribute configuration from schulinfo theme
         * @returns {object[]} list - one object per row
         */
        prepareFeatureListToShow: function (gfiAttributes) {
            var list = [],
                featureList = this.get("groupedFeatureList")[this.get("layerId")];

            Object.keys(gfiAttributes).forEach(function (key) {
                var row = {};

                row["col-1"] = gfiAttributes[key];
                featureList.forEach(function (feature, index) {
                    row["col-" + (index + 2)] = feature.get(key);
                });
                list.push(row);
            });
            return list;
        },
        /**
         * checks if attribute is in gfiAttributes
         * @param  {[type]} gfiAttributes [description]
         * @param  {[type]} attribute  [description]
         * @return {[type]}            [description]
         */
        checkForAttribute: function (gfiAttributes, attribute) {
            var isAttributeFound = false;

            if (!_.isUndefined(gfiAttributes[attribute])) {
                isAttributeFound = true;
            }

            return isAttributeFound;
        },
        /**
         * splits the features into sets, grouped by the given property
         * @param {ol.feature[]} featureList - the comparable features
         * @param {string} property - value is grouped by
         * @returns {object} object grouped by property
         */
        groupedFeaturesBy: function (featureList, property) {
            return _.groupBy(featureList, function (feature) {
                return feature.get(property);
            });
        },

        /**
         * sets the feature attribute 'isOnCompareList'
         * @param {ol.feature} feature - to be added to or removed from the list
         * @param {boolean} value - shows if the feature is on the compare list
         * @returns {void}
         */
        setFeatureIsOnCompareList: function (feature, value) {
            feature.set("isOnCompareList", value);
        },

        /**
         * checks if the list has already reached the maximum number of features per layer
         * @param {string} layerId - layer id of the feature
         * @param {object} groupedFeatureList - features grouped by layerId
         * @param {number} numberOfFeaturesToShow - max number of features per layer
         * @returns {boolean} true - if the max number of features per layer has not been reached
         */
        isFeatureListFull: function (layerId, groupedFeatureList, numberOfFeaturesToShow) {
            if (typeof groupedFeatureList[layerId] === "undefined") {
                return false;
            }
            else if (groupedFeatureList[layerId].length < numberOfFeaturesToShow) {
                return false;
            }
            return true;
        },

        /**
         * returns a list of all available layers in the featureList
         * @param {object} groupedFeatureList - features grouped by layerId
         * @returns {object[]} including name and id
         */
        getLayerSelection: function (groupedFeatureList) {
            var selectionList = [];

            Object.keys(groupedFeatureList).forEach(function (key) {
                selectionList.push({
                    id: key,
                    name: groupedFeatureList[key][0].get("layerName")
                });
            });
            return selectionList;
        },

        /**
         * returns the feature ids of a layer
         * @param {object} groupedFeatureList - features grouped by layerId
         * @param {string} layerId -  layer id of the features needed
         * @returns {string[]} featureIdList
         */
        getFeatureIds: function (groupedFeatureList, layerId) {
            var idList = [];

            groupedFeatureList[layerId].forEach(function (feature) {
                idList.push(feature.getId());
            });
            return idList;
        },

        /**
         * parses attribute values with pipe-sign ("|") and replace it with an array of single values
         * @param {ol.feature} feature - feature of the attributes
         * @returns {void}
         */
        beautifyAttributeValues: function (feature) {
            Object.keys(feature.getProperties()).forEach(function (key) {
                var array = [],
                    newVal;

                if (typeof feature.get(key) === "string" && feature.get(key).indexOf("|") !== -1) {
                    feature.set(key, feature.get(key).split("|"));
                }
                else if (feature.get(key) === "true") {
                    feature.set(key, "ja");
                }
                else if (feature.get(key) === "false") {
                    feature.set(key, "nein");
                }
                if (key === "oberstufenprofil") {
                    if (_.isArray(feature.get(key))) {
                        _.each(feature.get(key), function (value) {
                            newVal = value;

                            // make part before first ";" bold
                            newVal = newVal.replace(/^/, "<b>");
                            newVal = newVal.replace(/;/, "</b>;");
                            array.push(newVal);
                        });
                        feature.set(key, array);
                    }
                    else {
                        newVal = feature.get(key);
                        // make part before first ";" bold
                        newVal = newVal.replace(/^/, "<b>");
                        newVal = newVal.replace(/;/, "</b>;");

                        feature.set(key, newVal);
                    }
                }
            });
        },
        preparePrint: function (rowsToShow) {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")}),
                features = this.prepareFeatureListToShow(layerModel.get("gfiAttributes")),
                tableBody = this.prepareTableBody(features, rowsToShow),
                rowWidth = this.calculateRowWidth(tableBody[0], 30),
                title = "Vergleichsliste - Schulen",
                pdfDef = {
                    pageSize: "A4",
                    pageOrientation: "portrait",
                    content: [
                        {
                            table: {
                                headerRows: 1,
                                widths: rowWidth,
                                body: tableBody
                            },
                            layout: {
                                hLineWidth: function (i, node) {
                                    return i === 0 || i === node.table.body.length ? 2 : 1;
                                },
                                vLineWidth: function (i, node) {
                                    return i === 0 || i === node.table.widths.length ? 2 : 1;
                                },
                                fillColor: function (i) {
                                    return i % 2 === 0 ? "#dddddd" : "#ffffff";
                                }
                            }
                        }
                    ]
                };

            Radio.trigger("BrowserPrint", "print", "Vergleichsliste_Schulen", pdfDef, title, "download");
        },

        prepareTableBody: function (features, rowsToShow) {
            var tableBody = [];

            _.each(features, function (rowFeature, rowIndex) {
                var row = [];

                if (rowIndex < rowsToShow) {
                    _.each(rowFeature, function (val) {
                        if (_.isUndefined(val)) {
                            row.push("");
                        }
                        // header cells get extra styling
                        else if (rowIndex === 0) {
                            row.push({
                                text: String(val),
                                style: "bold"
                            });
                        }
                        else if (_.isArray(val)) {
                            row.push(String(val).replace(/,/g, ",\n"));
                        }
                        else {
                            row.push(String(val));
                        }
                    });
                    tableBody.push(row);
                }
            });
            tableBody[0][0] = {
                text: ""
            };
            return tableBody;
        },
        calculateRowWidth: function (firstRow, firstRowWidth) {
            var numDataRows = firstRow.length - 1,
                rowWidth = [String(firstRowWidth) + "%"],
                dataRowsWidth = 100 - firstRowWidth,
                dataRowWidth = String(dataRowsWidth / numDataRows) + "%";

            _.each(firstRow, function (row, index) {
                if (index > 0) {
                    rowWidth.push(dataRowWidth);
                }
            });
            return rowWidth;
        },

        /**
         * @param {object} value - features grouped by layerId
         * @returns {void}
         */
        setGroupedFeatureListByLayer: function (value) {
            this.set("groupedFeatureList", value);
        },

        /**
         * @param {string} value - layer id of the displayed features
         * @returns {void}
         */
        setLayerId: function (value) {
            this.set("layerId", value);
        },

        /**
         * @param {boolean} value - true if the tool is activated
         * @returns {void}
         */
        setIsActivated: function (value) {
            this.set("isActive", value);
        }
    });

    return CompareFeaturesModel;
});
