import FolderTemplate from "text-loader!./templateTree.html";

const FolderView = Backbone.View.extend({
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
    tagName: "li",
    className: "themen-folder",
    id: "",
    template: _.template(FolderTemplate),
    render: function () {
        var attr = this.model.toJSON(),
            paddingLeftValue = 0,
            selector = "";

        this.$el.html("");

        if (this.model.get("isVisibleInTree")) {
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
                    if (this.model.get("parentId") === "Baselayer") {
                        selector = "#Baselayer";
                    }
                    else {
                        selector = "#Overlayer";
                    }
                    $(selector).append(this.$el.html(this.template(attr)));
                }
                paddingLeftValue = (this.model.get("level") * 15) + 5;

                $(this.$el).css("padding-left", paddingLeftValue + "px");
            }
        }
        return this;
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

export default FolderView;
