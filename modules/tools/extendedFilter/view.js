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
            "click #addorbutton": "addOrToFilter",
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
                select += "</div><br>";
                $("#attributepanel").append(select);
            },this);
        },
        addOrToFilter: function () {
            var select = "",
                attrToFilter = this.model.get("attributesToFilter");
            
            attrToFilter.push ("OR");
            this.model.set("attributesToFilter",attrToFilter);
            
            select += "<div class='input-group-addon'>";
            select += "<span>OR</span>";
            select += "</div><br>";
            
            $("#attributepanel").append(select);
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
                value;

            _.each(wfsList, function (layer) {
                    if (layer.filterOptions === "extended") {
                        _.each(this.model.get("attributesToFilter"), function (fieldName) {
                            
                            if(fieldName==="OR"){
                                filters.push ({
                                    id: "none",
                                    filterType: "OR",
                                    fieldName: "none",
                                    fieldValue: "none"
                                });
                            }
                            else{
                                id = "#" + layer.id + "_" + fieldName;
                                value = $(id).val();
                                filters.push ({
                                    id: id,
                                    filterType: "AND",
                                    fieldName: fieldName,
                                    fieldValue: value
                                });
                            }
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
                    var attrToFilter = this.model.get("attributesToFilter"),
                        newAttrToFilter = [];
                    for (var i=layerfilter.filter.length-1; i>=0; i--) {
                        if (layerfilter.filter[i].filterType === "OR") {
                            newAttrToFilter.push(layerfilter.filter.splice(i,layerfilter.filter.length-1));
                        }
                    }
                    newAttrToFilter.push(layerfilter.filter);
                    
                    // alle Objecte mit filterType OR herauslöschen
                    _.each(newAttrToFilter,function(t1,index){
                       _.each(t1,function(t2,index2){
                            if(t2 !== undefined){
                                if(t2.filterType==="OR"){
                                t1.splice(index2,1);
                                }
                            }
                           
                       });
                    });
                    
                    console.log(newAttrToFilter);
                    
                    
                    
                    features.forEach(function (feature) {
                        var featuredarstellen2 = true,
                            preVal2 = false;

                        // Prüfung, ob Feature dargestellt werden soll
                        _.each(newAttrToFilter, function(arrayWithAnds) {
                            var featuredarstellen = true,
                                preVal = true;
                            
                            _.each(arrayWithAnds, function (elementfilter) {

                                featuredarstellen = this.checkFeatureForFilter(feature,elementfilter);
                                if(preVal === true && featuredarstellen === true){
                                    featuredarstellen = true;
                                    preVal = true;
                                }
                                else{
                                    featuredarstellen = false;
                                    preVal = false;
                                }
                               
                            },this);
                            
                            if(preVal2 === true || featuredarstellen === true){
                                featuredarstellen2 = true;
                                preVal2 = true;
                            }
                            else{
                                featuredarstellen2 = false;
                                preVal2 = false;
                            }
                            
                        },this);
                        if (featuredarstellen2 === true) {
                            if (feature.defaultStyle) {
                                feature.setStyle(feature.defaultStyle);
                                delete feature.defaultStyle;
                            }
                            else {
                                feature.setStyle(layer.defaultStyle);
                            }
                        }
                        else if (featuredarstellen2 === false) {
                            feature.setStyle(null);
                        }
                        
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
