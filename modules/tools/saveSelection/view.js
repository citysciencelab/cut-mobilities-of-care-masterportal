define([
    "backbone",
    "text!modules/tools/saveSelection/template.html",
    "modules/tools/saveSelection/model"
], function (Backbone, SaveSelectionTemplate, SaveSelection) {

    var SaveSelectionView = Backbone.View.extend({
        model: new SaveSelection(),
        className: "win-body",
        template: _.template(SaveSelectionTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render
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
        }
    });

    return SaveSelectionView;
});
