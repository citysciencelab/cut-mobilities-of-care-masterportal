Die Kommunikationsschnittstelle (Remote-Interface) bietet Zugriff auf festgelegte Events und Funktionen in unterschiedlichen Modulen. Sie ist mit [Backbone.Radio](https://github.com/marionettejs/backbone.radio) umgesetzt. Backbone.Radio wird als Radio in den globalen Namespace importiert.

Die Kommunikationsschnittstelle kann erst verwendet werden, wenn alle notwendigen Module geladen sind. Hierfür wird per window.postMessage() ein MessageEvent bereitgestellt, auf das sich wie folgt registriert werden kann:

```
#!js
window.addEventListener("message", function (messageEvent) {
      if (messageEvent.data === "portalReady") {
         Radio.request("RemoteInterface", "getZoomLevel");
      }
}, false);

```

Eine vollständige Auflistung aller Events erfolgt nachfolgend. Die Syntax unterscheidet sich zwischen *Triggern* zum Verändern von Kartenzuständen und Auslösen von Operationen, *Requests* zum Abfragen von Kartenzuständen und *Events*, auf die sich registriert werden kann. Sie ist nachfolgend beschrieben.


**Syntax Trigger**
```
#!js
Radio.trigger("RemoteInterface", eventName [, parameter])
```

**Syntax Request**
```
#!js
Radio.request("RemoteInterface", eventName);
```

**Syntax Event**
```
Radio.on("RemoteInterface", eventName, function (eventObject) {
   console.log(eventObject);
});

Radio.once("RemoteInterface", eventName, function (eventObject) {
   console.log(eventObject);
});
```

---
**Inhaltsverzeichnis:**

[TOC]

---
# **RemoteHost**

Über die hier genannten Aufrufe kann das Masterportal, sofern es als iFrame eingebunden ist, mit dem parentObject kommunizieren.

## Nachricht senden
*(postMessage)*

Sendet eine Nachricht an das parent-Object über postMessage-API.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|content|Object|der zu sendende Content.|

**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "postMessage", {...});
```

---
# **Karte**

Über die hier genannten Aufrufe können bestimmte Kartenzustände gesetzt oder abgefragt werden und die Sichtbarkeit von Layern verändert werden.

## URL der aktuellen View zurückgeben
*(getMapState)*

Gibt die parametrisierte URL zurück, mit der die aktuelle Ausprägung der Karte mit dargestellten Layern und deren Sichtbarkeit und Transparenz zentriert und im selben Maßstab geöffnet werden kann.


**Returns** *URL* String


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getMapState");
```

## BoundingBox WGS84 abfragen
*(getWGS84MapSizeBBOX)*

Gibt den aktuellen Extent (BoundingBox) der Karte im WGS84 zurück.


**Returns** *[Rechtswert Min, Hochwert Max, Rechtswert Max, Hochwert Min]* (Array mit Rechts- und Hochwerten)


**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "getWGS84MapSizeBBOX");
```

## Setzt die View der Map zurück
*(resetView)*

Zoomt die View der Map auf den Ausgangsmaßstab und -ausschnitt und entfernt den MapMarker.

**Beispiel-Aufruf**
```
#!js
Radio.request("RemoteInterface", "resetView");
```

## Übernimmt Attribute an einen Layer
*(setModelAttributesById)*

Übernimmt das attributes-Object an speziellen Layer.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|id|String|LayerID des Layers, dem Attribute zegeordnet werden.|
|attributes|Object|Attribute|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "setModelAttributesById", {...});
```

---
# **Vektorfeatures**

Über die hier genannten Aufrufe können spezielle Methoden und Funktionen für Vektorfeatures aufgerufen werden.

## Zeige alle Features in speziellem Layer
*(showAllFeatures)*

Zeigt alle Vektorfeatures des genannten Layers an.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|String|Layername mit den Vektorfeatures|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showAllFeatures", "Anliegen");
```

## Zeige spezielle Features in speziellem Layer
*(showFeaturesById)*

Zeigt alle Vektorfeatures des genannten Layers an.

**Parameter**

|Name|Typ|Beschreibung|
|----|---|------------|
|value|String|Layername mit den Vektorfeatures|
|featureIds|[id]|Array mit FeautureIDs|


**Beispiel-Aufruf**
```
#!js
Radio.trigger("RemoteInterface", "showFeaturesById", "Anliegen", ["1", "2"]);
```
