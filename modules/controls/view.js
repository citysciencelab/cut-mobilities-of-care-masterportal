define([
    "backbone"
], function (Backbone) {

    var ControlsView = Backbone.View.extend({
        className: "controls-view",
        initialize: function (style) {
            this.uiStyle = style;
            this.render();


            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            if (!this.uiStyle || this.uiStyle !== "TABLE") {
                $("#map .ol-overlaycontainer-stopevent").append(this.$el);
                this.renderSubViews();
            }
        },

        renderSubViews: function () {
            this.$el.append("<div class='control-view-top-right'></div>");
            this.$el.append("<div class='control-view-bottom-right'></div>");
            this.$el.append("<div class='control-view-bottom-left'></div>");
        },

        addRowTR: function (id, showMobile) {
            if (!this.uiStyle || this.uiStyle !== "TABLE") {
                if (showMobile === true) {
                    this.$el.find(".control-view-top-right").append("<div class='row controls-row-right' id='" + id + "'></div>");
                }
                else {
                    this.$el.find(".control-view-top-right").append("<div class='row controls-row-right hidden-xs' id='" + id + "'></div>");
                }
                return this.$el.find(".control-view-top-right").children().last();
            }
            else {
                // Im Table-Design werden die Controls nicht oben rechts gerendert, sondern im Werkzeug-Fenster
                // ToDo: hier ist das table-tools-menu aber noch tnicht geladen!!!!!

            }
        },

        addRowBR: function (id) {
            this.$el.find(".control-view-bottom-right").append("<div class='row controls-row-right' id='" + id + "'></div>");
            return this.$el.find(".control-view-bottom-right").children().last();
        },

        addRowBL: function (id) {
            this.$el.find(".control-view-bottom-left").append("<div class='row controls-row-left' id='" + id + "'></div>");
            return this.$el.find(".control-view-bottom-left").children().last();
        }
    });

    return ControlsView;
});
