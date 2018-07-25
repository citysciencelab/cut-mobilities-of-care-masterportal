define(function (require) {

    var Template = require("text!modules/title/template.html"),
        Model = require("modules/title/model"),
        $ = require("jquery"),
        TitleView;

    TitleView = Backbone.View.extend({
        className: "portal-title",
        id: "portalTitle",
        model: new Model(),
        template: _.template(Template),
        initialize: function () {
            this.listenTo(Radio.channel("Title"), {
                "setSize": function () {
                    this.setSize();
                }
            });

            window.addEventListener("resize", _.bind(this.setSize, this));

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": function () {
                    this.render();
                }
            });

            this.setSize();
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".nav-menu").after(this.$el);

            return this;
        },

        setSize: function () {
            var rootWidth,
                searchbarWidth,
                width;

            if (!_.isNull(document.getElementById("searchbar"))) {
                rootWidth = document.getElementById("root").offsetWidth;
                searchbarWidth = document.getElementById("searchbar").offsetWidth;
                width = document.getElementById("navbarRow").offsetWidth - rootWidth - searchbarWidth - 100; // 50px toleranz wegen padding und margin von #root, #searchbar , .navbar-collapse und #portalTitle

                this.$el.width(width);
                if (width > 100) {
                    this.render();
                }
                else {
                    this.$el.empty();
                }
            }
        }
    });

    return TitleView;
});
