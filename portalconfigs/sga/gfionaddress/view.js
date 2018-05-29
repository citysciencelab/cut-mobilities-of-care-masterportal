define(function (require) {
    var Backbone = require("backbone"),
        GfiOnAddressModel = require("../gfionaddress/model"),
        GfiOnAddressTemplate = require("text!../../../gfionaddress/template.html"),
        GfiOnAddressView;

    GfiOnAddressView = Backbone.View.extend({
        id: "gfi-on-address",
        className: "top-center",
        model: new GfiOnAddressModel(),
        template: _.template(GfiOnAddressTemplate),
        initialize: function () {
            var lgvContainer = $.find(".lgv-container")[0];

            this.listenTo(this.model, {
                "render": this.render,
                "close": this.close
            }, this);

            $(lgvContainer).append(this.$el);
        },
        events: {
            "click .address": "addressClicked"
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html("");
            this.$el.append(this.template(attr));
        },
        close: function () {
            this.$el.html("");
        },
        addressClicked: function (evt) {
            var street = $(evt.currentTarget).attr("street"),
                hsnr = $(evt.currentTarget).attr("hsnr"),
                affix = $(evt.currentTarget).attr("affix");

            this.model.addressClicked(street, hsnr, affix);
        }
    });

    return GfiOnAddressView;
});
