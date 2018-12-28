/**
 * @namespace Alerting
 * @description Alerting system that responds to given events.
 * Used to have same alert all over the portal.
 */
/**
 * @memberof Alerting
 * @event RadioChannel("Alert")#"alert"
 */
/**
 * @memberof Alerting
 * @event RadioChannel("Alert")#"remove:alert"
 */
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
         * @class ClickCounterView
         * @extends Backbone.Model
         * @memberOf Alerting
         * @constructs
         * @property {String} category="alert-info" [description]
         * @property {Boolean} isDismissable=true [description]
         * @property {Boolean} isConfirmable=false [description]
         * @property {String} position="top-center" [description]
         * @property {String} message="" [description]
         * @property {Boolean} animation=false [description]
         * @listens Radio.channel("Alert", "alert")
         * @listens Radio.channel("Alert", "alert:remove")
         * @fires AlertingModel, "removeAll"
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
         * Wird ein String übergeben, handelt es sich dabei um die Alert Message
         * Ist es ein Objekt, werden die entsprechenden Attribute gesetzt
         * @param {String|Object} val Value string or object with information about the alert
         * @fires AlertingModel, "render"
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

        setId: function (value) {
            this.set("id", value);
        },

        setCategory: function (value) {
            this.set("category", value);
        },

        setIsDismissable: function (value) {
            this.set("isDismissable", value);
        },

        setIsConfirmable: function (value) {
            this.set("isConfirmable", value);
        },

        setMessage: function (value) {
            this.set("message", value);
        },

        setPosition: function (value) {
            this.set("position", value);
        },

        setAnimation: function (value) {
            this.set("animation", value);
        }
    });

export default AlertingModel;
