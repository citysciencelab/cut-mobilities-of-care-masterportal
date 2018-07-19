define([
    "backbone",
    "backbone.radio",
    "jquery",
    "text!modules/menu/desktop/folder/templateTree.html"
], function (Backbone, Radio, $, FolderTemplate) {

    var FolderView = Backbone.View.extend({
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

            if (this.model.get("isVisibleInTree")) {
                var attr = this.model.toJSON();

                this.$el.attr("id", this.model.get("id"));


                // external Folder
                if (this.model.get("parentId") === "ExternalLayer") {
                    $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
                }
                else {
                    // Folder ab der ersten Ebene
                    if (this.model.get("level") > 0) {
                        $("#" + this.model.get("parentId")).after(this.$el.html(this.template(attr)));
                    }
                    else {
                        // Folder ist auf der Höchsten Ebene (direkt unter Themen)
                        var selector = "";

                        if (this.model.get("parentId") === "Baselayer") {
                            selector = "#Baselayer";
                        }
                        else {
                            selector = "#Overlayer";
                        }
                        $(selector).append(this.$el.html(this.template(attr)));
                    }
                    var paddingLeftValue = this.model.get("level") * 15 + 5;

                    $(this.$el).css("padding-left", paddingLeftValue + "px");
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
            if (!this.model.get("isVisibleInTree")) {
                this.remove();
            }
        }

    });

    return FolderView;
});
