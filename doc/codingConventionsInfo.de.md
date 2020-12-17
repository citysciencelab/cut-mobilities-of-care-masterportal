# Weitere Informationen zu den Coding-Konventions

Es folgen - falls vorhanden - Erläuterungen und Beispiele zu den jeweiligen Punkten aus [codingConventions.md](./codingConventions.md).

---

### Teil A

#### A.1.6
Derzeit ist Babel nicht in der Lage, TPL Dateien zu übersetzen und Internet Explorer unterstützt keine Pfeil-Funktionen.

---

#### A.4.1
Weitere Infos bezüglich Vue befinden sich [hier](./conventions/vue.md).

---

#### A.4.3
*Beispiel des JSDoc zweier Funktionen*
```javascript
/**
* This function does some things that are explained right here.
* @returns {Void}
*/
functionWithoutParamsAndNoReturn: function () {
    ...
}
```

```javascript
/**
* This function does some things that are explained right here.
* @param {String} param1 InputString.
* @returns {String}  - ConcatenatedString
*/
functionWithParamsAndReturn: function (param1) {
    return param1 + "foobar";
}
```

---

#### A.4.4
*Beispiel einer initialize() Funktion*
```javascript
defaults: {
        channel: Radio.channel("Alert"),
        category: "alert-info",
        isDismissable: true,
        isConfirmable: false,
        position: "top-center",
        message: "",
        animation: false
    },

/**
 * @class AlertingModel
 * @extends Backbone.Model
 * @memberof Alerting
 * @constructs
 * @property {Radio.channel} channel=Radio.channel("Alert") Radio channel for communication
 * @property {String} category="alert-info" Category of alert. bootstrap css class
 * @property {Boolean} isDismissable=true Flag if alert has a dismissable button
 * @property {Boolean} isConfirmable=false Flag if alert has to be confirmed to close
 * @property {String} position="top-center" The positioning of the alert. Possible values "top-center", "center-center"
 * @property {String} message="" The message of the alert
 * @property {Boolean} animation=false Flag if Alert is animated by means of fading out
 * @fires Alerting#render
 * @fires Alerting#changePosition
 * @listens Alerting#RadioTriggerAlertAlert
 */
initialize: function () {
    this.listenTo(this.get("channel"), {
        "alert": this.setParams
    }, this);
},
```

*Beispiel einer Instanziierung eines Templates:*
```javascript
/**
 * @member AlertingTemplate
 * @description Template used to create the alert message
 * @memberof Alerting
 */
template: _.template(AlertingTemplate),
```

---

#### A.4.5
*Kommentar bei Vererbung*
```javascript
    const AlertingModel = Backbone.Model.extend(/** @lends AlertingModel.prototype */{
```

---

#### A.4.6
*Definition von Namespaces:*
*Beispiel des Namespaces Alerting in Root:*
```javascript
/**
 * @namespace Alerting
 * @description Alerting system that responds to given events.
 * Used to have same alert all over the portal.
 */
```

*Beispiel des Namespaces Modellist als Unterordner des Core:*
```javascript
/**
 * @namespace ModelList
 * @memberof Core
 * @description List module to gather all item models
 */
```

*Beispiel: Innerhalb von verschachtelten Namespaces:*
```javascript
/**
 * @event Core.ModelList.Layer#changeIsSelected
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isSelected has changed
 */
```

*Beispiel mit Namespace eines Moduls:*
*Beispiel eines Events, das zum Namespace "Alerting" gehört:*
```javascript
/**
 * @event Alerting#RadioTriggerAlertAlert
 * @param {String/Object} alert The alert object or string needed to create the alert.
 * @example Radio.trigger("Alert", "alert", alert)
 */
```

---

#### A.4.7
*Definition von Events:*
*Beispiel: Radio.trigger("Channel", "Event");*
```javascript
/**
 * @event Namespace#RadioTriggerChannelEvent
 * @description FooBar.
 * @example Radio.trigger("Channel", "Event")
 */
```

