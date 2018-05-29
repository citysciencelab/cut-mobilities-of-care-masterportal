define(function (require) {
    require("bootstrap/dropdown");

    var Backbone = require("backbone"),
        Template = require("text!idaModules/1_queries/use/template.html"),
        Model = require("idaModules/1_queries/use/model"),
        UseView;

    UseView = Backbone.View.extend({
        el: "#nutzung",
        className: "panel panel-default",
        template: _.template(Template),
        model: new Model(),
        events: {
            "click .btn": "checkNutzung"
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
            this.setActive(evt);
            this.model.setNutzung(evt.target.id);
            evt.stopPropagation();
        },
        setActive: function (evt) {
            var activeButton = $(evt.target),
                allButtonsArr = $(activeButton).closest(".btn-group").find(".btn");

            allButtonsArr.each(function () {
                $(this).removeClass("active");
            });
            $(activeButton).addClass("active");
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return UseView;
});
