import ListTemplate from "text-loader!./templates/template.html";
import SingleLayerView from "./singleLayerView";
import CloseClickView from "./closeClickView";

const LayerView = Backbone.View.extend({
    events: {
        "click .closeclick-view": "hideMenu"
    },
    initialize: function () {
        this.collection = Radio.request("ModelList", "getCollection");
        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementLayer": this.hideMenu
        });
        this.listenTo(this.collection, {
            "updateLightTree": function () {
                this.render();
            }
        });

        this.$el.on("hide.bs.collapse", function () {
            $("#closeclick-view").removeClass("closeclick-activated");
            $("#closeclick-view").addClass("closeclick-deactivated");
        });

        this.$el.on("show.bs.collapse", function () {
            Radio.request("TableMenu", "setActiveElement", "Layer");
            $("#closeclick-view").removeClass("closeclick-deactivated");
            $("#closeclick-view").addClass("closeclick-activated");
        });
    },
    id: "table-layer-list",
    className: "table-layer-list table-nav",
    template: _.template(ListTemplate),
    hideMenu: function () {
        $("#table-nav-layers-panel").collapse("hide");
        $("#closeclick-view").removeClass("closeclick-activated");
        $("#closeclick-view").addClass("closeclick-deactivated");
    },
    render: function () {
        this.$el.html(this.template());
        new CloseClickView().render();
        if (Radio.request("TableMenu", "getActiveElement") === "Layer") {
            $("#table-nav-layers-panel").collapse("show");
        }
        this.renderList();
        return this;
    },
    renderList: function () {
        var models = this.collection.where({type: "layer"});

        models = _.sortBy(models, function (model) {
            return model.get("selectionIDX");
        });
        this.addViews(models);
    },
    addViews: function (models) {
        var childElement = {};

        _.each(models, function (model) {
            if (model.get("isVisibleInTree") === true) {
                childElement = new SingleLayerView({model: model}).render().$el;
                this.$el.find("ul.layers").prepend(childElement);
            }
        }, this);
    }
});

export default LayerView;
