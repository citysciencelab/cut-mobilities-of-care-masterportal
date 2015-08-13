define([
    "backbone",
    "text!modules/draw/template.html",
    "modules/draw/model"
], function (Backbone, DrawTemplate, Draw) {

    var DrawView = Backbone.View.extend({
        model: Draw,
        className: "win-body",
        template: _.template(DrawTemplate),
        events: {
            "change .drawType": "setType",
            "change .drawColor": "setColor",
            "change .drawPointRadius": "setPointRadius",
            "change .drawStrokeWidth": "setStrokeWidth",
            "click button": "deleteFeatures"
        },
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this);
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

        setType: function (evt) {
            this.model.setType(evt.target.value);
            this.render();
        },

        setColor: function (evt) {
            this.model.setColor(evt.target.value);
        },

        setPointRadius: function (evt) {
            this.model.setPointRadius(evt.target.value);
        },

        setStrokeWidth: function (evt) {
            this.model.setStrokeWidth(evt.target.value);
        },

        deleteFeatures: function () {
            this.model.deleteFeatures();
        }
    });

    return DrawView;
});