*Beispiel: Radio.trigger("Channel", "EventWithData", data);*
```javascript
/**
 * @event Namespace#RadioTriggerChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @example Radio.trigger("Channel", "Event", data)
 */
```

*Beispiel: Radio.request("Channel", "Event");*
```javascript
/**
 * @event Namespace#RadioRequestChannelEvent
 * @description FooBar.
 * @returns {*} - Response of this event
 * @example Radio.request("Channel", "Event")
 */
```

*Beispiel: Radio.request("Channel", "EventWithData", data);*
```javascript
/**
 * @event Namespace#RadioRequestChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @returns {*} - Response of this evennt
 * @example Radio.request("Channel", "Event", data)
 */
```

*Beispiel: Model.trigger("myTrigger");*
```javascript
/**
 * @event Namespace#MyTrigger
 * @description FooBar.
 */
```

*Beispiel: Model.trigger("myTriggerWithData", data);*
```javascript
/**
 * @event Namespace#MyTriggerWithData
 * @param {*} data Data to be sent with the event
 * @description FooBar.
 */
```

*Beispiel: this.listenTo(this, {
    "change:attributeOne": this.doSomething
});*
```javascript
/**
 * @event Namespace#changeAttributeOne
 * @description FooBar.
 */
```

---

#### A.5.1
*Beispiele einer testbaren und einer nicht testbaren Funktion*
```javascript
function testbareFunktion (uebergabeParameter) {
    let rueckgabeParameter = "Hello " + uebergabeParameter;

    return rueckgabeParameter
}

const arr = [];
function nichtTestbareFunktion (param) {
    setTimeout(() => {
        arr.push(param);
    }, 1000);
}

```

---

#### A.5.2
Weitere Informationen zu Unit-Tests [hier](./unittestingVue.md).

Zum Testen werden die Bibliotheken **[Chai](https://www.chaijs.com/)** und **[Mocha](https://mochajs.org/)** verwendet.

---

#### A.6.2
Erweitere die Dokumentation in den .md-Dateien wie im Folgenden beschrieben:
a) Erweitere die **[config.js.md](./config.js.md)**, wenn du neue Konfigurationsparameter erzeugt hast die sich nicht auf die Portal-Oberfläche oder die dargestellten Layer beziehen oder wenn du Erweiterungen/Anpassungen der vorhandenen Parameter vorgenommen hast.
b) Erweitere die **[config.json.md](./config.json.md)**, wenn du neue Konfigurationsparameter für die Portaloberfläche erzeugt hast oder wenn du Erweiterungen/Anpassungen der vorhandenen Parameter vorgenommen hast.
c) Es werden immer die folgenden Parameter in der Dokumentation für die Konfigurationsparameter befüllt:
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
"Expert" gibt es nur in der config.json.
d) Ein Parameter endet in der .md Datei immer mit einer horizontalen Trennlinie.
e) Je nach Verschachtelung des Parameters wird die Überschrift ausgewählt. Auf der obersten Ebene mit # darunter mit ##.
f) Konfigurationsparameter die ein Objekt sind und selber weitere Parameter enthalten werden in einem eigenen Bereich einzeln beschrieben und verlinkt.
g) Bei komplexen Konfigurationsparametern ist eine Beispielkonfiguration gefordert.
h) Erweitere ebenso die Dateien **[services.json.md](./services.json.md)**, **[rest-services.json.md](./rest-services.json.md)** und **[style.json.md](./style.json.md)**, wenn du für diese globalen Konfigurationsdateien neue Parameter benötigst/verwendest.


*Verschachtelung in .json wird mit der Anzahl von # dargestellt:*
```
    # config.json
    .
    .
    .

    ## Portalconfig
```

