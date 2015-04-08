define([
    "underscore",
    "backbone",
    "modules/layerselection/list",
    "modules/layerselection/view"
], function (_, Backbone, List, View) {

        var listView = Backbone.View.extend({
            collection: new List(),
            tagName: "ul",
            className: "list-group layer-selected-list",
            initialize: function () {
                this.render();
                this.listenTo(this.collection, "add", this.render);
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
            }
        });

        return listView;
    });
