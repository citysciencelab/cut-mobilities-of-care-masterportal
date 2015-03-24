define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Menubar.html',
    'views/LayerListView',
    'models/Menubar',
    'config',
    'eventbus'
], function ($, _, Backbone, MenubarTemplate, LayerListView, Menubar, Config, EventBus) {

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
        events: {
            'click .filterTree': 'activateFilterTree',
            'click .filterWfsFeature': 'activateWfsFilter',
            'click .legend': 'activateLegend',
            'click .routingModul': 'activateRoutingModul'
        },
        render: function () {
            var attr = this.model.toJSON();
            $('body').append(this.$el.append(this.template(attr)));
            if(Config.isMenubarVisible === false) {
                $('#navbarRow').css('display', 'none');
            }
            if (_.has(Config, "tree") === true) {
                require(["views/TreeListView", "views/TreeSelectionView"], function (TreeListView, TreeSelectionView) {
                    new TreeSelectionView();
                    new TreeListView();
                });
            } else {
                new LayerListView();
            }
            // new OpenDataTreeList();
        },
        activateFilterTree: function () {
            EventBus.trigger('toggleWin', ['treefilter', 'Filtereinstellungen', 'glyphicon-filter']);
        },
        activateWfsFilter: function () {
            EventBus.trigger('toggleFilterWfsWin');
        },
        activateLegend: function () {
            EventBus.trigger('toggleLegendWin');
        },
        activateRoutingModul: function () {
//            EventBus.trigger('toggleRoutingWin');
            EventBus.trigger('toggleWin', ['routing', 'Routenplaner', 'glyphicon-road']);
        }
    });

    return MenubarView;

});
