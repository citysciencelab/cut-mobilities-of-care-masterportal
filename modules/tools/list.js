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
                "onlyActivateGFI": this.activateGFI
            });
            _.each(Config.tools, this.addModel, this);
        },
        addModel: function (obj, key) {
            obj.name = key;
            this.add(obj);
        },
        setActiveToFalse: function (model) {
            var models = this.without(model);

            _.each(models, function (mod) {
                mod.set("isActive", false);
            });
        },
        activateGFI: function () {
            var model = this.findWhere({name: "gfi"});

            model.set("isActive", true);
            this.setActiveToFalse(model);
        }
    });

    return ToolList;
});
