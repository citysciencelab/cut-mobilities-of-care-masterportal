>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

# style.json #
Die *style.json* beinhaltet die Parameter für die WFS-Features. Die Verbindung zwischen den Layern und der *style.json* erfolgt über die Angabe der *Layer-ID* in der *style.json* und entsprechendem Verweis in der [config.json](config.json.md) im Bereich *Themenconfig --> Fachdaten*. Sollten in der *Style.json* nicht alle notwendigen Parameter angegeben sein, wird auf die Default-Werte zurückgegriffen. Bei Farbwerten muss der Parameter entsprechend der Vorgabe von *OpenLayers* für *ol.style* aussehen.

## Allgemeine Style Parameter ##
Beim Stylen der WFS-Features gibt es verschiedene Klassen nach denen wir den Style in der *style.json* unterscheiden. Die hier aufgeführten Parameter sind in allen Klassen verfügbar und können überschrieben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerId|ja|String||ID des Styles, der in der [config.json](config.json.md) angegeben wird, um entsprechend zugeordnet zu werden. In der Regel gleiche ID, wie die des Layers.|
|styleFieldValue|ja|String||Wert des Attributes eines Features für die Zuordnung. Attribut wir in der [config.json](config.json.md) angegeben.|
|subclass|ja|String||Angabe der entsprechenden Klasse, nach der die Style-Information verwendet werden soll.|

