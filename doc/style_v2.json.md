>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

# style_v2.json #
Die *style_v2.json* beinhaltet die Parameter für die WFS-Features. Die Verbindung zwischen den Layern und der *style_v2.json* erfolgt über die Angabe der *Layer-ID* in der *style_v2.json* und entsprechendem Verweis in der [config.json](config.json.md) im Bereich *Themenconfig --> Fachdaten*. Sollten in der *style_v2.json* nicht alle notwendigen Parameter angegeben sein, wird auf die Default-Werte zurückgegriffen. Bei Farbwerten muss der Parameter entsprechend der Vorgabe von *OpenLayers* für *ol.style* aussehen.

## Allgemeine Style Parameter ##
Beim Stylen der WFS-Features gibt es verschiedene Klassen nach denen wir den Style in der *style_v2.json* unterscheiden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerId|ja|String||ID des Styles, der in der [config.json](config.json.md) angegeben wird, um entsprechend zugeordnet zu werden. In der Regel gleiche ID, wie die des Layers.|
|class|ja|String|"POINT"|Angabe der entsprechenden Klasse, entspricht dem Geometrietyp. Mögliche Werte: "POINT", "LINE",  "POLYGON".|
|subClass|ja|String|"SIMPLE"|Angabe der entsprechenden SubKlasse, nach der die Style-Information verwendet werden soll. Mögliche Werte bei "POINT": "SIMPLE", "CUSTOM", "CIRCLE". Mögliche Werte bei "LINE": "SIMPLE". Mögliche Werte bei "POLYGON": "SIMPLE"|
|labelField|nein|String||Attribut des Features, nach dessen Wert das Label angezeigt werden soll.|
|textAlign|nein|String|"left"|Ausrichtung des Textes am Feature. Mögliche Werte "left", "center", "right"|
|textFont|nein|String|"Courier"|Font des Textes am Feature.|
|textScale|nein|Integer|1|Skalierung des Textes.|
|textOffsetX|nein|Integer|0|Offset des Textes in X-Richtung.|
|textOffsetY|nein|Integer|0|Offset des Textes in Y-Richtung.|
|textFillColor|nein|Array []|[255, 255, 255, 1]|Füllfarbe des Textes in rgba.|
|textStrokeColor|nein|Array []|[0, 0, 0, 1]|Randfarbe des Textes in rgba.|
|textStrokeWidth|nein|Integer|3|Breite der Textstriche.|
|clusterTextAlign|nein|String|"left"|Ausrichtung des Textes am Feature. Mögliche Werte "left", "center", "right". Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextFont|nein|String|"Courier"|Font des Textes am Feature Bei geclusterten Features siehe [config.json](config.json.md).|
|clusterTextScale|nein|Integer|1|Skalierung des Textes. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextOffsetX|nein|Integer|0|Offset des Textes in X-Richtung. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextOffsetY|nein|Integer|0|Offset des Textes in Y-Richtung. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextFillColor|nein|Array []|[255, 255, 255, 1]|Füllfarbe des Textes in rgba. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextStrokeColor|nein|Array []|[0, 0, 0, 1]|Randfarbe des Textes in rgba. Bei geclusterten Features siehe [config.json](config.json.md)|
|clusterTextStrokeWidth|nein|Integer|3|Breite der Textstriche. Bei geclusterten Features siehe [config.json](config.json.md)|

## Spezielle Parameter ##
Einige Parameter sind nur bei bestimmten Kombinationen von "class" und "subClass" notwendig.
So gibt es folgende Kombinationen:
[POINT SIMPLE](#markdown-header-point-simple)
[POINT CUSTOM](#markdown-header-point-custom)
[POINT CIRCLE](#markdown-header-point-circle)

[LINE SIMPLE](#markdown-header-line-simple)

[POLYGON SIMPLE](#markdown-header-polygon-simple)

#### POINT SIMPLE ####
Bei "class"=== "POINT" und "subClass" === "SIMPLE" wird nur ein Image für alle Features gesetzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|imageName|ja|String||Name des Images.|
|imageWidth|nein|String||Breite des Images.|
|imageHeight|nein|String||Höhe des Images.|
|imageScale|nein|String||Skalierung des Bildes.|
|imageOffsetX|nein|String||Offset des Bildes in X-Richtung.|
|imageOffsetY|nein|String||Offset des Bildes in Y-Richtung.|
|clusterImageName|nein|String||Name des Images bei geclusterten Features siehe [config.json](config.json.md).|
|clusterImageWidth|nein|String||Breite des Images bei geclusterten Features [config.json](config.json.md).|
|clusterImageHeight|nein|String||Höhe des Images bei geclusterten Features [config.json](config.json.md).|
|clusterImageScale|nein|String||Skalierung des Bildes bei geclusterten Features [config.json](config.json.md).|
|clusterImageOffsetX|nein|String||Offset des Bildes in X-Richtung bei geclusterten Features [config.json](config.json.md).|
|clusterImageOffsetY|nein|String||Offset des Bildes in Y-Richtung bei geclusterten Features [config.json](config.json.md).|

#### POINT CUSTOM ####
Bei "class"=== "POINT" und "subClass" === "CUSTOM" wird jedem Feature, abhänhig von einem gegebenen Attributwert, das Image gesetzt. Es können alle Attribute aus [POINT SIMPLE](#markdown-header-point-simple) gesetzt werden. Diese dienen dann als defaults, falls styleFieldValues keine entsprechenden Parameter gegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|styleField|ja|String||Attribut des Features, nach dessen Wert das Icon gesetzt wird.|
|styleFieldValues|ja|Array [[styleFieldValue](#markdown-header-styleFieldValue)]||Object für Attributwert, das den Custom Style setzt .|
|imageName|ja|String||Name des Images.|
|imageWidth|nein|String||Breite des Images.|
|imageHeight|nein|String||Höhe des Images.|
|imageScale|nein|String||Skalierung des Bildes.|

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

### styleFieldValue ###
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

#### POINT CIRCLE ####
Bei "class"=== "POINT" und "subClass" === "CIRCLE" wird jedem Feature, anstelle eines Images, ein Kreis gesetzt. Cluster-Attribute können gesetzt werden wie in [POINT SIMPLE](#markdown-header-point-simple) zu sehen. Label-Attribute können gesetzt werden wie in [Allgemeine Style Parameter](#markdown-header-allgemeine-style-parameter) zu sehen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|circleRadius|nein|Integer|10|Radius des Kreises.|
|circleStrokeColor|nein|Array []|[0, 0, 0, 1]|Farbe des Kreisrandes in rgba.|
|circleStrokeWidth|nein|Integer|2|Breite des Kreisrandes.|
|circleFillColor|nein|Array []|[0, 153, 255, 1]|Farbe der Kreisfüllung in rgba.|

#### LINE SIMPLE ####
Bei "class"=== "LINE" und "subClass" === "SIMPLE" wird ein linienhafter Style definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|lineStrokeColor|nein|Array []|[0, 0, 0, 1]|Farbe der Linie in rgba.|
|lineStrokeWidth|nein|Integer|2|Breite der Linie.|

#### POLYGON SIMPLE ####
Bei "class"=== "POLYGON" und "subClass" === "SIMPLE" wird ein flächenhafter Style  definiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|polygonFillColor|nein|Array []|[255, 255, 255, 1]|Füllfarbe des Polygon.|
|polygonStrokeColor|nein|Array []|[0, 0, 0, 1]|Farbe des Polygonrandes in rgba.|
|polygonStrokeWidth|nein|Integer|2|Breite des Polygonrandes.|

>Zurück zur [Dokumentation Masterportal](doc.md).).
