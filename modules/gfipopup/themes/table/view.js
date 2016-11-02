define(function (require) {

    var Backbone = require("backbone"),
        GFITableTemplate = require("text!modules/gfipopup/themes/table/template.html"),
        GFITableModel = require("modules/gfipopup/themes/table/model"),
        GFITableView;

    GFITableView = Backbone.View.extend({
        tagName: "table",
        className: "table table-striped table-condensed table-gfi",
        template: _.template(GFITableTemplate),
        initialize: function (layer) {
            this.model = new GFITableModel(layer);

            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        }
    });

    return GFITableView;
});
