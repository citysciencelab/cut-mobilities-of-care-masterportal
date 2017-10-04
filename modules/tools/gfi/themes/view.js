define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ThemeView;

    ThemeView = Backbone.View.extend({
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.appendTheme
            });

            this.render();
        },

        render: function () {
            if (_.isUndefined(this.model.get("gfiContent")) === false) {
                var attr = this.model.toJSON();

                this.$el.html(this.template(attr));
            }
        },

        appendTheme: function (model, value) {
            if (value === true) {
                Radio.request("GFI", "getCurrentView").$el.find(".gfi-content").html(this.el);
                Radio.request("GFI", "getCurrentView").$el.find(".gfi-title").text(this.model.get("name"));
                this.appendChildren();
                this.appendRoutableButton();
            }
            this.delegateEvents();
        },

        /**
         * Alle Children werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
         * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
         * nicht im view ankommen.
         */
        appendChildren: function () {
            var children = this.model.get("children");

            _.each(children, function (element) {
                if (element.type && element.type === "image") {
                    this.$el.before(element.val.$el);
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
