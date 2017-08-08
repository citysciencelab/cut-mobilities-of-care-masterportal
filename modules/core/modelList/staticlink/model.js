define(function (require) {

    var Item = require("modules/core/modelList/item"),
        Radio = require("backbone.radio"),
        StaticLink;

    StaticLink = Item.extend({
        defaults: {
            // welcher Node-Type - folder/layer/item/staticLink
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Name (Überschrift) der Funktion
            name: "",
            // URL des Links
            url: "",
            // Trigger Event
            onClickTrigger: {
                event: "",
                channel: "",
                data: ""
            },
            inSubMenue: false
        },

        initialize: function () {
        },
        trigger: function () {
            var onClickTrigger = this.getOnClickTrigger(),
                data = onClickTrigger.data;

            if (onClickTrigger.event === "" || onClickTrigger.channel === "") {
                return;
            }
            Radio.trigger(onClickTrigger.channel, onClickTrigger.event, data);
        },
        // getter for onClickTrigger
        getOnClickTrigger: function () {
            return this.get("onClickTrigger");
        },
        // setter for onClickTrigger
        setOnClickTrigger: function (value) {
            this.set("onClickTrigger", value);
        },
        getViewElementClasses: function () {
            var classes = "dropdown";

             if (this.get("parentId") === "root") {
                classes += " menu-style hidden-sm";
            }
            else {
                classes += " submenu-style";
            }
            return classes;
        }

    });

    return StaticLink;
});
