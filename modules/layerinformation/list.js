define([
    "backbone",
    "eventbus"
], function (Backbone, EventBus) {

    var list = Backbone.Collection.extend({
        initialize: function () {
            this.listenTo(EventBus, {
                "layerinformation:add": function (model) {
                    this.add(model);
                },
                "layerinformation:remove": function (id) {
                    this.remove(this.get(id));
                }
            });
        }
    });

    return list;
});
