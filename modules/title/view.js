define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Template = require("text!modules/title/template.html"),
        Model = require("modules/title/model"),
        TitleView;

     TitleView = Backbone.View.extend({
        className: "visible-lg-block portal-title",
        id: "portalTitle",
        model: Model,
        template: _.template(Template),
        initialize: function () {
            this.listenTo(Radio.channel("Title"), {
                "setSize": function () {
                    this.setSize();
                }
            });

            $(window).on("resize", this.setSize);

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": function () {
                    this.render();
                }
            });

            this.render();
            this.setSize();
        },

        setSize: function () {
            var rootWidth = $("#root").width(),
                searchbarWidth = $("#searchbar").width() + 20, //20 searchbar padding
                width = $("#navbarRow").width() - rootWidth - searchbarWidth - 140; // 35px toleranz wegen padding und margin von #root, #searchbar , .navbar-collapse und #portalTitle

            $("#portalTitle").width(width);
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".navbar-collapse").append(this.$el);
        }
    });

    return TitleView;
});
