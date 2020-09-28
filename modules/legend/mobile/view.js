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
 * @memberof Legend.Mobile
 */
const MobileLegendView = Backbone.View.extend(/** @lends MobileLegendView.prototype */{
    events: {
        "click .glyphicon-remove": "hide",
        "click #collapseAll-btn": "toggleCollapsePanels"
    },
    /**
     * @class MobileLegendView
     * @extends Backbone.View
     * @memberof Legend.Mobile
     * @constructs
     * @listens Legend#hide
     * @listens Legend#changeLegendParams
     * @listens Legend#changeParamsStyleWMSArray
     * @listens Tool#changeIsActive
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
        const attr = this.model.toJSON();

        $("#masterportal-container").append(this.$el.html(this.template(attr)));
        return this;
    },
    /**
     * Reacts on change of legend params and rebuilds legend
     * @returns {void}
     */
    paramsChanged: function () {
        const legendParams = this.model.get("legendParams");

        // Filtern von this.unset("legendParams")
        if (typeof legendParams !== "undefined" && legendParams.length > 0) {
            this.addContentHTML(legendParams);
            if (this.model.get("isActive")) {
                this.render();
            }
        }
    },
    /**
     * Adds the rendered HTML to the legend definition, is needed in the template
     * @param {Object[]} legendParams Legend objects via reference
     * @returns {void}
     */
    addContentHTML: function (legendParams) {
        legendParams.forEach(legendDefinition => {
            if (legendDefinition.legend) {
                legendDefinition.legend.forEach(legend => {
                    legend.html = this.contentTemplate(legend);
                });
            }
        });
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
    },
    /**
     * collapse or folds out all legend panels
     * toogles the icon of the collapse-all button
     * @param {object} evt trigger event
     * @returns {void}
    */
    toggleCollapsePanels: function (evt) {
        const panels = this.$(".panel-collapse");

        if (evt.target.classList.contains("fold-in")) {
            evt.target.title = this.model.get("foldOutAllText");
            panels.each((i, panel) => {
                $(panel).collapse("hide");
            });
        }
        else {
            evt.target.title = this.model.get("collapseAllText");
            panels.each((i, panel) => {
                $(panel).collapse("show");
            });
        }

        $("#collapseAll-btn").toggleClass("glyphicon-arrow-down glyphicon-arrow-up");
        $("#collapseAll-btn").toggleClass("fold-in fold-out");
    }
});

export default MobileLegendView;
