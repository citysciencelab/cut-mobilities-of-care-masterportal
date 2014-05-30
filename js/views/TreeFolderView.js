define([
    'jquery',
    'underscore',
    'backbone',
    'views/WMSLayerView',
    'text!templates/TreeFolder.html',
    'models/TreeFolder',
    'eventbus',
    'bootstrap'
], function ($, _, Backbone, WMSLayerView, TreeFolderTemplate, TreeFolder, EventBus) {

    var TreeFolderView = Backbone.View.extend({
        model: TreeFolder,
        template: _.template(TreeFolderTemplate),
        initialize: function () {
            this.render();
        },
        events: {
            'click span.glyphicon-check': 'uncheckAll',
            'click span.glyphicon-unchecked': 'checkAll',
            'click span.glyphicon-chevron-right': 'expanded',
            'click span.glyphicon-chevron-down': 'unexpanded',
        },
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        },
        checkAll: function (evt) {
            this.model.setVisibility();
            $(evt.target).toggleClass('glyphicon-check glyphicon-unchecked');
        },
        uncheckAll: function (evt) {
            this.model.setVisibility2();
            $(evt.target).toggleClass('glyphicon-check glyphicon-unchecked');
        },
        expanded: function (evt) {
            this.model.setExpand();
            $(evt.target).toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
        },
        unexpanded: function (evt) {
            this.model.setExpand2();
            $(evt.target).toggleClass('glyphicon-chevron-right glyphicon-chevron-down');
        }
    });

    return TreeFolderView;
});