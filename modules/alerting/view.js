import AlertingTemplate from "text-loader!./template.html";
import "bootstrap/js/alert";

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
            "alert:remove": this.remove
        }, this);
        this.listenTo(this.model, {
            "addMessage": this.addMessage,
            "change:position": this.positionAlerts
        }, this);

        $("body").prepend(this.$el);
    },
    id: "messages",
    className: "top-center",
    /**
     * @member AlertingTemplate
     * @description Template used to create the alert message
     * @memberof Alerting
     */
    template: _.template(AlertingTemplate),

    /**
     * Renders the data to DOM.
     * @return {AlertingView} returns this
     */
    render: function () {
        const attr = this.model.toJSON();

        this.$el.append(this.template(attr));
        if (attr.fadeOut) {
            this.$el.find(".alert").last().fadeOut(attr.fadeOut, function () {
                $(this).remove();
            });
        }

        return this;
    },

    /**
     * Called when new messages have to be added
     * @param {string} message message to add
     * @returns {void}
     */
    addMessage: function (message) {
        if (!this.checkDuplicates(message)) {
            this.render();
        }
    },

    /**
     * Checks if text has already been popped up.
     * @param   {string} text text to check
     * @returns {Boolean} isDuplicate
     */
    checkDuplicates: function (text) {
        let isDuplicate = false;

        _.each(this.el.getElementsByTagName("p"), function (p) {
            if (p.textContent.trim() === text.trim()) {
                isDuplicate = true;
            }
        }, this);

        return isDuplicate;
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
     * @param {String} id Id of alert to remove
     * @returns {void}
     */
    remove: function (id) {
        if (id) {
            this.$el.find("#" + id).remove();
        }
        else {
            this.$el.find(".alert").remove();
        }
    }
});

export default AlertingView;
