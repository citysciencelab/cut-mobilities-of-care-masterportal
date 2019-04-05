import LegendTemplate from "text-loader!./template.html";
import ContentTemplate from "text-loader!../content.html";
/**
 * @member LegendTemplate
 * @description Template of desktop legend
 * @memberof Legend.Desktop
 */
/**
 * @member ContentTemplate
 * @description Template of legend content identical for mobile and desktop view
 * @see Legend.ContentTemplate
 * @memberOf Legend.Desktop
 */
const LegendView = Backbone.View.extend(/** @lends LegendView.prototype */{
    events: {
        "click .glyphicon-remove": "hide"
    },
    /**
     * @class LegendView
     * @extends Backbone.View
     * @memberof Legend.Desktop
     * @constructs
     * @listens Legend#hide
     * @listens Legend#changeLegendParams
     * @listens Legend#changeParamsStyleWMSArray
     * @listens Legend#changeIsActive
     * @listens Map#RadioTriggerMapUpdateSize
     */
    initialize: function () {
        $(window).resize(function () {
            if ($(".legend-win-content").height() !== null) {
                $(".legend-win-content").css("max-height", $(window).height() * 0.7);
            }
        });

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

        this.listenTo(Radio.channel("Map"), {
            "updateSize": this.updateLegendSize
        });
        if (this.model.get("isActive") === true) {
            this.show();
        }
    },
    className: "legend-win",
    template: _.template(LegendTemplate),
    contentTemplate: _.template(ContentTemplate),
    /**
    * todo
    * @returns {Legend.Desktop.LegendView} returns this
    */
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $("body").append(this.$el.html(this.template(attr)));
        $(".legend-win-content").css("max-height", $(".lgv-container").height() * 0.7);
        this.$el.draggable({
            containment: "#map",
            handle: ".legend-win-header"
        });
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
            Radio.trigger("Layer", "updateLayerInfo", this.model.get("paramsStyleWMS").styleWMSName);
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
        if ($("body").find(".legend-win").length === 0) {
            this.render();
        }
        this.model.setLayerList();
        this.$el.show();
    },
    /**
    * todo
    * @returns {void}
    */
    hide: function () {
        this.$el.hide();
        this.model.setIsActive(false);
    },
    /**
    * todo
    * @returns {void}
    */
    removeView: function () {
        this.$el.hide();
        this.remove();
    },
    /**
    * Fits the legend height according to the class lgv-container
    * currently this function is executed when map sends updateSize
    * @returns {void}
    */
    updateLegendSize: function () {
        $(".legend-win-content").css("max-height", $(".lgv-container").height() * 0.7);
    }
});

export default LegendView;
