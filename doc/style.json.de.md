>Zurück zur **[Dokumentation Masterportal](doc.de.md)**.

[TOC]

# style.json #
Die *style.json* beinhaltet Visualisierungsvorschriften zum steuern der Darstellung von Vektor-Features. Sie ist damit für alle Arten von Vektorlayern relevant, wie WFS, GeoJson und Sensor.
Zudem können Visualisierungsvorschriften für 3DTileSets definiert werden.

## Was geschieht beim Starten des Masterportals

Beim Starten des Masterportals wird die konfigurierte style.json eingelesen und eine Liste aller dort definierten styles in einer internen Datenstruktur angelegt.  Die Layer fragen bei Bedarf diese Liste ab und erhalten die definierten Stylingvorschriften.
> Hinweis: Jeder Eintrag der Liste kann zu Testzwecken aus der console für eine spezifische *styleId* abgefragt werden:
```javascript
Backbone.Radio.request("StyleList", "returnModelById", "styleId")
```

Erst zu dem Zeitpunkt, wenn ein Layer visualisiert werden soll, werden aus der internen Datenstruktur [openlayer Styles](https://openlayers.org/en/latest/apidoc/module-ol_style_Style-Style.html "openlayer Styles") abgeleitet und den Features zugeordnet.
> Hinweis: Malformed style.json Dateien werden vollständig abgewiesen und führen zur Ausgabe einer entsprechenden Fehlermeldung. Wir empfehlen eine syntaktische Prüfung z.B. über freie Online-Validatoren, wie [jsonlint](https://jsonlint.com/ "jsonlint").

## Konfiguration des Styling-Moduls
Der Pfad zur verwendenden *style.json* wird in der **[config.js](config.js.de.md)** definiert und ist dort dokumentiert. Bitte beachten Sie folgende Parameter:

- *styleConf*: Zum definieren des Pfades zur Datei.
> Hinweis: Fehlerhafte Pfadangaben werden über eine entsprechende Fehlermeldung mitgeteilt.

## Layerverknüpfung
In der **[config.json](config.json.de.md)** erfolgt im Abschnitt *Themenconfig.Layer.Vector* die Definition der Layer im Portal. Dort wird für jeden Vektorlayer auch eine *styleId* zwingend verlangt. Diese styleId stellt die Verbindung zur *style.json* dar und wird in dieser ebenfalls über das Attribut *styleId* verknüpft Siehe [hier](#markdown-header-aufbau).
> Hinweis: Eine fehlerhafte Verknüpfung führt zu keinem Laufzeitfehler. Es wird eine Meldung in der console ausgegeben, der Adminsitratoren auf die Fehlkonfiguration hinweist. Der Portalnutzer bekommt hiervon nur insofern etwas mit, als dass das Styling dem openlayers default entspricht.

## Aufbau
Nachfolgend wird der syntaktische und schematische Aufbau und die Funktionsweise der *style.json* erklärt.
> Hinweis: Die grundsätzliche Syntax von Json-Dateien ist z.B. [hier](https://www.json.org) erklärt und gilt auch für die style.json.

Die style.json enthält grundsätzlich nur ein Array von Objekten. Das Array umschließt dabei Styledefinitionen. Jede Styledefinition kann mit einem Layer verknüpft werden.
```javascript
[
    {}, // Styledefinition 1
    {} // Styledefinition 2
]
```
Zur Verknüpfung einer Styledefinition aus dem Array mit einem Layer bedarf es zwingend eines Attributs *styleId*. Näheres hierzu unter [Layerverknüpfung](#markdown-header-layerverknupfung).
```javascript
{
    "styleId": "1711"
}
```
Parallel zum Attribut *styleId* wird zwingend ein Attribut *rules* erwartet. Das rules-Attribut ist dabei wieder ein Array und umfasst alle Regeln eines Layers.
```javascript
{
    "styleId": "1711",
    "rules": []
}
```
Jede Regel im Array *rules* ist ein Objekt und besteht zwingend aus dem Attribut *style*. Das *style*-Attribut nimmt die Abbildungsvorschriften entgegen, die bei dieser Regel angewendet werden sollen. Näheres hierzu unter [Abbildungsvorschriften](#markdown-header-abbildungsvorschriften).
```javascript
"rules": [
    {
        "style": {}
    }
]
```
Parallel zum Attribut *style* kann optional ein Attribut *conditions* eingefügt werden. Das *conditions*-Attribut nimmt die Bedingungen entgegen, die ein Feature erfüllen muss, damit die Regel angewendet wird. Näheres hierzu unter [Bedingungen](#markdown-header-bedingungen).
```javascript
"rules": [
    {
        "conditions": {},
        "style": {}
    }
]
```
**DIE ZUORDNUNG EINER REGEL ZU EINEM FEATURE ERFOLGT DAMIT ÜBER EINE OR-VERKNÜPFUNG, INDEM DAS ARRAY VON OBEN NACH UNTEN (VON INDEX = 0 BIS INDEX = MAX) DURCHLAUFEN WIRD, WOBEI INNERHALB JEDER REGEL EINE AND-VERKNÜPFUNG VON *PROPERTIES* UND *SEQUENCE* (IN DEN CONDITIONS) BESTEHT.**

**ES WIRD DIE ERSTE REGEL ZUR ANWENDUNG GEBRACHT, DEREN *CONDITIONS* VOLLSTÄNDIG AUF DAS FEATURE ZUTREFFEN.**
> Hinweis: Erfüllt keine Regel die *conditions* so wird ein leeres Style-Objekt erzeugt und dem Feature zugeordnet. Das Feature wird damit nicht gezeichnet.

Es empfiehlt sich eine Regel **ohne** *conditions* als Fallback-Lösung in folgender Form vorzusehen.
```javascript
"rules": [
    {
        "conditions": {},
        "style": {}
    },
    {
        "style": {}
    }
]
```
> Hinweis: Die Reihenfolge der Regeln im Array rules ist maßgeblich. Der Style der ersten passenden Condition wird verwendet, alle weiteren Rules werden ignoriert. Alle Regeln hinter dem Default-Style (dem ersten ohne Condition) werden somit ignoriert. Im Beispiel oben: Ein Vertauschen der beiden dargestellten Regeln würde definieren, dass immer die Fallback-Lösung genutzt wird. Die Regel mit conditions wäre somit obsolet.


## Bedingungen
Nachfolgend werden die Inhalte beschrieben, die unter *conditions*, wie unter [Aufbau](#markdown-header-aufbau) vorgestellt, gesetzt werden können.
Unter *conditions* können zwei optionale *condition types* angewendet werden:

- *properties*
- *sequence*.

```javascript
"conditions": {
    "properties": {},
    "sequence": []
}
```
### *properties*
Das *properties*-Attribut steuert eine inhaltliche Prüfung jedes Features über Soll-Ist-Vergleiche der [Feature-Properties](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#getProperties).  Auch innerhalb der *properties* gilt äquivalent zu den *conditions* eine AND-Verknüpfung, sodass alle *key-value-Paare* erfüllt sein müssen.

Die *properties* werden als Objekt definiert. Der Key entspricht einem Attributnamen innerhalb der Feature-Properties. Der Value entspricht dem Referenzwert.
```javascript
"conditions": {
    "properties": {
        key: value,
        key2: value2
    }
}
```
#### key
Als *key* wird der Feature-Attributname angegeben, der innerhalb der Feature-Properties als direktes child-Element existiert.
> Hinweis: Existiert der key nicht, so ist die *condition* nicht erfüllt.

Alternativ kann auf ein beliebig verzweigtes Attribut innerhalb der Feature-Properties verwiesen werden. Näheres hierzu unter [Objektpfadverweise](#markdown-header-objektpfadverweise).
> Hinweis: Objektpfade werden z.B. von Sensorlayern in die Properties übernommen, die mehrere Datastreams aufweisen.

Ein *key* ist damit immer vom Datentyp *String*.

#### value
Als *value* wird der Referenzwert angegeben, gegen den der *key* geprüft wird. *Values* können unterschiedliche Datentypen aufweisen:

| Datentyp | Beschreibung |
| ------------ | ------------ |
| String | Direkter Vergleich der Textinhalte zwischen Feature-Attribut und Referenzwert. |
| Number | Direkter Vergleich des nummerischen Wertes zwischen Feature-Attribut und Referenzwert. Ist der Attributwert vom Typ *String*, so wird versucht diesen in einen nummerischen Wert zu übersetzen. |
| Array mit zwei Zahlen | Ein Array mit zwei nummerischen Werten definiert eine Prüfung gegen einen nummerischen Wertebereich. Der erste Wert des Array wird als minValue interpretiert und der zweite Wert als maxValue. Es erfolgt ein Prüfung des Feature-Attributs gegen diesen Wertebereich. Ist der Attributwert vom Typ *String*, so wird versucht diesen in einen nummerischen Wert zu übersetzen. |
| Array mit vier Zahlen | Ein Array mit vier nummerischen Werten definiert eine Prüfung gegen einen relativen, nummerischen Wertebereich. Der erste Wert des Array wird als minValue interpretiert und der zweite Wert als maxValue. Der Attributwert aber wird nicht absolut gegen diesen Wertebereich geprüft, sondern relativ, wobei der dritte Wert des Array relativMin und der vierte Wert des Array relativMax definiert. Der Attributwert wird zunächst in Relation zu relativMin und relativMax gebracht und das Ergebnis gegen den Wertebereich von minValue und maxValue geprüft. Ist der Attributwert vom Typ *String*, so wird versucht diesen in einen nummerischen Wert zu übersetzen. |

> Hinweis: Die Prüfungswert gegen einen relativen, nummerischen Wertebereich erfolgt über $$x=1/(relativMax-relativMin)(x-relativMin)$$.

> Hinweis: Jeder Vergleich gegen einen nummerischen Wertebereich erfolgt über $$minValue <= x<maxValue$$.


Alternativ kann auch als *value* für jeden der oben genannten Datentypen auf ein beliebig verzweigtes Attribut innerhalb der Feature-Properties verwiesen werden. Näheres hierzu unter [Objektpfadverweise](#markdown-header-objektpfadverweise).

#### Beispiel
Hier ist eine beispielhafte Konfiguration von Properties. Wir gehen davon aus, dass das Feature enstsprechende Informationen zu *name*, *typ*, *anzahlBetten*, *anzahlPersonal*, *anzahlOperationen*, *hamburgGesamt.OperationenSollMin* und *hamburgGesamt.OperationenSollMax* bereitstellt.
```javascript
"conditions": {
    "properties": {
        "name": "Kinderkrankenhaus Wilhelmsstift",
        "typ": 1,
        "anzahlBetten": [50, 100],
        "anzahlPersonal": [25, 50, 100, 500],
        "anzahlOperationen": [0, 50, "@hamburgGesamt.OperationenSollMin", "@hamburgGesamt.OperationenSollMax"]
    }
}
```

### *sequence*
Das *sequence*-Attribut steuert eine indexielle Prüfung für *MultiGeometry-Features*. Sie ist daher nur relevant für Features vom Typ:

- *MultiPoint*,
- *MultiLinestring*,
- *MultiPolygon*,
- *GeometryCollection*

> Hinweis: Für alle anderen einfachen Geometrietypen erfolgt diese Prüfung nicht.

**Alle *MultiGeometry-Features*  bestehen aus einfachen *Features*.** Innerhalb eines *MultiGeomtry-Features* wird über seine *Feature* iteriert und jedes Feature wird individuell gestylt. Über *sequence* kann der Indexbereich der *Features* innerhalb des *MultiGeomtry-Features* definiert werden, für die diese *condition* greift.
Der Wertebereich wird in einem Array mit zwei nummerischen Werten festgelegt, wobei der erste Wert den unteren Index und der zweite Wert den oberen Index vorgibt. Somit gilt folgender Eintrag für das zweite und dritte *Feature* innerhalb eines *Multigeometry-Feature*, das aus mindestens drei *Features* besteht.

> Hinweis: Array sind null-basiert. Das erste Feature innerhalb der Multi-Geometry hat den index 0.

```javascript
"sequence": [1, 2]
```
> Hinweis: Sequence ist auch für MultiGeometry-Features optional.


### Objektpfadverweise
Wie beschrieben, können Objektpfadverweise unter den *properties* sowohl für *key* wie auch für *value* gesetzt werden.

**JEDER STRING MIT EINEM PREFIX @ WIRD ALS EIN *OBJEKTPFADVERWEIS* ERKANNT. **

Der Verweis über einen Objektpfad ist z.B. dann sinnvoll, wenn unterhalb der Feature-Properties tiefere Objekt-Strukturen liegen, in denen auf einen tiefer liegenden Wert verwiesen werden soll.
> Hinweis: Objektpfade werden insbesondere bei Sensorlayern genutzt, da sie tlw. mehrere Datastreams anzapfen.

Ein Objektpfad von `"@Datastreams.0.ObservedProperty.name"` wertet bspw. folgenden Eintrag aus und gibt `"myName"` zurück:
```javascript
"featureProperties": {
    "name": "Kinderkrankenhaus Wilhelmsstift",
    "Datastreams": [
        {
            "ObservedProperty": {
                "name": "myName"
            }
        }
    ]
}
```
> Hinweis: Objektpfade können sowohl Objekte als auch Array beinhalten. Der Eintrag Datastreams.0 gibt an, dass dem ersten Eintrag im Array gefolgt werden soll.
> Hinweis: Arrays sind null-basiert. Der erste Eintrag im Array wird über Datastreams.0 erreicht. Der zweite entsprechend über Datastreams.1.

Neben diesem Anwendungsszenario machen Objektpfadverweise auch für direkte child-Elemente Sinn. Z.B. können Features mit direkten child Properties, wie diesem:
```javascript
"featureProperties": {
    "name": "Kinderkrankenhaus Wilhelmsstift",
    "alternativName": "Wartestube"
}
```
gegen sich selbst geprüft werden.
```javascript
"conditions": {
    "properties": {
        "name": "@alternativName"
    }
}
```

## Abbildungsvorschriften
Nachfolgend werden die Inhalte beschrieben, die unter *style*, wie unter [Aufbau](#markdown-header-aufbau) vorgestellt, gesetzt werden können.

Das Styling ist vom Geometrietyp des Features abhängig. Alle *MultiGeometry-Features*  bestehen aus einfachen *Features*. Innerhalb eines *MultiGeomtry-Features* wird über seine *Feature* iteriert und jedes Feature wird individuell gestylt. Folgende Geometrietypen können bislang gestylt werden:


- [Linestring](#markdown-header-linestring)
- [Point](#markdown-header-point)
- [Polygon](#markdown-header-polygon)
- [Cesium](#markdown-header-cesium)

> Hinweis: Es ist nicht möglich, MultiGeometrien zu stylen, die innerhalb einer GeometryCollection (double nested) definiert sind.

Bei einem WFS-Layer wird der Geometrietyp mittels eines Aufrufes des DescribeFeatureTypes ermittelt. In einigen Fällen wird der Typ "Geometry" ermittelt, dabei werden für die Geometrien: LineString, Point und Polygon Styles angelegt. Dies kann mittels des Attributes styleGeometryType in der config.json an dem jeweiligen Layer überschrieben werden [styleGeometryType](config.json.md#markdown-header-themenconfiglayervector).

Das Styling erfolgt auf Grundlage des jeweiligen Geometrietyps des Features, indem für jeden Typ default-Abbildungsvorschriften angewandt werden, die über die Einträge in *style* übersteuert werden können.

Beispiel eines *style*:
```javascript
"style": {
    "imageName": "krankenhaus.png",
    "clusterImageName": "krankenhaus.png"
}
```

> Es ist somit möglich, in einem style gleichzeitig unterschiedliche Geometrietypen (Point, Linestring, Polygon, ...) zu stylen, indem deren Abbildungsvorschriften ergänzt werden.

Darüber hinaus kann für alle genannten Geometriearten eine Textbeschriftung vorgenommen werden. Siehe hierzu [Text](#markdown-header-text).

Eine individuelle Legendenbeschriftung kann gesetzt werden. Siehe hierzu [Legende](#markdown-header-legende).

### Point
Die Abbildungsvorschriften für Punkte unterscheiden sich in

- einfache Punktgeometrien: Siehe nachfolgenden Parameter *type*.
- geclusterte Punkthaufen: Wird in der Layerconfiguration (**[config.json](config.json.de.md)**) eine *clusterDistance* gesetzt, so wird ein ClusterStyle erzeugt. Siehe nachfolgenden Parameter *clusterType*.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
| type |  | String | "circle" | Art des Stylings von Punkten gemäß Wertebereich: [icon](#markdown-header-pointicon), [circle](#markdown-header-pointcircle), [nominal](#markdown-header-pointnominal), [interval](#markdown-header-pointinterval).|
| clusterType |  | String | "circle" | Art des Stylings von geclusterten Punkten gemäß Wertebereich: [icon](#markdown-header-pointclustericon), [circle](#markdown-header-pointclustercircle).|
Nachfolgend werden die möglichen styling Optionen aufgelistet.

#### Point.Icon
Für weitere Informationen siehe auch die [Openlayers Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_style_Icon-Icon.html "Openlayers Beschreibung").

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|imageName| |String| "blank.png"|Name des Images.|
|imageWidth| |String|1|Breite des Images.|
|imageHeight| |String|1|Höhe des Images.|
|imageScale| |String|1|Skalierung des Bildes.|
|imageOffsetX| |Float|0.5|Offset des Bildes in X-Richtung.|
|imageOffsetY| |Float|0.5|Offset des Bildes in Y-Richtung.|
|imageOffsetXUnit| | String | "fraction" |Units in which the anchor x value is specified.|
|imageOffsetYUnit| | String | "fraction" |Units in which the anchor y value is specified.|

#### Point.Circle
Für weitere Informationen siehe auch die [Openlayers Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_geom_Circle-Circle.html "Openlayers Beschreibung").

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|circleRadius|   |Integer|10|Radius des Kreises.|
|circleStrokeColor|   |Integer []|[0, 0, 0, 1]|Farbe des Kreisrandes in rgba.|
|circleStrokeWidth|   |Integer|2|Breite des Kreisrandes.|
|circleFillColor|   |Integer[]|[0, 153, 255, 1]|Farbe der Kreisfüllung in rgba.|

#### Point.Interval
Für jedes Feature wird ein dynamischer Style gesetzt. Dieser Style unterstützt die automatisierte Aktualisierung von Sensor-Features. Für Zahlendaten die eine natürliche Reihenfolge haben (z.B. in der Einheit Meter, oder Grad Celsius).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|scalingShape| x |String||Angabe der Darstellungsart: CIRCLE_BAR.|
|scalingAttribute| x |String||Attribut das zur Darstellung verwendet werden soll|
|circleBarScalingFactor|   |Float|1|Faktor um den Attributwert zu überhöhen. Notwendig bei sehr großen (positiven oder negativen Werten) und bei Werten nahe 0.|
|circleBarRadius|   |Float|6|Radius des Punktes.|
|circleBarLineStroke|   |Float|5|Breite des Balkens.|
|circleBarCircleFillColor|   |Integer[]|[0, 0, 0, 1]|Füllfarbe des Punktes in rgba.|
|circleBarCircleStrokeColor|   |Integer[]|[0, 0, 0, 1]|Farbe des Kreisrandes in rgba.|
|circleBarCircleStrokeWidth|   ||1|Breite des Kreisrandes|
|circleBarLineStrokeColor|   |Integer[]|[0, 0, 0, 1]|Farbe des Balkens in rgba.|

#### Point.Nominal
Für jedes Feature wird ein dynamischer Style gesetzt. Dieser Style unterstützt die automatisierte Aktualisierung von Sensor-Features. Für Daten die sich nicht in eine Reihenfolge bringen lassen (z.B. Farben oder Formen).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|scalingShape| x |String||Angabe der Darstellungsart: CIRCLESEGMENTS.|
|scalingAttribute| x |String||Attribut das zur Darstellung verwendet werden soll. Kann auch als [Objektpfadverweis](#markdown-header-objektpfadverweise) genutzt werden.|
|scalingValues|   |Object||Attributwerte denen eine Farbe zugeordnet ist, z.B. `{"charging" : [220, 0, 0, 1]}`. Innerhalb des Objektes können beliebig viele Attributwerte angegeben werden.|
|scalingValueDefaultColor|   |Integer[]|[0, 0, 0, 1]|Standardfarbe für alle Attributwerte die nicht in *scalingValues* definiert sind.|
|circleSegmentsRadius|   |Float|10|Radius der Kreissegmente|
|circleSegmentsStrokeWidth|   |Float|4|Breite der Kreissegmente|
|circleSegmentsGap|   |Float|10|Abstand zwischen den Kreissegmenten|
|circleSegmentsBackgroundColor|   |Integer[]|[255, 255, 255, 0]|Farbe des Kreises|

#### Point.Cluster
Geclusterte Punkte stellen ein Symbol für mehrere Features dar. Siehe auch die [Openlayers Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html "Openlayers Beschreibung"). Die Darstellung ist abhängig von Anzahl und Lage der Features, der gewählten Zoomstufe und der am Layer definierten *clusterDistance*. *PointCluster* können auf zwei Arten dargestellt werden:

- [Icon](#markdown-header-pointclustericon")
- [Circle](#markdown-header-pointclustercircle)

Es ist ebenso möglich, geclusterte Punkte mit einem Textattribut zu belegen. Dies ist z.B. häufig gewünscht, um die Anzahl der geclusterten Features darzustellen. Siehe hierzu [ClusterText](#markdown-header-pointclustertext).

#### Point.Cluster.Icon
Für weitere Informationen siehe auch die [Openlayers Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_style_Icon-Icon.html "Openlayers Beschreibung").

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|clusterImageName|   |String|"blank.png"|Name des Images als Clusterstyle.|
|clusterImageWidth|   |Integer|1|Breite des Images als Clusterstyle.|
|clusterImageHeight|   |Integer|1|Höhe des Images als Clusterstyle.|
|clusterImageScale|   |Integer|1|Skalierung des Images als Clusterstyle.|
|clusterImageOffsetX|   |Float|0.5|Offset des Images als Clusterstyle in X-Richtung.|
|clusterImageOffsetY|   |Float|0.5|Offset des Images als Clusterstyle in Y-Richtung.|

#### Point.Cluster.Circle
Für weitere Informationen siehe auch die [Openlayers Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_geom_Circle-Circle.html "Openlayers Beschreibung").

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|clusterCircleRadius|   |Integer|10|Radius des Kreises als Clusterstyle.|
|clusterCircleFillColor|   |Integer[]|[0, 153, 255, 1]|Füllfarbe des Kreises als Clusterstyle in rgba.|
|clusterCircleStrokeColor|   |Integer[]|[0, 0, 0, 1]|Randfarbe des Kreises als Clusterstyle in rgba.|
|clusterCircleStrokeWidth|   |Integer|2|Randstärke des Kreises als Clusterstyle.|

#### Point.Cluster.Text
Für weitere Informationen siehe auch die [Openlayers Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html "Openlayers Beschreibung").

Es gibt zwei Arten clusterTexte darzustellen. Sie werden im Attribut *clusterTextType* gesetzt:

- *counter :* Darstellung der Anzahl der geclusterten Features.
- *text* : Darstellung eines festen Textes.
- *none* : Mit dem Wert *none* wird die Darstellung unterdrückt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
| clusterTextType |  | String | "counter" | Beschriftungsart gemäß Wertebereich: *counter*, *none*, *text*.|
| clusterText | nur bei *clusterTextType*: *text* | String | "undefined"  | Darzustellender Text.|
|clusterTextAlign|   | String | "center"|Ausrichtung des Textes am Feature.|
|clusterTextFont|   | String | "Comic Sans MS"|Font des Textes am Feature.|
|clusterTextScale|   | Integer | 2 | Skalierung des Textes.|
|clusterTextOffsetX|   | Integer | 0 | Offset des Textes in X-Richtung.|
|clusterTextOffsetY|   | Integer | 2 | Offset des Textes in Y-Richtung.|
|clusterTextFillColor|   | Integer[] | [255, 255, 255, 1] | Füllfarbe des Textes in rgba. |
|clusterTextStrokeColor|   | Integer[] | [0, 0, 0, 0] | Randfarbe des Textes in rgba.|
|clusterTextStrokeWidth|   | Integer | 0 | Breite der Textstriche.|

> Hinweis: Eine Cluster-Beschriftung ist gegenüber einer allgemeinen Beschriftung höher priorisiert.

### Linestring
Für weitere Informationen siehe auch die [Openlayers Stroke Beschreibung ](https://openlayers.org/en/latest/apidoc/module-ol_style_Stroke-Stroke.html "Openlayers Beschreibung").

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|lineStrokeColor|   | Integer[] |[255, 0, 0, 1]|Farbe der Linie in rgba.|
|lineStrokeWidth|   | Integer | 5 |Breite der Linie.|
|lineStrokeCap|   | String | "round" | Line cap style |
|lineStrokeJoin|   | String | "round" | Line join style |
|lineStrokeDash|   | Integer[] | null  |Style der Linie mit dash|
|lineStrokeDashOffset|   | Integer | 0 | Line dash offset |
|lineStrokeMiterLimit|   | Integer | 10 | Miter limit |

### Polygon
Für weitere Informationen siehe auch die [Openlayers Fill Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_style_Fill-Fill.html "Openlayers Beschreibung") und diese [Openlayers Stroke Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_style_Stroke-Stroke.html "Openlayers Beschreibung").

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|polygonStrokeColor|   | Integer[] |[0, 0, 0, 1]| Farbe der Linie in rgba.|
|polygonStrokeWidth|   | Integer | 1 |Breite der Linie.|
|polygonStrokeCap|   | String | "round" | Line cap style |
|polygonStrokeJoin|   | String | "round" | Line join style |
|polygonStrokeDash|   | Integer[] | null  | Style der Linie mit dash|
|polygonStrokeDashOffset|   | Integer | 0 | Line dash offset |
|polygonStrokeMiterLimit|   | Integer | 10 | Miter limit |
|polygonFillColor|   | Integer[] | [10, 200, 100, 0.5] | Füllfarbe in rgba. |

### Cesium

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|color|   | String || Farbe als rgb(a)-String. |

##Beispiel für 3DTileSets
```json
{
    "styleId": "3DTileSetStyle",
    "rules": [
        {
            "conditions": {
                "attr3": [15, 17],
                "attr4": "abc"
            },
            "style": {
                "type": "cesium",
                "color": "rgba(0, 0, 255, 0.5)"
            }
        },
        {
            "conditions": {
                "attr2": [0, 10]
            },
            "style": {
                "type": "cesium",
                "color": "rgba(0, 255, 0, 0.5)"
            }
        },
        {
            "conditions": {
                "attr1": 50.5
            },
            "style": {
                "type": "cesium",
                "color": "rgb(255, 0, 0)"
            }
        },
        {
            "style": {
                "type": "cesium",
                "color": "rgba(150, 150, 150, 0.5)"
            }
        }
    ]
}
```

### Text
Für weitere Informationen siehe auch die [Openlayers Beschreibung](https://openlayers.org/en/latest/apidoc/module-ol_style_Text-Text.html "Openlayers Beschreibung").

Über das Attribut *labelfield* kann im *style* gesteuert werden, ob eine Featurebeschriftung vorgenommen werden soll. Es wird der Text ausgegeben und gestylt, der in den *Feature-Properties* unter dem genannten *labelField* gefunden wird.
> Hinweis: Fehlt das Attribut *labelfield* wird keine Beschriftung vorgenommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|labelField| ja |String| "undefined" |Attribut des Features, nach dessen Wert das Label angezeigt werden soll. Kann auch als [Objektpfadverweis](#markdown-header-objektpfadverweise) genutzt werden.|
|textAlign|   |String|"center"|Ausrichtung des Textes am Feature.|
|textFont|   |String|"Comic Sans MS"|Font des Textes am Feature.|
|textScale|   |Integer|2|Skalierung des Textes.|
|textOffsetX|   |Integer| 10 | Offset des Textes in X-Richtung.|
|textOffsetY|   |Integer| -8 | Offset des Textes in Y-Richtung.|
|textFillColor|   |Integer[]| [69, 96, 166, 1] |Füllfarbe des Textes in rgba.|
|textStrokeColor|   |Integer[]| [240, 240, 240, 1] | Randfarbe des Textes in rgba.|
|textStrokeWidth|   |Integer| 3 | Breite der Textstriche.|
|textSuffix|nein|String|'""'|Suffix das hinter den Text gehängt wird.|

> Hinweis: Eine Cluster-Beschriftung ist gegenüber dieser Beschriftung höher priorisiert.

### Legende
Die textliche Beschreibung in der Legende kann gesteuert werden. Dies geschieht über den Parameter *legendValue*.
```javascript
"style": {
    "legendValue": "mein Text"
}
```
> Hinweis: Das Attribut *legendValue* muss pro Layer und Geometrietyp unique sein, da die Legende ansonsten unvollständig ist.

## Beispiel
Nachfolgend eine Beispielkonfiguration für einen Sensorlayer:
```javascript
[
  {
    "styleId": "1711",
    "rules": [
      {
        "conditions": {
          "properties": {
            "@Datastreams.1.Observations.0.result": [1, 3]
          }
        },
        "style": {
          "type": "circle",
          "circleFillColor": [255, 0, 0, 1],
          "clusterType": "circle"
        }
      },
      {
        "conditions": {
          "properties": {
            "@Datastreams.1.Observations.0.result": [3, 8]
          }
        },
        "style": {
          "type": "circle",
          "circleFillColor": [255, 255, 102, 1],
          "clusterType": "circle"
        }
      },
      {
        "conditions": {
          "properties": {
            "@Datastreams.1.Observations.0.result": [8, 50]
          }
        },
        "style": {
          "type": "circle",
          "circleFillColor": [132, 222, 2, 1],
          "clusterType": "circle"
        }
      },
      {
        "conditions": {
          "properties": {
            "@Datastreams.1.Observations.0.result": "no data"
          }
        },
        "style": {
          "type": "circle",
          "circleFillColor": [200, 200, 1, 1],
          "clusterType": "circle"
        }
      },
      {
        "style": {
          "type": "circle",
          "circleFillColor": [211, 211, 211, 1],
          "clusterType": "circle"
        }
      }
    ]
  }
]
```
