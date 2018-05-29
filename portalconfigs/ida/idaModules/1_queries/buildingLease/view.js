define(function (require) {
    var Backbone = require("backbone"),
        Template = require("text!idaModules/1_queries/buildingLease/template.html"),
        Model = require("idaModules/1_queries/buildingLease/model"),
        LeaseView;

    LeaseView = Backbone.View.extend({
        el: "#erbbaurecht",
        className: "panel panel-default",
        template: _.template(Template),
        model: new Model(),
        events: {
            "click .btn": "checkErbbau"
        },
        initialize: function () {
            this.listenTo(this.model, "change:header", this.setHeader);

            this.render();
        },
        setHeader: function () {
            var header = this.model.get("header");

            $("#buildingLeaseHeaderSuffix").text(header);
        },
        checkErbbau: function (evt) {
            this.setActive(evt);
            this.model.setBuildingLease(evt.target.id, evt.target.textContent);
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

    return LeaseView;
});
