>Zurück zur [Dokumentation Masterportal](doc.md).


Es ist möglich, über Parameter in der URL spezielle Einstellungen der Konfiguration zu überschreiben bzw. initiale Aktionen auszuführen. Als Trennzeichen zwischen URL und Parameterauflistung wird ein "?" verwendet. Die einzelnen Parameter werden durch "&" miteinander verknüpft.

**Beispiel:**

*http://geoportal-hamburg.de/Geoportal/geo-online/?layerIDs=453,1731,2426&visibility=true,true,false&transparency=0,40,0&center=565874,5934140&zoomlevel=2*

**Folgende Parameter existieren:**

|Name|Beschreibung|Beispiel|
|----|------------|--------|
|bezirk|Zoomt auf den Umring des angegebenen Hamburger Bezirks.|`&bezirk=wandsbek`|
|projection|Gibt den Namen des Quellkoordinatensystems an, aus dem in der URL angegebene Koordinaten stammen.|`&projection=EPSG:4326`|
|center|Verschiebt den Kartenausschnitt auf die angegebene Adresse. Ist der Parameter `projection` angegeben, werden die Koordinaten aus dem angegebenen Quellkoordinatensystem für die Karte umgerechnet. Die Koordinaten müssen dem in `projection` (wenn vorhanden) angegebenen oder alternativ dem für die Karte konfigurierten Koordinatensystem angehören (siehe [config.namedProjections.epsg](config.js.md)).|`&center=565874,5934140`|
|marker|Setzt einen Map Marker auf die angegebenen Koordinaten und zoomt auf diesen. Ist der Parameter `projection` angegeben, werden die Marker-Koordinaten aus der angegebenen Projektion für die Karte konvertiert. Die Koordinaten müssen dem in `projection` (wenn vorhanden) angegebenen oder alternativ dem für die Karte konfigurierten Koordinatensystem angehören (siehe [config.namedProjections.epsg](config.js.md)).|`&marker=565874,5934140`|
|layerids|Mit diesem Parameter können initial anzuzeigende Layer überschrieben werden. Die Wirkung ist von [config.Portalconfig.Baumtyp](config.json.md) abhängig. Bei *light* werden die layerIds ergänzend sichtbar geschaltet. Ansonsten wird die Voreinstellung komplett überschrieben. Diese Einstellung kann um [Sichtbarkeit](URL-Parameter.md) und [Transparenz](URL-Parameter.md) ergänzt werden.|`&layerids=453,2128`|
|query|Führt eine Adresssuche im Suchschlitz mit dem angegebenen String aus. Hausnummern müssen mit Komma getrennt werden.|`&query=Neuenfelder Straße,19`|
|isinitopen|Die übergebene Modul-ID wird initial geöffnet. Von Modulen des Typs Tools, die sich in einem Fenster öffnen, kann immer nur eins offen sein. |`&isinitopen=routing`|
|transparency|nur gemeinsam mit layerids zu verwenden. Transparenz der Layer kommagetrennt von 0-100. Kann für jeden Layer in layerids angegeben werden.|`&layerids=453,2128&transparency=0,40`|
|visibility|nur gemeinsam mit layerids zu verwenden. Sichtbarkeit der Layer kommagetrennt als Boolean (true, false)|`&layerids=453,2128&visibility=true,false`|
|zoomlevel|Zoomt auf die Maßstabsstufe, die angegeben wurde (siehe [config.view.options](config.js.md)).|`&zoomlevel=2`|
|featureid|Zoomt auf die Features des WFS-Dienstes, der in der config.js konfiguriert ist (siehe [config.zoomtofeature](config.js.md)).|`&featureid=18,26`|
|config| Legt eine zu verwendende Konfigurationsdatei fest. Die Angabe erfolgt mittels einer absoluten URL (`http://...` bzw. `https://...`) oder eines relativen Pfades. Im zweiten Fall wird der in der config.js([config.portalConf](config.js.md)) angegebene Pfad mit diesem Parameter kombiniert und ergibt den kompletten Pfad zur config.json.|`&config=config.json`|
|style| Definiert ob eine besondere Variante der Bedienelemente angezeigt werden soll, z.B. komplett ohne Bedienlemente zur Einbindung als Iframe ("simple") |`&style=simple`|
|highlightfeature| Definiert welches Feature aus welchem layer gehighlighted werden soll. Dabei werden in einem String die LayerId und dann die FeatureId kommasepariert übergeben. |`&highlightfeature=`layerid`,`featureId|
|clickcounter| Überschreibt das default Verhalten des clickCounter Moduls (siehe [config.clickCounter](config.js.md)), indem hier ein fester Typ der URL [desktop|mobile] eingetragen wird. Dieser Schalter ist z.B. sinnvoll, wenn das Portal seinerseits per iFrame eingebunden wurde und die übergeordnete Seite die desktop oder mobile Darstellung auswerten möchte. |`&clickcounter=desktop`|
