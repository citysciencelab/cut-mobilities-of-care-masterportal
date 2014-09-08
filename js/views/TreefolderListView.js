define([
    'jquery',
    'underscore',
    'backbone',
    'collections/TreefolderList',
    'views/TreeFolderView',
    'views/WMSLayerView',
    'eventbus',
    'bootstrap'
], function ($, _, Backbone, TreefolderList, TreeFolderView, WMSLayerView) {

    var TreeFolderListView = Backbone.View.extend({
        collection: TreefolderList,
        el: '#tree',
        initialize: function () {
            this.listenTo(this.collection, 'change:isChecked', this.render);
            this.listenTo(this.collection, 'change:isExpanded', this.render);
            this.render();
        },
        render: function () {
            this.$el.html('');
            this.collection.forEach(this.addTreeFolder, this);
        },
        addTreeFolder: function (treeFolder) {
            var treefold = new TreeFolderView({model: treeFolder});
            this.$el.append(treefold.el);
            _.each(treefold.model.get('WMSLayerList'), function (element) {
                var wmsLayerView = new WMSLayerView({model: element});
                _.each(wmsLayerView.model.get('kategorieOpendata'), function (element) {
                    if(treeFolder.get('name') === element) {
                        // NOTE hier gehts weiter
                        $('.' + element).append(wmsLayerView.render().el);
                    }
                    });
//                $('.' + wmsLayerView.model.get('treeFolder')).append(wmsLayerView.render().el);
            });
        }
    });

    return TreeFolderListView;
});
