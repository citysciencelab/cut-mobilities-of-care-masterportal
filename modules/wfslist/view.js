define([
    "backbone",
    "eventbus",
    "text!modules/wfslist/template.html",
    "modules/wfsList/model"
], function (Backbone, EventBus, Template, Model) {

    var WFSListView = Backbone.View.extend({
        model: Model,
        className: "wfslist-win",
        template: _.template(Template),
        events: {
            "click .glyphicon-remove": "toggle",
            "click .navbar-nav": "switchActiveTab",
            "click .wfslist-themes-li": "newTheme"
        },
        switchActiveTab: function (evt) {
            // Setzte/entferne active
            _.each(evt.currentTarget.children, function (child) {
                if (child.id === evt.target.parentElement.id) {
                    $(child).addClass("active");
                }
                else {
                    $(child).removeClass("active");
                }
            });
            // Schalte DIV ein/aus
            $("#wfslist-themes").hide();

            switch (evt.target.parentElement.id) {
                case "wfslistThemeChooser": {
                    $("#wfslist-themes").show();
                }
                case "wfslistFeaturelist": {
                    console.log("1");
                }
                case "wfslistFeaturedetails": {
                    console.log("2");
                }
            }
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:layerlist": this.updateVisibleLayer
            });
            this.render();
            this.toggle();
        },
        updateVisibleLayer: function (layerlist) {
            var ll = this.model.get("layerlist");

            $("#wfslist-themes-ul").clear();
            _.each(ll, function (layer) {
                $("#wfslist-themes-ul").append("<li id='<%= layer.id %>' class='wfslist-themes-li' role='presentation'><a href='#'>" + layer.name + "</a></li>");
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
        },
        toggle: function () {
            this.$el.toggle();
        }
    });

    return new WFSListView;
});
