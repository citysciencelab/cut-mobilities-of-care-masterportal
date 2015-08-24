define([
    "backbone",
    "modules/layerinformation/list",
    "modules/layerinformation/view"
], function (Backbone, LayerInformationList, View) {

        var listView = Backbone.View.extend({
            collection: new LayerInformationList(),
            className: "layerinformations",
            initialize: function () {
                $("body").append(this.$el);
                this.listenTo(this.collection, {
                    "add": this.render
                });
            },
            render: function (model) {
                var view = new View({model: model});

                this.$el.prepend(view.render().el);
            }
        });

        return listView;
});
