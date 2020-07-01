import Template from "text-loader!./template.html";

const ExportButtonView = Backbone.View.extend(/** @lends ExportButtonView.prototype */ {

    /**
     * initializes the ExportButtonView
     * @extends Backbone.View
     * @memberof Snippets.ExportButton
     * @member Template
     * @constructs
     * @returns {void}
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:disabled": this.render,
            "render": this.render,
            "download": this.download
        });
    },
    model: {},
    className: "download-container",
    template: _.template(Template),

    /**
     * renders the download button to the parent view
     * @returns {Backbone.View} returns this
     */
    render: function () {
        const attrs = this.model.toJSON();

        this.$el.html(this.template(attrs));
        this.el.querySelector(".btn").addEventListener("pointerup", this.export.bind(this));
        this.delegateEvents();

        return this;
    },

    /**
     * triggers the download of either the data passed or the html object to print
     * @returns {void}
     */
    export: function () {
        if (this.model.get("disabled")) {
            return;
        }
        if (typeof this.model.get("rawData") === "string") {
            this.model.htmlToCanvas();
        }
        else {
            this.download();
        }
    },

    /**
     * creates a temporary download link and triggers it
     * @returns {void}
     */
    download: function () {
        const blob = this.model.get("data");

        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, this.model.generateFilename());
        }
        else {
            const link = document.createElement("a");

            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);

                link.setAttribute("href", url);
                link.setAttribute("download", this.model.generateFilename());
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
});

export default ExportButtonView;
