define(function (require) {

    var Model = require("modules/model"),
        Template = require("text!template.html"),
        ;

     = Backbone.View.extend({
        model: new Model(),
        template: _.template(Template),
        initialize: function () {

        },
        render: function () {
            var attr = this.model.toJSON();
        }
    });
    return ;
});
