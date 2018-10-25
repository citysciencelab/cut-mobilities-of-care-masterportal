import Template from "text-loader!./template.html";
import "jquery-ui/ui/widgets/draggable";

const FeatureLister = Backbone.View.extend({
    events: {
        "click .glyphicon-remove": "toggle",
        "click #featurelistFeaturelist": "switchTabToListe", // wechselt den sichtbaren Tab
        "click #featurelistThemeChooser": "switchTabToTheme", // wechselt den sichtbaren Tab
        "click #featurelistFeaturedetails": "switchTabToDetails", // wechselt den sichtbaren Tab
        "click .featurelist-themes-li": "newTheme", // übernimmt Layer
        "mouseover .featurelist-list-table-tr": "hoverTr", // HoverEvent auf Tabelleneintrag
        "click .featurelist-list-table-tr": "selectTr", // Klick-Event auf Tabelleneintrag
        "click .featurelist-list-button": "moreFeatures", // Klick auf Button zum Nachladen von Features
        "click .featurelist-list-table-th": "orderList" // Klick auf Sortiersymbol in thead
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:layerlist": this.updateVisibleLayer,
            "change:layer": function () {
                this.updateLayerList();
                this.updateLayerHeader();
            },
            "change:featureProps": this.showFeatureProps,
            "gfiHit": this.selectGFIHit,
            "gfiClose": this.deselectGFIHit,
            "switchTabToTheme": this.switchTabToTheme
        });

        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    className: "featurelist-win",
    template: _.template(Template),
    /*
    * Wenn im Model das Schließen des GFI empfangen wurde, werden die Elemente in der Tabelle wieder enthighlighted.
    */
    deselectGFIHit: function () {
        this.$("#featurelist-list-table tr").each(function (inte, tr) {
            this.$(tr).removeClass("info");
        }, this);
    },
    /*
    * Wenn im Model ein GFI empfangen wurde, wird dieses in der Liste gesucht und ggf. gehighlighted.
    */
    selectGFIHit: function (evt) {
        var gesuchteId = evt.id;

        this.deselectGFIHit();
        this.$("#featurelist-list-table tr").each(function (inte, tr) {
            var trId = parseInt(this.$(tr).attr("id"), 10);

            if (trId === gesuchteId) {
                this.$(tr).addClass("info");
            }
        }, this);
    },
    /*
    * Findet das Spanelement der Spalte, die geklickt wurde. Liest dann die derzeit dargestellten Features aus und sortiert diese. Leert die aktuelle (unsortierte) Tabelle
    * und überschreibt sie mit den sortierten Features.
    */
    orderList: function (evt) {
        var spanTarget = this.$(evt.target).find("span")[0] ? this.$(evt.target).find("span")[0] : evt.target,
            sortOrder = this.$(spanTarget).hasClass("glyphicon-sort-by-alphabet-alt") ? "ascending" : "descending",
            sortColumn = spanTarget.parentElement.textContent,
            tableLength = this.$("#featurelist-list-table tr").length - 1,
            features = _.filter(this.model.get("layer").features, function (feature) {
                return feature.id >= 0 && feature.id <= tableLength;
            }),
            featuresExtended = _.each(features, function (feature) {
                _.extend(feature, feature.properties);
            }),
            featuresSorted = _.sortBy(featuresExtended, sortColumn);

        this.$(".featurelist-list-table-th-sorted").removeClass("featurelist-list-table-th-sorted");
        if (sortOrder === "ascending") {
            this.$(spanTarget).removeClass("glyphicon-sort-by-alphabet-alt");
            this.$(spanTarget).addClass("glyphicon-sort-by-alphabet");
            this.$(spanTarget).addClass("featurelist-list-table-th-sorted");
        }
        else {
            featuresSorted = featuresSorted.reverse();
            this.$(spanTarget).removeClass("glyphicon-sort-by-alphabet");
            this.$(spanTarget).addClass("glyphicon-sort-by-alphabet-alt");
            this.$(spanTarget).addClass("featurelist-list-table-th-sorted");
        }

        this.$("#featurelist-list-table tbody").empty();
        this.writeFeaturesToTable(featuresSorted);
    },
    /*
    * Ermittelt die Anzahl der derzeit dargestellten Features, erhöht diese und liest diese Features aus. Stellt sie dann dar.
    */
    moreFeatures: function () {
        var countFeatures = this.$("#featurelist-list-table tbody").children().length,
            maxFeatures = this.model.get("maxFeatures"),
            toFeatures = countFeatures + maxFeatures - 1;

        this.readFeatures(countFeatures, toFeatures, false);
    },
    /*
    * Bei change der Feature-Props wird in den Details-Tab gewechselt und dort werden die Detailinformationen des Features (wie GFI) aufgelistet.
    */
    showFeatureProps: function () {
        var props = this.model.get("featureProps");

        if (_.keys(props).length > 0) {
            this.$("#featurelistFeaturedetails").removeClass("disabled");
            this.$(".featurelist-details-li").remove();
            _.each(props, function (value, key) {
                this.$(".featurelist-details-ul").append("<li class='list-group-item featurelist-details-li'><strong>" + key + "</strong></li>");
                this.$(".featurelist-details-ul").append("<li class='list-group-item featurelist-details-li'>" + value + "</li>");
            }, this);
            this.switchTabToDetails();
        }
        else {
            this.$(".featurelist-details-li").remove();
            this.$("#featurelistFeaturedetails").addClass("disabled");
        }
    },
    /*
    * Wechselt den Tab
    */
    switchTabToListe: function (evt) {
        if (evt && this.$("#featurelistFeaturelist").hasClass("disabled")) {
            return;
        }
        _.each(this.$(".featurelist-navtabs").children(), function (child) {
            if (child.id === "featurelistFeaturelist") {
                this.$(child).removeClass("disabled");
                this.$(child).addClass("active");
            }
            else {
                this.$(child).removeClass("active");
            }
        }, this);
        this.$("#featurelist-themes").hide();
        this.$("#featurelist-list").show();
        this.$("#featurelist-details").hide();
    },
    /*
    * Wechselt den Tab
    */
    switchTabToTheme: function () {
        _.each(this.$(".featurelist-navtabs").children(), function (child) {
            if (child.id === "featurelistThemeChooser") {
                this.$(child).removeClass("disabled");
                this.$(child).addClass("active");
            }
            else {
                this.$(child).removeClass("active");
            }
        }, this);
        this.$("#featurelist-themes").show();
        this.$("#featurelist-list").hide();
        this.$("#featurelist-details").hide();
        this.model.downlightFeature();
        this.model.set("layerid", {});
    },
    /*
    * Wechselt den Tab
    */
    switchTabToDetails: function (evt) {
        if (evt && this.$("#featurelistFeaturedetails").hasClass("disabled")) {
            return;
        }
        _.each(this.$(".featurelist-navtabs").children(), function (child) {
            if (child.id === "featurelistFeaturedetails") {
                this.$(child).removeClass("disabled");
                this.$(child).addClass("active");
            }
            else {
                this.$(child).removeClass("active");
            }
        }, this);
        this.$("#featurelist-themes").hide();
        this.$("#featurelist-list").hide();
        this.$("#featurelist-details").show();
    },
    /*
    * Setted FeatureId bei Klick auf Feature in Tabelle
    */
    selectTr: function (evt) {
        var featureid = evt.currentTarget.id;

        this.model.set("featureid", featureid);
    },
    /*
    * Zeigt Marker bei Hover
    */
    hoverTr: function (evt) {
        var featureid = evt.currentTarget.id;

        this.model.downlightFeature();
        this.model.highlightFeature(featureid);
    },
    /*
    * Bei Klick auf Layer wird dieser gehighlighted und Layerid wird gesertzt
    */
    newTheme: function (evt) {
        this.model.set("layerid", evt.currentTarget.id);
        // setze active Class
        _.each(this.$(evt.currentTarget.parentElement.children), function (li) {
            this.$(li).removeClass("active");
        }, this);
        this.$(evt.currentTarget).addClass("active");
    },
    /*
    * Wird ein neuer Layer ausgewählt, werden aus allen Features mögliche Keys ermittelt und daraus Überschriften thead gebildet. Anschließend wird Funktion
    * zum Lesen der Features aufgerufen.
    */
    updateLayerList: function () {
        // lt. Mathias liefern Dienste, bei denen ein Feature in einem Attribut ein null-Value hat, dieses nicht aus und es erscheint gar nicht am Feature.
        var layer = this.model.get("layer"),
            features = layer.features,
            maxFeatures = this.model.get("maxFeatures") - 1,
            keyslist = [];

        if (layer && features && features.length > 0) {
            // Extrahiere vollständige Überschriftenliste, funktioniert nicht, sollten Kommas im Key stehen. Darf aber wohl nicht vorkommen.
            _.each(features, function (feature) {
                _.each(_.keys(feature.properties), function (key) {
                    if (_.contains(keyslist, key) === false) {
                        keyslist.push(key);
                    }
                }, this);
            }, this);
            this.model.set("headers", keyslist);
            this.$("#featurelist-list-table thead").remove(); // leere Tabelle
            this.$("#featurelist-list-table tbody").remove(); // leere Tabelle
            this.$("#featurelist-list-table").prepend("<thead><tr><th class='featurelist-list-table-th'>" + keyslist.toString().replace(/,/g, "<span class='glyphicon glyphicon-sort-by-alphabet'></span></th><th class='featurelist-list-table-th'>") + "<span class='glyphicon glyphicon-sort-by-alphabet'></span></th></tr></thead>");
            this.$("#featurelist-list-table").append("<tbody>");
            this.readFeatures(0, maxFeatures, true);
            this.$("#featurelist-list-table").append("</tbody>");
            this.switchTabToListe();
        }
        else {
            this.$("#featurelist-list-table tr").remove();
            this.$(".featurelist-list-footer").hide();
            this.switchTabToTheme();
            this.$("#featurelistFeaturelist").addClass("disabled");
        }
    },
    /*
    * Liest Features von - bis aus Layer aus. Löscht ggf. bisherige Inhalte der Tabelle.
    */
    readFeatures: function (from, to, dropTableFirst) {
        var features = _.filter(this.model.get("layer").features, function (feature) {
            return feature.id >= from && feature.id <= to;
        });

        if (dropTableFirst === true) {
            this.$("#featurelist-list-table tbody").empty();
        }
        // entferne evtl. Sortierungshinweise aus Überschriften
        this.$(".featurelist-list-table-th-sorted").removeClass("featurelist-list-table-th-sorted");
        this.writeFeaturesToTable(features);
    },
    /*
    * Nimmt die darzustellenden Features entgegen un schreibt sie in tbody. Zeigt ggf. Nachlade-Button.
    */
    writeFeaturesToTable: function (features) {
        var totalFeaturesCount = this.model.get("layer").features.length,
            shownFeaturesCount,
            properties = "",
            headers = this.model.get("headers");

        // Schreibe jedes Feature in tbody
        _.each(features, function (feature) {
            properties += "<tr id='" + feature.id + "' class='featurelist-list-table-tr'>";
            // entsprechend der Reihenfolge der Überschriften...
            _.each(headers, function (header) {
                var attvalue = "";

                _.each(feature.properties, function (value, key) {
                    if (header === key) {
                        attvalue = value;
                    }
                }, this);
                properties += "<td headers='" + header + "'><div class='featurelist-list-table-td' title='" + attvalue + "'>";
                properties += attvalue;
                properties += "</div></td>";
            }, this);
            properties += "</tr>";
        }, this);
        this.$("#featurelist-list-table tbody").append(properties);

        // Prüfe, ob alle Features geladen sind, falls nicht, zeige Button zum Erweitern
        shownFeaturesCount = this.$("#featurelist-list-table tr").length - 1;

        if (shownFeaturesCount < totalFeaturesCount) {
            this.$(".featurelist-list-footer").show(0, function () {
                this.setMaxHeight();
            }.bind(this));
            this.$(".featurelist-list-message").text(shownFeaturesCount + " von " + totalFeaturesCount + " Features gelistet.");
        }
        else {
            this.$(".featurelist-list-footer").hide();
        }
    },
    /*
    * Ändert den Titel des Tabellen-Tabs auf Layernamen.
    */
    updateLayerHeader: function () {
        var name = this.model.get("layer").name ? this.model.get("layer").name : "";

        this.$("#featurelist-list-header").text(name);
    },
    /*
    * Erzeugt Auflistung der selektierbaren Layer.
    */
    updateVisibleLayer: function () {
        var ll = this.model.get("layerlist");

        this.$("#featurelist-themes-ul").empty();
        _.each(ll, function (layer) {
            this.$("#featurelist-themes-ul").append("<li id='" + layer.id + "' class='featurelist-themes-li' role='presentation'><a href='#'>" + layer.name + "</a></li>");
        }, this);
    },

    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.toggle();
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    },
    toggle: function () {
        if (this.$el.is(":visible") === true) {
            this.updateVisibleLayer();
            this.model.checkVisibleLayer();
            // wenn nur ein Layer gefunden, lade diesen sofort
            if (this.model.get("layerlist").length === 1) {
                this.model.set("layerid", this.model.get("layerlist")[0].id);
            }
            this.setMaxHeight();
        }
        this.model.downlightFeature();
    },
    setMaxHeight: function () {
        var totalFeaturesCount = this.model.get("layer").features ? this.model.get("layer").features.length : -1,
            shownFeaturesCount = $("#featurelist-list-table tr").length - 1,
            posY = this.$el[0].style.top ? parseInt(this.$el[0].style.top, 10) : parseInt(this.$el.css("top"), 10),
            winHeight = $(window).height(),
            marginTop = parseInt(this.$el.css("marginTop"), 10),
            marginBottom = parseInt(this.$el.css("marginBottom"), 10),
            header = 107,
            footer = shownFeaturesCount < totalFeaturesCount ? 71 : 0,
            maxHeight = winHeight - posY - marginTop - marginBottom - header - footer - 5,
            maxWidth = $(window).width() * 0.4;

        this.$(".featurelist-list-table").css("max-height", maxHeight);
        this.$(".featurelist-list-table").css("max-width", maxWidth);
        this.$(".featurelist-details-ul").css("max-height", maxHeight);
        this.$(".featurelist-details-ul").css("max-width", maxWidth);
    }
});

export default FeatureLister;
