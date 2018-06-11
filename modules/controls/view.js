define([
    "backbone",
    "backbone.radio",
    "jquery"
], function (Backbone, Radio, $) {

    var ControlsView = Backbone.View.extend({
        className: "controls-view",
        initialize: function () {
            var channel = Radio.channel("ControlsView");

            channel.reply({
                "addRowTR": this.addRowTR,
                "addRowBR": this.addRowBR,
                "addRowBL": this.addRowBL
            }, this);

            this.render();

            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            $("#map .ol-overlaycontainer-stopevent").append(this.$el);
            this.renderSubViews();
        },

        renderSubViews: function () {
            this.$el.append("<div class='control-view-top-right'></div>");
            this.$el.append("<div class='control-view-bottom-right'></div>");
            this.$el.append("<div class='control-view-bottom-left'></div>");
        },

        addRowTR: function (id, showMobile) {
            if (showMobile === true) {
                this.$el.find(".control-view-top-right").append("<div class='row controls-row-right' id='" + id + "'></div>");
            }
            else {
                this.$el.find(".control-view-top-right").append("<div class='row controls-row-right hidden-xs' id='" + id + "'></div>");
                /*if ($("control-view-top-right").hasClass('.full-screen-buttom')) {
                    $(this).parent().addClass(".full-screen-buttom");
                }
                else {
                    this.$el.find(".control-view-top-right").append("<div class='row controls-row-right hidden-xs' id='" + id + "'></div>");
                }
                $(".control-view-top-right").next().hasClass(".full-screen-button").prepend( "<div class='fa fa-plus'></div>" );
            */}
            return this.$el.find(".control-view-top-right").children().last();
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
