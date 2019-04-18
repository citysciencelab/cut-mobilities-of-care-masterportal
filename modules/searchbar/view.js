import SearchbarTemplate from "text-loader!./template.html";
import TemplateTable from "text-loader!./templateTable.html";
import SearchbarRecommendedListTemplate from "text-loader!./templateRecommendedList.html";
import SearchbarHitListTemplate from "text-loader!./templateHitList.html";
import GAZModel from "./gaz/model";
import SpecialWFSModel from "./specialWFS/model";
import VisibleVectorModel from "./visibleVector/model";
import BKGModel from "./bkg/model";
import TreeModel from "./tree/model";
import OSMModel from "./OSM/model";
import GdiModel from "./gdi/model";
import Searchbar from "./model";

/**
 * @member SearchbarTemplate
 * @description Template for searchbar
 * @memberof Searchbar
 */
/**
 * @member TemplateTable
 * @description Template for table
 * @memberof Searchbar
 */
/**
 * @member SearchbarRecommendedListTemplate
 * @description Template for recommendedList
 * @memberof Searchbar
 */
/**
 * @member SearchbarHitListTemplate
 * @description Template for hitList
 * @memberof Searchbar
 */
const SearchbarView = Backbone.View.extend(/** @lends SearchbarView.prototype */{
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
        "click .list-group-item.type": "clickListGroupItem",
        "click .btn-search-question": "clickBtnQuestion",
        "keydown": "navigateList",
        "click": "clickHandler"
    },

    /**
     * @class SearchbarView
     * @extends Backbone.View
     * @memberof Searchbar
     * @constructs
     * @param {Object} config config
     * @listens Searchbar#renderRecommendedList
     * @listens Menu#RadioTriggerTableMenuHideMenuElementSearchbar
     * @listens Searchbar#RadioTriggerSearchbarDeleteSearchString
     * @listens Searchbar#RadioTriggerSearchbarSetFocus
     * @listens Menu#RadioTriggerMenuLoaderReady
     * @listens Util#RadioTriggerUtilIsViewMobileChanged
     * @listens Searchbar#RadioTriggerViewZoomHitSelected
     * @fires Quickhelp#RadioTriggerQuickhelpShowWindowHelp
     * @fires Title#RadioTriggerTitleSetSize
     * @fires Searchbar#RadioTriggerSearchbarSearchAll
     * @fires GFI#RadioTriggerGFISetIsVisible
     * @fires MapMarker#RadioTriggerMapMarkerZoomTo
     * @fires Searchbar#RadioTriggerSearchbarHit
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @fires MapMarker#RadioTriggerMapMarkerHidePolygon
     * @fires MapMarker#RadioTriggerMapMarkerShowMarker
     */
    initialize: function (config) {
        this.model = new Searchbar(config);

        if (config.renderToDOM) {
            this.setElement(config.renderToDOM);
            this.render();
        }

        this.className = "navbar-form col-xs-9";

        this.listenTo(this.model, {
            "renderRecommendedList": this.renderRecommendedList
        });

        this.listenTo(Radio.channel("TableMenu"), {
            "hideMenuElementSearchbar": this.hideMenu
        });

        this.listenTo(Radio.channel("Searchbar"), {
            "deleteSearchString": this.deleteSearchString,
            "setFocus": this.setFocus
        });

        this.listenTo(Radio.channel("MenuLoader"), {
            "ready": this.menuLoaderReady
        });

        if (config.quickHelp) {
            this.model.setQuickHelp(config.quickHelp);
        }

        this.initialRender();

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.viewMobileChanged
        });

        this.listenTo(Radio.channel("ViewZoom"), {
            "hitSelected": this.hitSelected
        });

        if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
            this.$("#searchInput").val(this.model.get("placeholder"));
        }
        this.$("#searchInput").blur();
        // Verwalte Suchalgorithmen zur initialen Suche
        this.model.setInitialSearchTasks(config);

        // Bedarfsweises Laden der Suchalgorythmen
        if (_.has(config, "gazetteer") === true) {
            new GAZModel(config.gazetteer);
        }
        if (_.has(config, "specialWFS") === true) {
            new SpecialWFSModel(config.specialWFS);
        }
        if (_.has(config, "visibleVector") === true) {
            new VisibleVectorModel(config.visibleVector);
        }
        else if (_.has(config, "visibleWFS") === true) {
            // Deprecated mit neuer Stable
            new VisibleVectorModel(config.visibleWFS);
        }
        if (_.has(config, "bkg") === true) {
            new BKGModel(config.bkg);
        }
        if (_.has(config, "tree") === true) {
            new TreeModel(config.tree);
        }
        if (_.has(config, "osm") === true) {
            new OSMModel(config.osm);
        }
        if (_.has(config, "gdi") === true) {
            new GdiModel(config.gdi);
        }

        this.model.setHitIsClick(false);

        // Hack für flexible Suchleiste
        $(window).on("resize", function () {
            if (window.innerWidth >= 768) {
                $("#searchInput").width(window.innerWidth - $(".desktop").width() - 160);
            }
            $(".dropdown-menu-search").css({
                "max-height": window.innerHeight - 100, // 100 fixer Wert für navbar &co.
                "overflow": "auto"
            });
        });


    },
    id: "searchbar", // wird ignoriert, bei renderToDOM
    className: "navbar-form col-xs-9", // wird ignoriert, bei renderToDOM
    searchbarKeyNavSelector: "#searchInputUL",
    template: _.template(SearchbarTemplate),
    templateTable: _.template(TemplateTable),
    templateRecommendedList: _.template(SearchbarRecommendedListTemplate),
    templateHitList: _.template(SearchbarHitListTemplate),
    /**
     * todo
     * @returns {*} todo
     */
    render: function () {
        var attr = this.model.toJSON(),
            menuStyle = Radio.request("Util", "getUiStyle");

        if (menuStyle !== "TABLE") {
            this.$el.html(this.template(attr));
            if (window.innerWidth < 768) {
                $(".navbar-toggle").before(this.$el); // vor dem toggleButton
            }
            else {
                $(".navbar-collapse").append(this.$el); // rechts in der Menuebar
            }
            if (this.model.get("searchString").length !== 0) {
                $("#searchInput:focus").css("border-right-width", "0");
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
     * todo
     * @returns {*} todo
     */
    initialRender: function () {
        this.render();
        if (!_.isUndefined(this.model.get("initSearchString"))) {
            this.renderRecommendedList();
            this.$("#searchInput").val(this.model.get("initSearchString"));
            this.model.unset("initSearchString", true);
        }
        if (window.innerWidth >= 768) {
            this.$("#searchInput").width(window.innerWidth - $(".desktop").width() - 160 + "px");
            Radio.trigger("Title", "setSize");
        }
    },

    /**
     * Handling of click event on a ListGroupItem
     * @param   {event} e Event
     * @returns {void}
     */
    clickListGroupItem: function (e) {
        // fix für Firefox
        var event = e || window.event;

        this.collapseHits($(event.target));
    },

    /**
     * Handling of click event on button quickhelp
     * @returns {void}
     */
    clickBtnQuestion: function () {
        Radio.trigger("Quickhelp", "showWindowHelp", "search");
    },

    /**
     * Handling of click event
     * @returns {void}
     */
    clickHandler: function () {
        this.clearSelection();
        $("#searchInput").focus();
    },

    /**
     * Handling of menuLoader:ready
     * @param   {String} parentElementId parentElementId
     * @returns {void}
     */
    menuLoaderReady: function (parentElementId) {
        this.render(parentElementId);
        if (!_.isUndefined(this.model.get("initSearchString"))) {
            if (this.model.get("isInitialRecommendedListCreated") === true) {
                this.renderRecommendedList();
                this.$("#searchInput").val(this.model.get("initSearchString"));
                this.model.unset("initSearchString", true);
            }
        }
        if (window.innerWidth >= 768) {
            this.$("#searchInput").width(window.innerWidth - $(".desktop").width() - 160);
            Radio.trigger("Title", "setSize");
        }
    },

    /**
     * Handling of isViewMobileChanged
     * @returns {void}
     */
    viewMobileChanged: function () {
        this.render();
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

    /**
     * Calculates the height of the dropdown div. Default 100 should allways fit roughly.
     * @returns {integer} div height
     */
    getDropdownHeight: function () {
        if (document.getElementsByClassName("lgv-container").length > 0) {
            return document.getElementsByClassName("lgv-container")[0].offsetHeight - 130;
        }
        return 100;
    },

    /**
     * todo
     * @returns {*} todo
     */
    renderRecommendedList: function () {
        var attr = this.model.toJSON(),
            height = this.getDropdownHeight(),
            width = this.$("#searchForm").width();

        attr.uiStyle = Radio.request("Util", "getUiStyle");

        // Falls der Themenbaum auf dem Tisch geöffnet ist, soll dieser bei der Initialisierung der Suche
        // geschlossen werden.
        if ($("#table-nav-layers-panel").length > 0) {
            $("#table-nav-layers-panel").collapse("hide");
            Radio.trigger("TableMenu", "deactivateCloseClickFrame");
        }
        // sz, will in lokaler Umgebung nicht funktionieren, daher erst das Template als Variable
        // $("ul.dropdown-menu-search").html(_.template(SearchbarRecommendedListTemplate, attr));

        this.prepareAttrStrings(attr.hitList);
        this.$("ul.dropdown-menu-search").html(this.templateRecommendedList(attr));
        this.$("ul.dropdown-menu-search").css("max-height", height);
        this.$("ul.dropdown-menu-search").css("width", width);
        this.$("ul.dropdown-menu-search").css("max-width", width);

        // Bei nur einem Treffer in der RecommendedList wird direkt der Marker darauf gesetzt
        // und im Falle eines Tree-Search auch das Menü aufgeklappt.
        if (!_.isUndefined(this.model.get("initSearchString")) && this.model.get("hitList").length === 1) {
            this.hitSelected();
        }
        this.$("#searchInput + span").show();
    },

    /**
     * todo
     * @param {*} hitlist todo
     * @returns {*} todo
     */
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

    /**
     * todo
     * @returns {*} todo
     */
    searchAll: function () {
        Radio.trigger("Searchbar", "searchAll", this.model.get("searchString"));
    },

    /**
     * todo
     * @returns {*} todo
     */
    renderHitList: function () {
        var attr;

        if (this.model.get("hitList").length === 1) {
            this.hitSelected(); // erster und einziger Eintrag in Liste
        }
        else {
            this.model.set("typeList", _.uniq(_.pluck(this.model.get("hitList"), "type")));
            attr = this.model.toJSON();
            attr.uiStyle = Radio.request("Util", "getUiStyle");
            // sz, will in lokaler Umgebung nicht funktionieren, daher erst das Template als Variable
            // $("ul.dropdown-menu-search").html(_.template(SearchbarHitListTemplate, attr));
        }
        this.$("ul.dropdown-menu-search").html(this.templateHitList(attr));
    },

    /**
     * Set focus in searchInput
     * @returns {void}
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
            this.model.setHitIsClick(true);
            Radio.trigger(hit.triggerEvent.channel, hit.triggerEvent.event, hit, true);
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

    /**
     * todo
     * @param {*} e todo
     * @returns {*} todo
     */
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

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    getSelectedElement: function () {
        return this.$el.find(this.searchbarKeyNavSelector + " .selected");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    clearSelection: function () {
        this.getSelectedElement().removeClass("selected");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isLastElement: function (element) {
        return element.is(":last-child");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isFirstElement: function (element) {
        return element.is(":first-child");
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isChildElement: function (element) {
        return element.parent().prev().hasClass("type");
    },

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
    getFirstChildElement: function (selected) {
        return selected.next().children().first();
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    isFolderElement: function (element) {
        return element.hasClass("type");
    },

    /**
     * todo
     * @param {*} li todo
     * @returns {*} todo
     */
    scrollToNext: function (li) {
        var parent = li.parent(),
            pos = parent.scrollTop(),
            scrollHeight = pos + li.outerHeight(true);

        parent.scrollTop(scrollHeight);
    },

    /**
     * todo
     * @param {*} li todo
     * @returns {*} todo
     */
    scrollToPrev: function (li) {
        var parent = li.parent(),
            pos = parent.scrollTop(),
            scrollHeight = pos - li.outerHeight(true);

        parent.scrollTop(scrollHeight);
    },

    /**
     * todo
     * @param {*} element todo
     * @returns {*} todo
     */
    resetScroll: function (element) {
        element.scrollTop(0);
    },

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
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

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
    getNextElement: function (selected) {
        return selected.nextAll("li:first");
    },

    /**
     * todo
     * @param {*} selected todo
     * @returns {*} todo
     */
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

    /**
     * todo
     * @returns {*} todo
     */
    getFirstElement: function () {
        return this.$el.find(this.searchbarKeyNavSelector + " li").first();
    },

    /**
     * todo
     * @returns {*} todo
     */
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

    /**
     * todo
     * @param {*} evt todo
     * @returns {*} todo
     */
    setSearchString: function (evt) {
        if (evt.target.value.length === 0) {
            // suche zurücksetzten, wenn der letzte Buchstabe gelöscht wurde
            this.deleteSearchString();
        }
        else if (evt.target.value.length < 3) {
            this.$("#searchInputUL").html("");
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
            else if (evt.keyCode === 38 || evt.keyCode === 40) {
                this.positionOfCursorToEnd();
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

    /**
     * puts the cursor at the end of the text when the arrow key up or down is up,
     * if navigate through results
     * @returns {void}
     */
    positionOfCursorToEnd: function () {
        var selectedElement = _.find(this.$(".list-group-item"), function (element) {
                return this.$(element).hasClass("selected");
            }, this),
            lastSelectedItem = this.model.get("searchFieldisSelected");

        if (!_.isUndefined(lastSelectedItem) || (!_.isUndefined(lastSelectedItem) && this.$(".list-group-item").length !== 0)) {
            this.focusOnEnd(this.$("#searchInput"));
        }

        this.model.setSearchFieldisSelected(selectedElement);
    },

    /**
     * todo
     * @param {*} target todo
     * @returns {*} todo
     */
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

    /**
     * todo
     * @param {*} evt todo
     * @returns {*} todo
     */
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

    /**
     * todo
     * @returns {*} todo
     */
    deleteSearchString: function () {
        this.model.setSearchString("");
        this.$("#searchInput").val("");
        this.$("#searchInput + span").hide();
        this.focusOnEnd(this.$("#searchInput"));
        this.hideMarker();
        Radio.trigger("MapMarker", "hideMarker");
        Radio.trigger("MapMarker", "hidePolygon");
        this.clearSelection();
        // Suchvorschläge löschen
        this.$("#searchInputUL").html("");

    },

    /**
     * todo
     * @param {*} evt todo
     * @returns {*} todo
     */
    showMarker: function (evt) {
        var hitId = evt.currentTarget.id,
            hit = _.findWhere(this.model.get("hitList"), {id: hitId});

        if (_.has(hit, "triggerEvent")) {
            // bei gdi-Suche kein Aktion bei Maushover oder bei GFI on Click
            if (hit.type !== "Fachthema" && hit.triggerEvent.event !== "gfiOnClick") {
                Radio.trigger(hit.triggerEvent.channel, hit.triggerEvent.event, hit, true);
            }
        }
        else if (_.has(hit, "coordinate")) {
            Radio.trigger("MapMarker", "showMarker", hit.coordinate);
        }
        else {
            console.warn("Error: Could not set MapMarker, no Coordinate found for " + hit.name);
        }
    },

    /**
     * hides the map marker
     * @param {event} evt mouse leave event
     * @fires MapMarker#RadioTriggerMapMarkerHideMarker
     * @returns {void}
     */
    hideMarker: function (evt) {
        var hitId,
            hit;

        if (!_.isUndefined(evt)) {
            hitId = evt.currentTarget.id;
            hit = _.findWhere(this.model.get("hitList"), {id: hitId});
        }

        if (_.has(hit, "triggerEvent")) {
        // bei gdi-Suche kein Aktion bei Maushover oder bei GFI on Click
            if (hit.type !== "Fachthema" && hit.triggerEvent.event !== "gfiOnClick" && !this.model.get("hitIsClick")) {
                Radio.trigger(hit.triggerEvent.channel, hit.triggerEvent.event, hit, false);
            }
        }
        else if (this.$(".dropdown-menu-search").css("display") === "block") {
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

export default SearchbarView;
