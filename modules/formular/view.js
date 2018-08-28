define(function (require) {
    var Grenznachweismodel = require("modules/formular/grenznachweis"),
        Grenznachweistemplate = require("text!modules/formular/grenznachweis.html"),
        Grenznachweiscss = require("text!modules/formular/grenznachweis.css"),
        $ = require("jquery"),
        FormularView;

    FormularView = Backbone.View.extend({
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
        initialize: function (attr) {
            this.model = new Grenznachweismodel(attr);
            this.template = _.template(Grenznachweistemplate);
            $("head").prepend("<style>" + Grenznachweiscss + "</style>");
            this.listenTo(this.model, {
                "change:isCollapsed render invalid change:isCurrentWin": this.render
            });
            Radio.trigger("Autostart", "initializedModul", "formular");
        },
        id: "formularWin",
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.model.prepWindow();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else if (this.model.get("isCurrentWin") === false) {
                this.model.resetWindow();
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

    return FormularView;
});
