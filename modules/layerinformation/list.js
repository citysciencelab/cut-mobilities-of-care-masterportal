define([
    "backbone",
    "eventbus",
    "modules/layerinformation/view"
], function (Backbone, EventBus, LayerInformationView) {

    var list = Backbone.Collection.extend({
        initialize: function () {
            this.listenTo(EventBus, {
                "layerinformation:add": function (model) {
                    this.add(model);
                }
            });

            this.listenTo(this, {
                "add": this.createView,
                "change:remove": this.test
            });
        },

        createView: function (model) {
            new LayerInformationView({model: model});
        },

        test: function (model) {
            console.log(model);
            this.remove(model);
        }
    });

    return list;
});
