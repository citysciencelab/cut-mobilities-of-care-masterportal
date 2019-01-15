import ListTemplate from "text-loader!./templates/template.html";
import SingleLayerView from "./singleLayerView";

const LayerView = Backbone.View.extend({
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
            Radio.trigger("TableMenu", "deactivateCloseClickFrame");
        });

        this.$el.on("show.bs.collapse", function () {
            Radio.request("TableMenu", "setActiveElement", "Layer");
        });

    },
    id: "table-layer-list",
    className: "table-layer-list table-nav",
    template: _.template(ListTemplate),
    hideMenu: function () {
        $("#table-nav-layers-panel").collapse("hide");
        Radio.trigger("TableMenu", "deactivateCloseClickFrame");
    },
    render: function () {
        this.$el.html(this.template());
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
            if (!model.get("isNeverVisibleInTree")) {
                if (model.get("isVisibleInTree") === true) {
                    childElement = new SingleLayerView({model: model}).render().$el;
                    this.$el.find("ul.layers").prepend(childElement);
                }
            }
        }, this);
    }
});

export default LayerView;
