define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Menubar.html',
    'views/TreefolderListView',
    'models/Menubar'
], function ($, _, Backbone, MenubarTemplate, TreefolderListView, Menubar) {

    var MenubarView = Backbone.View.extend({
        model: Menubar,
        tagName: 'nav',
        className: 'navbar navbar-default navbar-fixed-top',
        attributes: {"role": "navigation"},
        template: _.template(MenubarTemplate),
        initialize: function () {
            this.render();
            $('#tree').on({
                "click": function (e) {
                    e.stopPropagation();
                }
            });
        },
        render: function () {
            var attr = this.model.toJSON();
            $('body').append(this.$el.append(this.template(attr)));
            new TreefolderListView();
        }
    });

    return MenubarView;

});