define(function (require) {

    var Model = require("modules/tools/addPointsFromFile/model"),
        Template = require("text!modules/tools/addPointsFromFile/template.html"),
        AddPointsFromFileView;

    AddPointsFromFileView = Backbone.View.extend({
        model: new Model(),
        template: _.template(Template),
        className: "add-points-from-file",
        events: {
            "click .einlesen" : "readFile"
        },
        initialize: function () {
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(".lgv-container").append(this.$el);
        },
        readFile: function (evt) {
            this.model.readFile(evt);
        }
    });
    return AddPointsFromFileView;
});
