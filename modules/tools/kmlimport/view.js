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
            "click .filesearch": "searchFile",
            "keyup .filetext": "setText"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
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
            this.model.setText(evt.target.value);
        },
        searchFile: function () {
            console.log("searchFile");
        },
    });

    return ImportView;
});
