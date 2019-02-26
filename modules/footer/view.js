import Template from "text-loader!./template.html";
import Footermodel from "./model";


const FooterView = Backbone.View.extend({
    initialize: function (attr) {
        this.model = new Footermodel(attr);
        this.render();
    },
    template: _.template(Template),
    className: "footer",
    render: function () {
        var attr = this.model.toJSON();

        $(".ol-viewport").append(this.$el.html(this.template(attr)));
        return this;
    }
});

export default FooterView;
