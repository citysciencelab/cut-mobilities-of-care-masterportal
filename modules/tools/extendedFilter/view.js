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
            "click .panel-heading": "toggleHeading",
            "click .btn-default": "removeDiv"
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
                selectRadio = "",
                attrToFilter = this.model.get("attributesToFilter"),
                counter = this.model.get("logExpCounter");
            
            counter ++;
            this.model.set("logExpCounter", counter);
            attrToFilter.push(attr);
            this.model.set("attributesToFilter", attrToFilter);

            _.each(this.model.get("wfsList"), function (layer) {                
                select += "<div class='' id='all_" + layer.id + "_" + attr + "'>";
                if (counter === 1) {
                }
                else {
                    select += "<div class='input-group' id='radio_" + layer.id + "_" + attr + "'>";
                    select += "<span class='input-group-addon'>";
                    select += "<input type='radio' checked='true' name='andor_" + attr + "' id='" + counter + "_AND'>AND";
                    select += "<input type='radio' name='andor_" + attr + "' id='" + counter + "_OR'>OR";
                    select += "</span>";
                    select += "</div>";                
                }
                select += "<label for='' id='label_" + layer.id + "_" + attr + " ' class='control-label'>" + attr + "</label>";
                select += "<div class='input-group'id='div_" + layer.id + "_" + attr + "'>";
                select += "<select class='form-control input' id='" + layer.id + "_" + attr + "'>";
                select += "<option title='Nicht filtern'>*</option>";
                _.each(layer.attributes, function (attribute) {
                    if (attribute.attr === attr) {
                        _.each(attribute.values, function (value) {
                            select += "<option title='" + value + "'>" + value + "</option>";
                        });
                   }
                });
                select += "</select><br>";
                select += "<div class='input-group-btn'>";
                select += "<button id='btnremove_"+layer.id+"_"+attr+"' title='Attribut vom Filter entfernen' class='btn btn-default' type='button'><span class='glyphicon glyphicon-minus-sign'></span></button>";
                select += "</div>";
                select += "</div>";
                select += "</div>";
                $("#attributepanel").append(select);
            },this);
        },
        removeDiv: function (btn_remove){
            var id = btn_remove.currentTarget.id,
                attr = id.split("_")[2],
                counter = this.model.get("logExpCounter"),
                attrToFilter = this.model.get("attributesToFilter");
            
            for (var i=attrToFilter.length-1; i>=0; i--) {
                if (attrToFilter[i] === attr) {
                    attrToFilter.splice(i, 1);
                    break;
                }
            }
            this.model.set("attributesToFilter",attrToFilter);
            
            
            id = id.replace("btnremove_","all_");
            $("#"+id).remove();

            counter--;
            this.model.set("logExpCounter",counter);
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
                        // counter entspricht dem Zähler der Logischen Ausdrücke (AND/OR)
                        _.each(this.model.get("attributesToFilter"), function (fieldName,counter) {

                            id = "#" + layer.id + "_" + fieldName;
                            value = $(id).val();
                            and_or = "";

                            if ($("#" + counter + "_AND").prop("checked")) {
                                and_or = "AND";
                            }
                            else if ($("#" + counter + "_OR").prop("checked")) {    
                                and_or = "OR";
                            }
                            else {
                                //sonderfall 1.attribut. Da kein radioBtn gesetzt ist, kann er nicht abgefragt werden. Er wird hier gesetzt. 
                                and_or = "AND";
                            }
                            
                            
                            filters.push ({
                                id: id,
                                filterType: and_or,
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
                                        filterType: filter.filterType,
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

                    features.forEach(function (feature) {
                        var featuredarstellen = true,
                            preVal = true,
                            attributname,
                            attributvalue,
                            filtertype;

                        // Prüfung, ob Feature dargestellt werden soll
                        _.each(layerfilter.filter, function (elementfilter) {
                            attributname = elementfilter.fieldName;
                            attributvalue = elementfilter.fieldValue;
                            filtertype = elementfilter.filterType;

                            if(filtertype ==="OR"){
                                featuredarstellen = this.checkFeatureForFilter(feature,elementfilter);
                                if(preVal === true || featuredarstellen === true){
                                    featuredarstellen = true;
                                    preVal = true;
                                }
                                else{
                                    featuredarstellen = false;
                                    preVal = false;
                                }
                            }
                            else{
                                featuredarstellen = this.checkFeatureForFilter(feature,elementfilter);
                                if(preVal === true && featuredarstellen === true){
                                    featuredarstellen = true;
                                    preVal = true;
                                }
                                else{
                                    featuredarstellen = false;
                                    preVal = false;
                                }
                            }
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
                        },this);
                    },this);
                }
            }, this);
            
            this.model.set("layerfilters", layerfilters);
        },
        
        checkFeatureForFilter: function(feature, elementfilter){
            var featuredarstellen = true,
                attributname = elementfilter.fieldName,
                attributvalue = elementfilter.fieldValue,
                featurevalue0,
                featurevalue;

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
            return featuredarstellen;
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
