define([
    "backbone",
    "backbone.radio",
    "modules/tree/selection/list",
    "modules/tree/selection/view",
    "jqueryui/widgets/sortable"
], function (Backbone, Radio, List, View) {

    var listView = Backbone.View.extend({
        collection: new List(),
        tagName: "ul",
        className: "list-group layer-selected-list",
        initialize: function () {
            this.listenTo(Radio.channel("MenuBar"), {
                "switchedMenu": this.render
            });

            this.listenTo(this.collection, {
                "add": this.render,
                "remove": this.render
            });

            this.render();
        },
        render: function () {
            var isMobile = Radio.request("MenuBar", "isMobile");

            if (isMobile === false) {
                $(".layer-selection > .content").append(this.$el.html(""));
                this.collection.forEach(this.renderModelView, this);
                this.setSortable();
            }
        },
        renderModelView: function (model) {
            // keine gute Lösung. Das Model ist in zwei collections, referenziert aber nur auf eine.
            // Zurzeit noch kein Problem da das Model nur Funktionen einer der beiden Collection benötigt
            model.collection = this.collection;
            var view = new View({model: model});
            this.$el.prepend(view.render().el);
        },
        setSortable: function () {
            this.$el.sortable({
                start: function (evt, ui) {
                    ui.item.startPos = ui.item.index();
                },
                update: function (evt, ui) {
                    ui.item.trigger("movemodel", ui.item.startPos - ui.item.index());
                    ui.item.trigger("movemodel", ui.item.startPos - ui.item.index());
                }
            });
        }
    });

    return listView;
});
