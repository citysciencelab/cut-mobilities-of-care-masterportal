define([
    'underscore',
    'backbone',
    'eventbus'
], function (_, Backbone, EventBus) {

    var TreeFolder = Backbone.Model.extend({
        defaults: {
            name: '',
            isExpanded: '',
            isChecked: '',
            layerList: ''
        },
        initialize: function () {
            this.listenTo(this, 'change:isChecked', this.setVisibilityByFolder);
            this.listenTo(this, 'change:isExpanded', this.collapse);
            EventBus.on('checkVisibilityByFolder', this.checkVisibilityByFolder, this);
        },
        toggleVisibility: function (evt) {
            if (this.get('isChecked') === true) {
                this.set('isChecked', false);
            }
            else {
                this.set('isChecked', true);
            }
        },
        toggleExpanding: function () {
            if (this.get('isExpanded') === true) {
                this.set('isExpanded', false);
            }
            else {
                this.set('isExpanded', true);
            }
        },
        setVisibilityByFolder: function () {
            var bool = this.checkVisibilityLayerList();
            if (bool === true || this.get('isChecked') === true) {
                _.each(this.get('layerList'), function (element) {
                    element.set('visibility', this.get('isChecked'));
                }, this);
            }
        },
        checkVisibilityByFolder: function () {
            var bool = this.checkVisibilityLayerList();
            if (bool === true) {
                this.set('isChecked', true);
            }
            else {
                this.set('isChecked', false);
            }
        },
        checkVisibilityLayerList: function () {
            var bool = _.every(this.get('layerList'), function (element) {
                return element.get('visibility') === true;
            });
            return bool;
        },
        collapse: function () {
            if (this.get('isExpanded') === true) {
                $('.' + this.get('name')).collapse('show');
            }
            else {
                $('.' + this.get('name')).collapse('hide');
            }
        }
    });

    return TreeFolder;
});