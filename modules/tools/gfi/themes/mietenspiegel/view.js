import ThemeView from "../view";
import MietenspiegelTemplate from "text-loader!./template.html";
import MietenspiegelFormularTemplate from "text-loader!./template-formular.html";

const MietenspiegelThemeView = ThemeView.extend({
    /*
     + Die Mietenspiegel-View öffnet sich auf jede GFI-Abfrage. Sein Model hingegen bleibt konstant.
     */
    events: {
        "remove": "destroy",
        "change .msmerkmal": "changedMerkmal",
        "click #msreset": "reset"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isVisible": this.appendTheme
        });

        this.init();
    },
    /**
    * Wird aufgerufen wenn die View erzeugt wird.
    * Unterscheide anhand isMietenspiegelFormular, ob Aufruf in mietenspiegel oder mietenspiegel-formular.
    * @param {ol.layer} layer -
    * @param {object} response -
    * @param {number[]} coordinate -
    * @param {boolean} isMietenspiegelFormular -
    * @returns {void}
    */
    init: function (layer, response, coordinate, isMietenspiegelFormular) {
        if (isMietenspiegelFormular === true) {
            this.template = _.template(MietenspiegelFormularTemplate);

            this.listenTo(this, "setFocusToInput", this.setFocusToInput);
        }
        else {
            this.template = _.template(MietenspiegelTemplate);
            this.listenTo(this.model, "showErgebnisse", this.showErgebnisse);
            this.listenTo(this.model, "hideErgebnisse", this.hideErgebnisse);
        }
        this.listenTo(Radio.channel("GFI"), {
            "isVisible": this.popupRendered
        }, this);

        this.listenToOnce(this.model, "change:readyState", function () { // Beim ersten Abfragen läuft initialize durch, bevor das Model fertig ist. Daher wird change:readyState getriggert
            this.model.newWindow(layer, response, coordinate);
            $(".gfi-content").append(this.$el.html(this.template(this.model.toJSON())));
            this.focusNextMerkmal(0);
        });
        this.listenTo(this.model, "change:msMittelwert", this.changedMittelwert);
        this.listenTo(this.model, "change:msSpanneMin", this.changedSpanneMin);
        this.listenTo(this.model, "change:msSpanneMax", this.changedSpanneMax);
        this.listenTo(this.model, "change:msDatensaetze", this.changedDatensaetze);
        if (this.model.get("readyState") === true) {
            this.model.newWindow(layer, response, coordinate);
            this.render();
        }
    },
    reset: function () {
        this.model.defaultErgebnisse();

        this.render();
        this.trigger("setFocusToInput"); // triggere im mietenspiegel und mietenspiegel-formular immer setFocusToInput, Methode aber nicht immer registriert.
        this.focusNextMerkmal(0);
    },
    /**
     * Hier muss eine Reihenfolge abgearbeitet werden, bevor die Berechnung gestartet wird.
     * @param {ChangeEvent} evt -
     * @returns {void}
     */
    changedMerkmal: function (evt) {
        var id;

        if (evt) {
            this.$(".msmerkmal").each(function (index) {
                if ($(this).attr("id") === evt.target.id) {
                    id = index + 1;
                }
            });
            if (id) {
                this.focusNextMerkmal(id);
            }
        }
    },
    /*
     * Erzeugt eine Liste mit gewählten Merkmalen
     */
    returnMerkmaleListe: function () {
        var merkmale = _.object(["Wohnlage"], [this.$(".mswohnlage").text()]);

        this.$(".msmerkmal").each(function () {
            if (this.value !== "-1") { // = bitte wählen
                merkmale = _.extend(merkmale, _.object([$(this).attr("id")], [$(this).find("option:selected").text()]));
            }
        });
        return merkmale;
    },
    /*
     * Combobox mit Werten füllen. Initial leer.
     */
    fillMerkmaleInCombobox: function (comboboxId) {
        var merkmale = this.returnMerkmaleListe(),
            validMerkmale = this.model.returnValidMerkmale(comboboxId, merkmale);

        // Combobox erst leeren
        this.$(".msmerkmal").each(function () {
            if ($(this).attr("id") === comboboxId) {
                $(this).find("option").each(function () {
                    if (this.value !== "-1") { // = bitte wählen
                        $(this).remove();
                    }
                });
            }
        });
        // dann füllen
        _.each(validMerkmale, function (val, index) {
            document.getElementById(comboboxId).add(new Option(val, index));
        });
    },
    /*
     * Diese Combobox der Merkmale disablen und darauf folgende enablen.
     * Startet fillMerkmaleInCombobox;  //index in ComboboxArray
     */
    focusNextMerkmal: function (activateIndex) {
        var id,
            merkmale;

        this.$(".msmerkmal").each(function (index) {
            if (activateIndex === index) {
                $(this).removeAttr("disabled");
                id = $(this).attr("id");
            }
            else {
                $(this).prop("disabled", true);
            }
        });
        if (id) {
            this.fillMerkmaleInCombobox(id);
        }
        else {
            merkmale = this.returnMerkmaleListe();
            this.model.calculateVergleichsmiete(merkmale);
        }
    },
    /*
    * Methode wird nur im Mietenspiegel-Formular registriert
    */
    setFocusToInput: function () {
        Radio.trigger("Searchbar", "setFocus");
    },
    /*
     * Wenn GFI-Popup gerendert wurde. --> initialzize der View
     */
    popupRendered: function (resp) {
        if (resp === true) {
            this.focusNextMerkmal(0);
        }
    },
    changedMittelwert: function () {
        this.$(".msmittelwert").text(this.model.get("msMittelwert").toString());
    },
    changedSpanneMin: function () {
        this.$(".msspannemin").text(this.model.get("msSpanneMin").toString());
    },
    changedSpanneMax: function () {
        this.$(".msspannemax").text(this.model.get("msSpanneMax").toString());
    },
    changedDatensaetze: function () {
        this.$(".msdatensaetze").text(this.model.get("msDatensaetze").toString());
    },
    showErgebnisse: function () {
        this.$("#msergdiv").show();
        this.$("#msmetadaten").hide();
    },
    hideErgebnisse: function () {
        this.$("#msergdiv").hide();
        this.$("#msmetadaten").show();

    },
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
    }
});

export default MietenspiegelThemeView;
