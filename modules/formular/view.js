import Grenznachweistemplate from "text-loader!./grenznachweis.html";
import Grenznachweiscss from "text-loader!./grenznachweis.less";
/**
 * @member GrenznachweisTemplate
 * @description Template used to create the formular for the Grenznachweis
 * @memberof Formular
 */
const GrenznachweisView = Backbone.View.extend(/** @lends GrenznachweisView.prototype */{
    events: {
        // anonymisierte Events
        "keyup input[type=text]": "keyup",
        "keyup textarea": "keyup",
        "click input[type=radio]": "click",
        "click input[type=checkbox]": "click",
        "click button": "click",
        "click a": "click",
        "focusout": "focusout"
    },
    /**
     * @class GrenznachweisView
     * @extends Backbone.View
     * @memberof Formular
     * @constructs
     * @fires Formular#RadioTriggerKeyUp
     * @fires Formular#RadioTriggerClick
     * @fires Formular#RadioTriggerFocusOut
     * @listens Formular#changeIsActive
     * @listens Formular#render
     * @listens Formular#invalid
     */
    initialize: function () {
        if (this.model.get("modelname") === "grenznachweis") {
            this.template = _.template(Grenznachweistemplate);
            $("head").prepend("<style>" + Grenznachweiscss + "</style>");
        }
        this.listenTo(this.model, {
            "change:isActive render invalid": this.render
        });
    },
    /**
     * Renders the formular
     * @param {GrenznachweisModel} model todo
     * @param {Boolean} value Empty the formular or render it
     * @return {GrenznachweisView} returns this
     */
    render: function (model, value) {
        if (value) {
            this.model.prepWindow();
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.$el.empty();
        }
        return this;
    },
    /**
     * With a keyup event on the formular this anonymized event is triggered
     * @param {Event} evt Keyup event on the formular
     * @return {void}
     */
    keyup: function (evt) {
        if (evt.target.id) {
            this.model.keyup(evt);
        }
    },
    /**
     * With a click event on the formular this anonymized event is triggered
     * @param {Event} evt Click event on the formular
     * @return {void}
     */
    click: function (evt) {
        if (evt.target.id) {
            this.model.click(evt);
        }
    },
    /**
     * With a focus out event on the formular this anonymized event is triggered
     * @param {Event} evt Focus out event on the formular
     * @return {void}
     */
    focusout: function (evt) {
        if (evt.target.id) {
            this.model.focusout(evt);
        }
    }
});

export default GrenznachweisView;
