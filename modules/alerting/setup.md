### Alerting
Dieses Modul setzt und entfernt MessageBoxes in Form von Bootstrap-Alerts.

#### Erzeugen eines Alerts
Alerts werden über Radio getriggert.

```javascript
Radio.trigger("Alert", "alert", "Ich bin ein Hinweis");

Radio.trigger("Alert", "alert", {
    id: id,
    text: "Ich lese gerne <a href='https://www.abendblatt.de' target='_blank' class='alert-link'>Zeitung</a>.",
    kategorie: "alert-info",
    position: "center-center"
});
```
#####Entsprechend der genannten Syntax können folgende Parameter überschrieben werden:

|Name|Verpflichtend|Typ|Default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|id|nein|String|random|Setzt spezielle ID ans div.||
|kategorie|nein|String|"alert-info"|Bestimmt das Layout des Bootstrap-Alerts.|Siehe [Bootstrap](https://getbootstrap.com/docs/3.3/components/#alerts)|
|dismissable|nein|Boolean|true|Legt fest, ob der Alarm weggeklickt werden kann.|[true | false]|
|position|nein|String|"top-center"|Positioniert die Alerts über css-Klassen.|[top-center | center-center]|

#### Schließen eines speziellen Alerts
Einzelne Alerts, die mit

```javascript
dismissable: true
```

erzeugt wurden, können über das X weggeklickt werden.

Dies lößt ein Trigger-Event vom Alert aus. Auf dieses kann wie folgt gehört werden:

```javascript
Radio.once("Alert", {
    "closed": function (divId) {
        console.log(divId + " wurde geschlossen.");
    }
}, this);
```

#### Entfernen aller Alerts
Über folgenden Trigger können alle geöffneten Alerts wieder geschlossen werden.

```javascript
Radio.trigger("Alert", "alert:remove");
```
