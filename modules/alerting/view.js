/**
 * @memberof Alerting
 * @event AlertingModel#"change:position"
 */
/**
 * @memberof Alerting
 * @event AlertingModel#"render"
 */
/**
 * @memberof Alerting
 * @event AlertingModel#"removeAll"
 */
/**
 * @memberof Alerting
 * @event RadioChannel("Alert")#"closed"
 */
/**
 * @memberof Alerting
 * @event RadioChannel("Alert")#"confirmed"
 */

import AlertingModel from "./model";
import AlertingTemplate from "text-loader!./template.html";
import "bootstrap/js/alert";

const AlertingView = Backbone.View.extend({
    events: {
        "click .close": "alertClosed",
        "click .alert-confirm": "alertConfirmed"
    },
    /**
     * Initialize function for view
     * @memberof Alerting
     * @listens AlertingModel, "render"
     * @listens AlertingModel, "removeAll"
     * @listens AlertingModel, "change:position"
     * @return {void}
     */
    initialize: function () {
        this.listenTo(this.model, {
            "render": this.render,
            "removeAll": this.removeAll,
            "change:position": this.positionAlerts
        }, this);

        $("body").prepend(this.$el);
    },
    id: "messages",
    className: "top-center",
    model: new AlertingModel(),
    template: _.template(AlertingTemplate),
    /**
     * Renders the data to DOM
     * @memberof Alerting
     * @return {object} returns this
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
     * Reacts to click on dismiss button
     * @memberof Alerting
     * @param {Event} evt Click event on dismissable alert
     * @fires Radio,trigger("Alert", "closed")
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
     * Reacts to click on confirm button
     * @memberof Alerting
     * @param {Event} evt Click event on confirmable alert
     * @fires Radio.trigger("Alert", "confirmed")
     * @return {void}
     */
    alertConfirmed: function (evt) {
        var div = $(evt.currentTarget).parent();

        Radio.trigger("Alert", "confirmed", $(div[0]).attr("id"));
        this.model.setIsConfirmable(false);
    },

    /**
     * Positioniert der Alerts über css-Klassen
     * @memberof Alerting
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
     * Entfernt alle Meldungen
     * @memberof Alerting
     * @returns {void}
     */
    removeAll: function () {
        this.$el.find(".alert").remove();
    }
});

export default AlertingView;
