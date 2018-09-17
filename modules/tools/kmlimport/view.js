define(function (require) {
    var ImportTemplate = require("text!modules/tools/kmlimport/template.html"),
        ImportView;

    ImportView = Backbone.View.extend({
        template: _.template(ImportTemplate),
        events: {
            "click .import": "importKML",
            "change .file": "setText"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isActive": this.render
            });
            // Bestätige, dass das Modul geladen wurde
            Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
        },

        render: function (model, value) {
            if (value) {
                this.setElement(document.getElementsByClassName("win-body")[0]);
                this.$el.html(this.template(model.toJSON()));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },

        importKML: function () {
            this.model.importKML();
        },

        setText: function (evt) {
            var file = evt.target.files[0],
                reader = new FileReader();

            this.$("#fakebutton").toggleClass("btn-primary");

            if (this.$("#fakebutton").hasClass("btn-primary") === true) {
                this.$("#btn_import").prop("disabled", false);
            }
            else {
                this.$("#btn_import").prop("disabled", true);
            }

            reader.onload = function () {
                var fakeBtnTxt = this.$("#kmlinput").val(),
                    test = fakeBtnTxt.slice(12);

                this.model.setText(reader.result);
                this.$("#fakebutton").html("Datei: " +
                test);
            }.bind(this);
            reader.readAsText(file);
        }
    });

    return ImportView;
});
