define(function (require) {
    var TimesliderTemplate = require("text!modules/tools/timeslider/template.html"),
        $ = require("jquery"),
        TimesliderModel = require("modules/tools/timeslider/model"),
        TimesliderView;

    TimesliderView = Backbone.View.extend({
        events: {

        },
        initialize: function (attr) {
            var layerIds = _.has(attr, "layerIds") && _.isArray(attr.layerIds) ? attr.layerIds : null,
                title = _.has(attr, "title") ? attr.title : null,
                timeInterval = _.has(attr, "timeInterval") ? attr.timeInterval : null;

            if (!layerIds) {
                console.error("Timesliderkonfiguration unvollständig");
                return;
            }
            this.model = new TimesliderModel(layerIds, title, timeInterval);

            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render
            });
        },
        className: "win-body",
        template: _.template(TimesliderTemplate),

        render: function () {
            var attr;

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        }
    });

    return TimesliderView;
});
