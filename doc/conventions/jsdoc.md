**6. JSDoc**

6.1. Die Dokumentationssprache ist Englisch.

6.2. Zu Dokumentieren sind Models, Views und Collections.

6.3. Wird von einer Klasse geerbt, so ist folgendes anzugeben:
```javascript
/** @lends [Kindklasse].prototype */
```

Beispiel:
```javascript
    const AlertingModel = Backbone.Model.extend(/** @lends AlertingModel.prototype */{
```

6.4. Die Namespaces sind in der [namespaces.js](../../devtools/jsdoc/namespaces.js) zu definieren. Sie repräsentieren die Ordnerstruktur/Module des Codes.

Beispiel des Namespaces Alerting im Root:
```javascript
/**
 * @namespace Alerting
 * @description Alerting system that responds to given events.
 * Used to have same alert all over the portal.
 */
```

Beispiel des Namespaces Modellist als Unterordner des Core
```javascript
/**
 * @namespace ModelList
 * @memberOf Core
 * @description List module to gather all item models
 */
```


6.5. Die Events sind in der [events.js](../../devtools/jsdoc/events.js) zu definieren.

Beispiel: Radio.trigger("Channel", "Event")
```javascript
/**
 * @event Namespace#RadioTriggerChannelEvent
 * @description FooBar.
 * @example Radio.trigger("Channel", "Event")
 */
```

Beispiel: Radio.trigger("Channel", "EventWithData", data)
```javascript
/**
 * @event Namespace#RadioTriggerChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @example Radio.trigger("Channel", "Event", data)
 */
```

Beispiel: Radio.request("Channel", "Event");
```javascript
/**
 * @event Namespace#RadioRequestChannelEvent
 * @description FooBar.
 * @returns {*} - Response of this event
 * @example Radio.request("Channel", "Event")
 */
```

Beispiel: Radio.request("Channel", "EventWithData", data);
```javascript
/**
 * @event Namespace#RadioRequestChannelEventWithData
 * @description FooBar.
 * @param {*} data Data to be sent with the event
 * @returns {*} - Response of this evennt
 * @example Radio.request("Channel", "Event", data)
 */
```

Beispiel: Model.trigger("myTrigger");
```javascript
/**
 * @event Namespace#MyTrigger
 * @description FooBar.
 */
 ```

 Beispiel: Model.trigger("myTriggerWithData", data);
 ```javascript
/**
 * @event Namespace#MyTriggerWithData
 * @param {*} data Data to be sent with the event
 * @description FooBar.
 */
```

Beispiel: this.listenTo(this, {
    "change:attributeOne": this.doSomething
})
```javascript
/**
 * @event Namespace#changeAttributeOne
 * @description FooBar.
 */
```

Beispiel: Innerhalb von verschachtelten Namespaces;
 ```javascript
/**
 * @event Core.ModelList.Layer#changeIsSelected
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isSelected has changed
 */
```

6.6. Jedes Event ist in folgender Schreibweise dem Namespace des entsprechenden Moduls zuzuordnen:

[Namespace]#[Eventname]

Beispiel eines Events, das zum Namespace "Alerting" gehört:
```js
/**
 * @event Alerting#RadioTriggerAlertAlert
 * @param {String/Object} alert The alert object or string needed to create the alert.
 * @example Radio.trigger("Alert", "alert", alert)
 */
```


6.7. Die Klassendefinition kommt über die *initialize*-Funktion mit Angabe der Default-Werte. Alle Event-Listener, -Trigger und -Requests, die in der Klasse vorkommen, werden ebenfalls in der Klassendefinition dokumentiert.

Beispiel:

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

6.8. Für jede Funktion ist ein JSDoc zu erzeugen mit einer Beschreibung, Übergabeparametern, Rückgabewert und ggf. Events.

Beispiel:

```javascript
/**
* FooBar
* @returns {Void}
*/
functionWithoutParamsAndNoReturn: function () {
    ...
}
```

```javascript
/**
* BarFoo
* @param {String} param1 InputString.
* @returns {String}  - ConcatenatedString
*/
functionWithParamsAndReturn: function (param1) {
    return param1 + "foobar";
}
```

6.9. Werden Templates verwendet, sind diese im View an der Stelle zu definieren, wo das Template instanziiert wird.

Beispiel:
```javascript
/**
 * @member AlertingTemplate
 * @description Template used to create the alert message
 * @memberof Alerting
 */
template: _.template(AlertingTemplate),
```

6.10. Der Bauprozess zur Generierung des JSDoc (npm run buildJsDoc) muss fehlerfrei durchlaufen.
