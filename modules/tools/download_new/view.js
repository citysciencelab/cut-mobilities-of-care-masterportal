import DownloadWin from "text-loader!./template.html";
import DownloadModel from "./model";

const DownloadView = Backbone.View.extend({
    events: {
        "click button.back": "back",
        "change .formats": "setSelectedFormat",
        "keydown .filename": "setFilename"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
    },
    template: _.template(DownloadWin),
    model: new DownloadModel(),

    /**
     * Ruft das Tool auf, das den Download gestartet hat
     * @returns {void}
     */
    back: function () {
        this.model.set("isActive", false);
        Radio.request("ModelList", "getModelByAttributes", {id: "draw"}).set("isActive", true);
    },
    setSelectedFormat: function (evt) {
        const value = evt.currentTarget.value;

        this.model.setSelectedFormat(value);
        this.model.prepareData();
        this.prepareDownloadButton();
    },
    setFilename: function (evt) {
        const value = evt.currentTarget.value;

        this.model.setFileName(value);
    },
    prepareDownloadButton: function () {
        if (this.model.isInternetExplorer()) {
            this.prepareDownloadButtonIE();
        }
        else {
            this.prepareDownloadButtonNonIE();
        }
    },
    prepareDownloadButtonNonIE: function () {
        var url = "data:text/plain;charset=utf-8,%EF%BB%BF" + encodeURIComponent(this.model.get("dataString")),
            that = this;
console.log(123);

        $("a.downloadFile").attr("href", url);
        $("a.downloadFile").on("click", function (e) {
            console.log("click");
            
            const fileName = that.model.validateFileName();

            if (!fileName) {
                e.preventDefault();
            }
            else {
                $("a.downloadFile").attr("download", fileName);
            }
        });
    },
    // prepareDownloadButtonIE: function () {
    //     var fileData = [this.getData()],
    //         blobObject = new Blob(fileData),
    //         that = this;

    //     $(this.getDlBtnSel()).on("click", function () {
    //         var filename = $("input.file-name").val();

    //         if (that.validateFilename(filename)) {
    //             if (that.validateFileExtension()) {
    //                 filename = that.appendFileExtension(filename, that.getSelectedFormat());
    //                 window.navigator.msSaveOrOpenBlob(blobObject, filename);
    //             }
    //         }
    //     });
    // },

    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    }
});

export default DownloadView;
