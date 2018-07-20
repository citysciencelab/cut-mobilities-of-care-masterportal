define([
    "backbone",
    "backbone.radio",
    "modules/menu/mobile/breadCrumb/model",
    "bootstrap/collapse"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        BreadCrumbItem = require("modules/menu/mobile/breadCrumb/model"),
        BreadCrumbList;

    BreadCrumbList = Backbone.Collection.extend({
        model: BreadCrumbItem,

        /**
         * Registriert die Listener und fügt das erste "Breadcrumb-Item" hinzu
         */
        initialize: function () {
            var channel = Radio.channel("BreadCrumb");

            channel.on({
                "addItem": this.addItem
            }, this);

            channel.reply({
                "getLastItem": this.getLastItem
            }, this);

            this.addMainItem();
        },

        /**
         * Fügt der Liste das erste "Breadcrumb-Item" (Main-Item) hinzu.
         */
        addMainItem: function () {
            this.add({
                id: "root",
                name: "Menü"
            });
        },

        /**
         * Fügt der Liste ein neues Model hinzu
         * @param {Backbone.Model} model - Model aus der TreeList
         */
        addItem: function (model) {
            this.add({
                id: model.get("id"),
                name: model.get("name")
            });
        },

        /**
         * Löscht alle Models ab einen bestimmten Index aus der Collection
         * @param  {Backbone.Model} model - Ab diesem Model aufwärts, werden alle Models gelöscht
         */
        removeItems: function (model) {
            var modelIndex = this.indexOf(model),
                models = this.filter(function (model, index) {
                    return index > modelIndex;
                }),
                hasModels = models.length > 0;

            if (hasModels) {
                this.remove(models);
                Radio.trigger("ModelList", "setAllDescendantsInvisible", models[0].get("id"));
                Radio.trigger("ModelList", "setModelAttributesById", models[0], {isExpanded: false});
            }
            else if (modelIndex === 0) {
                $("div.collapse.navbar-collapse").removeClass("in");
            }
        },

        /**
         * Löscht das letzte Model aus der Collection
         */
        removeLastItem: function () {
            if (this.length > 1) {
                Radio.trigger("ModelList", "setModelAttributesById", this.pop().get("id"), {isExpanded: false});
            }
        },

        /**
         * Gibt das letzte Model aus der Collection zurück
         * @return {Backbone.Model}
         */
        getLastItem: function () {
            return this.at(this.length - 1);
        }
    });

    return BreadCrumbList;
});
