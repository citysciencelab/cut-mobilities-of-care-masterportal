define(function (require){
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Model = require("modules/tools/extendedfilter/model"),
        Template = require("text!modules/tools/extendedFilter/template.html"),
        ExtendedFilterView;

    ExtendedFilterView = Backbone.View.extend({
        model: new Model(),
        template:_.template(Template),
        initialize: function () {
            this.listenTo(this.model,{
                "change:isCollapsed, change:isCurrentWin": this.render
            }, this); // Fenstermanagement

        },
        events: {
            "change #dropdown": "nextStep",
            "click .btn_remove": "removeAttrFromFilter",
            "click #btn_back": "previousStep"
        },

        previousStep: function () {
            var currentContent = this.model.getCurrentContent(),
                step = currentContent.step,
                name = currentContent.name,
                layername = currentContent.layername,
                filtername = currentContent.filtername,
                attribute = currentContent.attribute,
                options = currentContent.options,
                currentFilterType = this.model.getCurrentFilterType(),
                content;

            if(step === 2){
                content = this.getDefaultContent();

            }
            else if (step === 3){
                step = step-2;
                content = this.step2(currentFilterType,step);
            }
            else if (step === 4){
                step = step-2;

                content = this.step3(layername,step);
            }
            this.model.setCurrentContent(content);
            this.render();
        },
        removeAttrFromFilter: function (evt) {
            var id = evt.currentTarget.id,
                filtername = id.split("__")[0],
                attr = id.split("__")[1],
                val = id.split("__")[2],
                currentFilters = this.model.getCurrentFilters(),
                filterToUpdate,
                attributesArray;

            for (var i=currentFilters.length-1; i>=0; i--) {
                if (currentFilters[i].layername === filtername) {
                    filterToUpdate = currentFilters.splice(i, 1)[0];
                    break;
                }
            }

            attributesArray = filterToUpdate.attributes;

            for (var i=attributesArray.length-1; i>=0; i--) {
                if (attributesArray[i].attribute === attr && attributesArray[i].value === val) {
                    attributesArray.splice(i, 1)[0];
                    break;
                }
            }
            if(attributesArray.length === 0){
                var counter = this.model.getFilterCounter();

                counter--;
                this.model.setFilterCounter(counter);
            }
            else{
                currentFilters.push({
                    layername: filtername,
                    attributes: attributesArray
                });
            }
            this.model.setCurrentFilters(currentFilters);

            if(currentFilters.length === 0){
                var content = this.getDefaultContent();

                content.options = ["Neuer Filter"];
                this.model.setCurrentContent(content);
            }
            this.render();
        },

        nextStep: function(evt) {
            var id = evt.currentTarget.id,
                val = $("#"+id).val(),
                currentContent = this.model.getCurrentContent(),
                step = currentContent.step,
                newContent;

            if(step === 1){ //Layer wählen oder Filter wählen
                newContent = this.step2(val, step);
            }
            else if (step === 2){ //Attribut wählen
                newContent = this.step3(val, step);
            }
            else if (step === 3){ //Wert wählen
                newContent = this.step4(val, step, currentContent.layername,currentContent.filtername);
            }
            else if (step === 4){ //auf default zurücksetzen
                newContent = this.getDefaultContent();
                this.setFilter(val, currentContent.layername ,currentContent.attribute,currentContent.filtername);
                this.filterLayers();
            }

            this.model.setCurrentContent(newContent);
            this.render();
        },

        filterLayers: function () {
            this.model.getLayers();

            var currentFilters = this.model.getCurrentFilters(),
                wfsList = this.model.getWfsList();
            _.each(wfsList,function(wfsLayer){

            });


        },
        getDefaultContent: function () {
            var content;

            content = {step: 1,
                       name: "Bitte wählen",
                       layername: undefined,
                       filtername: undefined,
                       attribute: undefined,
                       options: ["Neuer Filter","Filter verfeinern"]
                      }
            return content;
        },

        step2: function (val, step) {
            var content,
                newStep = step,
                wfsList,
                options = [],
                currentFilters = [];

            newStep++;
            if(val === "Neuer Filter"){
                this.model.getLayers();
                wfsList = this.model.getWfsList();
                _.each(wfsList,function(layer){
                    options.push(layer.name);
                });
                content = {step: newStep,
                          name: "Layer wählen",
                          layername: undefined,
                          attribute: undefined,
                          options: options}
            }
            else { //Filter erweitern
                currentFilters = this.model.getCurrentFilters();
                _.each(currentFilters,function(filter){
                    options.push(filter.layername)
                });
                content = {step: newStep,
                          name: "Filter verfeinern",
                          layername: undefined,
                          attribute: undefined,
                          options: options}

            }
            return content;
        },

        step3: function (val, step) {
            var content,
                newStep = step,
                wfsList = this.model.getWfsList(),
                currentFilters = this.model.getCurrentFilters(),
                currentFilter,
                options = [],
                layer;

            newStep++;
            this.model.getLayers();

            if(val.split(" ")[0] !== "Filter"){
                this.model.setCurrentFilterType("Neuer Filter");
                layer = _.findWhere(wfsList,{name : val});
            }
            else{
                this.model.setCurrentFilterType("Filter verfeinern");
                layer = _.findWhere(wfsList,{name : val.split(" ")[2]});

            }

            _.each(layer.attributes,function(attribute){
                options.push(attribute.attr);
            });
            content = {step: newStep,
                        name: "Attribut wählen",
                        layername: layer.name,
                        filtername: val,
                        attribute: undefined,
                        options: options};

            return content;
        },

        step4: function (val, step, layername, filtername) {
            var content,
                newStep = step,
                wfsList = this.model.getWfsList(),
                options = [],
                layer,
                attribute;

            newStep++;
            this.model.getLayers();
            layer = _.findWhere(wfsList,{name : layername});
            attribute = _.findWhere(layer.attributes,{attr: val});

            _.each(attribute.values,function(value){
                options.push(value);
            });
            content = {step: newStep,
                        name: "Wert wählen",
                        layername: layer.name,
                        filtername: filtername,
                        attribute: val,
                        options: options}

            return content;
        },

        setFilter: function (val,layername, attribute, filtername) {
            var currentFilters = this.model.getCurrentFilters(),
                filterToUpdate,
                currentFilterType = this.model.getCurrentFilterType(),
                filtercounter = this.model.getFilterCounter(),
                attributesArray = [];

            if(currentFilterType==="Neuer Filter"){
                attributesArray = [];
                attributesArray.push({attribute:attribute,
                                     value: val});

                currentFilters.push({
                    layername:"Filter" + " " + filtercounter + " " + layername,
                    attributes: attributesArray
                });

                filtercounter++;
            }
            else {
                for (var i=currentFilters.length-1; i>=0; i--) {
                    if (currentFilters[i].layername === filtername) {
                        filterToUpdate = currentFilters.splice(i, 1)[0];
                        break;
                    }
                }

                attributesArray = filterToUpdate.attributes;
                attributesArray.push({attribute:attribute,
                                     value: val});

                currentFilters.push({
                    layername: filtername,
                    attributes: attributesArray
                });
            }
            this.model.setFilterCounter(filtercounter);
            this.model.setCurrentFilters(currentFilters);
            this.filterLayers();
        },
        filterLayers: function () {
            var currentFilters =  this.model.getCurrentFilters(),
                layername,
                layers = this.model.get("wfsList"),
                wfslayer,
                layer,
                features,
                featuredarstellen = true,
                preVal = true;
            
            _.each(currentFilters,function(filter){
                layername = filter.layername.split(" ")[2];
                wfslayer = _.find(layers, function (layer) {
                    return layer.name === layername;
                });
                layer = wfslayer.layer;
                features = layer.getFeatures();
            });
            
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {

                var attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));

                this.delegateEvents();
            }
            else{
                this.undelegateEvents();
            }
        }
    });
    return ExtendedFilterView;
});
