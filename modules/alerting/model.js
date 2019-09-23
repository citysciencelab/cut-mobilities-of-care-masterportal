import AlertingView from "./view";

const AlertingModel = Backbone.Model.extend(/** @lends AlertingModel.prototype */{
    defaults: {
        channel: Radio.channel("Alert"),
        category: "alert-info",
        isDismissable: true,
        isConfirmable: false,
        position: "top-center",
        message: "",
        fadeOut: null
    },
    /**
     * @class AlertingModel
     * @extends Backbone.Model
     * @memberof Alerting
     * @constructs
     * @property {Radio.channel} channel=Radio.channel("Alert") Radio channel for communication
     * @property {String} [category="alert-info"] Category of alert. bootstrap css class
     * @property {Boolean} [isDismissable=true] Flag if alert has a dismissable button
     * @property {Boolean} [isConfirmable=false] Flag if alert has to be confirmed to close
     * @property {String} [position="top-center"] The positioning of the alert. Possible values "top-center", "center-center"
     * @property {Boolean} [fadeOut=null] Milliseconds before fading out alert
     * @property {String} message="" The message of the alert
     * @fires Alerting#render
     * @fires Alerting#changePosition
     * @listens Alerting#RadioTriggerAlertAlert
     */
    initialize: function () {
        this.setView(new AlertingView({model: this}));

        this.listenTo(this.get("channel"), {
            "alert": this.setParams
        }, this);
    },

    /**
     * Sets given parameters on model.
     * @param {String|Object} val Value string or object with information about the alert
     * @fires  AlertingModel#render
     * @returns {void}
     */
    setParams: function (val) {
        if (_.isString(val)) {
            this.setId(_.uniqueId());
            this.setMessage(val);
        }
        else if (_.isObject(val)) {
            this.setMessage(val.text);
            if (_.has(val, "id") === true) {
                this.setId(String(val.id));
            }
            else {
                this.setId(_.uniqueId());
            }
            if (_.has(val, "kategorie") === true) {
                this.setCategory(val.kategorie);
            }
            if (_.has(val, "dismissable") === true) {
                this.setIsDismissable(val.dismissable);
            }
            if (_.has(val, "confirmable") === true) {
                this.setIsConfirmable(val.confirmable);
            }
            if (_.has(val, "position") === true) {
                this.setPosition(val.position);
            }
            if (_.has(val, "fadeOut") === true) {
                this.setFadeOut(val.fadeOut);
            }
        }
        if (_.isString(this.get("message"))) {
            this.trigger("addMessage", this.get("message"));
        }
    },

    /**
     * Setter for id
     * @param {String} value Id
     * @returns {void}
     */
    setId: function (value) {
        this.set("id", value);
    },
    /**
     * Setter for category
     * @param {String} value category
     * @returns {void}
     */
    setCategory: function (value) {
        this.set("category", value);
    },

    /**
     * Setter for isDismissable
     * @param {Boolean} value Flag if alert is dismissable
     * @returns {void}
     */
    setIsDismissable: function (value) {
        this.set("isDismissable", value);
    },

    /**
     * Setter for isConfirmable
     * @param {Boolean} value Flag if alert is confirmable
     * @returns {void}
     */
    setIsConfirmable: function (value) {
        this.set("isConfirmable", value);
    },

    /**
     * Setter for message
     * @param {String} value Message to be shown
     * @returns {void}
     */
    setMessage: function (value) {
        this.set("message", value);
    },

    /**
     * Setter for position
     * @param {String} value Positioning of alert
     * @returns {void}
     */
    setPosition: function (value) {
        this.set("position", value);
    },

    /**
     * Setter for fadeOut
     * @param {Number} fadeOut null if no fadeOut is wanted. Number for fade-out in millis
     * @returns {void}
     */
    setFadeOut: function (fadeOut) {
        this.set("fadeOut", fadeOut);
    },

    /**
     * Sets the view to this model
     * @param {Backbone.View} val this view
     * @returns {void}
     */
    setView: function (val) {
        this.set("view", val);
    }
});

export default AlertingModel;
