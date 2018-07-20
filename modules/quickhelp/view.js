define(function (require) {
    var TemplateSearch = require("text!modules/quickhelp/templateSearch.html"),
        TemplateTree = require("text!modules/quickhelp/templateTree.html"),
        TemplateMeasureTool = require("text!modules/quickhelp/templateMeasureTool.html"),
        $ = require("jquery"),
        quickHelpView;

    require("jqueryui/widgets/draggable");

    quickHelpView = Backbone.View.extend({
        templateSearch: _.template(TemplateSearch),
        templateTree: _.template(TemplateTree),
        templateMeasureTool: _.template(TemplateMeasureTool),
        className: "quick-help-window ui-widget-content",
        events: {
            "click .glyphicon-remove": "removeWindow",
            "click .glyphicon-print": "printHelp"
        },
        initialize: function () {
            var channel = Radio.channel("Quickhelp");

            channel.on({
                "showWindowHelp": this.showWindow
            }, this);
            this.render();

            this.$el.draggable({
                containment: "#map",
                handle: ".header"
            });
        },
        render: function () {
            $("body").append(this.$el);
            return this;
        },
        removeWindow: function () {
            this.$el.hide("slow");
        },
        /**
         * [showWindow description]
         * @param {[type]} value [description]
         * @returns {void}
         */
        showWindow: function (value) {
            var allgemein, allgemein2, allgemein3, allgemein4,
                themen, themen2,
                statistikFlaecheNiemeier, statistikStreckeUniErlangen, utmStreifen, utmVerzerrung, utmFormeln;

            switch (value) {
                case "search": {
                    allgemein = Radio.request("Util", "getPath", "../img/allgemein.png");
                    allgemein2 = Radio.request("Util", "getPath", "../img/allgemein_2.png");
                    allgemein3 = Radio.request("Util", "getPath", "../img/allgemein_3.png");
                    allgemein4 = Radio.request("Util", "getPath", "../img/allgemein_4.png");

                    this.$el.html(this.templateSearch({
                        allgemein: allgemein,
                        allgemein2: allgemein2,
                        allgemein3: allgemein3,
                        allgemein4: allgemein4
                    }));
                    break;
                }
                case "tree": {
                    themen = Radio.request("Util", "getPath", "../img/themen.png");
                    themen2 = Radio.request("Util", "getPath", "../img/themen_2.png");

                    this.$el.html(this.templateTree({
                        themen: themen,
                        themen2: themen2
                    }));
                    break;
                }
                case "measure": {
                    statistikFlaecheNiemeier = Radio.request("Util", "getPath", "../img/Statistik_Flaeche_Niemeier.png");
                    statistikStreckeUniErlangen = Radio.request("Util", "getPath", "../img/Statistik_Strecke_UniErlangen.png");
                    utmStreifen = Radio.request("Util", "getPath", "../img/UTM_Streifen.png");
                    utmVerzerrung = Radio.request("Util", "getPath", "../img/UTM_Verzerrung.png");
                    utmFormeln = Radio.request("Util", "getPath", "../img/UTM_Formeln.png");

                    this.$el.html(this.templateMeasureTool({
                        statistikFlaecheNiemeier: statistikFlaecheNiemeier,
                        statistikStreckeUniErlangen: statistikStreckeUniErlangen,
                        utmStreifen: utmStreifen,
                        utmVerzerrung: utmVerzerrung,
                        utmFormeln: utmFormeln
                    }));
                    break;
                }
                default: {
                    break;
                }
            }
            this.$el.show("slow");
        },

        printHelp: function () {
            var htmlToPrint = document.getElementsByClassName("quick-help-window")[0],
                newWin = window.open("");

            newWin.document.write(htmlToPrint.outerHTML);
            newWin.print();
        }
    });

    return quickHelpView;
});
