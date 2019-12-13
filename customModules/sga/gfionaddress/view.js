import GfiOnAddressTemplate from "text-loader!./template.html";
import GfiOnAddressModel from "./model";

const GfiOnAddressView = Backbone.View.extend({
    events: {
        "click .address": "addressClicked"
    },
    initialize: function () {
        var lgvContainer = $.find(".lgv-container")[0];

        this.listenTo(this.model, {
            "render": this.render,
            "close": this.close
        }, this);

        $(lgvContainer).append(this.$el);
    },
    id: "gfi-on-address",
    className: "top-center",
    model: new GfiOnAddressModel(),
    template: _.template(GfiOnAddressTemplate),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html("");
        this.$el.append(this.template(attr));
        return this;
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

export default GfiOnAddressView;
