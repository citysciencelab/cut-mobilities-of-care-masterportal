define([
    "backbone",
    "eventbus",
    "text!modules/tools/extendedFilter/template.html",
    "modules/tools/extendedFilter/model"
], function (Backbone, EventBus, ExtendedFilterTemplate, ExtendedFilter) {
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
            "click .addattrbutton": "addAttributeToFilter",
            "click .addorbutton": "addOrToFilter",
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

        /*
        * erstellt das Attribut dropdown für den Filter
        */
        addAttributeToFilter: function (idlayer) {
            var layer,
                idlayer = idlayer.currentTarget.id.split("__")[0],
                attr,
                select = "",
                attrToFilterObjs,
                attrToFilterObj,
                attrCounterObjs,
                attrCounterObj,
                counter,
                index;
            
            layer = _.find(this.model.get("wfsList"),function(layer){
                if(layer.id=idlayer){
                    return layer
                }
            });
                
            attr = $("#"+layer.id+"_addattrselect").val();
            select = "";
            attrToFilterObjs = this.model.get("attrToFilter");
            attrCounterObjs = this.model.get("attrCounter");

            if(attr === "Attribut auswählen"){
                EventBus.trigger("alert", "Bitte geben Sie ein Attribut zum Filtern ein!");
            }
            else{
                
                // erstelle für den aktuellen layer ein objekt mit layerid und counter, wenn nicht schon eins existiert. Wenn eins existiert, zähle counter hoch. 
                attrCounterObj = _.findWhere(attrCounterObjs,{layerid:layer.id});
                index = _.indexOf(attrCounterObjs,attrCounterObj);

                if(index !== -1){
                    counter = attrCounterObj.counter;
                    counter ++;
                    attrCounterObjs.splice(index, 1);
                    attrCounterObjs.push({
                        layerid: layer.id,
                        counter: counter
                    });
                    this.model.set("attrCounter",attrCounterObjs);
                }
                else{
                    counter = 0;
                    attrCounterObjs.push({
                        layerid: layer.id,
                        counter: counter
                    });
                    this.model.set("attrCounter",attrCounterObjs);
                }
                
                
                // erstelle für den aktuellen layer ein objekt mit layerid und attributen-array, wenn nicht schon eins existiert. Wenn eins existiert, füge attribut hinzu. 
                attrToFilterObj = _.findWhere(attrToFilterObjs,{layerid:layer.id});
                index = _.indexOf(attrToFilterObjs,attrToFilterObj);
                
                attr=attr+"__"+counter;
                
                if(index !== -1){
                    var array = attrToFilterObj.attributes;
                    
                    attrToFilterObjs.splice(index, 1);
                    array.push(attr);
                    attrToFilterObjs.push({
                        layerid: layer.id,
                        attributes: array
                    });
                    this.model.set("attrToFilter",attrToFilterObjs);
                }
                else{
                    var array = [];
                    
                    array.push(attr);
                    attrToFilterObjs.push({
                        layerid: layer.id,
                        attributes: array
                    });
                    this.model.set("attrToFilter",attrToFilterObjs);
                }

                select += "<div class='' id='all__" + layer.id + "__" + attr + "'>";
                select += "<label for='' id='label__" + layer.id + "__" + attr + "' class='control-label'>" + attr.split("__")[0] + "</label>";
                select += "<div class='input-group'id='div__" + layer.id + "__" + attr + "'>";
                select += "<select class='form-control input' id='" + layer.id + "__" + attr + "'>";
                select += "<option title='Nicht filtern'>*</option>";
                _.each(layer.attributes, function (attribute) {
                    if (attribute.attr === attr.split("__")[0]) {
                        _.each(attribute.values, function (value) {
                            select += "<option title='" + value + "'>" + value + "</option>";
                        });
                   }
                });
                select += "</select><br>";
                select += "<div class='input-group-btn'>";
                select += "<button id='btnremove__" + layer.id + "__" + attr + "' title='Attribut vom Filter entfernen' class='btn btn-default' type='button'><span class='glyphicon glyphicon-minus-sign'></span></button>";
                select += "</div>";
                select += "</div>";
                select += "</div><br>";
                $("#"+layer.id+"__attributepanel").append(select);
            }
        },
        /*
        * added den Trenner OR
        */
        addOrToFilter: function (layer) {
            var select = "",
                idlayer = layer.currentTarget.id.split("__")[0],
                attrToFilterObjs = this.model.get("attrToFilter"),
                attrToFilterObj = _.findWhere(attrToFilterObjs,{layerid:idlayer}),
                attributeArray = attrToFilterObj.attributes,
                orCounterObjs = this.model.get("orCounter"),
                orCounterObj,
                index,
            
                counter = 0;
            
           
            
            if(attributeArray.length===0){
                 EventBus.trigger("alert", "Bitte geben Sie zuerst mindestens ein Attribut zum Filtern ein!");
            }
            else if(attributeArray[attributeArray.length-1]==="OR"){
                EventBus.trigger("alert", "Bitte geben Sie zuerst mindestens ein Attribut zum Filtern ein!");
            }
            else{
                attributeArray.push ("OR");
                
                // erstelle für den aktuellen layer ein objekt mit layerid und OR counter, wenn nicht schon eins existiert. Wenn eins existiert, zähle counter hoch. 
                orCounterObj = _.findWhere(orCounterObjs,{layerid:idlayer});
                index = _.indexOf(orCounterObjs,orCounterObj);
                
                if(index !== -1){
                    counter = orCounterObj.counter;
                    counter ++;
                    orCounterObjs.splice(index, 1);
                    orCounterObjs.push({
                        layerid: idlayer,
                        counter: counter
                    });
                    this.model.set("orCounter",orCounterObjs);
                }
                else{
                    counter = 0;
                    orCounterObjs.push({
                        layerid: idlayer,
                        counter: counter
                    });
                    this.model.set("orCounter",orCounterObjs);
                }

                select += "<div class='input-group-addon'id='" + idlayer + "__" + "or" + "__" + counter + "'>";
                select += "<span>Und zeige alle Objekte mit folgenden Eigenschaften an:</span>";
                select += "</div><br>";

                $("#" + idlayer + "__" + "attributepanel").append(select);

            }
            
        },
        /*
        * löscht das attribut als Filter
        */
        removeDiv: function (btn_remove){
            var id = btn_remove.currentTarget.id,
                layer =id.split("__")[1], 
                attr = id.split("__")[2],
                nummer = id.split("__")[3],
                attrCounterObjs = this.model.get("attrCounter"),
                attrCounterObj = _.findWhere(attrCounterObjs,{layerid:layer}),
                counter = attrCounterObj.counter,
                attrToFilterObjs = this.model.get("attrToFilter"),
                attrToFilterObj = _.findWhere(attrToFilterObjs,{layerid:layer}),
                attributeArray = attrToFilterObj.attributes;
            
            attr = attr+"__"+nummer;
            for (var i=attributeArray.length-1; i>=0; i--) {
                if (attributeArray[i] === attr) {
                    attributeArray.splice(i, 1);
                    break;
                }
            }
            attrToFilterObj.attributes= attributeArray;
            
            for (var i=attrToFilterObjs.length-1; i>=0; i--) {
                if (attrToFilterObjs[i].layerid === layer) {
                    attrToFilterObjs.splice(i, 1);
                    break;
                }
            }
            attrToFilterObjs.push(attrToFilterObj);
            this.model.set("attrToFilter",attrToFilterObjs);
            
            
            id = id.replace("btnremove__","all__");
            $("#"+id).prev().remove();
            
            $("#"+id).remove();

            counter--;
            attrCounterObj.counter = counter;
            for (var i=attrCounterObjs.length-1; i>=0; i--) {
                if (attrCounterObjs[i].layerid === layer) {
                    attrCounterObjs.splice(i, 1);
                    break;
                }
            }
            attrCounterObjs.push(attrCounterObj);
            this.model.set("attrCounter",attrCounterObjs);
            this.removeOrIfNecessary();
        },

        /*
        * prüft ob das ODER-element gelöscht werden muss oder nicht
        */
        removeOrIfNecessary: function(){
            var counter = this.model.get("orCounter"),
                attrToFilter = this.model.get("attributesToFilter");
            
            for(var i=0;i<counter;i++){
                if($("#or__"+i).next().next().length===0 || $("#or__"+i).next().next()[0].id.split("__")[0]=== "or"){
                    $("#or__"+i).next().remove();
                    $("#or__"+i).remove();
                }
                if($("#or__"+i).prev().prev().length===0 || $("#or__"+i).prev().prev()[0].id.split("__")[0]=== "or"){
                    $("#or__"+i).prev().remove();
                    $("#or__"+i).remove();
                }
            }
            for (var i=attrToFilter.length-1; i>=0; i--) {
                if (attrToFilter[i] === "OR") {
                    attrToFilter.splice(i, 1);
                    
                }
            }
            this.model.set("attributesToFilter",attrToFilter);
        },
        /*
        * sammelt die Filter und führt dann die Filter-funktion durch
        */
        getFilterInfos: function () {
            var wfsList = this.model.get("wfsList"),
                layerfilters = [],
                filters = [],
                id,
                value;

            _.each(wfsList, function (layer) {
//                    if (layer.filterOptions === "extended") {
                    if (layer.extendedFilter === true) {
                        var iterator=0;
                        _.each(this.model.get("attributesToFilter"), function (fieldName) {
                            if(fieldName==="OR"){
                                iterator++;
                                filters.push ({
                                    id: "none",
                                    filterType: "OR",
                                    fieldName: "none",
                                    fieldValue: "none"
                                });
                            }
                            else{
                                id = "#" + layer.id + "__" + fieldName;
                                value = $(id).val();
                                filters.push ({
                                    id: id,
                                    filterType: "AND",
                                    fieldName: fieldName.split("__")[0],
                                    fieldValue: value
                                });
                            }
                        }, this);

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
        /*
        * iteriert über jedes feature und prüft ob es nach dem Filter dargestellt wird oder nicht. 
        */
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
                    
                    attrToFilter=[];
                    
                    // alle Objecte mit filterType !OR in attrToFilter schreiben
                    _.each(newAttrToFilter,function(t1){
                        
                       _.each(t1,function(t2,index2){
                            if(t2 !== undefined){
                                if(t2.filterType!=="OR"){
                                    attrToFilter.push(t1.splice(index2,1));
                                }
                            }
                       });  
                    });

                    features.forEach(function (feature) {
                        var featuredarstellen2 = true,
                            preVal2 = false;

                        // Prüfung, ob Feature dargestellt werden soll
                        _.each(attrToFilter, function(arrayWithAnds) {
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
