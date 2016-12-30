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

        render: function () {console.log("render");console.log(this.model.get("gfiContent"));
            if (_.isUndefined(this.model.get("gfiContent")) === false) {
                var attr = this.model.toJSON();
console.log(attr);
                this.$el.html(this.template(attr));
                this.appendChildren();
                this.appendRoutableButton();
            }
        },

        appendTheme: function (model, value) {
            if (value === true) {
                $(".gfi-content").html(this.el);
                $(".gfi-title").text(this.model.get("name"));
            }
        },

        /**
         *
         */
        destroy: function () {
            this.unbind();
            this.model.destroy();
        },
        /**
         * Alle Children werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
         * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
         * nicht im view ankommen.
         */
        appendChildren: function () {
            var children = this.model.get("children");

            _.each(children, function (element) {
                this.$el.append(element.val.$el);
            }, this);
        },
        /**
         * Fügt den Button dem gfiContent hinzu
         */
        appendRoutableButton: function () {
            if (this.model.get("routable") !== null) {
                var rb = this.model.get("routable");
                this.$el.append(rb.$el);
            }
        }
    });

    return ThemeView;
});
