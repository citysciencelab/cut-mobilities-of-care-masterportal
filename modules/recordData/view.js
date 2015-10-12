define([
    "backbone",
    "text!modules/recordData/template.html",
    "modules/recordData/model"
], function (Backbone, RecordDataTemplate, RecordData) {

    var RecordDataView = Backbone.View.extend({
        model: RecordData,
        className: "win-body",
        template: _.template(RecordDataTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:activeButton": this.render
            });
        },
        events: {
            "click .record-button": "setButtonActive"
        },

        //
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

        // Ruft im Model die Methode "setActive" auf um den entsprechenden Button/Interaction zu aktivieren.
        setButtonActive: function (evt) {
            this.model.setActive($(evt.currentTarget).attr("id"));
        }
    });

    return RecordDataView;
});