## Spezielle Style Parameter ##
In der *style.json* gibt es neben den allgemeinen Parametern auch spezielle Parameter, die nur für entsprechend angegebene Unterklassen verwendet werden können. Derzeit haben wir folgende subclass-Parameter:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[Circle](#markdown-header-circle)|nein|Object||Zeichnet jeweils einen Kreis an den Koordinaten der Features.|
|[Icon](#markdown-header-icon)|nein|Object||Setzt ein Icon an die Koordinaten der Features.|
|[IconWithText](#markdown-header-iconwithtext)|nein|Object||Setzt ein Icon mit zusätzlichem Text.|
|[Polygon](#markdown-header-spezielle-style-polygon)|nein|Object||zeichnet ein Polygon mit den Koordinaten des Features.|

*****

Icon, IconWithText und Circle sind anwendbar für Punktgeometrien und haben teilweise gemeinsame Parameter:

### circle ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|circlefillcolor|nein|Array []|[0, 153, 255, 1]|Füllfarbe des Kreises.|
|circleradius|nein|Number|10|Angabe des Radius bei Circle.|
|clusterfillcolor|nein|Array []|[255, 255, 255, 1]|Füllfarbe für die Cluster-Zahl.|
|clusteroffsetx|nein|String|"0"|Verschieben der Zahl in x-Richtung.|
|clusteroffsety|nein|String|"0"|Verschieben der Zahl in y-Richtung.|
|clusterscale|nein|String|"1"|Gibt die Skalierung des Icons/Kreises an bei WFS-Layern mit Clustern ([config.json](config.json.md)).|
|clusterstrokecolor|nein|Array []|[0, 0, 0, 1]|Farbe der Umrisslinie.|
|clusterstrokewidth|nein|String|"3"|Breite der Umrisslinie.|

**Beispiel subclass "Circle":**


```
#!json

{
        "layerId" : "2054_cluster",
        "styleFieldValue":"Geologische Objekte",
        "subclass" : "Circle",
        "imagescale" : "0.5",
        "circleradius" : 15,
        "circlefillcolor": "[180, 0, 180, 1]",
        "clusterscale" : "2",
        "clusteroffsety" : "2",
        "clusterfillcolor" : "[255, 255, 255, 1]",
        "clusterstrokecolor" : "[240, 240, 240, 0]",
        "clusterstrokewidth" : "0"
    }

```
*****

### icon ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|clusterfillcolor|nein|Array []|[255, 255, 255, 1]|Füllfarbe für die Cluster-Zahl.|
|clusteroffsetx|nein|String|"0"|Verschieben der Zahl in x-Richtung.|
|clusteroffsety|nein|String|"0"|Verschieben der Zahl in y-Richtung.|
|clusterscale|nein|String|"12|Gibt die Skalierung des Icons/Kreises an bei WFS-Layern mit Clustern ([config.json](config.json.md)).|
|clusterstrokecolor|nein|Array []|[0, 0, 0, 1]|Farbe der Umrisslinie.|
|clusterstrokewidth|nein|String|"3"|Breite der Umrisslinie.|
|imagename|nein|String|"blank.png"|Gibt den Dateinamen für das Image an. Der Pfad wird in der *config.js* festgelegt.|
|imageoffsetx|nein|Number|0|Verschieben des Images in x-Richtung.|
|imageoffsety|nein|Number|0|Verschieben des Images in y-Richtung.|
|imagescale|nein|String|"1"|Über diesen Parameter lässt sich das Icon skalieren.|
|imagewidth|nein|Number|1|Über diesen Parameter lässt sich die Breite des Icons verändern.|
|imageheight|nein|Number|1|Über diesen Parameter lässt sich die Höhe des Icons verändern.|

**Beispiel subclass "Icon":**


```
#!json

{
        "layerId" : "1711",
        "subclass" : "Icon",
        "imagename" : "krankenhaus.png",
        "imagescale" : "1",
        "clusterscale" : "2",
        "clusteroffsety" : "2",
        "clusterfillcolor" : "[255, 0, 0, 1]",
        "clusterstrokecolor" : "[240, 240, 240, 1]",
        "clusterstrokewidth" : "3",
        "imageoffsetx" : 0.50,
        "imageoffsety" : 0.50
}
```

*****

### iconWithText ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|imagename|nein|String|"blank.png"|Gibt den Dateinamen für das Image an. Der Pfad wird in der [config.js](config.js.md) festgelegt.|
|imagescale|nein|String|"1"|Über diesen Parameter lässt sich das Icon skalieren.|
|legendValue|nein|String||Text, der in der Legende am entsprechenden Image stehen soll.|
|textfillcolor|nein|Array []|[255, 255, 255, 1]|Farbe für den Text.|
|textfont|nein|String|"Courier"|Schriftart|
|textlabel|nein|String|"default"||
|textoffsetx|nein|String|"0"|Verschiebt den Text in x-Richtung.|
|textoffsety|nein|String|"0"|Verschiebt den Text in y-Richtung.|
|textscale|nein|Number|1|Skalierung des Textes.|
|textstrokecolor|nein|Array []|[0, 0, 0, 1]|Umrissfarbe für den Text.|
|textstrokewidth|nein|Number|3|Umrissbreite|

Beispiel subclass "IconWithText":

```
#!json

{
        "layerId" : "47",
        "subclass" : "IconWithText",
        "styleFieldValue": "X",
        "legendValue": "angekündigt",
        "imagename" : "baustelle_neu.png",
        "imagescale" : "1.1",
        "textscale" : 1,
        "textoffsetx" : "100",
        "textoffsety" : "20",
        "textfillcolor" : "[0, 0, 254, 1]",
        "textstrokecolor" : "[240, 240, 240, 1]",
        "textstrokewidth" : "0"
}


```

*****

*****

### Polygon ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|color|nein|Array []|[0, 0, 0, 1]|Farbe für Umringslinie.|
|fillcolor|nein|Array []|[255, 255, 255, 1]|Farbe für die Fläche.|
|strokewidth|nein|Number|5|Stärke der Umringslinie.|

**Beispiel subclass "Polygon":**


```
#!json

{
        "layerId" : "2003",
        "subclass" : "Polygon",
        "color" : "[0, 0, 0, 1]",
        "fillcolor" : "[10, 200, 0, 0.2]",
        "strokewidth" : 1
}

```

>Zurück zur [Dokumentation Masterportal](doc.md).).
