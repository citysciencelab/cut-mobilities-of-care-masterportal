define([
    "backbone",
    "text!modules/wfs_t/template.html",
    "modules/wfs_t/model"
], function (Backbone, WFS_TTemplate, WFS_T) {

    var WFS_TView = Backbone.View.extend({
        model: WFS_T,
        className: "win-body",
        template: _.template(WFS_TTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:activeButton": this.render,
                "change:showAttrTable": this.render
            });
        },
        events: {
            "click .record-button": "setButtonActive",
            "keyup input": "setFeatureAttributions"
        },

        //
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },

        // Ruft im Model die Methode "setActive" auf um den entsprechenden Button/Interaction zu aktivieren.
        setButtonActive: function (evt) {
            this.model.setActive($(evt.currentTarget).attr("id"));
        },

        // Ruft im Model die Methode "setFeatureAttributions" auf um die Attribute für das Feature zu übernehmen.
        setFeatureAttributions: function (evt) {
            this.model.setFeatureAttributions(evt.target.id, evt.target.value);
        }
    });

    return WFS_TView;
});
