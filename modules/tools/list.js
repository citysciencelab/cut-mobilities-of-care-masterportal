define([
    "backbone",
    "modules/tools/model",
    "eventbus",
    "config"
], function (Backbone, Tool, EventBus, Config) {

    var ToolList = Backbone.Collection.extend({
        model: Tool,
        initialize: function () {
            EventBus.on("onlyActivateGFI", this.activateGFI, this);
            _.each(Config.tools, this.addModel, this);
        },
        addModel: function (obj, key) {
            obj.name = key;
            this.add(obj);
        },
        changeActive: function (mod) {
            var model = this.without(mod);

            _.each(model, function (mod) {
                mod.set("isActive", false);
            });
        },
        activateGFI: function () {
            this.changeActive(this.findWhere({name: "gfi"}).cid);
        }
    });

    return ToolList;
});
