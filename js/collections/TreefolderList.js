define([
    'underscore',
    'backbone',
    'models/TreeFolder',
    'collections/WMSLayerList',
    'config'
], function (_, Backbone, TreeFolder, WMSLayerList) {

    var TreefolderList = Backbone.Collection.extend({
        initialize: function () {
            var attr = _.uniq(WMSLayerList.pluck('treeFolder'));
            _.each(attr, this.addModel, this);
        },
        addModel: function (element) {
            var attr, treeFolder, bool, folderName;
            folderName = element;
            attr = WMSLayerList.where({treeFolder: folderName});
            bool = _.every(attr, function (element) {
                return element.get('visibility') === true;
            });
            treeFolder = new TreeFolder({
                'name': folderName,
                'isExpanded': false,
                'isChecked': bool,
                'WMSLayerList': attr
            });
            this.add(treeFolder);
        }
    });
    return new TreefolderList();
});