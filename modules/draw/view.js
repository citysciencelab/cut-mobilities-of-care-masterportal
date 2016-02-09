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
            "change .drawOpacity": "setOpacity",
            "click button.delete": "deleteFeatures",
            "click button.download": "getKML"
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

        setOpacity: function (evt) {
            this.model.setOpacity(evt.target.value);
        },

        deleteFeatures: function () {
            this.model.deleteFeatures();
        },
        getKML: function () {
            this.model.getKML();
        }
    });

    return DrawView;
});
