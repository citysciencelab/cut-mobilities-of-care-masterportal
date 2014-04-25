define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Menubar.html',
    'views/WMSLayerListView',
    'collections/WMSLayerList',
    'views/ToolsView',
    'models/Tools',
    'bootstrap'
], function ($, _, Backbone, MenubarTemplate, WMSLayerListView, WMSLayerList, ToolsView, Tools) {

    var MenubarView = Backbone.View.extend({
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
            new WMSLayerListView({collection: WMSLayerList});
            new ToolsView({model: Tools});
        }
    });

    return MenubarView;
});