
# Übersetzungen im Masterportal

Dieses Dokument beschreibt, wie mit Sprachen und Übersetzungen im Masterportal (MP) gearbeitet wird.
Es ist für Anfänger, Fortgeschrittene und Experten gedacht.

Dies sind die Ziele dieses Dokuments:

1. Wie erweitert man Sprachdateien und wie werden neue Sprachen hinzugefügt (Anfänger).
2. Wie fügst du Sprachen in neue models ein (fortgeschrittene Benutzer).
3. Wie haben wir es geschafft Übersetzungen und Sprachen zu verwenden (Experten).




## Hintergrund

Dieser Abschnitt bietet einige Hintergründe und allgemeines Wissen rund um die Arbeit mit Übersetzungen und Sprachen im MP.


### Technik

Die verwendete Technologie für die Übersetzung des MP ist "i18next" (https://www.i18next.com/).

Für fortgeschrittene Benutzer und Experten empfehlen wir die kurze aber scharfe Dokumentation von i18next zu lesen.

Es werden folgende i18next-Plugins verwendet:

* [i18next-http-backend](https://github.com/i18next/i18next-http-backend) zur Verwendung von Sprachdateien anstelle von hartkodierten Übersetzungen
* [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector) zur Erkennung der Sprache des Browsers, Verwendung des localStorage und Auslesen der Sprache aus der query Url

i18next sendet mit diesem Radio-Event einen Sprachwechsel: "i18next#RadioTriggerLanguageChanged".
Um i18next im Code zu verwenden, wird es als globale Variable "i18next" oder für Devs von der Browser-Konsole aus mit "Backbone.i18next" bereitgestellt.


### Sprachen

Da das MP derzeit hauptsächlich in Hamburg entwickelt wird, ist die Fallback-Sprache deutsch.
(Du kannst die Fallback-Sprache manuell in der config.js ändern)

Selbstverständlich stellen wir jederzeit eine komplette englische Übersetzung zur Verfügung:

1. Deutsch
2. Englisch

### Konfiguration

Die Konfiguration der Sprachen und von i18next findet in der config.js statt: **[Dokumentation config.js](config.js.de.md#markdown-header-portallanguage)**.

### Sprachdateien

Sprachdateien werden verwendet, um Übersetzungen in "Keys" zu speichern. Diese Keys sind wichtig, um auf die Übersetzungen im Code und in der Konfiguration des MPs zuzugreifen.
Für die Arbeit mit Sprachdateien setzen wir Grundkenntnisse der JSON-Syntax voraus.
Für Einsteiger empfehlen wir einen kurzen Blick in die JSON-Anleitungen:

* https://restfulapi.net/json-syntax/
* https://www.w3schools.com/js/js_json_syntax.asp

## Sprachdateien

Sprachdateien sind der Kern der Übersetzungen. Jede Sprache benötigt eigene Übersetzungsdateien.
Wir haben uns entschieden, die Übersetzungen in zwei verschiedene Dateien aufzuteilen:

1. common
2. additional

Hier ein Link zur **[Architektur](i18next.de.jpeg)**


### Common Sprachdatei - common.json
Die Common Sprachdatei ist die Sammlung aller Übersetzungen, die im MP in seiner Standardkonfiguration verwendet werden.
Dies beinhaltet sowohl die allgemeinen Module als auch die am häufigsten verwendeten Menüeinträge und die Anwendungslogik.

### Additional Sprachdatei - additional.json
Die Additional Sprachdatei wird für Addons (ehemalige custom modules) verwendet.

## Übersetzung der Namen in der config.json

Dieser Abschnitt beschreibt den Ansatz, wie i18next die in der config.json angegebenen Namen übersetzt.
Das Erste ist ein best practice Szenario, dann folgt eine Beschreibung, was im Hintergrund passiert und warum es passiert.


### Best practice szenario

### Menü

Um einen Namen aus der config.json zu übersetzen, muss der Name selbst korrekt formatiert werden.
Dieser formatierte Wert muss dann in die Übersetzungsdateien übernommen werden.
Wird der Teil der config.json vom Masterportal für die Übersetzung berücksichtigt, erfolgt die Übersetzung wie gewünscht.
Nur das Feld *"name"* wird bei der Übersetzung berücksichtigt!

Übersetzungsdatei common.json
```
{
    "foo": {
        "bar": {
            "exampleMenuTitle": "titulum menu",
            "exampleLayerName": "aliquid",
            "exampleSubjectData": "subject data"
        }
    }
}
```



Teil der config.json, den du für die Übersetzung des Menüs bearbeiten kannst:
```
{
    "Portalconfig": {
        "menu": {
            "example": {
                "name": "translate#common:foo.bar.exampleMenuTitle",
                "glyphicon": "glyphicon-list",
                "isInitOpen": false
            }
        }
    }
}
```
Dem Übersetzungs-Key muss folgender Text vorangestellt werden: translate#.

Aufbau:
translate#[Sprachdateiname]:[Pfad zum Key] = translate#common:foo.bar.exampleMenuTitle


Da das Menü bereits so programmiert ist, dass es auf den Übersetzungspräfix ("translate#") korrekt reagiert, ist dies für einen Menüeintrag alles, was zu tun ist.

### Themenbaum

Ähnlich wie das Menü kann auch der Themenbaum übersetzt werden.

**Achtung**: Ein Übersetzungsschlüssel, der zu einem Eintrag im Themenbaum hinzugefügt wird, überschreibt alle Titel oder Namen, die von Diensten stammen.

Ist der treeType "default" oder "custom" kann der Name des Ordners angegeben werden. Im Beispiel unten würde dann im Baum nicht "Fachdaten" sondern der Wert zum Schlüssel "foo.bar.exampleSubjectData" stehen.

Default-Übersetzungen:

* Baselayer: "Hintergrundkarten"
* Overlayer: "Fachthemen"
* 3d-Layer: "3D Daten"


Der Teil der config.json, den du für die Übersetzung des Themenbaums bearbeiten kannst:
```
{
    "Themenconfig": {
        "Fachdaten": {
            "name": "translate#common:foo.bar.exampleSubjectData",
            "Layer": [
                  {
                    "id": "2128",
                    "name": "translate#common:foo.bar.exampleLayerName"
                  }
            ]
        }
    }
}
```
Es gibt folgende Möglichkeiten und folgende Hierarchie:

* "name": "Meine Fachthemen" --> wird nie übersetzt
* "name": "translate#common:foo.bar.exampleMenuTitle" --> wird übersetzt, wenn der Key existiert
* kein Name angegeben (das Feld Name existiert nicht) --> Default-Übersetzung (siehe oben)

### Werkzeuge

Ähnlich wie das Menü können auch die Werkzeuge übersetzt werden.
Dazu gehört der Eintrag im Menü unter "Werkzeuge" und der Titel des Werkzeugfensters.

Dieser Teil der config.json kann für die Übersetzung der Tools bearbeitet werden:
```
      "tools":
      {
        "name": "Werkzeuge",
        "glyphicon": "glyphicon-wrench",
        "children": {
          "draw":
          {
            "name": "translate#common:foo.bar.exampleMenuTitle",
            "glyphicon": "glyphicon-pencil"
          },
          ...
```
Es gibt folgende Möglichkeiten und folgende Hierarchie:

* "name": "Zeichnen / Schreiben" --> wird nie übersetzt
* "name": "translate#common:foo.bar.exampleMenuTitle" --> wird übersetzt, wenn der Key existiert
* kein Name angegeben (das Feld Name existiert nicht) --> Name kommt aus der model.js (hier ../tools/draw/model.js)

#### Werkzeugname in der state.js definieren

Wenn das Feld "name" in der state.js gefüllt ist, wird es als Default-Name angesehen, der nicht übersetzt wird.
```
const state = {
    name: "Zeichnen / Schreiben",
    ...
```

Soll er übersetzt werden, kann im Feld "name" der Key für die Übersetzung des Namens eingegeben werden.
```
const state = {
    name: "common:menu.tools.draw",
    ...
```
## Übersetzungen in den addons


Die Sprachdateien befinden sich unter ./addons/{addon-Name}/locales/{language}/additional.json

Eine Übersetzung wird dann wie folgt implementiert:
```
i18next.t("additional:modules.tools.example.title"),

```
[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/addons/src/master/populationRequest/)

## Interessante Übersetzungsfunktionen von i18nxt

### Interpolation

Übergabe von Parametern.

Schlüssel
```
{
    "key": "{{what}} is {{how}}"
}
```
Beispiel
```
i18next.t('key', { what: 'i18next', how: 'great' });
// -> "i18next is great"
```
[Link](https://www.i18next.com/translation-function/interpolation#basic)

### Singular / Plural

Automatische Erkennung von Einzahl und Mehrzahl.

**Achtung**: Der Variablenname muss count heissen!

Schlüssel
```
{
  "key": "item",
  "key_plural": "items",
  "keyWithCount": "{{count}} item",
  "keyWithCount_plural": "{{count}} items"
}
```
Beispiel
```
i18next.t('key', {count: 0}); // -> "items"
i18next.t('key', {count: 1}); // -> "item"
i18next.t('key', {count: 5}); // -> "items"
i18next.t('key', {count: 100}); // -> "items"
i18next.t('keyWithCount', {count: 0}); // -> "0 items"
i18next.t('keyWithCount', {count: 1}); // -> "1 item"
i18next.t('keyWithCount', {count: 5}); // -> "5 items"
i18next.t('keyWithCount', {count: 100}); // -> "100 items"
```
[Link](https://www.i18next.com/translation-function/plurals#singular-plural)


### Verschachtelung

Andere Übersetzungs-Schlüssel in einer Übersetzung referenzieren.

Schlüssel
```
{
    "nesting1": "1 $t(nesting2)",
    "nesting2": "2 $t(nesting3)",
    "nesting3": "3",
}
```
Beispiel
```
i18next.t('nesting1'); // -> "1 2 3"
```
[Link](https://www.i18next.com/translation-function/nesting#basic)


### Formatierung

[Link](https://www.i18next.com/translation-function/formatting#formatting)

## Häufige Fehler

Du hast einen Übersetzungsschlüssel der Sprach-Datei hinzugefügt, aber was angezeigt wird, ist der Übersetzungsschlüssel selbst.
    Bitte überprüfe die korrekte Schreibweise des Schlüssels. i18next kann diesen Schlüssel weder in der ausgewählten Sprachdatei noch in der Fallback-Sprachdatei finden.

Du hast einen Übersetzungsschlüssel in der config.json gesetzt, aber es wird immer die Startsprache angezeigt, es wird nie die Sprache gewechselt.
    Hier ist zu prüfen, ob das Modul, das von diesem Teil der config.json gesteuert wird, so programmiert wurde, dass es auf die Übersetzung reagiert.
    Experte: Der Inhalt der config.json wird beim Start komplett übersetzt. Zur Übersetzung wird ab diesem Zeitpunkt die Übersetzungsfunktion i18nextTranslate verwendet. Wird sie nicht verwendet, bleibt der Inhalt auch bei einem Sprachwechsel erhalten.


## Wie man i18next in der Produktion verwendet Vue

Der folgende Abschnitt ist eine Anleitung, wie du i18next mit Vue in dein MP-Projekt integrieren kannst.

### Übersetzen im Template
Die Übersetzung der anzuzeigenden Werte kann direkt im Template einer Vue-Komponente vorgenommen werden. Dazu wird `$t()` verwendet. Im folgenden Beispiel wird das Attribute `name` übersetzt.

ExampleTemplate
```vue
<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
    >
</template>
```

### Übersetzen im Script
Zu Übersetung der Werte im Scriptteil einer Vue-Komponente muss dies in der computed property durchgeführt werden. Dazu wird `this.$t()` verwendet.

```js
 computed: {
    /**
    * Gets the exmaple attributes.
    * @returns {Object} The exmaple attributes.
    */
    example: function () {
        const example = {
            exampleTitle: this.$t("common:foo.bar.exampleTitle"),
            exampleText: this.$t("common:foo.bar.exampleText")
        };

        return example;
    },
 }
```

### Übersetzen in Unit-Tests

i18next bietet einen Testmodus für Unit-Tests.
Im Testmodus wird keine echte Übersetzung durchgeführt (es werden keine Dateien geladen).
Stattdessen antwortet i18next immer mit dem angegebenen Schlüssel.

Für Unit-Tests im Masterportal verwenden wir "Chai".
Wenn in einer Komponente i18next verendet wird, muss in dem zugehörigen Unit-test ein Mock erstellt werden.

```js
import {config} from "@vue/test-utils";
config.mocks.$t = key => key;
```


## Wie man i18next in der Produktion verwendet Backbone (Deprecated)

Der folgende Abschnitt ist eine Anleitung, wie du i18next mit MV* in dein MP-Projekt integrieren kannst.


### Übersetze dein Model

Um die Werte für dein Model mit i18next zu übersetzen, kannst du die Werte einfach mit der Übersetzungsfunktion von i18next übersetzen.
Durch das Horchen auf das Radio-Channel-Event "i18next#RadioTriggerLanguageChanged" kann das Model seine Übersetzungen während der Laufzeit ändern.

ExampleModel
```js
const ExampleModel = Backbone.Model.extend(/** @lends ExampleModel.prototype */ {
    defaults: {
        currentLng: "",
        exampleTitle: "",
        exampleText: ""
    },
    /**
     * @class ExampleModel
     * @extends Backbone.Model
     * @memberof Example
     * @constructs
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            currentLng: lng,
            exampleTitle: i18next.t("common:foo.bar.exampleTitle"),
            exampleText: i18next.t("common:foo.bar.exampleText")
        });
    }
});

export default ExampleModel;
```

#### Höre auf dein Model

Wenn die View richtig eingerichtet ist, sollte er auf Änderungen im Model hören und das Template bereits rendern.
Derzeit verwenden wir im Masterportal underscore für das Templating.
Um zu zeigen, wie dies geschehen SOLLTE, verwenden wir das Model von oben und setzen den MV* wie folgt auf.

ExampleTemplate
```html
<!DOCTYPE html>
<div class="title"><%= exampleTitle %></div>
<div class="text"><%= exampleText %></div>
```

ExampleView
```js
import ExampleTemplate from "text-loader!./template.html";
import ExampleModel from "./model";

const ExampleView = Backbone.View.extend(/** @lends ExampleView.prototype */{
    /**
     * @class ExampleView
     * @extends Backbone.View
     * @memberof Example
     * @constructs
     * @listens ExampleModel#changeExampleText
     */
    initialize: function () {
        this.model = new ExampleModel();

        this.listenTo(this.model, {
            "change:currentLng": this.render
        });

        this.render();
    },

    /**
     * renders the view
     * @param {ExampleModel} model the model of the view
     * @param {Boolean} value the values of the changes made to the model
     * @returns {Void}  -
     */
    render: function () {
        const template = _.template(ExampleTemplate),
            params = this.model.toJSON();

        this.$el.html(template(params));

        return this;
    }
});

export default ExampleView;
```

## Unit-Tests

i18next bietet einen Testmodus für Unit-Tests.
Im Testmodus wird keine echte Übersetzung durchgeführt (es werden keine Dateien geladen).
Stattdessen antwortet i18next immer mit dem angegebenen Schlüssel.

Für Unit-Tests im Masterportal verwenden wir "Chai".
Um i18next für den Unit-Test einzurichten, starten Sie den Test in Ihrem vorhergehenden Programm mit lng "cimode". Dadurch wird i18next in den Testmodus versetzt.


```
before(function () {
    i18next.init({
        lng: "cimode",
        debug: false
    });
    model = new Model();
});
```
