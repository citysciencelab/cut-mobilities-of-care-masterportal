define([
    "backbone",
    "text!modules/tools/draw/template.html",
    "text!modules/tools/draw/templatePoint.html",
    "text!modules/tools/draw/templateText.html",
    "text!modules/tools/draw/templateLine.html",
    "text!modules/tools/draw/templatePolygon.html",
    "text!modules/tools/draw/templateCircle.html",
    "modules/tools/draw/model"
], function (Backbone, DrawTemplate, PointTemplate, TextTemplate, LineTemplate, PolygonTemplate, CircleTemplate, DrawTool) {

    var DrawToolView = Backbone.View.extend({
        model: new DrawTool(),
        className: "win-body",
        template: _.template(DrawTemplate),
        templatePoint: _.template(PointTemplate),
        templateLine: _.template(LineTemplate),
        templatePolygon: _.template(PolygonTemplate),
        templateText: _.template(TextTemplate),
        templateCircle: _.template(CircleTemplate),
        events: {
            "change .interaction": "setInteraction",
            "change .drawFont": "setFont",
            "change .fontSize": "setFontSize",
            "change .drawColor": "setColor",
            "change .drawPointRadius": "setPointRadius",
            "change .drawStrokeWidth": "setStrokeWidth",
            "change .drawOpacity": "setOpacity",
            "click .delete": "deleteFeatures",
            "click .modify": "modifyFeatures",
            "click .trash": "toggleInteractions",
            "click .downloadDrawing": "downloadFeatures",
            "keyup .drawText": "setText"
        },
        initialize: function () {
            require(["modules/tools/download/view"], function (DownloadView) {
                new DownloadView();
            });
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
                this.model.setGlyphToCursor("glyphicon glyphicon-pencil");
                this.delegateEvents();
            }
            else {
                this.model.setGlyphToCursor("glyphicon glyphicon-pencil");
                this.undelegateEvents();
            }
            $("#map").removeClass("no-cursor");
            $("#map").removeClass("cursor-crosshair");
            $("#cursorGlyph").remove();
            $("#map").off("mousemove");
            this.renderForm();
        },

        renderForm: function () {
            var attr = this.model.toJSON(),
                selector = ".win-body > .form-horizontal.style";

            $(selector).empty();
            switch (this.model.get("selectedInteraction")){
                case "drawPoint": {
                    $(selector).append(this.templatePoint(attr));
                    break;
                }
                case "writeText": {
                    $(selector).append(this.templateText(attr));
                    break;
                }
                case "drawLine": {
                    $(selector).append(this.templateLine(attr));
                    break;
                }
                case "drawArea": {
                    $(selector).append(this.templatePolygon(attr));
                    break;
                }
                case "drawCircle": {
                    $(selector).append(this.templateCircle(attr));
                    break;
                }
                default: {
                    $(selector).append(this.templatePoint(attr));
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

        modifyFeatures: function () {
            $(".modify").toggleClass("btn-primary");

            if ($(".modify").hasClass("btn-primary") === true) {
                $(".win-body select").prop("disabled", true);
                $(".win-body input").prop("disabled", true);
                $(".downloadDrawing").prop("disabled", true);
                $(".trash").prop("disabled", true);
                $(".delete").prop("disabled", true);
            }
            else {
                $(".win-body select").prop("disabled", false);
                $(".win-body input").prop("disabled", false);
                $(".downloadDrawing").prop("disabled", false);
                $(".trash").prop("disabled", false);
                $(".delete").prop("disabled", false);
            }
            this.model.modifyFeatures();
        },

        toggleInteractions: function () {
            $(".trash").toggleClass("btn-primary");

            if ($(".trash").hasClass("btn-primary") === true) {
                $(".win-body select").prop("disabled", true);
                $(".win-body input").prop("disabled", true);
                $(".downloadDrawing").prop("disabled", true);
                $(".modify").prop("disabled", true);
                $(".delete").prop("disabled", true);
            }
            else {
                $(".win-body select").prop("disabled", false);
                $(".win-body input").prop("disabled", false);
                $(".downloadDrawing").prop("disabled", false);
                $(".modify").prop("disabled", false);
                $(".delete").prop("disabled", false);
            }

            this.model.toggleInteractions();
        },

        downloadFeatures: function () {
            this.model.downloadFeatures();
        }
    });

    return DrawToolView;
});
