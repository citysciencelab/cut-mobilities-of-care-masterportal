import Template from "text-loader!./template.html";
import Footermodel from "./model";

/**
 * @member FooterTemplate
 * @description Template used to create the footer
 * @memberof Footer
 */
const FooterView = Backbone.View.extend(/** @lends FooterView.prototype */{
    /**
     * @class FooterView
     * @extends Backbone.View
     * @memberof Footer
     * @constructs
     * @param {Object} attr Attributes to be used for creating the footer
     */
    initialize: function (attr) {
        this.model = new Footermodel(attr);
        this.render();
    },
    template: _.template(Template),
    className: "footer",
    /**
     * Renders the footer to the ol-viewport
     * @return {FooterView} returns this
     */
    render: function () {
        var attr = this.model.toJSON();

        $(".ol-viewport").append(this.$el.html(this.template(attr)));
        return this;
    }
});

export default FooterView;
