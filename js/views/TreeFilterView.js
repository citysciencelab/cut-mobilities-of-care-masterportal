define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/TreeFilter.html',
    'eventbus',
    'models/TreeFilter'
], function ($, _, Backbone, TreeFilterTemplate, EventBus, TreeFilter) {

    var TreeFilterView = Backbone.View.extend({
        model: TreeFilter,
        id: 'treeFilterWin',
        className: 'panel panel-master',
        template: _.template(TreeFilterTemplate),
        initialize: function () {
            this.render();
            this.model.on('change:filterHits change:treeCategory invalid', this.render, this);
            EventBus.on('toggleFilterTreeWin', this.toggleFilterTreeWin, this);
        },
        events: {
            'click .glyphicon-chevron-up, .glyphicon-chevron-down': 'toggleContent',
            'click .close': 'toggleFilterTreeWin',
            'change #treeCategory': 'setCategory',
            'click #filterbutton': 'setFilterParams',
            'click #filterRemoveButton': 'removeFilter'
//            'change #yearMin': 'render' // --> erst noch setzen
        },
        render: function () {
            var attr = this.model.toJSON();
             $('#toggleRow').append(this.$el.html(this.template(attr)));
        },
        toggleContent: function () {
            $('#treeFilterWin > .panel-body').toggle('slow');
            $('#treeFilterWin > .panel-heading > .toggleChevron').toggleClass('glyphicon-chevron-up glyphicon-chevron-down');
        },
        toggleFilterTreeWin: function () {
            $('#treeFilterWin').toggle();
        },
        setCategory: function () {
            this.model.setCategory();
        },
        removeFilter: function () {
            this.model.removeFilter();
        },
        setFilterParams: function () {
             this.model.setFilterParams();
        }
    });

    return TreeFilterView;
});
