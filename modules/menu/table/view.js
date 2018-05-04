define(function (require) {
    var Backbone = require("backbone"),
        _ = require("underscore"),
        MainTemplate = require("text!modules/menu/table/main/template.html"),
        $ = require("jquery"),
        LayerView = require("modules/menu/table/layer/view"),
        ToolsMenuView = require("modules/menu/table/tool/menuview"),
        ToolView = require("modules/menu/table/tool/toolview"),
        Menu;

    Menu = Backbone.View.extend({
        collection: {},
        id: "table-nav",
        className: "table-nav",
        template: _.template(MainTemplate),
        initialize: function () {
            this.render();
            this.renderLayer();
            this.renderTools();
        },
        render: function () {
            $(this.el).html(this.template());
            $(".lgv-container").append(this.$el);
        },
        renderLayer: function () {
            this.$el.find("#table-nav-main").append(new LayerView().render());
        },
        renderTools: function () {
            var collection = Radio.request("ModelList", "getCollection"),
                models = _.filter(collection.models, function (model) {
                    return model.getType() === "tool" || model.getType() === "folder";
                });

            _.each(models, function (model) {
                var id = model.getId();

                switch (model.getType()) {
                    case "tool": {
                        this.addToolView(model);
                        break;
                    }
                    case "folder": {
                        if (model.getId() === "tools") {
                            this.addToolsMenuView ();
                        }
                        break;
                    }
                }
                // switch (model.getId()) {
                //     case "measure": {
                //         this.addToolView(model);
                //         break;
                //     }
                //     case "gfi": {
                //         this.addToolView(model);
                //         break;
                //     }
                // }
            }, this);

        },
        addToolsMenuView: function () {
            this.$el.append(new ToolsMenuView().render());
        },
        addToolView: function (model) {
             new ToolView({model: model});
        }
    });
        return Menu;
    });
