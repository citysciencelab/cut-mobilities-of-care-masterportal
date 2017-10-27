define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Config = require("config"),
        ThemeView;

    ThemeView = Backbone.View.extend({
        defaults: {
            gfiWindow: "detached"
        },
        initialize: function () {
            var gfiWindow = _.has(Config, "gfiWindow") ? Config.gfiWindow : "detached";

            this.listenTo(this.model, {
                 "change:isVisible": this.appendTheme
            });

            this.gfiWindow = gfiWindow;
            this.render();
        },

        render: function () {
            if (_.isUndefined(this.model.get("gfiContent")) === false) {
                var attr = this.model.toJSON();

                this.$el.html(this.template(attr));
            }
        },

        appendTheme: function (model, value) {
            var isViewMobile = Radio.request("Util", "isViewMobile"),
                currentView = Radio.request("GFI", "getCurrentView"),
                oldGfiWidth = currentView.$el.width(),
                oldLeft = parseInt(currentView.$el.css("left").slice(0, -2), 10);

            if (value === true) {

                if (_.isNaN(oldLeft)) {
                    oldLeft = 0;
                }
                currentView.$el.css("left", "0px");

                currentView.$el.find(".gfi-content").html(this.el);
                currentView.$el.find(".gfi-title").text(this.model.get("name"));
                this.appendChildren();
                this.appendRoutableButton();

                if (this.gfiWindow === "detached" && !isViewMobile) {
                    this.adjustGfiWindow(currentView, oldGfiWidth, oldLeft);
                }
            }
            this.delegateEvents();
        },
        adjustGfiWindow: function (currentView, oldGfiWidth, oldLeft) {
            var newGfiWidth,
                newLeft;

            newGfiWidth = currentView.$el.width();
            newLeft = $(".lgv-container").width() - newGfiWidth - 40;

            // initial left of gfi. can never be 0 after drag, due to render-function in desktop/detached/view
            if (oldLeft === 0) {
                currentView.$el.css("left", newLeft + "px");
            }
            else if (newGfiWidth > oldGfiWidth) {

                if (oldLeft > newLeft) {
                    currentView.$el.css("left", newLeft + "px");
                }
                else {
                    currentView.$el.css("left", oldLeft + "px");
                }
            }
            else {
                currentView.$el.css("left", oldLeft + "px");
            }
        },
        /**
         * Alle Children werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
         * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
         * nicht im view ankommen.
         */
        appendChildren: function () {
            var children = this.model.get("children");

            $(".gfi-content").removeClass("has-image");
            _.each(children, function (element) {
                if (element.type && element.type === "image") {
                    this.$el.before(element.val.$el);
                    $(".gfi-content").addClass("has-image");
                }
                else {
                    this.$el.after(element.val.$el);
                }
            }, this);
        },
        /**
         * Fügt den Button dem gfiContent hinzu
         */
        appendRoutableButton: function () {
            if (this.model.get("routable") !== undefined) {
                var rb = this.model.get("routable");

                this.$el.after(rb.$el);
            }
        }
    });

    return ThemeView;
});
