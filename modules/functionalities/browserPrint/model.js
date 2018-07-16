define(function (require) {
    var Config = require("config"),
        momentJS = require("moment"),
        browserPrintModel;

    require("pdfmake");
    require("vfs_fonts");

    browserPrintModel = Backbone.Model.extend({
        defaults: {
            footerText: "Kartographie und Gestaltung: Freie und Hansestadt Hamburg \nLandesbetrieb Geoinformation und Vermessung",
            titleText: "PDF ohne Titel",
            styles: {
                large: {
                    fontSize: 18
                },
                header: {
                    margin: [0, 10]
                },
                subheader: {
                    fontSize: 14,
                    margin: [0, 10]
                },
                normal: {
                    fontSize: 12
                },
                bold: {
                    bold: true
                },
                small: {
                    fontSize: 10
                },
                xsmall: {
                    fontSize: 8
                },
                image: {
                    margin: [0, 10],
                    alignment: "left"
                },
                onGrey: {
                    margin: [10, 10]
                },
                center: {
                    alignment: "center"
                }
            }
        },
        initialize: function () {
            var channel = Radio.channel("BrowserPrint");

            this.listenTo(channel, {
                "print": this.print
            });
            console.log(window);
            this.setDefaults();
        },
        setDefaults: function () {
            var browserPrint = _.has(Config, "browserPrint") ? Config.browserPrint : undefined;

            if (!_.isUndefined(browserPrint)) {
                _.each(browserPrint, function (val, key) {
                    this.set(key, val);
                }, this);
            }
        },
        print: function (name, defs, title, mode) {
            var completeDefs,
                date = momentJS(new Date()).format("DD.MM.YYYY");

            if (!_.isUndefined(title)) {
                this.setTitleText(title);
            }
            completeDefs = this.appendTitle(defs, date, this.get("titleText"));
            completeDefs = this.appendFooter(completeDefs, this.get("footerText"));
            completeDefs = this.appendStyles(completeDefs);

            if (mode === "download") {
                window.pdfMake.createPdf(completeDefs).download(name + ".pdf");
            }
        },
        appendTitle: function (defs, date, titleText) {
            var defTitle = {
                text: [
                    {
                        text: titleText,
                        style: ["large", "bold", "center"]
                    },
                    {
                        text: " (Stand: " + date + ")",
                        style: ["normal", "center"]
                    }
                ],
                style: "header"
            };

            defs.content.unshift(defTitle);
            return defs;
        },
        appendFooter: function (defs, footerText) {
            defs.footer = function (currentPage, pageCount) {
                var footer = [
                    {
                        text: currentPage.toString() + " / " + pageCount,
                        style: ["xsmall", "center"]
                    },
                    {
                        text: footerText,
                        style: ["xsmall", "center"]
                    }
                ];

                return footer;
            };
            return defs;
        },
        appendStyles: function (defs) {
            defs.styles = this.get("styles");
            return defs;
        },
        // setter for titleText
        setTitleText: function (value) {
            this.set("titleText", value);
        }
    });
    return browserPrintModel;
});
