define([
    "backbone",
    "backbone.radio",
    "modules/layer/list",
    "modules/treeLight/view",
    "eventbus",
    "jqueryui/widgets/sortable"
], function (Backbone, Radio, LayerList, LayerView, EventBus) {

    var LayerListView = Backbone.View.extend({
        collection: LayerList,
        tagName: "ul",
        className: "list-group",
        initialize: function () {
            this.listenTo(this.collection, {
                "add": this.render
            });

            this.listenTo(Radio.channel("MenuBar"), {
                "switchedMenu": this.render
            });

            this.render();
            this.setMaxHeight();
        },
        render: function () {
            var isMobile = Radio.request("MenuBar", "isMobile");

            if (isMobile === false) {
                this.stopEventPropagation();
                $(".dropdown-tree").append(this.$el.html(""));
                this.collection.forEach(this.addTreeNode, this);
                EventBus.trigger("registerLayerTreeInClickCounter", this.$el);
            }
        },
        addTreeNode: function (node) {
            // hier nur von displayintree nicht auf false
            var layerView = new LayerView({model: node});

            this.$el.prepend(layerView.render().el);
        },
        setMaxHeight: function () {
            this.$el.css("max-height", $(window).height() - 100);
            this.$el.css("overflow-y", "auto");
            this.$el.css("overflow-x", "hidden");
        },
        // stopPropagation verhindert, dass ein Event im DOM-Baum nach oben reist
        // und dabei Aktionen auf anderen Elementen triggert.
        // In diesem Fall wird der Baum nicht geschlossen wenn z.B. auf eine Layer-View geklickt wird.
        stopEventPropagation: function () {
            $(".dropdown-tree").on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        }
    });

    return LayerListView;
});
