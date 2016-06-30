define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/desktop/folder/thementemplate.html",
    "text!modules/menu/desktop/folder/templateLeaf.html",
    "text!modules/menu/desktop/folder/catalogTemplate.html"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        FolderTemplate = require("text!modules/menu/desktop/folder/thementemplate.html"),
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
                "change:isSelected": this.rerender
            });
            this.render();
        },
        render: function () {
            this.$el.html("");

            if (this.model.getIsVisibleInTree()) {

                this.$el.attr("id", this.model.getId());

                var selector = "";

                if (this.model.getParentId() === "Baselayer") {
                    selector = "#Baselayer";
                }
                else {
                   selector = "#Overlayer";
                }
                var attr = this.model.toJSON();

                if (this.model.getLevel() > 0) {
                    $("#" + this.model.getParentId()).after(this.$el.html(this.template(attr)));
                }
                else {
                    $(selector).append(this.$el.html(this.template(attr)));
                }
                $(this.$el).css("padding-left", (this.model.getLevel() * 15 + 5) + "px");
            }

        },
        rerender: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        updateList: function () {
            if (this.model.getIsLeafFolder() === true) {
                this.model.setIsExpanded(true);
            }
            this.model.updateList(this.model.getId());
        },
        toggleIsExpanded: function () {
            this.model.toggleIsExpanded();
        },
        toggleIsSelected: function () {
            this.model.toggleIsSelected();
            Radio.trigger("ModelList", "toggleIsSelectedChildLayers", this.model);
            this.model.setIsExpanded(true);
        }
    });

    return FolderView;
});
