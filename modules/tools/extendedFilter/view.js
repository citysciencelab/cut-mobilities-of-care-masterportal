define([
    "backbone",
    "text!modules/tools/extendedFilter/template.html",
    "modules/tools/extendedFilter/model"
], function (Backbone, ExtendedFilterTemplate, ExtendedFilter) {
    "use strict";
    var extendedFilterView = Backbone.View.extend({
        model: ExtendedFilter,
        id: "wfsFilterWin",
        className: "win-body",
        template: _.template(ExtendedFilterTemplate),
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
        },
        events: {
            "click #filterbutton": "getFilterInfos",
            "click #addattrbutton": "addAttributeToFilter",
            "click .panel-heading": "toggleHeading"
        },
        toggleHeading: function (evt) {
            var id = $(evt.currentTarget)[0].id;

            $("." + id + "_wfs_panel").each(function (index, ele) {
                $(ele).toggle();
            });
            if ($("#extendedfilter_resizemarker").hasClass("glyphicon-resize-small")) {
                $("#extendedfilter_resizemarker").removeClass("glyphicon-resize-small");
                $("#extendedfilter_resizemarker").addClass("glyphicon-resize-full");
            }
            else {
                $("#extendedfilter_resizemarker").addClass("glyphicon-resize-small");
                $("#extendedfilter_resizemarker").removeClass("glyphicon-resize-full");
            }
        },

        addAttributeToFilter: function () {
            var attr = $("#addattrselect").val(),
                select = "",
                attrToFilter = this.model.get("attributesToFilter");

            attrToFilter.push(attr);
            this.model.set("attributesToFilter", attrToFilter);

            _.each(this.model.get("wfsList"), function (layer) {

                $("#attributepanel").append("<label for='' class='control-label'>" + attr + "</label>");
                select += "<select class='form-control input-sm' id='" + layer.id + "_" + attr + "'>";
                select += "<option title='Nicht filtern'>*</option>";

                _.each(layer.attributes, function (attribute) {
                    if (attribute.attr === attr) {
                        _.each(attribute.values, function (value) {
                            select += "<option title='" + value + "'>" + value + "</option>";
                        });
                   }
                });

                select += "</select>";
                select += "<div class='input-group'>";
                select += "<input type='radio' checked='true' name='andor_" + attr + "' id='" + layer.id + "_" + attr + "_AND'>AND";
                select += "<input type='radio' name='andor_" + attr + "' id='" + layer.id + "_" + attr + "_OR'>OR";
                select += "</div>";

                $("#attributepanel").append(select);
            });

        },

        getFilterInfos: function () {
            var wfsList = this.model.get("wfsList"),
                layerfilters = [],
                filters = [],
                id,
                value,
                and_or;

            _.each(wfsList, function (layer) {

                    if (layer.filterOptions === "extended") {
                        _.each(this.model.get("attributesToFilter"), function (fieldName) {
                            id = "#" + layer.id + "_" + fieldName;
                            value = $(id).val();
                            and_or = "";

                            if ($("#" + layer.id + "_" + fieldName + "_AND").prop("checked")) {
                                and_or = "AND";
                            }
                            else if ($("#" + layer.id + "_" + fieldName + "_OR").prop("checked")) {
                                and_or = "OR";
                            }
                            else {
                                console.log("ERROR");
                            }

                            filters.push ({
                                id: id,
                                filtertype: and_or,
                                fieldName: fieldName,
                                fieldValue: value
                            });
                        }, this);

                    }
                    else {
                        _.each(layer.filterOptions, function (filter) {
                                id = "#" + layer.id + "_" + filter.fieldName;
                                value = $(id).val();
                                filters.push(
                                    {
                                        id: id,
                                        filtertype: filter.filterType,
                                        fieldName: filter.fieldName,
                                        fieldValue: value
                                    }
                                );
                        });
                    }
                layerfilters.push(
                    {
                        layerId: layer.id,
                        filter: filters
                    }
                );
            }, this);
            if (layerfilters.length > 0) {
                this.filterLayers(layerfilters);
            }
        },

        filterLayers: function (layerfilters) {
            _.each(layerfilters, function (layerfilter) {
                // Prüfe, ob alle Filter des Layers auf * stehen, damit evtl. der defaultStyle geladen werden kann
                var showall = true,
                    layers = this.model.get("wfsList"),
                    wfslayer = _.find(layers, function (layer) {
                        return layer.id === layerfilter.layerId;
                    }),
                    layer = wfslayer.layer,
                    features = layer.getSource().getFeatures();

                _.each(layerfilter.filter, function (filter) {
                    if (filter.fieldValue !== "*") {
                        showall = false;
                    }
                });

                if (showall === true) {
                    if (layer.defaultStyle) {
                        layer.setStyle(layer.defaultStyle);
                        delete layer.defaultStyle;
                        layer.getSource().getFeatures().forEach(function (feature) {
                            if (feature.defaultStyle) {
                                feature.setStyle(feature.defaultStyle);
                                delete feature.defaultStyle;
                            }
                        });
                    }
                }
                else { // Falls Layer gestyled wurde, speichere den Style und schalte unsichtbar
                    if (layer.getStyle()) {
                        layer.defaultStyle = layer.getStyle();
                        layer.setStyle(null);
                    }
                    var and_or = true,
                        and_or_filter;

                    _.each(layerfilter.filter, function (elementfilter) {
                            and_or_filter = elementfilter.filtertype;
                            if (and_or_filter !== "AND") {
                                and_or = false;
                            }

                        });
                    // einfachster Fall, alle Filtertypes sind auf AND
                    if (and_or === true) {
                        features.forEach(function (feature) {
                        var featuredarstellen = true,
                            attributname,
                            attributvalue,
                            featurevalue0,
                            featurevalue;

                            // Prüfung, ob Feature dargestellt werden soll
                            _.each(layerfilter.filter, function (elementfilter) {
                                attributname = elementfilter.fieldName;
                                attributvalue = elementfilter.fieldValue;

                                if (attributvalue !== "*") {
                                    var featureattribute = _.pick(feature.getProperties(), attributname);

                                    if (featureattribute && !_.isNull(featureattribute)) {
                                        featurevalue0 = _.values(featureattribute)[0];
                                        if (featurevalue0) {
                                            featurevalue = featurevalue0.trim();
                                            if (featurevalue !== attributvalue) {
                                                featuredarstellen = false;
                                            }
                                        }
                                    }
                                }
                            });

                            if (featuredarstellen === true) {
                                if (feature.defaultStyle) {
                                    feature.setStyle(feature.defaultStyle);
                                    delete feature.defaultStyle;
                                }
                                else {
                                    feature.setStyle(layer.defaultStyle);
                                }
                            }
                            else if (featuredarstellen === false) {
                                feature.setStyle(null);
                            }
                        });
                    }
                    // Es wird auch nach OR gefiltert
                    else {
                        console.log("mist");
                    }
                }
            }, this);
            this.model.set("layerfilters", layerfilters);
        },
        render: function () {
            var attr,
                layerfilters = this.model.get("layerfilters");

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.model.getLayers();
                attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.setMaxHeight();
                if (layerfilters) {
                    _.each(layerfilters, function (layerfilter) {
                        _.each(layerfilter.filter, function (filter) {
                            $(filter.id).val(filter.fieldValue);
                        });
                    });
                }
            }
            else if (this.model.get("isCurrentWin") === false) {
                if (layerfilters) {
                    _.each(layerfilters, function (layerfilter) {
                        _.each(layerfilter.filter, function (filter) {
                            filter.fieldValue = "*";
                        });
                    });
                    this.filterLayers(layerfilters);
                }
            }
        },
        setMaxHeight: function () {
            var maxHeight = $(window).height() - 160;

            $("#wfsFilterWin").css("max-height", maxHeight);
        }
    });

    return extendedFilterView;
});
