define(function (require) {

var Sidebar,
    Radio = require("backbone.radio");

    Sidebar = Backbone.Model.extend({
        defaults: {
            isOpen: false
        },
        initialize: function () {
            var channel = Radio.channel("Sidebar");

            channel.on({
                "toggle": this.setIsOpen
            }, this);
        },
        // getter for isOpen
        getisOpen: function () {
            return isOpen;
        },
        // setter for isOpen
        setIsOpen: function (value) {
            this.set("isOpen", value);

            Radio.trigger("Map", "updateSize");
        }
    });

    return Sidebar;
});
