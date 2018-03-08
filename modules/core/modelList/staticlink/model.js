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
            onClickTrigger: [{
                event: "",
                channel: "",
                data: ""
            }],
            inSubMenue: false
        },
        triggerRadioEvent: function () {
            _.each(this.getOnClickTrigger(), function (trigger) {
                this.triggerEvent(trigger);
            }, this);
        },
        triggerEvent: function (triggerParams) {
            data = triggerParams.data;

            if (triggerParams.event === "" || triggerParams.channel === "") {
                return;
            }
            // ITGBM
            else if (triggerParams.data === "allFeatures") {
                var model = Radio.request("ModelList", "getModelByAttributes", {id: "10320"}),
                    featureList = [];

                var features = model.getLayerSource().getFeatures();
                _.each(features, function (feature) {
                    featureList.push(_.omit(feature.getProperties(), ["geometry", "geometry_EPSG_25832", "geometry_EPSG_4326"]));
                });
                Radio.trigger("RemoteInterface", "postMessage", {"featuresToAnalysis": JSON.stringify(featureList)});
            }
            else {
                Radio.trigger(triggerParams.channel, triggerParams.event, data);
            }
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
