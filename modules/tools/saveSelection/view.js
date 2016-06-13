define([
    "backbone",
    "text!modules/tools/saveSelection/template.html",
    "text!modules/tools/saveSelection/templateSimpleMap.html",
    "modules/tools/saveSelection/model"
], function (Backbone, SaveSelectionTemplate, SaveSelectionSimpleMapTemplate, SaveSelection) {

    var SaveSelectionView = Backbone.View.extend({
        model: new SaveSelection(),
        className: "win-body",
        template: _.template(SaveSelectionTemplate),
        templateSimpleMap: _.template(SaveSelectionSimpleMapTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                if (this.model.getSimpleMap() === true) {
                    $(".win-heading").after(this.$el.html(this.templateSimpleMap(attr)));
                }
                else {
                    $(".win-heading").after(this.$el.html(this.template(attr)));
                }
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        }
    });

    return SaveSelectionView;
});
