import Grenznachweistemplate from "text-loader!./grenznachweis.html";
import Grenznachweiscss from "text-loader!./grenznachweis.less";

const FormularView = Backbone.View.extend({
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
    initialize: function () {
        if (this.model.get("modelname") === "grenznachweis") {
            this.template = _.template(Grenznachweistemplate);
            $("head").prepend("<style>" + Grenznachweiscss + "</style>");
        }
        this.listenTo(this.model, {
            "change:isActive render invalid": this.render
        });
    },
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
    // anonymisierte Events
    keyup: function (evt) {
        if (evt.target.id) {
            this.model.keyup(evt);
        }
    },
    click: function (evt) {
        if (evt.target.id) {
            this.model.click(evt);
        }
    },
    focusout: function (evt) {
        if (evt.target.id) {
            this.model.focusout(evt);
        }
    }
});

export default FormularView;
