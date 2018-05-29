define([
    "backbone",
    "backbone.radio",
    "modules/controls/backforward/model",
    "text!modules/controls/backforward/template.html"
], function(Backbone, Radio, BackForwardModel, BackForwardTemplate) {
    BackForwardView = Backbone.View.extend({
        model: BackForwardModel,
        template: BackForwardTemplate,
        id: "backforwardview",
        events: {
            "click .forward": "setNextView",
            "click .backward": "setLastView"
        },
        initialize: function() {
            var channel = Radio.channel("BackForwardView");
            channel.on({
                "setUpdate": this.setUpdate
            }, this);
            channel.reply({
                "isUpdate": this.isUpdate
            }, this);

            Radio.trigger("Map", "registerListener", "moveend", this.updatePermalink);
            window.addEventListener('popstate', function(ev) {
                if (ev.state === null) {
                    return;
                }
                Radio.trigger("MapView", "setCenter", ev.state.center, event.state.zoom);
                Radio.trigger("BackForwardView", "setUpdate", false);
                //set new view
            });

            this.model = new BackForwardModel();
            this.render();
        },
        setUpdate: function(bool) {
            this.model.setUpdate(bool);
        },
        isUpdate: function() {
            return this.model.isUpdate();
        },
        updatePermalink: function(evt) {
            if (!Radio.request("BackForwardView", "isUpdate")) {
                // do not update the URL when the view was changed in the 'popstate' handler
                Radio.trigger("BackForwardView", "setUpdate", true);
                return;
            }
            this.model.pushState(evt.map.getView());
        },
        render: function() {
            var icon = this.model.getIcons();
            this.template = this.template.replace("$icon-for", icon["icon-forward"] || 'glyphicon-step-forward');
            this.template = this.template.replace("$icon-back", icon["icon-backward"] || 'glyphicon-step-backward');
            this.$el.html(_.template(this.template));

        },
        setNextView: function() {
            window.history.forward();
        },
        setLastView: function() {
            window.history.back();
        }
    });

    return BackForwardView;
});
