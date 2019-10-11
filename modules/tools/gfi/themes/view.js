import "jquery-ui/ui/widgets/resizable";

const ThemeView = Backbone.View.extend(/** @lends ThemeView.prototype */{
    /**
     * @class ThemeView
     * @extends Tools.GFI
     * @memberof Tools.GFI.Themes
     * @constructs
     * @listens gfiView#RadioTriggerRender
     * @fires Util#RadioRequestUtilIsViewMobile
     * @fires GFI#RadioRequestGFIGetCurrentView
     */
    initialize: function () {
        var gfiWindow = _.has(Config, "gfiWindow") ? Config.gfiWindow : "detached",
            channel = Radio.channel("gfiView");

        this.listenTo(this.model, {
            "change:isVisible": this.appendTheme,
            "change:Feature": this.render
        });

        // render the gfi
        this.listenTo(channel, {
            "render": this.render
        });

        this.gfiWindow = gfiWindow;
        this.render();
    },
    defaults: {
        gfiWindow: "detached"
    },
    /**
    * todo
    * @returns {*} todo
    */
    render: function () {
        var attr;

        if (_.isUndefined(this.model.get("gfiContent")) === false) {
            attr = this.model.toJSON();
            this.$el.html(this.template(attr));
        }
        return this;
    },

    /**
     * Appends the gfi theme to the gfi tool
     * @param   {Tools/GFI/Themes/Model} model model with gfi theme
     * @param   {boolean} value is gfi tool visible
     * @returns {void}
     */
    appendTheme: function (model, value) {
        const isViewMobile = Radio.request("Util", "isViewMobile"),
            currentView = Radio.request("GFI", "getCurrentView"),
            oldGfiWidth = currentView.$el.width();

        let oldLeft = parseInt(currentView.$el.css("left").slice(0, -2), 10);

        if (value === true) {
            if (_.isNaN(oldLeft)) {
                oldLeft = 0;
            }
            currentView.$el.css("left", "0px");

            currentView.$el.find(".gfi-content").html(this.el);
            currentView.$el.find(".gfi-title").text(this.model.get("name"));
            this.appendChildren();
            this.appendRoutableButton();
            if (this.gfiWindow === "detached" && !isViewMobile) {
                if (this.model.get("infoFormat") === "text/html") {
                    currentView.$el.addClass("gfi-text-html ui-widget-content");
                    currentView.$el.css("maxWidth", "inherit");
                    currentView.$el.resizable({
                        minHeight: 440,
                        resize: function (e, ui) {
                            currentView.$el.find("iframe").css("height", ui.size.height - 60);
                        }
                    });
                }
                else if (currentView.$el.hasClass("gfi-text-html")) {
                    currentView.$el.removeClass("gfi-text-html");
                }
                this.adjustGfiWindow(currentView, oldGfiWidth, oldLeft);
            }
        }
        this.delegateEvents();
    },
    /**
    * todo
    * @param {*} currentView todo
    * @param {*} oldGfiWidth todo
    * @param {*} oldLeft todo
    * @returns {*} todo
    */
    adjustGfiWindow: function (currentView, oldGfiWidth, oldLeft) {
        var newGfiWidth,
            newLeft;

        newGfiWidth = currentView.$el.width();
        newLeft = $("#map").width() - newGfiWidth - 40;

        // initial left of gfi. can never be 0 after drag, due to render-function in desktop/detached/view
        if (oldLeft === 0) {
            currentView.$el.css("left", newLeft + "px");
        }
        else if (newGfiWidth > oldGfiWidth) {

            if (oldLeft > newLeft) {
                currentView.$el.css("left", newLeft + "px");
            }
            else {
                currentView.$el.css("left", oldLeft + "px");
            }
        }
        else {
            currentView.$el.css("left", oldLeft + "px");
        }
    },
    /**
     * Alle Children werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
     * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
     * nicht im view ankommen.
     * @returns {*} todo
     */
    appendChildren: function () {
        var children = this.model.get("children");

        this.$(".gfi-content").removeClass("has-image");
        _.each(children, function (element) {
            if (element.type && element.type === "image") {
                this.$el.before(element.val.$el);
                this.$(".gfi-content").addClass("has-image");
            }
            else {
                this.$el.after(element.val.$el);
            }
        }, this);
    },
    /**
     * Fügt den Button dem gfiContent hinzu
     * @returns {*} todo
     */
    appendRoutableButton: function () {
        var rb;

        if (this.model.get("routable") !== undefined) {
            rb = this.model.get("routable");

            this.$el.after(rb.$el);
        }
    }
});

export default ThemeView;
