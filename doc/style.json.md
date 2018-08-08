>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

# style.json #
Die *style.json* beinhaltet die Parameter für die Vektor-Features (WFS und Sensor). Die Verbindung zwischen den Layern und der *style.json* erfolgt über die Angabe der *Layer-ID* in der *style.json* und entsprechendem Verweis in der [config.json](config.json.md) im Bereich *Themenconfig --> Fachdaten*. Sollten in der *style.json* nicht alle notwendigen Parameter angegeben sein, wird auf die Default-Werte zurückgegriffen. Bei Farbwerten muss der Parameter entsprechend der Vorgabe von *OpenLayers* für *ol.style* aussehen.

## Allgemeine Style Parameter ##
Beim Stylen der Vektor-Features (WFS und Sensor) gibt es verschiedene Klassen nach denen wir den Style in der *style.json* unterscheiden.
Wird in der [config.json](config.json.md) in der Layerconfiguration der Parameter "clusterDistance" gesetzt, so wird ein ClusterStyle erzeugt. Der ClusterStyle ist abhängig vom Parameter "clusterClass".

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerId|ja|String||ID des Styles, der in der [config.json](config.json.md) angegeben wird, um entsprechend zugeordnet zu werden. In der Regel gleiche ID, wie die des Layers.|
|class|ja|String|"POINT"|Angabe der entsprechenden Klasse, entspricht dem Geometrietyp. Mögliche Werte: "POINT", "LINE",  "POLYGON".|
|subClass|ja|String|"SIMPLE"|Angabe der entsprechenden SubKlasse, nach der die Style-Information verwendet werden soll. Mögliche Werte bei "POINT": "SIMPLE", "CUSTOM", "CIRCLE", "ADVANCED". Mögliche Werte bei "LINE": "SIMPLE". Mögliche Werte bei "POLYGON": "SIMPLE", "CUSTOM"|
|labelField|nein|String||Attribut des Features, nach dessen Wert das Label angezeigt werden soll.|
|textAlign|nein|String|"left"|Ausrichtung des Textes am Feature. Mögliche Werte "left", "center", "right"|
|textFont|nein|String|"Courier"|Font des Textes am Feature.|
|textScale|nein|Integer|1|Skalierung des Textes.|
|textOffsetX|nein|Integer|0|Offset des Textes in X-Richtung.|
|textOffsetY|nein|Integer|0|Offset des Textes in Y-Richtung.|
|textFillColor|nein|Array [Integer]|[255, 255, 255, 1]|Füllfarbe des Textes in rgba.|
|textStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Randfarbe des Textes in rgba.|
|textStrokeWidth|nein|Integer|3|Breite der Textstriche.|
|clusterClass|nein|String|"CIRCLE"|Angabe der entsprechenden Cluster Klasse nach der ein ClusterStyle gesetzt werden soll. Mögliche Werte "SIMPLE", "CIRCLE".|
|clusterCircleRadius|nein|Integer|10|Radius des Kreises als Clusterstyle.|
|clusterCircleFillColor|nein|Array [Integer]|[0, 153, 255, 1]|Füllfarbe des Kreises als Clusterstyle.|
|clusterCircleStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Randfarbe des Kreises als Clusterstyle.|
|clusterCircleStrokeWidth|nein|Integer|2|Randstärke des Kreises als Clusterstyle.|
|clusterImageName|nein|String|"blank.png"|Name des Images als Clusterstyle.|
|clusterImageWidth|nein|Integer|1|Breite des Images als Clusterstyle.|
|clusterImageHeight|nein|Integer|1|Höhe des Images als Clusterstyle.|
|clusterImageScale|nein|Integer|1|Skalierung des Images als Clusterstyle.|
|clusterImageOffsetX|nein|Float|0.5|Offset des Images als Clusterstyle in X-Richtung.|
|clusterImageOffsetY|nein|Float|0.5|Offset des Images als Clusterstyle in Y-Richtung.|
|clusterTextAlign|nein|String|"left"|Ausrichtung des Textes am Feature. Mögliche Werte "left", "center", "right". Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextFont|nein|String|"Courier"|Font des Textes am Feature Bei geclusterten Features siehe [config.json](config.json.md).|
|clusterTextScale|nein|Integer|1|Skalierung des Textes. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextOffsetX|nein|Integer|0|Offset des Textes in X-Richtung. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextOffsetY|nein|Integer|0|Offset des Textes in Y-Richtung. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextFillColor|nein|Array [Integer]|[255, 255, 255, 1]|Füllfarbe des Textes in rgba. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Randfarbe des Textes in rgba. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextStrokeWidth|nein|Integer|3|Breite der Textstriche. Bei geclusterten Features siehe [config.json](config.json.md)|


