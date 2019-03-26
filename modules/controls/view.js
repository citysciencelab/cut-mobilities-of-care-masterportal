const ControlsView = Backbone.View.extend(/** @lends ControlsView.prototype */{
    className: "controls-view",
    /**
     * @class ControlsView
     * @extends Backbone.View
     * @memberof Controls
     * @constructs
     * @description This view component manages the placements of the controls.
     * It gets triggered by the app.js for the controls to be placed
     * @listens ControlsView#RadioRequestControlsViewAddRowTr
     * @listens ControlsView#RadioRequestControlsViewAddRowBr
     * @listens ControlsView#RadioRequestControlsViewAddRowBl
     */
    initialize: function () {
        var channel = Radio.channel("ControlsView");

        channel.reply({
            "addRowTR": this.addRowTR,
            "addRowBR": this.addRowBR,
            "addRowBL": this.addRowBL
        }, this);

        this.render();

        this.$el.on({
            click: function (e) {
                e.stopPropagation();
            }
        });
    },
    /**
     * Renders the controls and its subview
     * @returns {ControlsView} - Itself
     */
    render: function () {
        $("#map .ol-overlaycontainer-stopevent").append(this.$el);
        this.renderSubViews();

        return this;
    },

    /**
     * Renders container for top-right, bottom-right and bottom-left
     * @returns {void}
     */
    renderSubViews: function () {
        this.$el.append("<div class='control-view-top-right'></div>");
        this.$el.append("<div class='control-view-bottom-right'></div>");
        this.$el.append("<div class='control-view-bottom-left'></div>");
    },

    /**
     * Adds an div-container to the top-right container and places the id of the control to be rendered.
     * @param {String} id Id of control
     * @param {Boolean} showMobile Flag if control should also be shown in mobile mode
     * @returns {object} - JQueryObject of the generated element
     */
    addRowTR: function (id, showMobile) {
        if (showMobile === true) {
            this.$el.find(".control-view-top-right").append("<div class='row controls-row-right' id='" + id + "'></div>");
        }
        else {
            this.$el.find(".control-view-top-right").append("<div class='row controls-row-right hidden-xs' id='" + id + "'></div>");
        }
        return this.$el.find(".control-view-top-right").children().last();
    },

    /**
     * Adds an div-container to the bottom-right container and places the id of the control to be rendered.
     * @param {String} id Id of control
     * @param {Boolean} showMobile Flag if control should also be shown in mobile mode
     * @returns {object} - JQueryObject of the generated element
     */
    addRowBR: function (id, showMobile) {
        if (showMobile === true) {
            this.$el.find(".control-view-bottom-right").append("<div class='row controls-row-right' id='" + id + "'></div>");
        }
        else {
            this.$el.find(".control-view-bottom-right").append("<div class='row controls-row-right hidden-xs' id='" + id + "'></div>");
        }

        return this.$el.find(".control-view-bottom-right").children().last();
    },

    /**
     * Adds an div-container to the bottom-left container and places the id of the control to be rendered.
     * @param {String} id Id of control
     * @returns {object} - JQueryObject of the generated element
     */
    addRowBL: function (id) {
        this.$el.find(".control-view-bottom-left").append("<div class='row controls-row-left' id='" + id + "'></div>");
        return this.$el.find(".control-view-bottom-left").children().last();
    }
});

export default ControlsView;
