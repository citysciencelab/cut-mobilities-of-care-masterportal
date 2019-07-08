**6. JSDoc**

6.1. Die Dokumentationssprache ist Englisch.

6.2. Zu Dokumentieren sind Models, Views und Collections.

6.3. Wird von einer Klasse geerbt, so ist folgendes anzugeben:
```javascript
/** @lends [Kindklasse].prototype */
```

6.4. Die Namespaces sind in der [namespaces.js](../../devtools/jsdoc/namespaces.js) zu definieren. Sie repräsentieren die Ordnerstruktur/Module des Codes.

6.5. Die Events sind in der [events.js](../../devtools/jsdoc/events.js) zu definieren.

6.6. Jedes Event ist ein *@memberof* des entsprechendes Namespaces/Moduls.

6.5. Alle Event-Listener, -Trigger und -Requests, die in der Klasse vorkommen, werden in der Klassendefinition dokumentiert.

6.4. Die Klassendefinition kommt über die *initialize*-Funktion mit Angabe der Default-Werte.

6.6. Für jede Funktion ist ein JSDoc zu erzeugen mit einer Beschreibung, *param*, *returns* und ggf. *listens* und *fires*.

6.7.


namespace analog zu ordner
namespaces definieren und angeben
events in event.js dokumentieren
events am modul definieren (member of [namespace]).
template in view.js dokumentieren.
JSDOC muss im gebauten zustand (npm run buildJsDoc) an der richtigen Stelle sein.


#### Kommentare / JSDOC: Bei Refactorings/Erweiterungen ist pro Datei mindestens folgendes auszuführen:
* Klasse und Namespace im JSDoc beschreiben, falls noch nciht vorhanden
* Die refactorten/erweiterten Funktionen per JSDoc beschreiben
* Übrige Funktionen beschreiben oder mit einem JSDoc-Todo markieren, damit alle Funktionen schonmal im JSDoc sind!

```javascript
/**
* todo
* @returns {*} todo
*/
functionWithoutParams: function () {...}
```

```javascript
/**
* todo
* @param {*} param1 todo
* @returns {*} todo
*/
functionWithParams: function (param1) {...}
```
### Kommentare / JSDOC: Events
Folgende Code-Convention gilt für das Dokumentieren von Events

* Events werden in CamelCase geschrieben.
* Events sollten nach Möglichkeit im Namespace (Modulname) definiert werden.
* Ist dies nicht möglich, so ist das Event an die Klasse zu hängen
* Alle Events werden in der devtool/jsdoc/events.js beschrieben

Event Radio.Trigger
```javascript
Radio.trigger("Channel", "Event")
/**
 * @event Namespace#RadioTriggerChannelEvent
 * @description FooBar.
 * @example Radio.trigger("Channel", "Event")
 */

Radio.trigger("Channel", "EventWithData", data)
/**
 * @event Namespace#RadioTriggerChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @example Radio.trigger("Channel", "Event", data)
 */
```

Event Radio.Request
```javascript
Radio.request("Channel", "Event");
/**
 * @event Namespace#RadioRequestChannelEvent
 * @description FooBar.
 * @returns {*} - Response of this event
 * @example Radio.request("Channel", "Event")
 */

Radio.request("Channel", "EventWithData", data);
/**
 * @event Namespace#RadioRequestChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @returns {*} - Response of this evennt
 * @example Radio.request("Channel", "Event", data)
 */
```

Event Model.trigger
```javascript
Model.trigger("myTrigger");
/**
 * @event Namespace#MyTrigger
 * @description FooBar.
 */

Model.trigger("myTriggerWithData", data);
/**
 * @event Namespace#MyTriggerWithData
 * @param {*} data Data to be sent with the event
 * @description FooBar.
 */
```

Event Model.change
```javascript
this.listenTo(this, {
    "change:attributeOne": this.doSomething
})
/**
 * @event Namespace#changeAttributeOne
 * @description FooBar.
 */
```
