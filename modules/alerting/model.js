const AlertingModel = Backbone.Model.extend(
    /** @lends AlertingModel.prototype */
    {
        defaults: {
            category: "alert-info",
            isDismissable: true,
            isConfirmable: false,
            position: "top-center",
            message: "",
            animation: false
        },
        /**
         * @class AlertingModel
         * @extends Backbone.Model
         * @memberof Alerting
         * @constructs
         * @property {String} category="alert-info" Category of alert. bootstrap css class
         * @property {Boolean} isDismissable=true Flag if alert has a dismissable button
         * @property {Boolean} isConfirmable=false Flag if alert has to be confirmed to close
         * @property {String} position="top-center" The positioning of the alert. Possible values "top-center", "center-center"
         * @property {String} message="" The message of the alert
         * @property {Boolean} animation=false Flag if Alert is animated by means of fading out
         * @fires AlertingModel#removeAll
         * @fires AlertingModel#render
         * @listens AlertingModel#RadioTriggerAlertAlert
         * @listens AlertingModel#RadioTriggerAlertAlertRemove
         */
        initialize: function () {
            var channel = Radio.channel("Alert");

            this.listenTo(channel, {
                "alert": this.setParams,
                "alert:remove": function () {
                    this.trigger("removeAll");
                }
            }, this);
        },
        /**
         * Sets given parameters on model. Then fires {@link AlertingModel#event:render}
         * @param {String|Object} val Value string or object with information about the alert
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
                if (_.has(val, "animation")) {
                    this.setAnimation(val.animation);
                }
                if (!_.has(val, "animation")) {
                    this.setAnimation(false);
                }
            }
            this.trigger("render");
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
         * Setter for animation
         * @param {Boolean/Number} value False if no animation is wanted. Number for fade-out in millis
         * @returns {void}
         */
        setAnimation: function (value) {
            this.set("animation", value);
        }
    });

export default AlertingModel;
