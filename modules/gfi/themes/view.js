define([
    "backbone"
], function (Backbone) {

    var Backbone = require("backbone"),
        ThemeView;

    ThemeView = Backbone.View.extend({
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.appendTheme
            });

            this.render();
        },

        render: function () {console.log(this);
            if (_.isUndefined(this.model.get("gfiContent")) === false) {
                var attr = this.model.toJSON();

                this.$el.html(this.template(attr));
            }
        },

        appendTheme: function (model, value) {
            if (value === true) {
                $(".gfi-content").html(this.el);
                $(".gfi-title").text(this.model.get("name"));
            }
            this.appendChildren();
            this.appendRoutableButton();
        },

        /**
         * Alle Children werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
         * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
         * nicht im view ankommen.
         */
        appendChildren: function () {
            var children = this.model.get("children");

            _.each(children, function (element) {
                this.$el.after(element.val.$el);
            }, this);
        },
        /**
         * Fügt den Button dem gfiContent hinzu
         */
        appendRoutableButton: function () {
            if (this.model.get("routable") !== null) {
                var rb = this.model.get("routable");
                this.$el.after(rb.$el);
            }
        }
    });

    return ThemeView;
});
