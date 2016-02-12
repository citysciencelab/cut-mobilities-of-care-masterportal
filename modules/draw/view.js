define([
    "backbone",
    "text!modules/draw/template.html",
    "text!modules/draw/templatePoint.html",
    "text!modules/draw/templateText.html",
    "text!modules/draw/templateLine.html",
    "text!modules/draw/templatePolygon.html",
    "modules/draw/model"
], function (Backbone, DrawTemplate, PointTemplate, TextTemplate, LineTemplate, PolygonTemplate, DrawTool) {

    var DrawToolView = Backbone.View.extend({
        model: new DrawTool(),
        className: "win-body",
        template: _.template(DrawTemplate),
        templatePoint: _.template(PointTemplate),
        templateLine: _.template(LineTemplate),
        templatePolygon: _.template(PolygonTemplate),
        templateText: _.template(TextTemplate),
        events: {
            "change .interaction": "setInteraction",
            "change .drawFont": "setFont",
            "change .fontSize": "setFontSize",
            "change .drawColor": "setColor",
            "change .drawPointRadius": "setPointRadius",
            "change .drawStrokeWidth": "setStrokeWidth",
            "change .drawOpacity": "setOpacity",
            "click button.delete": "deleteFeatures",
            "click button.download": "downloadFeatures",
            "keyup .drawText": "setText"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:selectedInteraction": this.renderForm
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
            this.renderForm();
        },

        renderForm: function () {
            var attr = this.model.toJSON();

            $(".win-body > .form-horizontal").empty();
            switch (this.model.get("selectedInteraction")){
                case "drawPoint": {
                    $(".win-body > .form-horizontal").append(this.templatePoint(attr));
                    break;
                }
                case "writeText": {
                    $(".win-body > .form-horizontal").append(this.templateText(attr));
                    break;
                }
                case "drawLine": {
                    $(".win-body > .form-horizontal").append(this.templateLine(attr));
                    break;
                }
                case "drawArea": {
                    $(".win-body > .form-horizontal").append(this.templatePolygon(attr));
                    break;
                }
                default: {
                    $(".win-body > .form-horizontal").append(this.templatePoint(attr));
                }
            }
        },

        setInteraction: function (evt) {
            this.model.setInteraction(evt.target.value);
        },

        setFont: function (evt) {
            this.model.setFont(evt.target.value);
        },

        setText: function (evt) {
            this.model.setText(evt.target.value);
        },

        setFontSize: function (evt) {
            this.model.setFontSize(evt.target.value);
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
        downloadFeatures: function () {
            this.model.downloadFeatures();
        }
    });

    return DrawToolView;
});
