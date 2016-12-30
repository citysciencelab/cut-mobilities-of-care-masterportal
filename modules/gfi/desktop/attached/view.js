define(function (require) {
    require("bootstrap/popover");

    var DesktopView = require("modules/gfi/view"),
        Template = require("text!modules/gfi/desktop/template.html"),
        GFIAttachedView;

    GFIAttachedView = DesktopView.extend({
        className: "gfi gfi-attached",
        template: _.template(Template),

        /**
         * Zeichnet das Template und erstellt das Bootstrap Popover
         */
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            // console.log(this.model.get("gfiContent")[this.model.get("gfiCounter") - 1]);
            // this.$el.find(".gfi-content").append(this.model.get("gfiContent")[this.model.get("gfiCounter") - 1].$el.clone(true));
            // this.$el.find(".gfi-title").text(this.model.get("gfiTitles")[this.model.get("gfiCounter") - 1]);
            $(this.model.getOverlayElement()).popover({
                content: this.$el,
                html: true,
                placement: function () {
                    if (this.getPosition().top > window.innerHeight / 2) {
                        return "top";
                    }
                    else {
                        return "bottom";
                    }
                }
            });
        },

        /**
         * Hängt ein DOM-Element an den body
         * Wird für das ol.Overlay benötigt
         */
        renderDomElementToBody: function () {
            $("body").append("<div id='gfipopup'></div>");
        },

        /**
         * Blendet das Popover ein oder aus
         */
        toggle: function () {
            if (this.model.getIsVisible() === true) {
                $(this.model.getOverlayElement()).popover("show");
            }
            else {
                $(this.model.getOverlayElement()).popover("hide");
            }
        },

        removeView: function () {
            $("#gfipopup").remove();
            this.remove();
        }
    });

    return GFIAttachedView;
});


// TODO fuer Mietenspiegel
// EventBus.on("gfipopup:rerender", this.rerender, this);
/*
* Zeichnet Popup mit vorhandenem content neu
*/
// rerender: function () {
//     $(this.model.get("element")).popover({
//         placement: function () {
//             if (this.getPosition().top > window.innerHeight / 2) {
//                 return "top";
//             }
//             else {
//                 return "bottom";
//             }
//         },
//         html: true,
//         content: this.$el.find(".gfi-content")
//     });
//     // this.model.showPopup();
//     this.minMaxPopover();
// },
