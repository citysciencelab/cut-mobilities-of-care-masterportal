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
     * Renders the footer to the ol-viewport and creates onClick-listeners for links that opens tools
     * @return {FooterView} returns this
     */
    render: function () {
        var attr = this.model.toJSON();

        attr.masterPortalVersionNumber = Radio.request("Util", "getMasterPortalVersionNumber");
        $(".ol-viewport").append(this.$el.html(this.template(attr)));
        const urls = this.model.get("urls");

        if (urls) {
            urls.forEach(function (url) {
                const toolModelId = url.toolModelId;

                if (toolModelId && toolModelId !== "") {
                    this.addOnClickListenerForTools(toolModelId, "-footerlink");
                    this.addOnClickListenerForTools(toolModelId, "-footerlink-mobile");
                }
            }, this);
        }
        return this;
    },
    /**
     * Creates onClick-listeners for links that opens tools.
     * @param {String} toolModelId the id of the model of the tool to be opened on click on footer-link
     * @param {String} linkIdAppendix "-footerlink" or "-footerlink-mobile"
     * @return {void}
     */
    addOnClickListenerForTools: function (toolModelId, linkIdAppendix) {
        $("#" + toolModelId + linkIdAppendix).click(function () {
            const model = Radio.request("ModelList", "getModelByAttributes", {id: toolModelId});

            model.set("isActive", !model.get("isActive"));
        });
    }
});

export default FooterView;
