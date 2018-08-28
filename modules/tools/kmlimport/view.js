define(function (require) {
    var ImportTemplate = require("text!modules/tools/kmlimport/template.html"),
        ImportTool = require("modules/tools/kmlimport/model"),
        $ = require("jquery"),
        ImportView;

    ImportView = Backbone.View.extend({
        className: "win-body",
        template: _.template(ImportTemplate),
        events: {
            "click .import": "importKML",
            "change .file": "setText"
        },
        initialize: function (attr) {
            this.model = new ImportTool(attr);
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render
            });
        },

        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
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
