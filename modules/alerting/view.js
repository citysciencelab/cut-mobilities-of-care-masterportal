import AlertingModel from "./model";
import AlertingTemplate from "text-loader!./template.html";
import "bootstrap/js/alert";
/**
 * @member AlertingTemplate
 * @description Template used to create the alert message
 * @memberof Alerting
 */
const AlertingView = Backbone.View.extend(/** @lends AlertingView.prototype */{
    events: {
        "click .close": "alertClosed",
        "click .alert-confirm": "alertConfirmed"
    },
    /**
     * @class AlertingView
     * @extends Backbone.View
     * @memberof Alerting
     * @constructs
     * @fires Alerting#RadioTriggerAlertClosed
     * @fires Alerting#RadioTriggerAlertConfirmed
     * @listens Alerting#render
     * @listens Alerting#changePosition
     * @listens Alerting#RadioTriggerAlertAlertRemove
     */
    initialize: function () {
        this.listenTo(this.model.get("channel"), {
            "alert:remove": this.removeAll
        }, this);
        this.listenTo(this.model, {
            "render": this.render,
            "change:position": this.positionAlerts
        }, this);

        $("body").prepend(this.$el);
    },
    id: "messages",
    className: "top-center",
    model: new AlertingModel(),
    template: _.template(AlertingTemplate),
    /**
     * Renders the data to DOM.
     * @return {AlertingView} returns this
     */
    render: function () {
        var attr = this.model.toJSON();

        this.$el.append(this.template(attr));
        if (_.has(attr, "animation") && attr.animation !== false) {
            this.$el.find(".alert").last().fadeOut(attr.animation, function () {
                $(this).remove();
            });
        }
        return this;
    },

    /**
     * Reacts to click on dismiss button.
     * @param {Event} evt Click event on dismissable alert
     * @fires AlertingView#RadioTriggerAlertClosed
     * @return {void}
     */
    alertClosed: function (evt) {
        var div = $(evt.currentTarget).parent(),
            isDismissable = div.length > 0 ? $(div[0]).hasClass("alert-dismissable") : false;

        if (isDismissable === true) {
            Radio.trigger("Alert", "closed", $(div[0]).attr("id"));
        }

    },

    /**
     * Reacts to click on confirm button.
     * @param {Event} evt Click event on confirmable alert
     * @fires AlertingView#RadioTriggerAlertConfirmed
     * @return {void}
     */
    alertConfirmed: function (evt) {
        var div = $(evt.currentTarget).parent();

        Radio.trigger("Alert", "confirmed", $(div[0]).attr("id"));
        this.model.setIsConfirmable(false);
    },

    /**
     * Sets position of alert via css-classes.
     * @param  {Backbone.Model} model - this.model
     * @param  {String} value - this.model.get("position")
     * @returns {void}
     */
    positionAlerts: function (model, value) {
        var currentClassName = this.$el.attr("class");

        this.$el.removeClass(currentClassName);
        this.$el.addClass(value);
    },

    /**
     * Removes all alerts
     * @returns {void}
     */
    removeAll: function () {
        this.$el.find(".alert").remove();
    }
});

export default AlertingView;
