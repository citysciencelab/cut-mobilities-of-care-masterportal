define(function (require) {
    var Template = require("text!modules/layerinformation/template.html"),
        ContentTemplate = require("text!modules/legend/content.html"),
        $ = require("jquery"),
        LayerInformationView;

    require("jqueryui/widgets/draggable");
    require("bootstrap/tab");

    LayerInformationView = Backbone.View.extend({
        events: {
            "click .glyphicon-remove": "hide"
        },
        initialize: function () {
            this.listenTo(this.model, {
                // model.fetch() feuert das Event sync, sobald der Request erfoglreich war
                "sync": this.render,
                "removeView": this.remove
            });
        },
        id: "layerinformation-desktop",
        className: "layerinformation",
        template: _.template(Template),
        contentTemplate: _.template(ContentTemplate),
        render: function () {
            var attr = this.model.toJSON();

            this.addContentHTML();
            $("#map").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".header"
            });
            this.$el.show();
            return this;
        },

        /**
         * Fügt den Legendendefinitionen das gerenderte HTML hinzu.
         * Dieses wird im template benötigt.
         * @returns {void}
         */
        addContentHTML: function () {
            var legends = this.model.get("legend");

            _.each(legends.legend, function (legend) {
                legend.html = this.contentTemplate(legend);
            }, this);
        },

        hide: function () {
            Radio.trigger("Layer", "setLayerInfoChecked", false);
            this.$el.hide();
            this.model.setIsVisible(false);
        }
    });

    return LayerInformationView;
});
