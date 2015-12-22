define([
    "backbone",
    "modules/tools/model",
    "eventbus",
    "config"
], function (Backbone, Tool, EventBus, Config) {

    var ToolList = Backbone.Collection.extend({
        model: Tool,
        initialize: function () {
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
        }
    });

    return ToolList;
});
