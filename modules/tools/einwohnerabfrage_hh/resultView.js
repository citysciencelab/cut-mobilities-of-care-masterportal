define(function (require) {

    var Backbone = require("backbone"),
        ResultTemplate = require("text!modules/tools/einwohnerabfrage_hh/resultTemplate.html"),
        ResultView;

    ResultView = Backbone.View.extend({
        model: {},
        template: _.template(ResultTemplate),
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        }
    });

    return ResultView;
});
