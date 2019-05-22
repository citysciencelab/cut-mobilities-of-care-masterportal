import Template from "text-loader!./templateMenu.html";

/**
 * @member Template
 * @description Template used to create the Folder View Menu
 * @memberof Menu.Desktop.Folder
 */

const FolderViewMenu = Backbone.View.extend(/** @lends FolderViewMenu.prototype */{
    /**
     * @class FolderViewMenu
     * @extends Backbone.View
     * @memberof Menu.Desktop.Folder
     * @constructs
     * @listens Map#RadioTriggerMapChange
     * @listens Util#RadioTriggerUtilIsViewMobileChanged
     * @fires Map#RadioRequestMapGetMapMode
     */
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "change": this.toggleDisplayByMapMode
        });
        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": function () {
                this.toggleDisplayByMapMode(Radio.request("Map", "getMapMode"));
            }
        });
        this.render();
    },
    tagName: "li",
    className: "dropdown dropdown-folder",
    template: _.template(Template),

    /**
     * Renders the data to DOM.
     * @return {void}
     */
    render: function () {
        var attr = this.model.toJSON();

        $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        return this;
    },

    /**
     * adds only layers to the tree that support the current mode of the map
     * e.g. 2D, 3D
     * @param {String} mapMode - current mode from map
     * @returns {void}
     */
    toggleDisplayByMapMode: function (mapMode) {
        var obliqueModeBlacklist = this.model.get("obliqueModeBlacklist"),
            modelId = this.model.get("id");

        if (mapMode === "Oblique" && _.contains(obliqueModeBlacklist, modelId)) {
            this.$el.hide();
        }
        else {
            this.$el.show();
        }
    }
});

export default FolderViewMenu;