## Spezielle Parameter ##
Einige Parameter sind nur bei bestimmten Kombinationen von "class" und "subClass" notwendig.
So gibt es folgende Kombinationen:

[POINT SIMPLE](#markdown-header-point-simple)

[POINT CUSTOM](#markdown-header-point-custom)

[POINT CIRCLE](#markdown-header-point-circle)

[POINT ADVANCED](#markdown-header-point-advanced)

[LINE SIMPLE](#markdown-header-line-simple)

[POLYGON SIMPLE](#markdown-header-polygon-simple)

[POLYGON CUSTOM](#markdown-header-polygon-custom)

#### POINT SIMPLE ####
Bei "class"=== "POINT" und "subClass" === "SIMPLE" wird nur ein Image für alle Features gesetzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|imageName|ja|String| "blank.png"|Name des Images.|
|imageWidth|nein|String|1|Breite des Images.|
|imageHeight|nein|String|1|Höhe des Images.|
|imageScale|nein|String|1|Skalierung des Bildes.|
|imageOffsetX|nein|Float|0.5|Offset des Bildes in X-Richtung.|
|imageOffsetY|nein|Float|0.5|Offset des Bildes in Y-Richtung.|

#### POINT CUSTOM ####
Bei "class"=== "POINT" und "subClass" === "CUSTOM" wird jedem Feature, abhänhig von einem gegebenen Attributwert, das Image gesetzt. Es können alle Attribute aus [POINT SIMPLE](#markdown-header-point-simple) gesetzt werden. Diese dienen dann als defaults, falls styleFieldValues keine entsprechenden Parameter gegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|styleField|ja|String||Attribut des Features, nach dessen Wert das Icon gesetzt wird.|
|styleFieldValues|ja|Array [[styleFieldValue](#markdown-header-styleFieldValue)]||Object für Attributwert, das den Custom Style setzt .|

```json
{
    "layerId": "2060",
    "class": "POINT",
    "subClass": "CUSTOM",
    "imageOffsetX": 0.50,
    "imageOffsetY": 0.50,
    "styleField": "kategorie",
    "styleFieldValues": [
      {
        "styleFieldValue":"Brunnen",
        "imageName": "brunnen_10.png",
        "imageScale": "0.5"
      },
      {
        "styleFieldValue":"Wasserbauobjekt",
        "imageName": "wasserbauobjekt_10.png",
        "imageScale": "0.5"
      },
      {
        "styleFieldValue":"Brack",
        "imageName": "brack_10.png",
        "imageScale": "0.5"
      },
      {
        "styleFieldValue":"See",
        "imageName": "see_10.png",
        "imageScale": "0.5"
      },
      {
        "styleFieldValue":"Gewässer",
        "imageName": "gewaesser_10.png",
        "imageScale": "0.5"
      }
    ]
  }
```

#### styleFieldValue ####
Objekt das für einen Attributwert das entsprechend angegebene Icon setzt. Werden die optionalen Parameter nicht gesetzt, so werden die Parameter des [Style-Objekts](#markdown-header-point-custom) verwendet oder deren Defaults.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|styleFieldValue|ja|String||Attributwert.|
|imageName|ja|String||Name des Images.|
|imageWidth|nein|String||Breite des Images.|
|imageHeight|nein|String||Höhe des Images.|
|imageScale|nein|String||Skalierung des Bildes.|
|imageOffsetX|nein|String||Offset des Bildes in X-Richtung.|
|imageOffsetY|nein|String||Offset des Bildes in Y-Richtung.|

### POINT CIRCLE ###
Bei "class"=== "POINT" und "subClass" === "CIRCLE" wird jedem Feature, anstelle eines Images, ein Kreis gesetzt. Cluster-Attribute können gesetzt werden wie in [POINT SIMPLE](#markdown-header-point-simple) zu sehen. Label-Attribute können gesetzt werden wie in [Allgemeine Style Parameter](#markdown-header-allgemeine-style-parameter) zu sehen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|circleRadius|nein|Integer|10|Radius des Kreises.|
|circleStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Farbe des Kreisrandes in rgba.|
|circleStrokeWidth|nein|Integer|2|Breite des Kreisrandes.|
|circleFillColor|nein|Array [Integer]|[0, 153, 255, 1]|Farbe der Kreisfüllung in rgba.|

### POINT ADVANCED ###
Bei "class"=== "POINT" und "subClass" === "ADVANCED" wird für jedes Feature ein dynamischer Style gesetzt. Diese werden mit den Parametern "scaling" und "scalingShape" in konkrete Styles unterschieden. Dieser Style unterstützt die automatisierte Aktualisierung von Sensor-Features.
Cluster-Attribute können gesetzt werden wie in [POINT SIMPLE](#markdown-header-point-simple) zu sehen. Label-Attribute können gesetzt werden wie in [Allgemeine Style Parameter](#markdown-header-allgemeine-style-parameter) zu sehen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|scaling|ja|String||Angabe welchem Skalenniveau die Daten entsprechen. Mögliche Werte sind "INTERVAL" für Zahlendaten die eine natürliche Reihenfolge haben (z.B. in der Einheit Meter, oder Grad Celsius) oder "NOMINAL" für Daten die sich nicht in eine reihenfolge bringen lassen (z.B. Farben oder Formen)|
|scalingShape|ja|String||Angabe der Darstellungsart. Möglicher Wert bei "INTERVAL": "[CIRCLE_BAR](#markdown-header-CIRCLE_BAR)". Möglicher Wert bei "NOMINAL": "[CIRCLESEGMENTS](#markdown-header-CIRCLESEGMENTS)".|

```json
{
    "layerId" : "999999",
    "class": "POINT",
    "subClass" : "ADVANCED",
    "scaling" : "NOMINAL",
    "scalingShape" : "CIRCLESEGMENTS",
    "scalingAttribute" : "state",
    "scalingValues" : {
       "charging" : [220, 0, 0, 1],
       "available" : [0, 220, 0, 1],
       "outoforder" : [175, 175, 175, 1]
    },
    "scalingValueDefaultColor" : [0, 0, 0, 1],
    "circleSegmentsRadius" : 21,
    "circleSegmentsStrokeWidth" : 3,
    "circleSegmentsGap" : 10,
    "circleSegmentsBackgroundColor" : [255, 255, 255, 1]
  }
```

### CIRCLE_BAR ###
Bei "class"=== "POINT", "subClass" === "ADVANCED", "scaling"="INTERVAL" und "scalingShape"="CIRCLE_BAR" wird für jedes Feature ein Punkt von dem aus ein Balken in vertikale Richtung abgeht. Der Punkt stellt den Ort des Features dar. Die Länge des Balkens repräsentiert den Attributwert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|scalingAttribute|ja|String||Attribut das zur Darstellung verwendet werden soll|
|circleBarScalingFactor|nein|Float|1|Faktor um den Attributwert zu überhöhen. Notwenidg bei sehr großen (positiven oder negativen Werten) und bei Werten nahe 0.|
|circleBarRadius|nein|Float|6|Radius des Punktes.|
|circleBarLineStroke|nein|Float|5|Breite des Balkens.|
|circleBarCircleFillColor|nein|Array[Integer]|[0, 0, 0, 1]|Füllfarbe des Punktes.|
|circleBarCircleStrokeColor|nein|Array[Integer]|[0, 0, 0, 1]|Farbe des Kreisrandes|
|circleBarCircleStrokeWidth|nein||1|Breite des Kreisrandes|
|circleBarLineStrokeColor|nein|Array[Integer]|[0, 0, 0, 1]|Farbe des Balkens.|

### CIRCLESEGMENTS ###
Bei "class"=== "POINT", "subClass" === "ADVANCED", "scaling"="NOMINAL" und "scalingShape"="CIRCLESEGMENTS" wird für jedes Feature ein Kreis der aus einem oder mehreren Kreissegmenten besteht gesetzt. Innerhalb der Kreissegmente kann ein Image platziert werden. Dazu können  alle Parameter die mit "image" beginnen aus [styleFieldValue](#markdown-header-styleFieldValue) verwendet werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|scalingAttribute|ja|String||Attribut das zur Darstellung verwendet werden soll|
|scalingValues|nein|Array[Object]||Attributwerte denen eine Farbe zugeordnet ist, z.B. {"charging" : [220, 0, 0, 1]}. Innerhalb des Objektes können beliebig viele Attributwerte angegeben werden.|
|scalingValueDefaultColor|nein|Array[Integer]|[0, 0, 0, 1]|Standardfarbe für alle Attributwerte die nicht in "scalingValues" definiert sind|
|circleSegmentsRadius|nein|Float|10|Radius der Kreissegmente|
|circleSegmentsStrokeWidth|nein|Float|4|Breite der Kreissegmente|
|circleSegmentsGap|nein|Float|10|Abstand zwischen den Kreissegmenten|
|circleSegmentsBackgroundColor|nein|Array[Integer]|[255, 255, 255, 0]|Farbe des Kreises|

### LINE SIMPLE ###
Bei "class"=== "LINE" und "subClass" === "SIMPLE" wird ein linienhafter Style definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|lineStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Farbe der Linie in rgba.|
|lineStrokeWidth|nein|Integer|2|Breite der Linie.|

### POLYGON SIMPLE ###
Bei "class"=== "POLYGON" und "subClass" === "SIMPLE" wird ein flächenhafter Style definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|polygonFillColor|nein|Array [Integer]|[255, 255, 255, 1]|Füllfarbe des Polygon.|
|polygonStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Farbe des Polygonrandes in rgba.|
|polygonStrokeWidth|nein|Integer|2|Breite des Polygonrandes.|

### POLYGON CUSTOM ###
Bei "class"=== "POLYGON" und "subClass" === "CUSTOM" wird ein flächenhafter Style definiert. Die Darstellung ist dabei anhängig von einem Attribut des Features

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|polygonFillColor|nein|Array [Integer]|[255, 255, 255, 1]|Füllfarbe des Polygon.|
|polygonStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Farbe des Polygonrandes in rgba.|
|polygonStrokeWidth|nein|Integer|2|Breite des Polygonrandes.|
|styleField|ja|String||Attribut, nach dem das Polygon eingefärbt wird.|
|styleFieldValues|ja|Array[[polygonStyleFieldValue](#markdown-header-polygonStyleFieldValue)]||Zuordnung der Farbe zum Attributwert des Features.|

### polygonStyleFieldValue ###
Darstellung eines Attributwertes auf die Auswirkungen des Polygons. Werden hier keine Füllfarben oder Strichstärken gesetzt, so werden die Werte des Layerobjektes (wenn angegeben) oder die Defaultwerte verwendet. Dadurch dann bspw. die Strichstärke bei allen styleFieldValues gleich gesetzt werden (siehe Beispiel).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|styleFieldValue|ja|String||Attributwert. Wert des Attributes wie ihn der WFS-Dienst liefert (Case-Insensitive).|
|polygonFillColor|nein|Array [Integer]|[255, 255, 255, 1]|Füllfarbe des Polygon. |
|polygonStrokeColor|nein|Array [Integer]|[0, 0, 0, 1]|Farbe des Polygonrandes in rgba.|
|polygonStrokeWidth|nein|Integer|2|Breite des Polygonrandes.|

```json
{
    "layerId" : "123456",
    "class": "POLYGON",
    "subClass" : "CUSTOM",
    "polygonStrokeColor" : [0, 0, 0, 1],
    "polygonStrokeWidth" : 1,
    "styleField": "nutzung",
    "styleFieldValues": [
      {
        "styleFieldValue": "1",
        "polygonFillColor" : [78, 78, 78, 0.6]
      },
      {
        "styleFieldValue": "2",
        "polygonFillColor" : [178, 178, 178, 0.6]
      },
      {
        "styleFieldValue": "3",
        "polygonFillColor" : [225, 225, 225, 0.6]
      }
    ]
  }
```
>Zurück zur [Dokumentation Masterportal](doc.md).).
