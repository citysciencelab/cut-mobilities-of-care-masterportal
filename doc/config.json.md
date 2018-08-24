>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

# config.json #
Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente wo in der Menüleiste sind, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem [Beispiel](https://bitbucket.org/lgv-g12/lgv/src/stable/portal/master/config.json).
## Portalconfig ##
In der *Portalconfig* kann die Oberfläche des Portals konfiguriert werden:

1.  der Titel mit Logo, falls erforderlich
2.  welche/r Suchdienst/e angesprochen werden soll/en
3.  welche Themenbaumart genutzt werden soll (einfach/light oder mit Unterordnern/custom)
4.  welche Werkzeuge geladen werden sollen
5.  welche Interaktionen mit der Karte möglich sein sollen (zoomen, Menüzeile ein/ausblenden, Standortbestimmung des Nutzers,  Vollbildmodus, etc.)
6.  welche Layer genutzt werden und ggf. in welchen Ordnern, sie in der Themenauswahl erscheinen sollen.

Es existieren die im Folgenden aufgelisteten Konfigurationen. Auch hier werden die Konfigurationen des Typs object verlinkt und später eingehend erläutert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|Baumtyp|ja|String||Legt fest, welche Themenbaumart genutzt werden soll. Es existieren die Möglichkeiten *light* (einfache Auflistung), *default* (FHH-Atlas), *custom* (benutzerdefinierte Layerliste anhand json).|`"light"`|
|[controls](#markdown-header-portalconfigcontrols)|nein|Object||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.||
|LogoLink|deprecated|deprecated||Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalTitle)||
|LogoToolTip|deprecated|deprecated||Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalTitle)||
|[mapView](#markdown-header-portalconfigmapview)|nein|Object||Gibt den Hintergrund an, wenn keine Karte geladen ist.||
|[menu](#markdown-header-portalconfigmenu)|nein|Object||Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der config.json (siehe [Tools](#markdown-header-portalconfigmenutools)).|
|PortalLogo|deprecated|deprecated||Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalTitle)||
|PortalTitle|deprecated|deprecated||Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalTitle)||
|[portalTitle](#markdown-header-portalconfigportalTitle)|nein|Object||Der Titel, der in der Menüleiste angezeigt wird.||
|scaleLine|nein|Boolean||true = die Maßstabsleiste wird unten rechts dargestellt, wenn kein footer vorhanden ist. Wenn ein footer vorhanden ist, wird die links angezeigt.|`true`|
|[searchBar](#markdown-header-portalconfigsearchbar)|nein|Object||Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden||
|[simpleLister](#markdown-header-portalconfigsimplelister)|nein|Object||Der SimpleLister zeigt alle Features eines angegebenen Layers im Kartenausschnitt an.||
|[mapMarkerModul](#markdown-header-portalconfigmapmarkermodul)|nein|Object||Gibt an, ob der auf der Karte verwendete Marker-Pin verschiebbar sein soll, oder nicht.||

******

### Portalconfig.controls ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[attributions](#markdown-header-portalconfigcontrolsattributions)|nein|Boolean/Object|false|Boolean: Zeigt vorhandene Attributions an. Object: Zeigt vorhandene Attributions mit folgenden Eigenschaften an, siehe [Object](#markdown-header-portalconfigcontrolsattributions)|
|fullScreen|nein|Boolean|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|
|mousePosition|nein|Boolean|false|Die Koordination des Mauszeigers werden angeziegt.|
|[orientation](#markdown-header-portalconfigcontrolsorientation)|nein|Object||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers. Siehe [orientation](#markdown-header-portalconfigcontrolsorientation).|
|zoom|nein|Boolean|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|
|[overviewmap](#markdown-header-portalconfigcontrolsoverviewmap)|nein|Boolean/Object|false|Boolean: Zeigt die Overviewmap unten rechts an. Object: Passt die Overviewmap um die angegebenen Attribute an, siehe [Object](#markdown-header-portalconfigcontrolsaoverviewmap)|
|[totalview](#markdown-header-portalconfigcontrolstotalview)|nein|Boolean|false|Zeigt einen Button für die Startansicht an.|
|freeze|nein|Boolean|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll. Im Style 'TABLE' erscheint dieser im Werkzeug-Fenster.|

**Beispiel controls:**


```
#!json

"controls": {
        "zoom": true,
        "orientation": {
          "zoomMode": "once",
          "poiDistances": [500, 1000, 2000]
        },
        "fullScreen": true,
        "mousePosition": true,
        "attributions": {
            "isInitOpenDesktop": true,
            "isInitOpenMobile": false
        },
        "overviewmap": true
      }

```


******
### Portalconfig.controls.attributions ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|isInitOpenDesktop|nein|Boolean|true|Legt fest, ob die Attributions (Desktop-Ansicht) initial ausgeklappt werden sollen.|
|isInitOpenMobile|nein|Boolean|false|Legt fest, ob die Attributions (Mobile-Ansicht) initial ausgeklappt werden sollen.|

******
### Portalconfig.controls.orientation ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|zoomMode|nein|String|"once"|*none* (Die Standortbestimmung ist deaktiviert.), *once* (Es wird einmalig beim Laden der Standort bestimmt und einmalig auf den Standort gezoomt.), *always* (Die Karte bleibt immer auf den Nutzerstandort gezoomt.)|
|poiDistances|nein|Boolean / [integer]|"true": [500,1000,2000] / "Array": []|Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Anbgabe eines Array werden die darin definierten Abstände angeboten. Bei Angabe von true der default.|

******
### Portalconfig.controls.overviewmap ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|nein|Integer||Legt die Resolution fest, die in der Overviewmap verwendet werden soll.|
|baselayer|nein|String||Über den Parameter baselayer kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss die Id aus der services.json angegeben werden die für das Portal in der config.js im Parameter layerConf steht.|

**Beispiel overviewmap mit Parametern:**


```
#!json

      "overviewmap": {
          "resolution": 305.7487246381551,
          "baselayer": "452"
      }


```
******
### Portalconfig.controls.zoom ###


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|showInSimpleMap|nein|Boolean||Gibt an ob die Zoom-Buttons auch in der simple Map ([URL-Parameter](URL_Parameter.md) "?style=simple" gezeichnet werden sollen.|
|showMobile|nein|Boolean|false|Gibt an ob die Zoom-Buttons auch in der mobilen Ansicht gezeichnet werden sollen.|

******
### Portalconfig.controls.totalview ###

Es werden die initialen Parameter zoomLevel und startCenter aus [mapView](#markdown-header-portalconfigmapview) verwendet.

### Portalconfig.mapView ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|backgroundImage|nein|String||Gibt den Hintergrund an, wenn keine Karte geladen ist.|
|startCenter|nein|Array|[565874, 5934140]|Die initiale Zentrumskoordinate.|
|options|nein|Array|[{resolution:66.14579761460263,scale:250000,zoomLevel:0},{resolution:26.458319045841044,scale:100000,zoomLevel:1},{resolution:15.874991427504629,scale:60000,zoomLevel:2},{resolution: 10.583327618336419,scale:40000,zoomLevel:3},{resolution:5.2916638091682096,scale:20000,zoomLevel:4},{resolution:2.6458319045841048,scale:10000,zoomLevel:5},{resolution:1.3229159522920524,scale:5000,zoomLevel:6},{resolution:0.6614579761460262,scale:2500,zoomLevel:7},{resolution:0.2645831904584105,scale: 1000,zoomLevel:8},{resolution:0.13229159522920521,scale:500,zoomLevel:9}]|Die initialen Maßstabsstufen und deren Auflösungen.|
|extent|nein|Array|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|
|resolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor zoomLevel.|
|zoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|
|epsg|nein|String|EPSG:25832|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|

**Beispiel mapView:**


```
#!json
"mapView": {
        "backgroundImage": "/../../node_modules/lgv-config/img/backgroundCanvas.jpeg",
        "startCenter": [561210, 5932600],
        "options": [
        {
          "resolution": 611.4974492763076,
          "scale": 2311167,
          "zoomLevel": 0
        },
        {
          "resolution": 305.7487246381551,
          "scale": 1155583,
          "zoomLevel": 1
        },
        {
          "resolution": 152.87436231907702,
          "scale": 577791,
          "zoomLevel": 2
        },
        {
          "resolution": 76.43718115953851,
          "scale": 288896,
          "zoomLevel": 3
        },
        {
          "resolution": 38.21859057976939,
          "scale": 144448,
          "zoomLevel": 4
        },
        {
          "resolution": 19.109295289884642,
          "scale": 72223,
          "zoomLevel": 5
        },
        {
          "resolution": 9.554647644942321,
          "scale": 36112,
          "zoomLevel": 6
        },
        {
          "resolution": 4.7773238224711605,
          "scale": 18056,
          "zoomLevel": 7
        },
        {
          "resolution": 2.3886619112355802,
          "scale": 9028,
          "zoomLevel": 8
        },
        {
          "resolution": 1.1943309556178034,
          "scale": 4514,
          "zoomLevel": 9
        },
        {
          "resolution": 0.5971654778089017,
          "scale": 2257,
          "zoomLevel": 10
        }
      ],
      "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
      "resolution": 15.874991427504629,
      "zoomLevel": 1,
      "epsg": "EPSG:25832"
    }
```

******

### Portalconfig.menu ###
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

Auch diese Konfigurationen sind vom Typ *object*. Sie sind ebenfalls verlinkt und werden im Anschluss an diese Auflistung näher beschrieben.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[staticlinks](#markdown-header-portalconfigmenustaticlinks)|nein|Object||Das Modul *staticlinks* werden die Links zu anderen Webseiten, deren Reihenfolge und das Erscheinungsbild in der Menüleiste konfiguriert.|
|[contact](#markdown-header-portalconfigmenucontact)|nein|Object||Das Modul *contact* gibt dem Anwender des Portals die Möglichkeit, eine Mail mit seiner Fehlermeldung/Rückmeldung/Anmerkung etc. an den Betreiber des Portals zu versenden.|
|[legend](#markdown-header-portalconfigmenulegend)|nein|Object||Die *Legende* kann wie jedes andere Werkzeug/Tool sowohl einzeln direkt unter *Menu*, als auch unter *Tools* konfiguriert werden.|
|[tools](#markdown-header-portalconfigmenutools)|nein|Object||Im Objekt *tools* werden die Werkzeuge, deren Reihenfolge und das Erscheinungsbild in der Menüleiste konfiguriert.|
|[tree](#markdown-header-portalconfigmenutree)|nein|Object||Unter *tree* wird der Themenbaum konfiguriert.|
|hide|nein|Boolean|false|Gibt an ob das Menu gezeichnet werden soll.

******

### Portalconfig.simpleLister ###
Listet die Features und deren Attribute eines angegebenen Layers auf, die sich im Kartenausschnitt befinden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerName|ja|String||Name des Layers, dessen Features angezeigt werden sollen.|
|errortxt|nein|String|"Keine Features im Kartenausschnitt"|Fehlermeldung die angezeigt werden soll, wenn sich keine Features im Kartenausschnitt befinden.|

******


### Portalconfig.mapMarkerModul ###
Gibt an ob der in der Karte verwendete Marker verschiebbar sein soll.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|marker|nein|String||Bei "dragMarker" wird der Marker auf der Karte verschiebbar, bei allen anderen Eingaben wird ein Marker verwendet, der nicht verschiebbar ist.|
|visible|nein|Boolean|true|Gibt an ob der Marker beim initialen Laden der Karte sichtbar ist oder nicht.|

******

### Portalconfig.menu.staticlinks ###
Gibt die Links zu externen Webseiten und deren Position im Menu an. Zusätzlich kann für jeden Link ein Radiotrigger definiert werden, der beim click einen Internen Ablauf startet.
Wird die URL oder der Radio trigger weggelassen, dann wird nur jeweils die andere Aktion ausgeführt.
Wichtig: Werden Links an unterschiedlichen Stellen des Menus eingefügt, so müssen die Objektattribute, die das Array definieren, im Namen "staticlinks" enthalten


|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name, wie der Link im Menu angezeigt werden soll.|
|glyphicon|ja|String||Glyphicon des Linkes für den Menueintrag.|
|url|nein|String||URL zur externen Webseite. |
|onClickTrigger|nein|Array|| Ein Array von Objekten mit den jeweiligen Channel Namen, das Event, welches getriggert wird und die Daten die mitgeschickt werden.|


**Beispiel staticlinks:**


```
#!json

"info":{
    "name": "Informationen",
    "glyphicon": "glyphicon-info-sign",
    "children": {
        "staticlinks": [{
            "name": "Wikipedia1",
            "glyphicon": "glyphicon-globe",
            "url": "https://www.wikipedia.de/"
        }],
        "contact": {
            "name": "Kontakt",
            "glyphicon": "glyphicon-envelope",
            "serviceID": "80001",
            "includeSystemInfo": true
        },
        "staticlinks2": [{
            "name": "Wikipedia2",
            "glyphicon": "glyphicon-globe",
            "url": "https://www.wikipedia.de/"
        },
        {
            "name": "hamburg.de",
            "glyphicon": "glyphicon-globe",
            "url": "http://www.hamburg.de"
        },
        {
            "name": "Altona",
            "glyphicon": "glyphicon-globe",
            "onClickTrigger": [{
                "channel": "ZoomToGeometry",
                "event": "zoomToGeometry",
                "data": "Altona"
            }]
        }]
    }
}

```

******
******


#### Portalconfig.menu.contact ####
Das Modul *contact* gibt dem Anwender des Portals die Möglichkeit, eine Mail mit seiner Fehlermeldung/Rückmeldung/Anmerkung etc. an den Betreiber des Portals zu versenden.

Folgende Parameter stehen für die Konfiguration zur Verfügung:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[bcc](#markdown-header-portalconfigmenucontactbcc)|nein|Array [Object]|[]|Wie cc, nur sind diese Mailadressen nicht sichtbar für andere. Wird immer mit **email** und **name** erwartet.|
|[cc](#markdown-header-portalconfigmenucontactcc)|nein|Array [Object]|[]|Möglichkeit weitere Mailadressen zu konfigurieren, an die diese Mail versendet werden soll. Wird immer mit **email** und **name** erwartet.|
|ccToUser|nein|Boolean||Wenn hier true konfiguriert ist, wird eine Bestätigung mit Ticketnummer an die ins Formular eingetragene eMail-Adresse geschickt .|
|[from](#markdown-header-portalconfigmenucontactfrom)|nein|Array [Object]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de", "name": "LGVGeoportalHilfe"}]|Array für die Absender der Mail.|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|includeSystemInfo||Boolean||Hier wird ausgewählt, ob vom User die Systeminfo in der Mail mit versandt werden soll.|
|name|nein|String||Name des Moduls in der Oberfläche.|
|serviceID||String||ID zum finden des EmailServices aus der [rest-services.json](rest-services.json.md).|
|subject|nein|String|"Supportanfrage zum Portal " + *portalTitle*|Hier kann ein String mit übergeben werden, der oben in der Betreffzeile der Mail auftaucht. Eine TicketId wird dem Betreff in jedem Fall vorangestellt.|
|textPlaceholder||String||Platzhalter für das Textfeld in dem der Anwender sein Anliegen eintragen kann.|
|[to](#markdown-header-portalconfigmenucontactfrom)|nein|Array [Object]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de", "name": "LGVGeoportalHilfe"}]|Array der Empfänger. Wird immer mit **email** und **name** erwartet.|
|contactInfo|nein|String||Information, die über dem Kontaktformular angezeigt wird.|
|isInitOpen|nein|Boolean|false|Gibt an, ob das Modul *contact* beim initialen Laden des Portals geöffnet ist.|

##### Portalconfig.menu.contact.bcc #####

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|email|nein|String||eMail-Adresse(n) Empfänger|
|name|nein|String||Name(n) Empfänger|

##### Portalconfig.menu.contact.cc #####

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|email|nein|String||eMail-Adresse(n) Empfänger|
|name|nein|String||Name(n) Empfänger|


##### Portalconfig.menu.contact.from #####

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|email|nein|String|"lgvgeoportal-hilfe@gv.hamburg.de"|eMail-Adresse Absender|
|name|nein|String|"LGVGeoportalHilfe"|Name Absender|

##### Portalconfig.menu.contact.to #####

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|email|nein|String|"lgvgeoportal-hilfe@gv.hamburg.de"|eMail-Adresse(n) Empfänger|
|name|nein|String|"LGVGeoportalHilfe"|Name(n) Empfänger|


**Beispiel contact:**
```
#!json

"contact": {
            "name": "Kontakt",
            "glyphicon": "glyphicon-envelope",
            "serviceID": "80001",
            "from": [
              {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name": "LGVGeoportalHilfe"
              }
            ],
            "to": [
              {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name": "LGVGeoportalHilfe"
               }
             ],
            "ccToUser": true,
            "textPlaceholder": "Bitte formulieren Sie Ihre Anfrage.",
            "includeSystemInfo": true
        }
      }

```

******
******

#### Portalconfig.menu.legend ####

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Reiters unter dem die Legende in der Menüleiste erscheint.|
|isInitOpen|nein|Boolean|false|Gibt an, ob das Legendenmodul beim initialen Laden des Portals geöffnet ist.|

**Beispiel legend:**


```
#!json

"legend": {
        "name": "Legende",
        "glyphicon": "glyphicon-book"
      }

```


******
******

#### Portalconfig.menu.tools ####
Im Objekt *tools* werden die Werkzeuge, deren Reihenfolge und das Erscheinungsbild in der Menüleiste konfiguriert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[children](#markdown-header-portalconfigmenutoolschildren)|nein|Object||Objekte, die die Tools konfigurieren.|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Reiters unter dem der Baum in der Menüleiste erscheint.|
|isVisibleInMenu|nein|Boolean|true|Soll das Tool in der Menüleiste erscheinen.|

******

##### Portalconfig.menu.tools.children #####
Unter dem Objekt *children* werden die Werkzeuge und Funktionalitäten definiert welche im Portal verfügbar sein sollen. Folgende Werkzeuge stehen zur Verfügung:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[animation](#markdown-header-portalconfigmenutoolschildrenanimation)|nein|Object||Pendler Animation|
|[coord](#markdown-header-portalconfigmenutoolschildrencoord)|nein|Object||Koordinatenanzeige|
|[draw](#markdown-header-portalconfigmenutoolschildrendraw)|nein|Object||Zeichnen / Schreiben|
|[extendedFilter](#markdown-header-portalconfigmenutoolschildrenextendedfilter)|nein|Object||Erweiterter Filter|
|[featureLister](#markdown-header-portalconfigmenutoolschildrenfeaturelister)|nein|Object||WFS-Liste|
|[filter](#markdown-header-portalconfigmenutoolschildrenfilter)|nein|Object||Feature-Filter|
|[gfi](#markdown-header-portalconfigmenutoolschildrengfi)|nein|Object||Informationen abfragen|
|[kmlimport](#markdown-header-portalconfigmenutoolschildrenkmlimport)|nein|Object||KML Import|
|[measure](#markdown-header-portalconfigmenutoolschildrenmeasure)|nein|Object||Strecke / Fläche messen|
|[parcelSearch](#markdown-header-portalconfigmenutoolschildrenparcelsearch)|nein|Object||Flurstückssuche|
|[print](#markdown-header-portalconfigmenutoolschildrenprint)|nein|Object||Karte drucken|
|[routing](#markdown-header-portalconfigmenutoolschildrenrouting)|nein|Object||Routenplaner|
|[searchByCoord](#markdown-header-portalconfigmenutoolschildrencoord)|nein|Object||Koordinatensuche|
|[wfsFeatureFilter](#markdown-header-portalconfigmenutoolschildrenwfsfeaturefilter)|nein|Object||WFS Filter|
|[schulwegrouting](#markdown-header-portalconfigmenutoolschildrenschulwegrouting)|nein|Object||Schulwegrouting|
|[compareFeatures](#markdown-header-portalconfigmenutoolschildrencomparefeatures)|nein|Object||Feature-Vergleichsliste|

Werden mehrere Werkzeuge verwendet, so werden die Objekte mit Komma getrennt. Die Reihenfolge der Werkzeuge in der Konfiguration gibt die Reihenfolge der Werkzeuge im Portal wieder.

Die Werkzeuge können auch direkt in die Menüleiste eingebunden werden. Dazu muss lediglich das Objekt, welches ein Werkzeug definiert, unter *menu* eingetragen werden.
Im folgenden Beispiel würde das Werkzeug *Strecke / Fläche messen* in der Menüleiste untergebracht, wohingegen das Werkzeug *Flurstückssuche* unter dem Reiter *Werkzeuge* positioniert würde. Dadurch ist es möglich, für das Portal wichtige, Funktionen sehr dominant zu positionieren.

**Beispiel eines Werkzeuges, das in der Menüleiste ganz oben angebracht ist:**

```
#!json

"menu" : {
    "tree" : {
        "name" : "Themen",
        "glyphicon" : "glyphicon-list",
        "isInitOpen" : true
    },
    "measure" : {
        "name" : "Strecke / Fläche messen",
        "glyphicon" : "glyphicon-resize-full",
        "onlyDesktop" : true
    },
    "tools" : {
        "name" : "Werkzeuge",
        "glyphicon" : "glyphicon-wrench",
        "children" : {
            "parcelSearch" : {
                "name" : "Flurstückssuche",
                "glyphicon" : "glyphicon-search",
                "serviceId" : "6",
                "StoredQueryID" : "Flurstueck",
                "configJSON":"/../../node_modules/lgv-config/gemarkungen_hh.json",
                "parcelDenominator" : false
            },
            {...}
        }
    }
```

******
******

Darüber hinaus gibt es für die Werkzeuge weitere Konfigurationsmöglichkeiten, die im Folgenden erläutert werden.

#### Portalconfig.menu.tools.children.animation

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|
|attrAnzahl|nein|String|"anzahl_einpendler"|Aus diesem Attribut des featureTypes wird die Anzahl der Pendler ausgelesen.|
|attrKreis|nein|String|"wohnort_kreis"|Aus diesem Attribut werden die zur Auswahl stehenden Kreise ausgelesen.|
|colors|nein|Array[String]|["rgba(255,0,0,0.5)", "rgba(0,0,255,0.5)"]|Angabe der verschiedenen Farben, die für die Animation verschiedener Kreise genutzt werden sollen in [rgba()-Notation](https://www.w3.org/TR/css3-color/#rgba-color) ([siehe auch hier](https://developer.mozilla.org/de/docs/Web/CSS/Farben#rgba)). Anzahl der Farben muss mit "num_kreise_to_style" übereinstimmen.|
|featureType|nein|String|"mrh_einpendler_gemeinde"|FeatureType, der animiert werden soll.|
|maxPx|nein|Number|20|Größe des größten Punkts in px.|
|minPx|nein|Number|1|Größe des kleinsten Punkts in px.|
|num_kreise_to_style|nein|Number|2|Anzahl, der mit verschiedenen Farben darzustellenden Kreise. Muss mit der Anzahl der Farben in "colors" übereinstimmen.|
|[params](#markdown-header-animationparams)|nein|Object||Hier gibt es verschiedene Konfigurationsmöglichkeiten.|
|steps|nein|Number|50|Anzahl der Schritte, die pro Animation durchlaufen werden.|
|url|nein|String|"http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung"|Die URL des zu animierenden Dienstes.|
|zoomlevel|nein|Number|1|Zoomlevel, auf das nach Auswahl eines Kreises gezoomt wird.|

### animation.params ###
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|REQUEST|nein|String|"GetFeature"|WFS-Request|
|SERVICE|nein|String|"WFS"|Service-Typ|
|TYPENAME|nein|String|"app:mrh_kreise"|FeatureType des WFS|
|VERSION|nein|String|"1.1.0"|Version des Dienstes|
|maxFeatures|nein|String|"10000"|maximale Anzahl an zu ladenden Features|

**Beispiel animation:**

```
#!json
animation: {
            steps: 30,
            url: "http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung",
            params: {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                TYPENAME: "app:mrh_kreise",
                VERSION: "1.1.0",
                maxFeatures: "10000"
            },
            featureType: "mrh_einpendler_gemeinde",
            attrAnzahl: "anzahl_einpendler",
            attrKreis: "wohnort_kreis",
            minPx: 5,
            maxPx: 30,
            num_kreise_to_style: 4,
            zoomlevel: 1,
            colors: ["rgba(255,0,0,0.5)", "rgba(0,255,0,0.5)", "rgba(0,0,255,0.5)", "rgba(0,255,255,0.5)"]
        }
```
******
******

#### Portalconfig.menu.tools.children.coord ######
Ermöglicht die Ermittlung von Koordinaten in allen definierten Koordinatensystemen (siehe [namedProjections](config.js.md)). Der Titel wird dem "+title"-Attribut entnommen. Alternativ wird der Name (z.B. "EPSG:25832") verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|

******
******

#### Portalconfig.menu.tools.children.draw

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|
|isInitOpen|nein|Boolean|false|Gibt an, ob das Zeichnen Tool beim initialen Laden des Portals geöffnet ist.|

******
******

#### Portalconfig.menu.tools.children.extendedFilter ######
Der *erweiterte Filter* ist ein Filter, der in der Lage ist, sämtliche in der Karte verfügbaren WFS nach allen möglichen Attributen und -werten zu filtern.
Dazu muss für jeden WFS-Layer in der Layer-Konfiguration dem Werkzeug erlaubt werden, den Layer auch zu verwenden. Dies geschieht über folgenden Parameter:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|


******
******

#### Portalconfig.menu.tools.children.featureLister ######
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|lister|nein|Number|20|Gibt an wie viele Features mit jedem Klick geladen werden sollen.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|

******
******

#### Portalconfig.menu.tools.children.filter ######
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|nein|String||Name des Werkzeuges im Menüeintrag|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|isGeneric|nein|String|false||
|isInitOpen|nein|Boolean|false|Gibt an, ob das Zeichnen Tool beim initialen Laden des Portals geöffnet ist.|
|minScale|nein|Integer||Gibt den kleinsten Maßstab an auf den die Suche zoomt|
|predefinedQueries|nein|Object||Vordefinierter Filter der beim Aktivieren automatisch ausgeführt wird


******
******


#### Portalconfig.menu.tools.children.filter.predefinedQueries ####
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|layerId|ja|String||Id vom Layer auf dem der Filter ausgeführt wird|
|isActive|nein|Boolean||Wird der Filter initial ausgeführt|
|isSelected|nein|Boolean||Ist der Filter initial ausgewählt|
|isVisible|nein|Boolean|||
|searchInMapExtent|nein|Boolean|false|Suche im aktuellen Kartenausschnitt|
|allowMultipleQueriesPerLayer|nein|Boolean|false|gibt an ob für einen Layer mehrere Filter aktiv sein dürfen|
liveZoomToFeatures|nein|Boolean|false|gibt an ob bei jeder Auswahl eines Filterwertes direkt auf den Extent der übrigen Features gezoomt wird|
|name|nein|String||Name des Filters
|info|nein|String||Kleiner Info-Text der im Filter angezeigt wird
|predefinedRules|nein|Object||Regel für den vordefinierten Filter. Besteht aus Attributnamen und Attributwert(e)
|attributeWhiteList|nein|Array[String] / Array[[Object](#markdown-header-portalconfigmenutoolschildrenfilterpredefinedqueriesattributewhitelist)]||Filterbare Attribute. Können entweder als Array of Strings (Attributnamen) oder als Array[[Object](#markdown-header-portalconfigmenutoolschildrenfilterpredefinedqueriesattributewhitelist)] übergeben werden. Wird ein Array of Strigns übergeben, so werden bei Mehrfachauswahl die Werte eines Attributes mit ODER verknüpft.

**Beispiel:**

```
#!json

"filter": {
     "name": "Filter",
     "glyphicon": "glyphicon-filter",
     "isGeneric": false,
     "isInitOpen": true,
     "allowMultipleQueriesPerLayer": false,
     "predefinedQueries": [
         {
             "layerId": "8190",
             "isActive": false,
             "isSelected": false,
             "isVisible": false,
             "name": "Grundschulen",
             "predefinedRules": [
                 {
                     "attrName": "kapitelbezeichnung",
                     "values": ["Grundschulen"]
                 }
             ],
             "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "parallelklassen_1", "schwerpunktschule", "bilingual"]
         }
     ]
 }
```
#### Portalconfig.menu.tools.children.filter.predefinedQueries.attributeWhitelist ####

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Attribut-Name.|
|matchingMode|ja|String||Modus wie die Werte eines Attributes bei Mehrfachauswahl verknüpft werden sollen. "AND" für UND-Verknüpfung oder "OR" für ODER-Verknüfpung innerhalb eines Attributes.|

**Beispiel:**

```
#!json

"attributeWhiteList": [
  {"name": "bezirk", "matchingMode": "OR"},
  {"name": "stadtteil", "matchingMode": "OR"},
  {"name": "abschluss", "matchingMode": "AND"},
  {"name": "anzahl_schueler", "matchingMode": "AND"},
  {"name": "fremdsprache", "matchingMode": "AND"}
]
```


#### Portalconfig.menu.tools.children.gfi ######

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|isActive|nein|Boolean|false|Werkzeug wird initial (beim Laden des Portals) aktiviert.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|
|isVisibleInMenu|nein|Boolean|true|Gibt an ob das Werkzeug im Menu angezeigt wird.|


******
******

#### Portalconfig.menu.tools.children.kmlimport ######

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|

******
******

#### Portalconfig.menu.tools.children.measure ######

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|

******
******



#### Portalconfig.menu.tools.children.parcelSearch ######
Flurstücksuche

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|configJSON|nein|String||Pfad zur *gemarkungen_xx.json* (weitere Infos finden Sie im Anschluss an diese Tabelle).|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|
|parcelDenominator|nein|Boolean|false|Gibt an ob auch Flure mit an die *StoredQuery* übergeben werden.|
|serviceId|nein|String||ID, des Gazeteer-WFS. Wird in der [rest-services.json](rest-services.json.md) aufgelöst.|
|storedQueryID|nein|String||Name der *StoredQuery*, die angesprochen werden soll.|
|createReport|nein|Bool|false|Gibt an ob eine Berichtsfunktionalität erstellt werden soll.|
|reportServiceId|nein|String||Gibt die ID des Dienstes an, der aufgerufen werden soll.|

******
******


__Gemarkungen_xx.json__
Die *gemarkungen_xx.json* wird benötigt, um anhand des Gemarkungsnamens die ID der Gemarkung aufzulösen.
Wird das Array für die Flure nicht gefüllt (Spezialfall für HH), so muss für das Werkzeug der Parameter *parcelDenominator* auf *false* gesetzt werden.
Wird *parcelDenominator* auf *true* gesetzt, so verlangt das Werkzeug auch „flur“-Einträge in der *gemarkung_xx.json*. In der Werkzeugoberfläche kann man nun die Flurstückssuche weiter auf die Flure einschränken.
**ACHTUNG:** Dieses Tool und Teile der Konfiguration sind abhängig von den nutzerseitig angelegten Web-Diensten und Datenbankfunktionen.

**Beispiel einer *gemarkungs_xx.json* ohne „flur“:**


```
#!json

{
    "Allermöhe": { "id": "0601", "flur": []},
    "Alsterdorf": { "id": "0424", "flur": []},
    "Alt-Rahlstedt": { "id": "0544", "flur": []},
…
}


```

**Beispiel einer *gemarkungs_xx.json* mit „flur“:**


```
#!json

{
    "Allermöhe": { "id": "0601", "flur": [„Flur1“,“Flur2“]},
    "Alsterdorf": { "id": "0424", "flur": [„011“,“012“,“013“]},
    "Alt-Rahlstedt": { "id": "0544", "flur": [„025“,“026“,…]},
…
}

```

******
******

#### Portalconfig.menu.tools.children.print ######

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|
|gfi|nein|Boolean|false|Gibt an, ob nur die Karte oder auch geöffnete GFI-Informationen ausgedruckt werden sollen.|
|printID|nein|String|"9999"|ID des Druckdienstes in der restConf. Siehe [rest-services.json](rest-services.json.md).|
|title|nein|String|"PrintResult"|Der Titel erscheint auf dem Ausdruck der Karte.|
|[gfiMarker](#markdown-header-gfiMarker)|nein|Object||Ist ein Objekt, um den Standardkonfigurierten roten Kreis mit schwarzem Punkt für die Markierung des GFI im Druck zu überschreiben.|
|configYAML|nein|String|master|Der Name der YAML-Datei der MapFish-Webapp.|
|outputFilename|nein|String|Ausdruck|Der Dateiname der PDF, den die MapFish-Webapp erstellt.|

**Beispiel:**


```
#!json

"print": {
            "name": "Karte drucken",
            "glyphicon": "glyphicon-print",
            "printID": "99999",
            "title": "Master",
            "gfi": true,
            "outputFilename": "DruckPDF",
            "gfiMarker": {
              "outerCircle": {
                "fill": false,
                "pointRadius": 8,
                "stroke": true,
                "strokeColor": "#ff0000",
                "strokeWidth": 3
              },
              "point": {
                "fill": true,
                "pointRadius": 1,
                  "fillColor": "#000000",
                  "stroke": false
                }
            }
          }
```

******
******
#### Portalconfig.menu.tools.children.print.gfiMarker ####
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|outerCircle|nein|Object||Kann die im Beispiel enthaltenen Attribute haben und mit entsprechenden Werten gefüllt werden.|
|point|nein|Object||Kann die im Beispiel enthaltenen Attribute haben und mit entsprechenden Werten gefüllt werden.|

#### Portalconfig.menu.tools.children.routing ######
Der Routenplaner ermöglicht ein Routing innerhalb des Portals. Folgende Parameter müssen am Werkzeug vorhanden sein:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|isInitOpen|nein|Boolean|false|Gibt an, ob das Routingmodul beim initialen Laden des Portals geöffnet ist.|
|bkgGeosearchID|nein|String||ID des GeoSuchdienstes des BKG. Anhand der vom Nutzer angeklickten finalen Adresse wandelt dieser Dienst den Namen in eine Koordinate um und gibt diese zurück. Die Koordinate wird benötigt, um den Routingdienst mit Daten zu füllen. Wird in der [rest-services.json](rest-services.json.md) aufgelöst.|
|bkgSuggestID|nein|String||ID des Vorschlagsdienstes des BKG. Der Dienst gibt eine Trefferliste möglicher Adressen zurück, die auf den Eingabestring des Nutzers passen. Werden als Dropdown-Menü dargestellt. Wird in der [rest-services.json](rest-services.json.md) aufgelöst.|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|
|viomRoutingID|nein|String||ID des Routing-Dienstes. Der Dienst berechnet aufgrund von Start- und Ziel-Koordinate die schnellste Route. Wird in der [rest-services.json](rest-services.json.md) aufgelöst.|


******
******


#### Portalconfig.menu.tools.children.searchByCoord ######

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|isActive|nein|Boolean|false|Werkzeug wird initial (beim Laden des Portals) aktiviert.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|


******
******

#### Portalconfig.menu.tools.children.wfsFeatureFilter ######
Der WFS-Featurefilter ermöglicht das Filtern innerhalb eines Layers. Dabei kann nur nach den Attributen und -werten gefiltert werden, die in der WFS-Layer-Konfiguration in den [filterOptions](#markdown-header-filteroptions) definiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|onlyDesktop|nein|Boolean|false|Werkzeug wird nur in der Desktop-Variante des Portals angezeigt.|

**Beispiel tools:**


```
#!json

 "tools": {
        "name": "Werkzeuge",
        "glyphicon": "glyphicon-wrench",
        "children": {
          "parcelSearch": {
            "name": "Flurstückssuche",
            "glyphicon": "glyphicon-search",
            "serviceId": "6",
            "StoredQueryID": "Flurstueck",
            "configJSON": "/../../node_modules/lgv-config/gemarkungen_hh.json",
            "parcelDenominator": false
          },
          "measure": {
            "name": "Strecke / Fläche messen",
            "glyphicon": "glyphicon-resize-full",
            "onlyDesktop": true
          },
          "coord": {
            "name": "Koordinaten abfragen",
            "glyphicon": "glyphicon-screenshot"
          },
          "gfi": {
            "name": "Informationen abfragen",
            "glyphicon": "glyphicon-info-sign",
            "isActive": true
          },
          "print": {
            "name": "Karte drucken",
            "glyphicon": "glyphicon-print"
          },
          "searchByCoord": {
            "name": "Koordinatensuche",
            "glyphicon": "glyphicon-record"
          },
          "kmlimport": {
            "name": "KML Import",
            "glyphicon": "glyphicon-import"
          },
          "wfsFeatureFilter": {
            "name": "Filter",
            "glyphicon": "glyphicon-filter"
          },
          "extendedFilter": {
            "name": "Erweiterter Filter",
            "glyphicon": "glyphicon-filter"
          },
          "routing": {
            "name": "Routenplaner",
            "glyphicon": "glyphicon-road",
            "viomRoutingID": "7",
            "bkgSuggestID": "4",
            "bkgGeosearchID": "5"
          },
          "draw": {
            "name": "Zeichnen / Schreiben",
            "glyphicon": "glyphicon-pencil"
          },
          "featureLister": {
              "name": "Liste",
              "glyphicon": "glyphicon-menu-hamburger",
              "lister": 10
          },
          "animation": {
            "name": "Pendler Animation",
            "glyphicon": "glyphicon-play-circle"
          }
        }
      }
```


******
******

#### Portalconfig.menu.tools.children.schulwegrouting ######
Das Schulwegrouting ermöglicht das Routing von einer eingegebenen Addresse zur angegebenen Schule.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|layerId|ja|String|""|Id des Layers der die Schulstandorte enthält.|

******
******
#### Portalconfig.menu.tools.children.compareFeatures ######
Die Vergleichsliste ermöglicht einen Vergleich zwischen mehrerer Features eines Vektor-Layers. Über ein Radio.trigger() können features zugefügt werden. Werden Features aus unterschiedlichen Layern zugefügt, so werden die Features nach Layer sortiert.
Es werden nur die Attribute in der gegebenen Reihenfolge angezeigt, die in der services.json am Layerobjekt konfiguriert sind.
Auch gibt es eine Möglichkeit die Vergleichsliste zu exportieren

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|name|nein|String||Name des Werkzeuges im Menüeintrag.|
|numberOfFeaturesToShow|nein|integer|3|Anzahl der Features, die maximal pro Layer vergleichen werden kann|
|numberOfAttributesToShow|nein|integer|12|Anzahl der Attribute die beim öffnen der Vergleichsliste angezeigt wird. Über einen Button ("mehr Infos") können dann alle Attribute angezeigt werden.|


******
******

#### Portalconfig.menu.tree ####
Unter *tree* wird der Themenbaum konfiguriert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|glyphicon|nein|String||Das Glyphicon (Bootstrap Class) als Logo.|
|isInitOpen|nein|Boolean|false|Gibt an ob der Themenbaum beim initialen Laden des Portals geöffnet ist oder nicht.|
|name|nein|String||Name des Reiters unter dem der Baum in der Menüleiste erscheint.|

**Beispiel einer *tree*-Konfiguration:**


```
#!json

"tree": {
        "name": "Themen",
        "glyphicon": "glyphicon-list",
        "isInitOpen": true
      }

```

******
******

### Portalconfig.portalTitle ###
In der Menüleiste kann der Portalname und ein Bild angezeigt werden, sofern die Breite der Leiste ausreicht. Der Portaltitle ist mobil nicht verfügbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|title|nein|String|Master|Name des Portals.|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|
|link|nein|String|http://geoinfo.hamburg.de|URL der externen Seite, auf die verlinkt wird.|
|tooltip|nein|String|Landesbetrieb Geoinformation und Vermessung|Tooltip beim Hovern über dem Portaltitel angezeigt wird.|

**Beispiel portalTitle:**


```
#!json

"portalTitle": {
  "title": "Master",
  "logo": "../../img/hh-logo.png",
  "link": "http://geoinfo.hamburg.de",
  "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}

```

******

### Portalconfig.searchBar ###
Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden. Auch diese Konfigurationen sind vom Typ *object*. Sie sind ebenfalls verlinkt und werden im Anschluss an diese Auflistung näher beschrieben.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[bkg](#markdown-header-portalconfigsearchbarbkg)|nein|Object||Ein deutschlandweites Ortsverzeichnis.|
|[gazetteer](#markdown-header-portalconfigsearchbargazetteer)|nein|Object||Das Ortsverzeichnis von Hamburg.|
|minChars||Number||Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|
|placeholder|nein|String|"Suche"|Platzhaltertext in der Suchleiste. Gibt dem Nutzer an welche Themen gesucht werden können.|
|recommendedListLength|nein|Integer|5|Anzahl der Suchvorschläge.|
|quickHelp|nein|Boolean|false|Gibt an ob eine portalseitige Hilfe angezeigt werden soll. Wenn sie nicht gesetzt ist, wird der globale Wert aus der config.js verwendet.|
|[specialWFS](#markdown-header-portalconfigsearchbarspecialwfs)|nein|Object||Durchsuchen von speziell definierten WFS-Layern.|
|[tree](#markdown-header-portalconfigsearchbartree)|nein|Object||Themensuche. Durchsucht den Themenbaum des Portals.|
|[visibleWFS](#markdown-header-portalconfigsearchbarvisiblewfs)|nein|Object||Durchsuchen von sichtbar geschalteten WFS-Layern.|
|zoomLevel||Number||Zoomstufe, in der das gesuchte Objekt angezeigt wird.|
|renderToDOM|nein|String||HTML ID an deren Objekt sich die Suchleiste rendern soll. Bei  "#searchbarInMap" wird die Suchleiste auf der Karte gezeichnet.|

******

#### Portalconfig.searchBar.bkg ####
Der Suchdienst des BKG ([Bundesamt für Kartographie und Geodäsie](https://www.bkg.bund.de/DE/Home/home.html)) wird angefragt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|epsg|nein|String|EPSG:25832|EPSG-Code des verwendeten Koordinatensystems.|
|extent|nein|Array[]|[454591, 5809000, 700000, 6075769]|Koordinatenbasierte Ausdehnung in der gesucht wird.|
|filter|nein|String|filter=(typ:*)|Filterstring|
|geosearchServiceId|ja|String||Gibt die ID für die URL in der [rest-services.json](rest-services.json.md) vor|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|
|score|nein|Number|0.6|Score-Wert, der die Qualität der Ergebnisse auswertet.|
|suggestCount|nein|Number|20|Anzahl der über *suggest* angefragten Vorschläge.|
|suggestServiceId|ja|String||Gibt die ID für die URL in der [rest-services.json](rest-services.json.md) vor.|

**Beispiel bkg:**


```
#!json

"bkg": {
            "minChars": 3,
            "suggestServiceId": "4",
            "geosearchServiceId": "5",
            "extent": [454591, 5809000, 700000, 6075769],
            "suggestCount": 10,
            "epsg": "EPSG:25832",
            "filter": "filter=(typ:*)",
            "score": 0.6
        }

```

******

#### Portalconfig.searchBar.gazetteer ####
Der Gazetteer-Dienst des LGV wird angefragt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor Suche initiiert wird.|
|searchDistricts|nein|Boolean|false|Soll nach Stadtteilen gesucht werden?|
|searchHouseNumbers|nein|Boolean|false|Sollen auch Hausnummern gesucht werden oder nur Straßen?|
|searchParcels|nein|Boolean|false|Soll nach Flurstücken gesucht werden?|
|searchStreetKey|nein|Boolean|false|Soll nach Strassenschlüsseln gesucht werden?|
|searchStreets|nein|Boolean|false|Soll nach Straßennamen gesucht werden? Voraussetzung für *searchHouseNumbers*.|
|serviceID|ja|String||Gibt die ID für die URL in der [rest-services.json](rest-services.json.md) vor.|
|url||String||URL des WFS-Dienstes|

**Beispiel gazetteer:**


```
#!json

"gazetteer": {
            "minChars": 3,
            "serviceId": "6",
            "searchStreets": true,
            "searchHouseNumbers": true,
            "searchDistricts": true,
            "searchParcels": true,
            "searchStreetKey": true
        }

```

******

#### Portalconfig.searchBar.specialWFS ####
Die definierten WFS-Dienste werden angefragt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[definitions](#markdown-header-portalconfigsearchbarspecialwfsdefinitions)|ja|Array[Object]||Ein Array von Dienst-Objekten die initial ausgelesen werden (**url**: URL des WFS-Dienstes, **data**: Parameter des WFS-Requests, **name**: MetaName in Suche, **glyphicon**: Glyphicon in Suche.|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|
|timeout|nein|Number|6000|Timeout der Ajax-Requests im Millisekunden.|


##### Portalconfig.searchBar.specialWFS.definitions #####

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|url|ja|String||URL des WFS-Dienstes|
|data|ja|String||Parameter des WFS-Requests zum Filtern der featureMember auf Suchstring (erstes Element des featureMember).|
|name|ja|String||MetaName der Kategorie. Wird nur zur Anzeige in der Vorschlagssuche verwendet.|
|glyphicon|nein|String|"glyphicon-home"|Bezeichnung des Glyphicons. Wird nur zur Anzeige in der Vorschlagssuche verwendet.|

**Beispiel specialWFS:**


```
#!json

  "specialWFS": {
            "minChar": 3,
            "timeout": 2000,
            "definitions": [
                {
                    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                    "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_festgestellt&propertyName                    =planrecht",
                    "name": "bplan"
                },
                {
                    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                    "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_imverfahren&propertyName=                    plan",
                    "name": "bplan"
                }
            ]
        }
```

*****

#### Portalconfig.searchBar.tree ####
Alle Layer, die im Themenbaum des Portals sind, werden durchsucht.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|

**Beispiel tree:**


```
#!json

 "tree": {
           "minChars": 3
         }
```


******

#### Portalconfig.searchBar.visibleWFS ####
Die Namen aller sichtbaren WFS-Dienste werden durchsucht.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|

**Beispiel visibleWFS:**


```
#!json

"visibleWFS": {
           "minChars": 3
       }
```

******

#### Portalconfig.searchBar.osm ####
Suche bei OpenStreetMap ueber Stadt, Straße und Hausnummer

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minChars|nein|Number|3|Mindestanzahl an Zeichen im Suchstring, bevor die Suche initiiert wird.|
|serviceID|ja|String||Gibt die ID für die URL in der [rest-services.json](rest-services.json.md) vor.|
|limit|nein|Number|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|
|states|nein|string|kann die Namen der Bundesländer (entsprechend der Ausgabe für "address.state" der Treffer), für die Ergebnisse erzielt werden sollen, enthalten; Trenner beliebig|

**Beispiel osm:**

```
#!json

"osm": {
    "minChars": 3,
    "serviceId": "9",
    "limit": 60,
    "states": "Hamburg"
}
```

******
******
******

## Themenconfig ##
Layer die in der [services.json](services.json.md) beschrieben sind, können über die *Themenconfig* in das Portal über ihre ID eingebunden und zusätzlich konfiguriert werden. Die Konfiguration spiegelt die Themenbaumstruktur im Portal wieder. Sie ist unterteilt in Hintergrundkarten und Fachdaten.


```
#!json

"Themenconfig":
  {
    "Hintergrundkarten": {},
    "Fachdaten": {}
  }

```

******

### Themenconfig.Hintergrundkarten ###
Der Abschnitt Hintergrundkarten besteht aus dem Attribut _Layer_. Es ist ein Array bestehend aus Objekten, welche jeweils einen Layer in der Karte beschreiben. In Portalen mit dem Baumtyp *light*, werden die unter Hintergrundkarten beschriebenen Layer entsprechend der Konfigurationsreihenfolge von unten nach oben im Themenbaum einsortiert. Bei Portalen vom Baumtyp *custom* werden die Layer im Menüpunkt Themen/Hintergrundkarten, ebenfalls von unten nach oben, einsortiert.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|ja|Array [String] oder String||ID aus [services.json](services.json.md).|
|name|nein|String|Name aus der [services.json](services.json.md)|Layername|
|transparency|nein|Number|0|Layertransparenz|
|visibility|nein|Boolean|false|Initiale Sichtbarkeit des Layers.|


**Beispiel Hintergrundkarten:**


```
#!json

"Hintergrundkarten":
    {
      "Layer": [
        {
          "id": "453",
          "transparency": "80"
        },
        {
          "id": "452"
        },
        {
          "id": ["713", "714", "715", "716"],
          "name": "Geobasiskarten (schwarz-weiß)",
          "visibility": true
        }
      ]
    }

```

******


### Themenconfig.Fachdaten ###
Wenn es sich um Portale vom Baumtyp *custom* handelt, gibt es die zusätzliche Möglichkeit, Layer unterhalb von Fachdaten in Ordner zusammenzufassen. Ordner können wiederum auch Unerordner enthalten, so kann eine beliebig tiefe Verschachtelung entstehen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|Layer|nein|Array||Layerobjekte|
|Ordner|nein|Array||Ordnerobjekte|
|Titel|nein|String||Ordnername|
|isFolderSelectable|nein|Boolean|[globaler Wert](config.js.md#tree)|Legt fest, ob eine Auswahlbox zur Selektierung aller Layer eines Ordners angezeigt werden soll. Diese Eigenschaft ist nur für Blatt-Ordner (die ausschließlich Layer enthalten) relevant.|

**Beispiel Ordnerkonfiguration Fachdaten:**


```
#!json

 "Fachdaten":
        {
          "Ordner": [
            {
              "Titel": "Lage und Gebietszugehörigkeit",
              "Ordner": [
                {
                  "Titel": "Überschwemmungsgebiete",
                  "Ordner": [
                    {
                      "Titel": "Überschwemmungsgebiete",
                      "isFolderSelectable": true,
                      "Layer": [
                        {
                          "id": "1103",
                          "visibility": false
                        },
                        {
                          "id": "1104",
                          "visibility": false
                        }
                      ]
                    }
                  ],
                  "Layer": [
                    {
                      "id": "684",
                      "visibility": false
                    }
                  ]
                }
              ],
 "Layer": [
                {
                  "id": "2427",
                  "visibility": false
                },
                {
                  "id": "2426",
                  "visibility": false
                },
                {
                  "id": "936",
                  "visibility": false,
                  "name": "Hafengebiet (§ 2 HafenEG)",
                  "metaName": "Hafengebiet (§ 2 HafenEG)"
                }
              ]
            }
         ]
       }


```

******

### Themenconfig.Fachdaten.Layer ###
In diesem Abschnitt werden die Konfigurationsoptionen zur Steuerung der Darstellung von Layern auf der Karte beschrieben. 

**Folgende Konfigurationen sind allgemeingültig:**

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|displayInTree|nein|Boolean|true|Soll der Layer im Themenbaum angezeigt werden?|
|gfiTheme|nein|String|Wert aus der [services.json](services.json.md) sonst *"default"*|Style für das GFI-Popover *(„default“* / *„table“*).|
|id|ja|Array [String] oder String||Siehe [Eingabe von ID](#markdown-header-layerid).|
|children|nein|Array [Themenconfig.Fachdaten.Layer]||Für Grouplayer. Siehe [Eingabe von ID](#markdown-header-layerid).
|layerAttribution|nein|HTML-String|Wert aus der [services.json](services.json.md)|Zusatzinformationen zum Layer, die in der Karte angezeigt werden sollen. Voraussetzung Control [attributions](#markdown-header-portalconfigcontrols) ist aktiviert.|
|legendURL|nein|Array[String] oder String|Wert aus der [services.json](services.json.md)|URL zur Legende|
|maxScale|nein|String|Wert aus der [services.json](services.json.md)|Höchste Maßstabszahl, bei der ein Layer angezeigt wird.|
|minScale|nein|String|Wert aus der [services.json](services.json.md)|Niedrigste Maßstabszahl, bei der ein Layer angezeigt wird.|
|name|nein|Array[String] oder String|Wert aus der [services.json](services.json.md)|Layername|
|transparency|nein|Number|0|Layertransparenz|
|visibility|nein|Boolean|false|Initiale Sichtbarkeit des Layers.|
|autoRefresh|nein|Number||Automatischer Reload des Layers zum Aktualisieren der Inhalte (in Millisekunden > 500).|

**Folgende Layerkonfigurationen gelten nur für WMS:**

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|attributesToStyle|nein|Array[String]||Attribute über die gestlyt werden soll.|
|featureCount|nein|Number|1|Anzahl der Features beim GFI-Request.|
|geomType|nein|String||Geometrietyp des Layers, bisher nur Polygon.|
|infoFormat|nein|String|Wert aus der [services.json](services.json.md) sonst *„text/xml“*|Format für die GFI-Abfrage.|
|styleable|nein|Boolean||True -> Layer kann im Client anders gestylt werden. Zusätzlich müssen *geomType* und *attributesToStyle* gesetzt werden.|
|styles|nein|Array [String]||Nur bei WMS-Layern. Fragt dem WMS mit eingetragenem Styles-Eintrag ab.|

**Folgende Layerkonfigurationen gelten nur für WFS:**

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|clusterDistance|nein|Number||Werte > 0 nutzen Clustering. Radius in Px auf der Karte, in welchem alle Features zu einem einzigen Feature aggregiert werden.|
|extendedFilter|nein|Boolean||Um sämtliche verfügbare WFS zu filtern, muss für jeden WFS-Layer in der Layer-Konfiguration dem Werkzeug extendedFilter erlaubt werden, den Layer auch zu verwenden. Siehe [Portalconfig.menu.tools.children.extendedFilter](#markdown-header-PortalconfigmenutoolschildrenextendedFilter)|
|[filterOptions](#markdown-header-filteroptions)|nein|Object||Filtereinstellungen für diesen Layer, wird vom Tool  [wfsFeatureFilter](#markdown-header-portalconfigmenutoolschildrenwfsfeaturefilter) ausgewertet|
|mouseHoverField|nein|Array [String] oder String||Attributename, der beim MouseHover-Event als Tooltip angzeigt wird. Voraussetzung Control „Mousehover“ ist aktiviert (siehe [config.js](config.js.md)).|
|routable|nein|Boolean||true -> wenn dieser Layer beim der GFI-Abfrage als Routing Destination ausgewählt werden darf. Voraussetzung Routing ist konfiguriert.|
|searchField|nein|String || Attray [String]||Attributname[n], über den die Suche die Featuers des Layers finden kann.|
|styleId|ja|String||Weist dem Layer den Style aus der [style.json](style.json.md).|


#### filterOptions ####
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|fieldName|ja|String||Attributname des WFS.|
|filterName|ja|String||Name des Filters im Werkzeug|
|filterString|ja|String||Mögliche Filterwerte, welche der Nutzer als Dropdown-Menü erhält.|
|filterType|ja|String||Name des zulässigen Filtertyps. Derzeit nur combo.|

**Beispiel Fachdaten:**


```
#!json

“Layer”: [
   {
          "id": "2407",
          "visibility": false,
          "infoFormat": "text/html"
      },
    {
          "id": "1711",
          "styleId": "1711",
          "visibility": false,
          "layerAttribution": "<span>Attributierung für Fachlayer</span>",
          "mouseHoverField": ["name", "strasse"],
          "searchField": "name",
          "extendedFilter": true,
          "filterOptions": [
            {
              "fieldName": "teilnahme_geburtsklinik",
              "filterType": "combo",
              "filterName": "Geburtsklinik",
              "filterString": ["*", "Ja", "Nein"]
            },
            {
              "fieldName": "teilnahme_notversorgung",
              "filterType": "combo",
              "filterName": "Not- und Unfallversorgung",
              "filterString": ["*", "Ja", "Eingeschränkt", "Nein"]
            }
          ]
    }
]
```
### Layer.id ###
Die [id einer Layerkonfiguration](#markdown-header-themenconfigfachdatenlayer) kann auf drei unterschiedliche Arten definiert werden:

**Beispiel für einfache Layer:**

In diesem Fall wird die genannte ID in der [services.json](services.json.md) gesucht. Der gefundene Eintrag definiert den Layer.

```
#!json

{
  "id": "453"
}
```

**Beispiel für WMS multiple Layers:**

In diesem Fall wird zunächst der erste Eintrag des Array in der [services.json](services.json.md) gesucht. Der gefundene Eintrag definiert den Layer gemäß den Angaben in der [services.json](services.json.md) vollständig.  
Alle weiteren Werte im Array werden dahingehend ausgewertet, dass ihre _layers_-Angabe den  _layers-Parameter_ des Dienstes erweitern. Dies dient der gleichzeitigen Abfrage aller Layer in einem Request. Näheres kann der [Dokumentation](http://docs.geoserver.org/latest/en/user/services/wms/reference.html#wms-getmap) entnommen werden. Dem Themenbaum wird nur ein Eintrag hinzugefügt.

```
#!json

{
  "id":["538","539","540"]
}
```

**Beispiel für openlayers Layer Collection (GroupLayer):**

In diesem Fall wird ein ol/layer/Group Object gebildet. Ein Grouplayer kann aus ganz unterschiedlichen Layertypen bestehen, bspw. auch gemischt aus WMS und WFS. Ein Grouplayer stellt den Inhalt über einen Eintrag im Themenbaum zur Verfügung. Siehe auch die [openlayers Dokumentation](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html).  

* Die Konfiguration erfolgt über den Parameter _children_. Er ist ein Array bestehend aus [Layerkonfigurationen](#markdown-header-themenconfigfachdatenlayer). 
* Das Attribut _id_ wird in diesem Fall als unique _String_ erwartet und darf nicht in der [services.json](services.json.md) gelistet sein.
    * Über diesen Eintrag werden die _children_ gruppiert.
    * Über diesen Eintrag ist ein parametrisierter Aufruf möglich.
  
Es gelten folgende Besonderheiten:  

* Im Falle eines GFI wird jeder Layer einzeln abgefragt. 
* Legenden werden aus allen children einzeln erstellt und gemeinsam dargestellt. 
* Die Layerinformationen werden gekürzt (nur erster Layer) übernommen.

```
#!json

{
  "id": "myUniqueId",
  "children": [    
    {
      "id": "947"
    },
    {
      "id": "946"
    },
    {
      "id":"2714",
      "gfiTheme":"reisezeiten",
      "styleId":"2119"
    },
    {
      "id": "1562"
    }
  ]
}
```
>Zurück zur [Dokumentation Masterportal](doc.md).
