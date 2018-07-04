define([
    "backbone",
    "text!modules/tools/kmlimport/template.html",
    "modules/tools/kmlimport/model"
], function (Backbone, ImportTemplate, ImportTool) {

    var ImportView = Backbone.View.extend({
        model: new ImportTool(),
        className: "win-body",
        template: _.template(ImportTemplate),
        events: {
            "click .import": "importKML",
            "change .file": "setText"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render
            });
        },

        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }

        },

        importKML: function () {
            this.model.importKML();
        },

        setText: function (evt) {
            var reader = null,
                file = evt.target.files[0],
                reader = new FileReader();

            $("#fakebutton").toggleClass("btn-primary");

            if ($("#fakebutton").hasClass("btn-primary") === true) {
                $("#btn_import").prop("disabled", false);
            }
            else {
                $("#btn_import").prop("disabled", true);
            }

            reader.onload = function () {
                var fakeBtnTxt = $("#kmlinput").val(),
                    test = fakeBtnTxt.slice(12);

                this.model.setText(reader.result);
                $("#fakebutton").html("Datei: " +
                test);
            }.bind(this);
            reader.readAsText(file);
        }
    });

    return ImportView;
});
