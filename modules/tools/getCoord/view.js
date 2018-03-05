define(function (require) {

    var GetCoordTemplate = require("text!modules/tools/getCoord/template.html"),
        GetCoordModel = require("modules/tools/getCoord/model"),
        GetCoord;

    SearchByCoordView = Backbone.View.extend({
        model: new GetCoordModel(),
        className: "win-body",
        template: _.template(GetCoordTemplate),
        events: {
            "click .glyphicon-remove": "destroy"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render
            });
            this.listenTo(this.model, "change:coordinateGeo", this.render);
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
        }
    });

    return SearchByCoordView;
});
