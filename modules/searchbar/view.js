define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        SearchbarTemplate = require("text!modules/searchbar/template.html"),
        TemplateTable = require("text!modules/searchbar/templateTable.html"),
        SearchbarRecommendedListTemplate = require("text!modules/searchbar/templateRecommendedList.html"),
        SearchbarHitListTemplate = require("text!modules/searchbar/templateHitList.html"),
        Searchbar = require("modules/searchbar/model"),
        $ = require("jquery"),
        SearchbarView;

    SearchbarView = Backbone.View.extend({
        events: {
            "paste input": "waitForEvent",
            "keyup input": "waitForEvent",
            "contextmenu input": "waitForEvent",
            "focusin input": "toggleStyleForRemoveIcon",
            "focusout input": "toggleStyleForRemoveIcon",
            "click .form-control-feedback": "deleteSearchString",
            "click .btn-search": "searchAll",
            "click .list-group-item.hit": "hitSelected",
            "click .list-group-item.results": "renderHitList",
            "mouseover .list-group-item.hit": "showMarker",
            "mouseleave .list-group-item.hit": "hideMarker",
            "click .list-group-item.type": function (e) {

                // fix für Firefox
                var event = e || window.event;

                this.collapseHits($(event.target));
            },
            "click .btn-search-question": function () {
                Radio.trigger("Quickhelp", "showWindowHelp", "search");
            },
            "keydown": "navigateList",
            "click": function () {
                this.clearSelection();
                $("#searchInput").focus();
            }
        },

        /**
        * @description Konfiguration für die Suchfunktion.
        * @param {Object} config - Das Konfigurationsobjet der BKG Suche.
        * @param {Object} [config.visibleWFS] Konfigurationsobjekt für die client-seitige Suche auf bereits geladenen WFS-Layern. Weitere Konfiguration am Layer, s. searchField in {@link config#layerIDs}.
        * @param {integer} [config.visibleWFS.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @param {Object} [config.tree] - Das Konfigurationsobjekt der Tree-Suche, wenn Treesuche gewünscht.
        * @param {integer} [config.tree.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @param {Objekt} [config.specialWFS] - Das Konfigurationsarray für die specialWFS-Suche
        * @param {integer} [config.specialWFS.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @param {Object[]} config.specialWFS.definitions - Definitionen der SpecialWFS.
        * @param {Object} config.specialWFS.definitions[].definition - Definition eines SpecialWFS.
        * @param {string} config.specialWFS.definitions[].definition.url - Die URL, des WFS
        * @param {string} config.specialWFS.definitions[].definition.data - Query string des WFS-Request
        * @param {string} config.specialWFS.definitions[].definition.name - Name der speziellen Filterfunktion (bplan|olympia|paralympia)
        * @param {Object} config.bkg - Das Konfigurationsobjet der BKG Suche.
        * @param {integer} [config.bkg.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @param {string} config.bkg.bkgSuggestURL - URL für schnelles Suggest.
        * @param {string} [config.bkg.bkgSearchURL] - URL für ausführliche Search.
        * @param {float} [config.bkg.extent=454591, 5809000, 700000, 6075769] - Koordinatenbasierte Ausdehnung in der gesucht wird.
        * @param {integer} [config.bkg.suggestCount=20] - Anzahl der über suggest angefragten Vorschläge.
        * @param {string} [config.bkg.epsg=EPSG:25832] - EPSG-Code des verwendeten Koordinatensystems.
        * @param {string} [config.bkg.filter=filter=(typ:*)] - Filterstring
        * @param {float} [config.bkg.score=0.6] - Score-Wert, der die Qualität der Ergebnisse auswertet.
        * @param {Object} [config.gazetteer] - Das Konfigurationsobjekt für die Gazetteer-Suche.
        * @param {string} config.gazetteer.url - Die URL.
        * @param {boolean} [config.gazetteer.searchStreets=false] - Soll nach Straßennamen gesucht werden? Vorraussetzung für searchHouseNumbers. Default: false.
        * @param {boolean} [config.gazetteer.searchHouseNumbers=false] - Sollen auch Hausnummern gesucht werden oder nur Straßen? Default: false.
        * @param {boolean} [config.gazetteer.searchDistricts=false] - Soll nach Stadtteilen gesucht werden? Default: false.
        * @param {boolean} [config.gazetteer.searchParcels=false] - Soll nach Flurstücken gesucht werden? Default: false.
        * @param {integer} [config.gazetteer.minCharacters=3] - Mindestanzahl an Characters im Suchstring, bevor Suche initieert wird. Default: 3.
        * @param {Object} [config.osm] - Das Konfigurationsobjet der OSM Suche.
        * @param {integer} [config.osm.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @param {string} [config.osm.osmServiceUrl] - URL für die Suche.
        * @param {integer} [config.osm.limit=50] - Anzahl der angefragten Vorschläge.
        * @param {string} [config.osm.states=""] - Liste der Bundesländer für die Trefferauswahl.
        * @param {string} [config.osm.classes=""] - Liste der Werte des Dienstes des Attributes "class", die angezeigt werden sollen.
        * @param {string} [config.renderToDOM=searchbar] - Die id des DOM-Elements, in das die Searchbar geladen wird.
        * @param {string} [config.recommandedListLength=5] - Die Länge der Vorschlagsliste.
        * @param {boolean} [config.quickHelp=false] - Gibt an, ob die quickHelp-Buttons angezeigt werden sollen.
        * @param {string} [config.placeholder=Suche] - Placeholder-Value der Searchbar.
        * @returns {void}
        */
        initialize: function (config) {
            // https://developer.mozilla.org/de/docs/Web/API/Window/matchMedia
            // var mediaQueryOrientation = window.matchMedia("(orientation: portrait)"),
            //     mediaQueryMinWidth = window.matchMedia("(min-width: 768px)"),
            //     mediaQueryMaxWidth = window.matchMedia("(max-width: 767px)"),
            //     that = this;
            //
            // // Beim Wechsel der orientation landscape/portrait wird die Suchleiste neu gezeichnet
            // mediaQueryOrientation.addListener(function () {
            //     that.render();
            // });
            // // Beim Wechsel der Navigation(Burger-Button) wird die Suchleiste neu gezeichnet
            // mediaQueryMinWidth.addListener(function () {
            //     that.render();
            // });
            // mediaQueryMaxWidth.addListener(function () {
            //     that.render();
            // });

            if (config.renderToDOM) {
                this.setElement(config.renderToDOM);
            }
            if (config.recommandedListLength) {
                this.model.set("recommandedListLength", config.recommandedListLength);
            }
            if (config.quickHelp) {
                this.model.set("quickHelp", config.quickHelp);
            }
            if (config.placeholder) {
                this.model.set("placeholder", config.placeholder);
            }
            this.className = "navbar-form col-xs-9";

            this.listenTo(this.model, "renderRecommendedList", function () {
                this.renderRecommendedList();
            });

            this.listenTo(Radio.channel("TableMenu"), {
                "hideMenuElementSearchbar": this.hideMenu
            });

            this.listenTo(Radio.channel("Searchbar"), {
                "deleteSearchString": this.deleteSearchString,
                "setFocus": this.setFocus
            });
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function (parentElementId) {
                    this.render(parentElementId);
                    if (!_.isUndefined(this.model.get("initSearchString"))) {
                        this.renderRecommendedList();
                        this.$("#searchInput").val(this.model.get("initSearchString"));
                        this.model.unset("initSearchString", true);
                    }
                    if (window.innerWidth >= 768) {
                        this.$("#searchInput").width(window.innerWidth - $(".desktop").width() - 160);
                        Radio.trigger("Title", "setSize");
                    }
                }
            });

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": function () {
                    this.render();
                }
            });

            this.listenTo(Radio.channel("ViewZoom"), {
                "hitSelected": this.hitSelected
            });


            if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                this.$("#searchInput").val(this.model.get("placeholder"));
            }
            this.$("#searchInput").blur();
            // bedarfsweises Laden der Suchalgorythmen
            if (_.has(config, "gazetteer") === true) {
                require(["modules/searchbar/gaz/model"], function (GAZModel) {
                    new GAZModel(config.gazetteer);
                });
            }
            if (_.has(config, "specialWFS") === true) {
                require(["modules/searchbar/specialWFS/model"], function (SpecialWFSModel) {
                    new SpecialWFSModel(config.specialWFS);
                });
            }
            if (_.has(config, "visibleWFS") === true) {
                require(["modules/searchbar/visibleWFS/model"], function (VisibleWFSModel) {
                    new VisibleWFSModel(config.visibleWFS);
                });
            }
            if (_.has(config, "bkg") === true) {
                require(["modules/searchbar/bkg/model"], function (BKGModel) {
                    new BKGModel(config.bkg);
                });
            }
            if (_.has(config, "tree") === true) {
                require(["modules/searchbar/tree/model"], function (TreeModel) {
                    new TreeModel(config.tree);
                });
            }
            if (_.has(config, "osm") === true) {
                require(["modules/searchbar/OSM/model"], function (OSMModel) {
                    new OSMModel(config.osm);
                });
            }

            // Hack für flexible Suchleiste
            $(window).on("resize", function () {
                if (window.innerWidth >= 768) {
                    this.$("#searchInput").width(window.innerWidth - this.$(".desktop").width() - 160);
                }
            });
            if (window.innerWidth >= 768) {
                this.$("#searchInput").width(window.innerWidth - this.$(".desktop").width() - 160);
            }
        },
        model: new Searchbar(),
        id: "searchbar", // wird ignoriert, bei renderToDOM
        className: "navbar-form col-xs-9", // wird ignoriert, bei renderToDOM
        searchbarKeyNavSelector: "#searchInputUL",
        template: _.template(SearchbarTemplate),
        templateTable: _.template(TemplateTable),
        render: function (parentElementId) {
            var attr = this.model.toJSON();

            if (parentElementId !== "table-nav") {
                this.$el.html(this.template(attr));
                if (window.innerWidth < 768) {
                    $(".navbar-toggle").before(this.$el); // vor dem toggleButton
                }
                else {
                    $(".navbar-collapse").append(this.$el); // rechts in der Menuebar
                }
                if (this.model.get("searchString").length !== 0) {
                    this.$("#searchInput:focus").css("border-right-width", "0");
                }
                this.delegateEvents(this.events);
            }
            else {
                this.$el.html(this.templateTable(attr));
                $("#table-nav-main").prepend(this.$el);
            }
            return this;
        },

        /**
        * @description Methode, um den Searchstring über den Radio zu steuern ohne Event auszulösen
        * @param {string} searchstring - Der einzufügende Searchstring
        * @returns {void}
        */
        setSearchbarString: function (searchstring) {
            this.$("#searchInput").val(searchstring);
        },
        /**
        * @description Verbirgt die Menubar
        * @returns {void}
        */
        hideMenu: function () {
            this.$(".dropdown-menu-search").hide();
        },

        renderRecommendedList: function () {
            var attr = this.model.toJSON(),
                template;
                // sz, will in lokaler Umgebung nicht funktionieren, daher erst das Template als Variable
                // $("ul.dropdown-menu-search").html(_.template(SearchbarRecommendedListTemplate, attr));

            this.prepareAttrStrings(attr.hitList);
            template = _.template(SearchbarRecommendedListTemplate);

            this.$("ul.dropdown-menu-search").css("max-width", this.$("#searchForm").width());
            this.$("ul.dropdown-menu-search").html(template(attr));
            // }
            // bei nur einem Treffer in der RecommendedList wird direkt der Marker darauf gesetzt
            if (!_.isUndefined(this.model.get("initSearchString")) && this.model.get("hitList").length === 1) {
                this.hitSelected();
            }
            this.$("#searchInput + span").show();
        },
        prepareAttrStrings: function (hitlist) {
            // kepps hit.names from overflowing
            _.each(hitlist, function (hit) {
                if (!_.isUndefined(hit.additionalInfo)) {
                    if (hit.name.length + hit.additionalInfo.length > 50) {
                        hit.shortName = this.model.shortenString(hit.name, 30);
                        hit.additionalInfo = this.model.shortenString(hit.additionalInfo, 20);
                    }
                }
                // IE 11 svg bug -> png
                hit.imageSrc = this.model.changeFileExtension(hit.imageSrc, ".png");
            }, this);
        },

        searchAll: function () {
            Radio.trigger("Searchbar", "searchAll", this.model.get("searchString"));
        },

        renderHitList: function () {
            var attr, template;

            if (this.model.get("hitList").length === 1) {
                this.hitSelected(); // erster und einziger Eintrag in Liste
            }
            else {
                this.model.set("typeList", _.uniq(_.pluck(this.model.get("hitList"), "type")));
                attr = this.model.toJSON();
                // sz, will in lokaler Umgebung nicht funktionieren, daher erst das Template als Variable
                // $("ul.dropdown-menu-search").html(_.template(SearchbarHitListTemplate, attr));
                template = _.template(SearchbarHitListTemplate);
                this.$("ul.dropdown-menu-search").html(template(attr));
            }
        },

        /*
         * Methode, um den Focus über den Radio in SearchInput zu legen
         */
        setFocus: function () {
            this.$("#searchInput").focus();
        },

        /**
         * Vorschlag wurde ausgewählt.
         * @param  {evt} evt Event
         * @return {void}
         */
        hitSelected: function (evt) {
            var hit,
                hitID,
                modelHitList = this.model.get("hitList");

            // Ermittle Hit
            if (_.has(evt, "cid")) { // in diesem Fall ist evt = model
                hit = _.values(_.pick(modelHitList, "0"))[0];
            }
            else if (_.has(evt, "currentTarget") === true && evt.currentTarget.id) {
                hitID = evt.currentTarget.id;
                hit = _.findWhere(modelHitList, {id: hitID});
            }
            else if (modelHitList.length > 1) {
                return;
            }
            else {
                hit = modelHitList[0];
            }
            // 1. Schreibe Text in Searchbar
            this.setSearchbarString(hit.name);
            // 2. Verberge Suchmenü
            this.hideMenu();
            // 3. Hide das GFI
            Radio.trigger("GFI", "setIsVisible", false);
            // 4. Zoome ggf. auf Ergebnis oder Sonderbehandlung
            if (_.has(hit, "triggerEvent")) {
                Radio.trigger(hit.triggerEvent.channel, hit.triggerEvent.event, hit);
            }
            else {
                Radio.trigger("MapMarker", "zoomTo", hit, 5000);
            }
            // 5. Triggere Treffer über Radio
            // Wird benötigt für IDA und sgv-online, ...
            Radio.trigger("Searchbar", "hit", hit);
            // 6. Beende Event
            if (evt) {
                evt.stopPropagation();
            }
        },

        navigateList: function (e) {
            var selected = {},
                firstListElement = {},
                // fix für Firefox
                event = e || window.event;

            if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13) {
                selected = this.getSelectedElement();
                firstListElement = this.getFirstElement();
            }

            if (selected.length === 0) {
                firstListElement.addClass("selected");
            }
            else {
                // uparrow
                if (event.keyCode === 38) {
                    this.prevElement(selected);
                }
                // down arrow
                if (event.keyCode === 40) {
                    this.nextElement(selected);
                }
                if (event.keyCode === 13 && this.model.get("hitList").length > 1) {
                    if (this.isFolderElement(selected)) {
                        this.collapseHits(selected);
                    }
                    else {
                        selected.click();
                    }
                }
            }
        },
        getSelectedElement: function () {
            return this.$el.find(this.searchbarKeyNavSelector + " .selected");
        },

        clearSelection: function () {
            this.getSelectedElement().removeClass("selected");
        },
        isLastElement: function (element) {
            return element.is(":last-child");
        },
        isFirstElement: function (element) {
            return element.is(":first-child");
        },
        isChildElement: function (element) {
            return element.parent().prev().hasClass("type");
        },

        getFirstChildElement: function (selected) {
            return selected.next().children().first();
        },
        isFolderElement: function (element) {
            return element.hasClass("type");
        },

        scrollToNext: function (li) {
            var parent = li.parent(),
                pos = parent.scrollTop(),
                scrollHeight = pos + li.outerHeight(true);

            parent.scrollTop(scrollHeight);
        },
        scrollToPrev: function (li) {
            var parent = li.parent(),
                pos = parent.scrollTop(),
                scrollHeight = pos - li.outerHeight(true);

            parent.scrollTop(scrollHeight);
        },
        resetScroll: function (element) {
            element.scrollTop(0);
        },

        nextElement: function (selected) {
            var next = {};

            selected.removeClass("selected");

            if (this.isFolderElement(selected) && selected.hasClass("open")) {
                next = this.getFirstChildElement(selected);
                this.resetScroll(selected.nextAll("div:first"));
            }
            else if (this.isLastElement(selected)) {
                if (this.isChildElement(selected)) {
                    if (this.isLastElement(selected.parent())) {
                        this.getFirstElement().addClass("selected");
                        return;
                    }
                    next = this.getNextElement(selected.parent());
                    this.scrollToNext(selected);
                }
                else {
                    this.getFirstElement().addClass("selected");
                    return;
                }
            }
            else {
                next = this.getNextElement(selected);
                this.scrollToNext(selected);
            }
            next.addClass("selected");
        },

        getNextElement: function (selected) {
            return selected.nextAll("li:first");
        },

        prevElement: function (selected) {
            var prev = {};

            selected.removeClass("selected");

            if (this.isFirstElement(selected)) {
                if (this.isChildElement(selected)) {
                    // child
                    prev = selected.parent().prevAll("li:first");
                    this.resetScroll(selected.parent());
                }
                else {
                    // Folder
                    return;
                }
            }
            else {
                prev = selected.prevAll("li:first");
                if (this.isFolderElement(selected)) {
                    this.resetScroll(selected.prevAll("div:first"));
                }
                else {
                    this.scrollToPrev(selected);
                }
            }
            prev.addClass("selected");
        },
        getFirstElement: function () {
            return this.$el.find(this.searchbarKeyNavSelector + " li").first();
        },
        getLastElement: function () {
            return this.$el.find(this.searchbarKeyNavSelector + " li").last();
        },

        /**
         * wait until event is loaded complete
         * @param {event} evt - a keyup, paste or contextmenu event
         * @returns {void}
         */
        waitForEvent: function (evt) {
            var that = this;

            // The paste event occurs before the value is inserted into the element
            setTimeout(function () {
                that.controlEvent(evt);
            }, 0);
        },

        /**
         * controls the input sequence of events,
         * so that the paste works with shortcut and with contextmenu
         * because with ctrl + c comes 1 paste and 2 keyup events,
         * but with right-click and paste comes 1 contextmenu and 1 paste event
         * @param {event} evt - a keyup, paste or contextmenu event
         * @returns {void}
         */
        controlEvent: function (evt) {
            var count = this.model.get("tempCounter");

            if (evt.type === "contextmenu") {
                this.model.setTempCounter(0);
            }
            else if (evt.type === "paste") {
                this.handlePasteEvent(evt, count);
            }
            else if (evt.type === "keyup" && count < 2) {
                this.model.setTempCounter(++count);
            }
            else {
                this.setSearchString(evt);
            }
        },

        /**
         * handle paste event
         * @param {event} evt - a keyup, paste or contextmenu event
         * @param {number} count - temporary counter to control input events
         * @returns {void}
         */
        handlePasteEvent: function (evt, count) {
            if (_.isUndefined(count)) {
                this.model.setTempCounter(0);
            }
            else {
                this.model.setTempCounter(undefined);
            }
            this.setSearchString(evt);
        },

        setSearchString: function (evt) {
            if (evt.target.value.length === 0) {
                // suche zurücksetzten, wenn der letzte Buchstabe gelöscht wurde
                this.deleteSearchString();
            }
            else {
                if (evt.type === "paste") {
                    this.model.setSearchString(evt.target.value, evt.type);
                }
                else if (evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 && !(this.getSelectedElement("#searchInputUL").length > 0 && this.getSelectedElement("#searchInputUL").hasClass("type"))) {
                    if (evt.key === "Enter" || evt.keyCode === 13) {
                        if (this.model.get("hitList").length === 1) {
                            this.hitSelected(); // erster und einziger Eintrag in Liste
                        }
                        else {
                            this.renderHitList();
                            this.searchAll();
                        }
                    }
                    else {
                        this.model.setSearchString(evt.target.value); // evt.target.value = Wert aus der Suchmaske
                    }
                }
                // Der "x-Button" in der Suchleiste
                if (evt.target.value.length > 0) {
                    this.$("#searchInput + span").show();
                }
                else {
                    this.$("#searchInput + span").hide();
                }
            }
        },
        collapseHits: function (target) {
            this.$(".list-group-item.type + div").hide("slow"); // schließt alle Reiter
            if (target.next().css("display") === "block") {
                target.next().hide("slow");
                target.removeClass("open");
            }
            else {
                target.next().show("slow");
                target.addClass("open");
                target.siblings().removeClass("open");
            }
        },

        toggleStyleForRemoveIcon: function (evt) {
            if (evt.type === "focusin") {
                if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                    if (this.$("#searchInput").attr("value") === this.model.get("placeholder")) {
                        this.$("#searchInput").val("");
                    }
                }
                this.$(".btn-deleteSearch").css("border-color", "#66afe9");
            }
            else if (evt.type === "focusout") {
                if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                    if (this.$("#searchInput").attr("value") === "") {
                        this.$("#searchInput").val(this.model.get("placeholder"));
                    }
                }
                this.$(".btn-deleteSearch").css("border-color", "#cccccc");
            }
        },

        deleteSearchString: function () {
            this.model.setSearchString("");
            this.$("#searchInput").val("");
            this.$("#searchInput + span").hide();
            this.focusOnEnd(this.$("#searchInput"));
            this.hideMarker();
            Radio.trigger("MapMarker", "clearMarker");
            this.clearSelection();
            // Suchvorschläge löschen
            this.$("#searchInputUL").html("");

        },

        showMarker: function (evt) {
            var hitID = evt.currentTarget.id,
                hit = _.findWhere(this.model.get("hitList"), {id: hitID});

            if (hit.type === "Adresse" || hit.type === "Stadtteil" || hit.type === "Olympiastandort" || hit.type === "Paralympiastandort") {
                Radio.trigger("MapMarker", "showMarker", hit.coordinate);
            }
        },

        hideMarker: function () {
            if (this.$(".dropdown-menu-search").css("display") === "block") {
                Radio.trigger("MapMarker", "hideMarker");
            }
        },

        /**
        * Platziert den Cursor am Ende vom String
        * @param {Element} element - Das Dom-Element
        * @returns {void}
        */
        focusOnEnd: function (element) {
            var strLength = element.val().length * 2;

            element.focus();
            element[0].setSelectionRange(strLength, strLength);
        }
    });

    return SearchbarView;
});
