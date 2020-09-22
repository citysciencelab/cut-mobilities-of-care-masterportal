# Remote-Interface

Mithilfe des Remote-Interface können sämtliche Actions aller Vue Components ausgeführt werden. Weiterhin kann eine festgelge Auswahl von Funktionen genutzt werden.

## Generisches Remote-Interface für Vue-Actions
|Name|Typ|Beschreibung|
|----|---|------------|
|namespace|String|VueX Namespace der aufzurufenden Action|
|action|String|Name der aufzurufenden Action|
|args|Object|Parameter-Object für die Action|

#### Beispiel
Eine beliebige Vue Action kann wie folgt aufgerufen werden:

```js
const myIframe = document.getElementById("my-iframe");
myIframe.contentWindow.postMessage({
    namespace: "Name/Space/Of/VueX/Store",
    action: "nameOfAction",
    args: {
        "param1": "value1",
        "paramX": "valueX"
    }
});
```

Remote-Interface wird Folgendes aufrufen:

```js
store.dispatch("Name/Space/Of/VueX/Store/nameOfAction", {"param1": "value1", "paramX": "valueX"}, {root: true});

```

## Remote-Interface für spezifische Funktionen
Der im Parameter-Object von .postMessage() gewählte Key entspricht dem Namen der aufzurufenden Funktion. Der Value als Array entspricht den zu übergebenden Parametern.

|Name|Typ|Beschreibung|
|----|---|------------|
|nameOfFunction|Array|Parameter für die auszuführende Funktion|
|domain|String|Domain des Empfänger-Windows|


#### Beispiel
Eine spezifische Funktion kann wie folgt aufgerufen werden:

```js
const myIframe = document.getElementById("my-iframe");
myIframe.contentWindow.postMessage({nameOfFunction: "specificFunction", ["param1", "param2", "paramX"]}, domain);
```

### Liste Direkt aufrufbarer Funktionen
#### showPositionByExtent
Es wird ein Marker an die Zentrumskoordinate des übergebenen Extents gesetzt und die Karte auf diese Koordinate zentriert.

|Name|Typ|Beschreibung|
|----|---|------------|
|showPositionByExtent|Array|Extent, an dessen Zentrumskoordiante ein Marker gesetzt wird.|
|domain|String|Domain des Empfänger-Windows|

#### Beispiel

```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"showPositionByExtent": [xMin, yMin, xMax, yMax]}, domain);
```

#### showPositionByExtentNoScroll
Es wird ein Marker an die Zentrumskoordinate des übergebenen Extents gesetzt. Allerdings wird die Karte **nicht** auf diese Koordinate zentriert.

|Name|Typ|Beschreibung|
|----|---|------------|
|showPositionByExtentNoScroll|Array|Extent an dessen Zentrumskoordiante ein Marker gesetzt wird.|
|domain|String|Domain des Empfänger-Windows|

#### Beispiel
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"showPositionByExtentNoScroll": [xMin, yMin, xMax, yMax]}, domain);
```
#### transactFeatureById
Ein Feature eines gegebenen WFST-Layers wird modifiziert.

|Name|Typ|Beschreibung|
|----|---|------------|
|transactFeaturesById|String|Id des Features.|
|layerId|String|Id des Layers.|
|attributes|String|JSON mit den Attributes des Features.|
|mode|String|auszuführende Operation. Momentan nur "update" implementiert.|
|domain|String|Domain des Empfänger-Windows|

#### Beispiel
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"transactFeatureById": "id", "layerId": layerId, "attributes": attrs, "mode": "update"}, domain);
```

#### zoomToExtent
Die Karte wird auf den übergebenen Extent gezoomt.

|Name|Typ|Beschreibung|
|----|---|------------|
|zoomToExtent|Array|Extent.|
|domain|String|Domain des Empfänger-Windows|

#### Beispiel
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"zoomToExtent": [xmin, ymin, xmax, ymax]}, domain);
```

#### highlightfeature
Ein Vektor-Feature in der Karte wird hervorgehoben.

|Name|Typ|Beschreibung|
|----|---|------------|
|highlightfeature|String|LayerId und FeatureId in einem String per Komma separiert|
|domain|String|Domain des Empfänger-Windows|

#### Beispiel
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"highlightfeature": "layerid,featureId"}, domain);
```

#### hidePosition
Der Map-Marker wird versteckt.

|Name|Typ|Beschreibung|
|----|---|------------|
|hidePosition|String|"hidePosition". Dadurch wird der Marker versteckt.|
|domain|String|Domain des Empfänger-Windows|

#### Beispiel
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage("hidePosition", domain);
```

## Generisches Remote-Interface für Backbone Radio (Depricated)
Eine Möglichkeit, via postMessage direkt das Backbone-Radio des Masterportals anzusprechen ist, den Radio-Channel und die Funktion zu übergeben.

Achtung: Dieses Feature basiert auf Backbone-Radio, welches im gesamten Projekt als depricated gilt.

|Name|Typ|Beschreibung|
|----|---|------------|
|radio_channel|String|Der Radio-Channel, der angesprochen werden soll.|
|radio_function|String|Die Funktion des Radio-Channels, die angesprochen werden soll.|
|radio_para_object|Object|(optional) Ein Parameter-Objekt, das an die Radio-Funktion übergeben wird.|
|domain|String|Domain des Empfänger-Windows|

#### Beispiel
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"radio_channel": "MyRadioChannel", "radio_function": "myRequestedFunction", "radio_para_object": {"param1": "param1", "paramX": "paramX"}}, domain);
```

Remote-Interface wird Folgendes aufrufen:

```js
Radio.request("MyRadioChannel", "myRequestedFunction", {"param1": "param1", "paramX": "paramX"});
```

## Kommunikation vom Masterportal nach außen
So, wie vom Parent Window über den iframe Events *an* das Masterportal geschuckt werden können, ist es ebenfalls möglich, in die entgegengesetzte Richtung zu kommunizieren.

|Name|Typ|Beschreibung|
|----|---|------------|
|params|Object|Parameter als Object, welche an das Parent Window geschickt werden|

#### Beispiel

Innerhalb eines Vue Components:
```js
this.$remoteInterface.sendMessage({"param1": "param1", "paramX": "paramX"});
```

Innerhalb einer VueX Action:
```js
this._vm.$remoteInterface.sendMessage({"param1": "param1", "paramX": "paramX"});
```

Remote-Interface wird Folgendes aufrufen:
```js
parent.postMessage({"param1": "param1", "paramX": "paramX"}, options.postMessageUrl);
```

## Kommunikation vom Masterportal nach außen via Backbone Radio (depricated)
Ebensfalls noch möglich ist die Kommunikation über Backbone Radio.

|Name|Typ|Beschreibung|
|----|---|------------|
|params|Object|Parameter als Object, welche an das Parent Window geschickt werden|

#### Beispiel
```js
Radio.trigger("RemoteInterface", "postMessage", {"param1": "param1", "paramX": "paramX"});
```