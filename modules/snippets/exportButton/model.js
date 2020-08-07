import SnippetModel from "../model";
import html2canvas from "html2canvas";

const ExportButtonModel = SnippetModel.extend(/** @lends ExportButtonModel.prototype */{
    defaults: {
        tag: "Export",
        rawData: null,
        filename: "",
        fileExtension: "",
        data: null,
        disabled: false
    },

    /**
     * @description creates a downloadable Blob from Objects / ObjectArrays and appends them to a "download"-button
     * @extends SnippetModel
     * @memberof Snippets.ExportButton
     * @constructs
     * @property {string} tag=button name
     * @property {string} rawData= origin data as json string
     * @property {string} filename=name of the file
     * @property {string} fileExtension
     * @property {object} data=data for export
     * @returns {void}
     */
    initialize: function () {
        this.superInitialize();

        if (typeof this.get("rawData") === "string") {
            this.trigger("render");
        }
        else {
            this.prepareForExport();
        }

        this.listenTo(this, {
            "change:isActive": this.prepareForExport,
            "change:rawData": this.prepareForExport
        });
    },

    /**
     * triggers the conversion of input data depending on the data type
     * @returns {void}
     */
    convertRawData: function () {
        const data = this.get("rawData");

        if (data.length > 0 || Object.keys(data).length > 0) {
            switch (this.get("fileExtension")) {
                case "csv":
                    this.convertJsonToCsv(data);
                    break;
                default:
                    this.setData(data, {type: "text/plain"});
                    break;
            }
        }
    },

    /**
     * converts the original data to csv and triggers conversion to blob
     * @param {*} data the original data, taken from constructor if not defined otherwise
     * @returns {void}
     */
    convertJsonToCsv: function (data = this.get("rawData")) {
        let dataAsObjArr = data;

        if (data.length === undefined) {
            dataAsObjArr = this.refineObject(dataAsObjArr);
        }

        try {
            const csv = Radio.request("Util", "convertArrayOfObjectsToCsv", dataAsObjArr);

            this.setData(csv, "text/csv;charset=utf-8,%EF%BB%BF");
        }
        catch (err) {
            console.error(err);
        }

    },

    /**
     * converts an object to an array
     * @param {object} data the input data
     * @returns {object[]} the converted array
     */
    refineObject: function (data) {
        const objArr = [];

        for (const key in data) {
            data[key].id = key;
            objArr.push(data[key]);
        }

        return objArr;
    },

    /**
     * generates the filename based on construction paramters and current date
     * @returns {string} filename
     */
    generateFilename: function () {
        const date = new Date().toLocaleDateString("en-US", {year: "numeric", month: "numeric", day: "numeric"}),
            filename = `${this.get("filename")}-${date}.${this.get("fileExtension")}`;

        return filename;
    },

    /**
     * triggers the data conversion and button rendering on view
     * @fires #render
     * @returns {void}
     */
    prepareForExport: function () {
        this.convertRawData();

        this.trigger("render");
    },

    /**
     * Converts an arbitrary object to Blob and stores it for download
     * @param {*} data the object to convert to Blob
     * @param {string} type the type of the input object
     * @returns {void}
     */
    setData: function (data, type) {
        this.set("data", new Blob(["\ufeff", data], {type: type}));
    },

    /**
     * converts the specified html element to a canvas and prepares it for download
     * @fires #download
     * @returns {void}
     */
    htmlToCanvas: function () {
        const html = document.querySelector(this.get("rawData"));

        // workaround for scaled svgs
        html.querySelectorAll("svg").forEach((svg) => {
            const svgScale = parseFloat($(svg).attr("scale")),
                svgViewBox = $(svg).attr("viewBox"),
                svgViewBoxArray = svgViewBox.split(" "),
                scaledViewBox = svgViewBoxArray.map(val => val / svgScale);

            $(svg).attr("viewBox", `${scaledViewBox[0]} ${scaledViewBox[1]} ${scaledViewBox[2]} ${scaledViewBox[3]}`);
            $(svg).attr("initViewBox", svgViewBox);
        });

        $(html).find(".noprint").hide();

        html2canvas(html).then((canvas) => {
            canvas.toBlob((blob) => {
                this.set("data", blob);
                this.trigger("download");

                $(html).find(".noprint").show();
                html.querySelectorAll("svg").forEach((svg) => {
                    const svgViewBox = $(svg).attr("initViewBox");

                    $(svg).attr("viewBox", svgViewBox);
                });
            });
        });
    }
});

export default ExportButtonModel;
