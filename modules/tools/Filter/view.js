define(function (require) {

    var FilterModel = require("modules/tools/filter/model"),
        FilterView;

    FilterView = Backbone.View.extend({
        className: "test",
        initialize: function () {
            this.render();

            this.model = new FilterModel();
        },
        render: function () {
            $(".sidebar").append(this.$el);
        }
    });

    return FilterView;
});
