define([
    "jquery",
    "backbone",
    "text!idaModules/1_queries/use/template.html",
    "idaModules/1_queries/use/model"
], function ($, Backbone, Template, Model) {
    "use strict";
    var UseView = Backbone.View.extend({
        el: "#nutzung",
        className: "panel panel-default",
        template: _.template(Template),
        model: Model,
        events: {
            "change #nutzungdropdown": "checkNutzung"
        },
        initialize: function () {
            this.listenTo(this.model, "change:header", this.setHeader);

            this.render();
        },
        setHeader: function () {
            var header = this.model.get("header");

            $("#useheaderSuffix").text(header);
        },
        checkNutzung: function (evt) {
            this.model.setNutzung(evt.target.value);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return UseView;
});
