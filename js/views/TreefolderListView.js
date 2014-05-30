define([
    'jquery',
    'underscore',
    'backbone',
    'collections/TreefolderList',
    'collections/LayerList',
    'views/TreeFolderView',
    'views/WMSLayerView',
    'bootstrap'
], function ($, _, Backbone, TreefolderList, LayerList, TreeFolderView, WMSLayerView) {

    var TreeFolderListView = Backbone.View.extend({
        collection: TreefolderList,
        el: '#tree',
        initialize: function () {
            this.render();
            this.listenTo(this.collection, 'change:isExpanded', this.test1);
            this.listenTo(this.collection, 'change:isChecked', this.test2);
        },
        render: function () {
            this.$el.html('');
            this.collection.forEach(this.addOne, this);
            LayerList.forEach(this.addlay, this);
        },
        addOne: function (treeFolder) {
            var treefold = new TreeFolderView({model: treeFolder});
            this.$el.append(treefold.el);
        },
        addlay: function (wmslayer) {
            var wmsLayerView = new WMSLayerView({model: wmslayer});
            $('.' + wmsLayerView.model.get('treeFolder')).append(wmsLayerView.render().el);
        },
        test1: function (test) {
            $('.' + test.get('name')).collapse('toggle');
        },
        test2: function (test) {
            LayerList.forEach(this.vis, test);
        },
        vis: function (test) {
            if (test.get('treeFolder') === this.get('name')) {
                if (this.get('isChecked') === true) {
                    test.set('visibility', true);
                }
                else {
                    test.set('visibility', false);
                }
            }
        }
    });

    return TreeFolderListView;
});