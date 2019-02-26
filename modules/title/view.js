import Template from "text-loader!./template.html";
import Model from "./model";

const TitleView = Backbone.View.extend({
    initialize: function () {
        this.model = new Model();

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
    className: "portal-title",
    id: "portalTitle",
    template: _.template(Template),
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

export default TitleView;
