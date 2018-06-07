define([
    "backbone",
    "text!modules/menu/table/categories/templates/templateSingleCategory.html",
    "jquery"
], function (Backbone, Template, $) {

    var CategoryView = Backbone.View.extend({
        tagName: "li",
        className: "category-list category-group-item",
        template: _.template(Template),
        events: {
            "click .icon-checkbox, .icon-checkbox2, .title": "toggleIsSelected"
            // "click .icon-info": "showLayerInformation"
        },
        initialize: function () {
            this.$el.on({
                click: function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            this.$el.html(this.template());
            this.$el.append(this.template());
        }
    });

    return CategoryView;
});
