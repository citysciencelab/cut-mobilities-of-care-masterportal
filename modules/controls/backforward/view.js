import BackForwardTemplate from "text-loader!./template.html";
import BackForwardModel from "./model";
/**
 * @member BackForwardTemplate
 * @description Template used for backward and forward functionality
 * @memberof Controls.BackForward
 */
const BackForwardView = Backbone.View.extend(/** @lends BackForwardView.prototype */{
    events: {
        "click .forward": "setNextView",
        "click .backward": "setLastView"
    },
    /**
     * @class BackForwardView
     * @memberof Controls.BackForward
     * @extends Backbone.View
     * @constructs
     * @fires Map#RadioTriggerMapRegisterListenerMovenend
     * @fires MapView#RadioRequestMapViewGetOptions
     * @fires MapView#RadioRequestMapViewGetCenter
     * @fires MapView#RadioTriggerMapViewSetScale
     * @fires MapView#RadioTriggerMapViewSetCenter
     */
    initialize: function () {
        var channel = Radio.channel("BackForwardView");

        this.model = new BackForwardModel();

        channel.reply({
            "getView": this
        }, this);

        Radio.trigger("Map", "registerListener", "moveend", this.updatePermalink.bind(this));
        this.render();
    },
    template: _.template(BackForwardTemplate),
    id: "backforward",
    /**
     * Updates the permanent link in the map when backward or forward button is clicked.
     * @fires MapView#RadioRequestMapViewGetOptions
     * @fires MapView#RadioRequestMapViewGetCenter
     * @returns {void}
     */
    updatePermalink: function () {
        var forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            centerScales = this.model.get("CenterScales"),
            currentPos = this.model.get("currentPos"),
            that = this,
            scale,
            center;

        if (centerScales.length === 0) {
            $(backButton).css("pointer-events", "none");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                centerScales.push([center, scale]);
            }, 100);
            this.model.setCenterScales(centerScales);
        }
        else if (centerScales.length > 0 && this.model.get("wentFor") === false) {
            $(backButton).css("pointer-events", "auto");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                if (currentPos < centerScales.length - 1) {
                    centerScales.splice(currentPos + 1);
                    that.model.setCurrentPos(currentPos);
                }
                else if (centerScales.length === 10) {
                    centerScales.shift(centerScales[0]);
                    that.model.setCurrentPos(currentPos - 1);
                }
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                centerScales.push([center, scale]);
                that.model.setCurrentPos(that.model.get("currentPos") + 1);
            }, 100);
            this.model.setCenterScales(centerScales);
        }
        this.model.setWentFor(false);
    },
    /**
     * Render Function
     * @returns {BackForwardView} - Returns itself
     */
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    /**
     * Setter for nextview
     * @fires MapView#RadioTriggerMapViewSetScale
     * @fires MapView#RadioTriggerMapViewSetCenter
     * @returns {void}
     */
    setNextView: function () {
        var forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            centerScales = this.model.get("CenterScales");

        this.model.setWentFor(true);
        $(backButton).css("pointer-events", "auto");
        this.model.setCurrentPos(this.model.get("currentPos") + 1);
        Radio.trigger("MapView", "setScale", centerScales[this.model.get("currentPos")][1]);
        Radio.trigger("MapView", "setCenter", centerScales[this.model.get("currentPos")][0]);
        if (this.model.get("currentPos") === centerScales.length - 1) {
            $(forButton).css("pointer-events", "none");
        }
    },
    /**
     * Setter for lastview
     * @fires MapView#RadioTriggerMapViewSetScale
     * @fires MapView#RadioTriggerMapViewSetCenter
     * @returns {void}
     */
    setLastView: function () {
        var backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            centerScales = this.model.get("CenterScales");

        this.model.setWentFor(true);
        $(forButton).css("pointer-events", "auto");
        this.model.setCurrentPos(this.model.get("currentPos") - 1);
        Radio.trigger("MapView", "setScale", centerScales[this.model.get("currentPos")][1]);
        Radio.trigger("MapView", "setCenter", centerScales[this.model.get("currentPos")][0]);
        if (this.model.get("currentPos") === 0) {
            $(backButton).css("pointer-events", "none");
        }
    }
});

export default BackForwardView;
