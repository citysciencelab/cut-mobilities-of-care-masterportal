define([
    'underscore',
    'backbone'
], function (_, Backbone) {

    var TreeFolder = Backbone.Model.extend({
        defaultStatus: {
            name: '',
            isExpanded: '',
            isChecked: ''
        },
        setVisibility: function () {
            this.set('isChecked', true);
        },
        setVisibility2: function () {
            this.set('isChecked', false);
        },
        setExpand: function () {
            this.set('isExpanded', true);
        },
        setExpand2: function () {
            this.set('isExpanded', false);
        }
    });

    return TreeFolder;
});