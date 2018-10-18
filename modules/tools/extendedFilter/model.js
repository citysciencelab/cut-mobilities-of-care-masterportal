import Tool from "../../core/modelList/tool/model";

const ExtendedFilter = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        currentContent: {
            step: 1,
            name: "Bitte wählen Sie die Filteroption",
            layername: undefined,
            filtername: undefined,
            attribute: undefined,
            options: ["Neuen Filter erstellen"]
        },
        wfsList: [],
        currentFilterType: "Neuen Filter erstellen",
        currentFilters: [],
        ignoredKeys: [],
        filterCounter: 1,
        renderToWindow: true,
        glyphicon: "glyphicon-filter"
    }),
    initialize: function () {
        this.superInitialize();
    },
    // getDefaultContent: function () {
    //     return this.get("defaultContent");
    // },
    setCurrentContent: function (val) {
        this.set("currentContent", val);
    },
    setCurrentFilterType: function (val) {
        this.set("currentFilterType", val);
    },
    setCurrentFilters: function (val) {
        this.set("currentFilters", val);
    },
    setFilterCounter: function (val) {
        this.set("filterCounter", val);
    },
    setWfsList: function (val) {
        return this.set("wfsList", val);
    },
    getLayers: function () {
        var layers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WFS"}),
            featureLayers = _.filter(layers, function (layer) {
                return layer.get("layer").getSource().getFeatures().length > 0;
            }),
            filterLayers = _.filter(featureLayers, function (layer) {
                return layer.get("extendedFilter");
            }),
            wfsList = [],
            attributes = [],
            attributes_with_values = [],
            values = [];

        _.each(filterLayers, function (layer) {
            _.each(layer.get("layer").getSource().getFeatures()[0].getKeys(), function (key) {
                if (!_.contains(this.get("ignoredKeys"), key.toUpperCase())) {
                    attributes.push(key);
                }
            }, this);
            _.each(attributes, function (attr) {
                _.each(layer.get("layer").getSource().getFeatures(), function (feature) {
                    values.push(feature.get(attr));
                });
                attributes_with_values.push({
                    attr: attr,
                    values: _.uniq(values)
                });
                values = [];
            });
            wfsList.push({
                id: layer.id,
                name: layer.get("name"),
                layer: layer.get("layer"),
                attributes: attributes_with_values
            });
            attributes = [];
            attributes_with_values = [];

        }, this);
        this.set("wfsList", wfsList);
    },

    previousStep: function () {
        var currentContent = this.get("currentContent"),
            step = currentContent.step,
            layername = currentContent.layername,
            currentFilterType = this.get("currentFilterType"),
            content;

        if (step === 2) {
            content = this.getDefaultContent();

        }
        else if (step === 3) {
            step = step - 2;
            content = this.step2(currentFilterType, step);
        }
        else if (step === 4) {
            step = step - 2;

            content = this.step3(layername, step);
        }
        this.setCurrentContent(content);
    },
    removeAttrFromFilter: function (evt) {
        var id = evt.currentTarget.id,
            filtername = id.split("__")[0],
            attr = id.split("__")[1],
            val = id.split("__")[2],
            currentFilters = this.get("currentFilters"),
            filterToUpdate,
            i,
            counter,
            content,
            attributesArray;

        for (i = currentFilters.length - 1; i >= 0; i--) {
            if (currentFilters[i].layername === filtername) {
                filterToUpdate = currentFilters.splice(i, 1)[0];
                break;
            }
        }

        attributesArray = filterToUpdate.attributes;

        for (i = attributesArray.length - 1; i >= 0; i--) {
            if (attributesArray[i].attribute === attr && attributesArray[i].value === val) {
                attributesArray.splice(i, 1);
                break;
            }
        }

        if (attributesArray.length === 0) {
            counter = this.get("filterCounter");

            counter--;
            this.setFilterCounter(counter);
        }
        else {
            currentFilters.push({
                layername: filtername,
                attributes: attributesArray
            });
        }
        this.setCurrentFilters(currentFilters);

        if (currentFilters.length === 0) {
            content = this.getDefaultContent();

            content.options = ["Neuen Filter erstellen"];
            this.setCurrentContent(content);
        }

        this.filterLayers();
    },

    nextStep: function (evt) {
        var id = evt.currentTarget.id,
            val = $("#" + id).val(),
            currentContent = this.get("currentContent"),
            step = currentContent.step,
            newContent;

        if (step === 1) { // Layer wählen oder Filter wählen
            newContent = this.step2(val, step);
        }
        else if (step === 2) { // Attribut wählen
            newContent = this.step3(val, step);
        }
        else if (step === 3) { // Wert wählen
            newContent = this.step4(val, step, currentContent.layername, currentContent.filtername);
        }
        else if (step === 4) { // auf default zurücksetzen
            newContent = this.getDefaultContent();
            this.setFilter(val, currentContent.layername, currentContent.attribute, currentContent.filtername);
            this.filterLayers();
        }

        this.setCurrentContent(newContent);
    },

    getDefaultContent: function () {
        var content;

        content = {step: 1,
            name: "Bitte wählen Sie die Filteroption",
            layername: undefined,
            filtername: undefined,
            attribute: undefined,
            options: ["Neuen Filter erstellen", "Bestehenden Filter verfeinern"]
        };
        return content;
    },

    step2: function (val, step) {
        var content,
            newStep = step,
            wfsList,
            options = [],
            currentFilters = [];

        newStep++;
        if (val === "Neuen Filter erstellen") {
            this.setCurrentFilterType("Neuen Filter erstellen");
            this.getLayers();
            wfsList = this.get("wfsList");
            _.each(wfsList, function (layer) {
                options.push(layer.name);
            });
            content = {step: newStep,
                name: "Bitte wählen Sie einen Layer",
                layername: undefined,
                attribute: undefined,
                options: options};
        }
        else { // Filter erweitern
            this.setCurrentFilterType("Bestehenden Filter verfeinern");
            currentFilters = this.get("currentFilters");
            _.each(currentFilters, function (filter) {
                options.push(filter.layername);
            });
            content = {step: newStep,
                name: "Bitte wählen Sie einen Filter zum Verfeinern",
                layername: undefined,
                attribute: undefined,
                options: options};

        }
        return content;
    },

    step3: function (val, step) {
        var content,
            newStep = step,
            wfsList = this.get("wfsList"),
            options = [],
            layer;

        newStep++;
        this.getLayers();

        if (val.split(" ")[0] !== "Filter") {
            this.setCurrentFilterType("Neuen Filter erstellen");
            layer = _.findWhere(wfsList, {name: val});
        }
        else {
            this.setCurrentFilterType("Bestehenden Filter verfeinern");
            layer = _.findWhere(wfsList, {name: val.split(" ")[2]});

        }

        _.each(layer.attributes, function (attribute) {
            options.push(attribute.attr);
        });
        content = {step: newStep,
            name: "Bitte wählen Sie ein Attribut",
            layername: layer.name,
            filtername: val,
            attribute: undefined,
            options: options};

        return content;
    },

    step4: function (val, step, layername, filtername) {
        var content,
            newStep = step,
            wfsList = this.get("wfsList"),
            options = [],
            layer,
            attribute;

        newStep++;
        this.getLayers();
        layer = _.findWhere(wfsList, {name: layername});
        attribute = _.findWhere(layer.attributes, {attr: val});

        _.each(attribute.values, function (value) {
            options.push(value);
        });
        content = {step: newStep,
            name: "Bitte wählen Sie einen Wert",
            layername: layer.name,
            filtername: filtername,
            attribute: val,
            options: options};

        return content;
    },

    setFilter: function (val, layername, attribute, filtername) {
        var currentFilters = this.get("currentFilters"),
            filterToUpdate,
            i,
            currentFilterType = this.get("currentFilterType"),
            filtercounter = this.get("filterCounter"),
            attributesArray = [];

        if (currentFilterType === "Neuen Filter erstellen") {
            attributesArray = [];
            attributesArray.push({attribute: attribute,
                value: val});

            currentFilters.push({
                layername: "Filter " + filtercounter + " " + layername,
                attributes: attributesArray
            });

            filtercounter++;
        }
        else {
            for (i = currentFilters.length - 1; i >= 0; i--) {
                if (currentFilters[i].layername === filtername) {
                    filterToUpdate = currentFilters.splice(i, 1)[0];
                    break;
                }
            }

            attributesArray = filterToUpdate.attributes;
            attributesArray.push({attribute: attribute,
                value: val});

            currentFilters.push({
                layername: filtername,
                attributes: attributesArray
            });
        }
        this.setFilterCounter(filtercounter);
        this.setCurrentFilters(currentFilters);
    },

    filterLayers: function () {
        var currentFilters = this.get("currentFilters"),
            layers = this.get("wfsList"),
            layer,
            features;

        _.each(layers, function (wfslayer) {
            layer = wfslayer.layer;
            features = layer.getSource().getFeatures();

            if (layer.getStyle()) {
                layer.defaultStyle = layer.getStyle();
                layer.setStyle(null);
            }

            _.each(features, function (feature) {
                var featuredarstellen2 = true,
                    preVal2 = false;

                _.each(currentFilters, function (filter) {
                    var featuredarstellen = true,
                        preVal = true;

                    if (filter.layername.split(" ")[2] === wfslayer.name) {
                        _.each(filter.attributes, function (attribute) {
                            featuredarstellen = this.checkFeatureForFilter(feature, attribute);
                            if (preVal === true && featuredarstellen === true) {
                                featuredarstellen = true;
                                preVal = true;
                            }
                            else {
                                featuredarstellen = false;
                                preVal = false;
                            }
                        }, this);

                        if (preVal2 === true || featuredarstellen === true) {
                            featuredarstellen2 = true;
                            preVal2 = true;
                        }
                        else {
                            featuredarstellen2 = false;
                            preVal2 = false;
                        }
                    }
                }, this);

                if (featuredarstellen2 === true) {
                    if (feature.defaultStyle) {
                        feature.setStyle(feature.defaultStyle);
                        delete feature.defaultStyle;
                    }
                    else {
                        feature.setStyle(layer.defaultStyle(feature));
                    }
                }
                else if (featuredarstellen2 === false) {
                    feature.setStyle(null);
                }
            }, this);

        }, this);

    },

    checkFeatureForFilter: function (feature, attr) {
        var featuredarstellen = true,
            attributname = attr.attribute,
            attributvalue = attr.value,
            featurevalue0,
            featurevalue,

            featureattribute = _.pick(feature.getProperties(), attributname);

        if (featureattribute && !_.isNull(featureattribute)) {
            featurevalue0 = _.values(featureattribute)[0];
            if (featurevalue0) {
                featurevalue = featurevalue0.trim();
                if (featurevalue !== attributvalue) {
                    featuredarstellen = false;
                }
            }
        }
        return featuredarstellen;
    }
});

export default ExtendedFilter;
