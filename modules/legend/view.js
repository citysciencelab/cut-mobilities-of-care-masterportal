define([
    "backbone",
    "text!modules/legend/template.html",
    "text!modules/legend/templateMobile.html",
    "modules/legend/model",
    "eventbus",
    "backbone.radio",
    "jqueryui/widgets/draggable"
], function (Backbone, LegendTemplate, LegendTemplateMobile, Legend, EventBus, Radio) {

    var LegendView = Backbone.View.extend({
        model: Legend,
        // className: "legend-win",
        template: _.template(LegendTemplate),
        templateMobile: _.template(LegendTemplateMobile),
        events: {
            "click .glyphicon-remove": "toggle"
        },
        initialize: function () {
            $(window).resize(function () {
                if ($(".legend-win-content").height() !== null) {
                    $(".legend-win-content").css("max-height", ($(window).height() * 0.7));
                }
            });

            this.listenTo(this.model, {
                "change:legendParams": this.render
            });

            this.listenTo(EventBus, {
                "toggleLegendWin": this.toggle
            });

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.render
            });

            this.render();
        },

        render: function () {
            var isViewMobile = Radio.request("Util", "isViewMobile"),
                attr = this.model.toJSON();

            if (isViewMobile === true) {
                this.$el.attr("id", "base-modal-legend");
                this.$el.attr("class", "modal bs-example-modal-sm legend fade in");
                this.$el.html(this.templateMobile(attr));
            }
            else {
                this.$el.attr("id", "");
                this.$el.attr("class", "legend-win");
                this.$el.html(this.template(attr));
                $("body").append(this.$el.html(this.template(attr)));
                $(".legend-win-content").css("max-height", ($(window).height() * 0.7));
                this.$el.draggable({
                    containment: "#map",
                    handle: ".legend-win-header"
                });
                // this.$el.show();
            }

        },

        toggle: function () {
            var isViewMobile = Radio.request("Util", "isViewMobile"),
                legendModel = Radio.request("ModelList", "getModelByAttributes", {id: "legend"});

            this.model.setLayerList(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}));
            if (isViewMobile === true) {
                this.$el.modal({
                    backdrop: true,
                    show: true
                });
            }
            else {
                this.$el.toggle();
            }

            if (this.$el.css("display") === "block") {
                legendModel.setIsActive(true);
            }
            else {
                legendModel.setIsActive(false);
            }
        }
    });

    return LegendView;
});
