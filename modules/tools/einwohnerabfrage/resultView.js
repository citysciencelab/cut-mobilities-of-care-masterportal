define(function (require) {

    var Backbone = require("backbone"),
        ResultTemplate = require("text!modules/tools/einwohnerabfrage/resultTemplate.html"),
        ResultView;

        ResultView = Backbone.View.extend({
        model: {},
        template: _.template(ResultTemplate),
        render: function () {
            var attr = this.model.toJSON();
console.log(attr);
            this.$el.html(this.template(attr));
            return this.$el;
        }
    });

    return ResultView;
});
