define([
    "backbone",
    "modules/tree/selection/list",
    "modules/tree/selection/view",
    "jqueryui/sortable"
], function (Backbone, List, View) {

    var listView = Backbone.View.extend({
        collection: new List(),
        tagName: "ul",
        className: "list-group layer-selected-list",
        initialize: function () {
            this.listenTo(this.collection, {
                "add": this.render,
                "remove": this.render
            });

            // // JQuery UI
            this.$el.sortable({
                start: function (evt, ui) {
                    ui.item.startPos = ui.item.index();
                },
                update: function (evt, ui) {
                    ui.item.trigger("movemodel", ui.item.startPos - ui.item.index());
                    ui.item.trigger("movemodel", ui.item.startPos - ui.item.index());
                }
            });
            this.setMaxHeight();
            this.render();
        },
        render: function () {
            $(".layer-selection").after(this.$el.html(""));
            this.collection.forEach(this.renderModelView, this);
        },
        renderModelView: function (model) {
            // keine gute Lösung. Das Model ist in zwei collections, referenziert aber nur auf eine.
            // Zurzeit noch kein Problem da das Model nur Funktionen einer der beiden Collection benötigt
            model.collection = this.collection;
            var view = new View({model: model});
            this.$el.prepend(view.render().el);
        },
        setMaxHeight: function () {
            this.$el.css("max-height", $(window).height() / 4);
        }
    });

    return listView;
});