*8.3.6 - Parameter sind verschachtelt, wenn sie selber ein Objekt sind*
```
    ## Portalconfig
    |Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
    |----|-------------|---|-------|------------|------|
    |controls|nein|[controls](#markdown-header-portalconfigcontrols)||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
    ***

    ### Portalconfig.controls

```

*8.3.7 - Beispiel einer komplexen Beispielkonfiguration*
```
    "osm": {
        "minChars": 3,
        "serviceId": "10",
        "limit": 60,
        "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
        "classes": "place,highway,building,shop,historic,leisure,city,county"
    }
```

---

#### A.6.4
Bei Veränderung/Refactoring/Löschen eines Parameters:
a) Markiere den Parameter in der Doku mit "Deprecated in [nächstes Major-Release]".
b) Markiere den Code für den alten Parameter mit "@deprecated in [nächstes Major-Release]" im JSDoc.

*Beispiel Änderung eines Parameters:*
*Beispiel des deprecated Parameters "Baumtyp" in der config.json.md:*
```markdown
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Baumtyp|nein|enum["light", "default", "custom"]|"light"|Deprecated in 3.0.0 Bitte Attribut "treeType" verwenden.|false|
```

*Beispiel des deprecated Parameter "Baumtyp" im Code:*
```javascript
/**
* this.updateTreeType
* @deprecated in 3.0.0
*/
attributes = this.updateTreeType(attributes, response);
...
/**
 * Update the preparsed treeType from attributes to be downward compatible.
 * @param {Object} attributes Preparased portalconfig attributes.
 * @param {Object} response  Config from config.json.
 * @returns {Object} - Attributes with mapped treeType
 * @deprecated in 3.0.0. Remove whole function and call!
 */
updateTreeType: function (attributes, response) {
    if (response.Portalconfig.treeType !== undefined) {
        attributes.treeType = response.Portalconfig.treeType;
    }
    else if (response.Portalconfig.Baumtyp !== undefined) {
        attributes.treeType = response.Portalconfig.Baumtyp;
        console.warn("Attribute 'Baumtyp' is deprecated. Please use 'treeType' instead.");
    }
    else {
        attributes.treeType = "light";
    }
    return attributes;
},
```

---

#### A.7.1
Es wird die Bibliothek [i18next](https://www.i18next.com/) verwendet.

---

#### A.8.3
Weitere Informationen zur Versionierung [hier](./Versionierung.md).
Schreibe für jeden Pull request einen Eintrag im [CHANGELOG](../CHANGELOG.md) unter dem Punkt Unreleased. Vermeide Fachjargon. Der Changelog soll die NutzerIn und EntwicklerIn informieren.

---

### Teil B (optional)

#### B.3.1
```
import state from "./state";
import {generateSimpleMutations} from "~generators";

const mutations = {
    ...generateSimpleMutations(state),
```

----

#### B.4.2
* [mapState](https://vuex.vuejs.org/guide/state.html#the-mapstate-helper)
* [mapGetters](https://vuex.vuejs.org/guide/getters.html#the-mapgetters-helper)
* [mapMutations](https://vuex.vuejs.org/guide/mutations.html#committing-mutations-in-components)
* [mapActions](https://vuex.vuejs.org/guide/actions.html#dispatching-actions-in-components)

---

#### B.5.4
```
<style lang="less" scoped>
    @import "~variables";
</style>
```

---

#### B.6
*Beispiel mit einfachem Text:*
```javascript
    import store from "masterportal/src/app-store/index";
    store.dispatch("Alerting/addSingleAlert", "My First Alert Message.");
```

*Beispiele von Fehlermeldungen:*
Negativ-Beispiel: "CSW-Request fehlgeschlagen".
Positiv-Beispiel: "Die weiteren Informationen zu Themen konnten nicht geladen werden."

Negativ-Beispiel: "Sie haben das Passwort vergessen".
Positiv-Beispiel: "Bitte geben sie ihr Passwort an".
