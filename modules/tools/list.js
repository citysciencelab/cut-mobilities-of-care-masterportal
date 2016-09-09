define([
    "backbone",
    "backbone.radio",
    "modules/tools/model",
    "eventbus",
    "config"
], function (Backbone, Radio, Tool, EventBus, Config) {

    var ToolList = Backbone.Collection.extend({
        model: Tool,
        initialize: function () {
            var channel = Radio.channel("ToolList");

            channel.on({
                "setActiveByName": this.setActiveByName
            }, this);

            this.listenTo(EventBus, {
                // wird getriggert, wenn das Tool-Fenster (z.B. Print) geschlossen wird
                "onlyActivateGFI": this.activateGFI
            });
            _.each(Config.tools, this.addModel, this);
        },
        // fügt die Tools (obj) der Liste hinzu
        // key = name des Tools (z.B. gfi, coords)
        addModel: function (obj, key) {
            obj.name = key;
            this.add(obj);
        },
        // Setzt alle Tools auf deaktiviert, bis auf das Übergebene
        setActiveToFalse: function (model) {
            var models = this.without(model);

            _.each(models, function (mod) {
                mod.set("isActive", false);
            });
        },
        // Aktiviert das GFI-Tool
        activateGFI: function () {
            var model = this.findWhere({name: "gfi"});

            model.set("isActive", true);
            this.setActiveToFalse(model);
        },
        setActiveByName: function (value) {
            var model = this.findWhere({name: value});

            model.set("isActive", true);
            this.setActiveToFalse(model);
        }
    });

    return ToolList;
});
