define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/desktop/folder/templateTree.html"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        FolderTemplate = require("text!modules/menu/desktop/folder/templateTree.html"),
        FolderView;

    FolderView = Backbone.View.extend({
        tagName: "li",
        className: "themen-folder",
        id: "",
        template: _.template(FolderTemplate),
        events: {
            "click .title, .glyphicon-minus-sign, .glyphicon-plus-sign": "toggleIsExpanded",
            "click .selectall": "toggleIsSelected"
        },
        initialize: function () {
            // Verhindert, dass sich der Themenbaum wg Bootstrap schließt
            this.$el.on({
                click: function (e) {
                   e.stopPropagation();
                }
            });
            this.listenTo(this.model, {
                "change:isSelected": this.rerender,
                "change:isExpanded": this.rerender,
                "change:isVisibleInTree": this.removeIfNotVisible
            });
            this.render();
        },
        render: function () {
            this.$el.html("");

            if (this.model.getIsVisibleInTree()) {

                this.$el.attr("id", this.model.getId());


                var attr = this.model.toJSON();

                // external Folder
                if (this.model.getParentId() === "ExternalLayer") {
                        $("#" + this.model.getParentId()).append(this.$el.html(this.template(attr)));
                }
                else {
                    // Folder ab der ersten Ebene
                    if (this.model.getLevel() > 0) {
                        $("#" + this.model.getParentId()).after(this.$el.html(this.template(attr)));
                    }
                    else {
                        // Folder ist auf der Höchsten Ebene (direkt unter Themen)
                        var selector = "";

                        if (this.model.getParentId() === "Baselayer") {
                            selector = "#Baselayer";
                        }
                        else {
                           selector = "#Overlayer";
                        }
                        $(selector).append(this.$el.html(this.template(attr)));
                    }
                    $(this.$el).css("padding-left", (this.model.getLevel() * 15 + 5) + "px");
                }
            }

        },
        rerender: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        toggleIsExpanded: function () {
            this.model.toggleIsExpanded();
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            Radio.trigger("ModelList", "setIsSelectedOnChildLayers", this.model);
            this.model.setIsExpanded(true);
        },
        removeIfNotVisible: function () {
            if (!this.model.getIsVisibleInTree()) {
                this.remove();
            }
        }

    });

    return FolderView;
});
