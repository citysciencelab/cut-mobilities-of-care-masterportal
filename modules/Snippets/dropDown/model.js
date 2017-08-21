define(function () {

    var DropdownModel = Backbone.Model.extend({
        defaults: {

        },

        initialize: function () {

        },

        /**
         * set the dropdown value(s)
         * @param  {string[]} value
         */
        setValues: function (value) {
            this.set("values", value);
        },

        /**
         * get the dropdown value(s)
         * @return {string[]}
         */
        getValues: function () {
            return this.get("values");
        }
    });

    return DropdownModel;
});
