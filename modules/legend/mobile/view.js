import LegendTemplate from "text-loader!./template.html";
import ContentTemplate from "text-loader!../content.html";
/**
 * @member LegendTemplate
 * @description Template of mobile legend
 * @memberof Legend.Mobile
 */
/**
 * @member ContentTemplate
 * @description Template of legend content identical for mobile and desktop view
 * @see Legend.ContentTemplate
 * @memberOf Legend.Mobile
 */
const MobileLegendView = Backbone.View.extend(/** @lends MobileLegendView.prototype */{
    events: {
        "click .glyphicon-remove": "hide"
    },
    /**
     * @class MobileLegendView
     * @extends Backbone.View
     * @memberof Legend.Mobile
     * @constructs
     * @listens Legend#hide
     * @listens Legend#changeLegendParams
     * @listens Legend#changeParamsStyleWMSArray
     * @listens Legend#changeIsActive
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:legendParams": this.paramsChanged,
            "change:paramsStyleWMSArray": this.paramsChanged,
            "change:isActive": function (model, value) {
                if (value) {
                    this.show();
                }
                else {
                    this.hide();
                }
            }
        });
    },
    id: "base-modal-legend",
    className: "modal bs-example-modal-sm legend fade in",
    template: _.template(LegendTemplate),
    contentTemplate: _.template(ContentTemplate),
    /**
    * todo
    * @returns {Legend.Mobile.MobileLegendView} returns this
    */
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },
    /**
     * Reacts on change of legend params and rebuilds legend
     * @returns {void}
     */
    paramsChanged: function () {
        var legendParams = this.model.get("legendParams");

        // Filtern von this.unset("legendParams")
        if (!_.isUndefined(legendParams) && legendParams.length > 0) {
            this.addContentHTML(legendParams);
            this.render();
        }
    },
    /**
     * Adds the rendered HTML to the legend definition, is needed in the template
     * @param {Object[]} legendParams Legend objects via reference
     * @returns {void}
     */
    addContentHTML: function (legendParams) {
        _.each(legendParams, function (legendDefinition) {
            _.each(legendDefinition.legend, function (legend) {
                legend.html = this.contentTemplate(legend);
            }, this);
        }, this);
    },
    /**
    * todo
    * @returns {void}
    */
    show: function () {
        if (this.$("body").find(".legend-win").length === 0) {
            this.render();
        }
        this.model.setLayerList();
        this.$el.modal("show");
    },
    /**
    * todo
    * @returns {void}
    */
    hide: function () {
        this.$el.modal("hide");
        this.model.setIsActive(false);
    },
    /**
    * todo
    * @returns {void}
    */
    removeView: function () {
        this.$el.modal("hide");
        this.remove();
    }
});

export default MobileLegendView;
