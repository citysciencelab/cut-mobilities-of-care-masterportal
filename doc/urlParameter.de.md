>Zurück zur [Dokumentation Masterportal](doc.de.md).


Es ist möglich, über Parameter in der URL spezielle Einstellungen der Konfiguration zu überschreiben bzw. initiale Aktionen auszuführen. Als Trennzeichen zwischen URL und Parameterauflistung wird ein "?" verwendet. Die einzelnen Parameter werden durch "&" miteinander verknüpft.

**Beispiel:**

**https://geoportal-hamburg.de/Geoportal/geo-online/?layerIDs=453,1731,2426&visibility=true,true,false&transparency=0,40,0&center=565874,5934140&zoomlevel=2**

**Folgende Parameter existieren:**

|Name|Beschreibung|Beispiel|
|----|------------|--------|
|BEZIRK|Deprecated in 3.0.0 Bitte das Attribut "zoomToGeometry" verwenden. Zoomt auf den Umring eines Features, das über einen WFS abgerufen wird. Die möglichen Parameter sind von **[config.zoomToGeometry](config.js.de.md)** abhängig. Alternativ zum namen des Features kann auch die Position im Array "geometries" zum Aufruf verwendet werden (Beginnend bei 1). |`&bezirk=wandsbek`|
|CENTER|Verschiebt den Kartenausschnitt auf die angegebene Adresse. Ist der Parameter `projection` angegeben, werden die Koordinaten aus dem angegebenen Quellkoordinatensystem für die Karte umgerechnet. Die Koordinaten müssen dem in `projection` (wenn vorhanden) angegebenen oder alternativ dem für die Karte konfigurierten Koordinatensystem angehören (siehe **[config.namedProjections.epsg](config.js.de.md)**).|`&center=565874,5934140`|
|CLICKCOUNTER|Überschreibt das default Verhalten des clickCounter Moduls (siehe **[config.clickCounter](config.js.de.md)**), indem hier ein fester Typ der URL `desktop` oder `mobile` eingetragen wird. Dieser Schalter ist z.B. sinnvoll, wenn das Portal seinerseits per iFrame eingebunden wurde und die übergeordnete Seite die desktop oder mobile Darstellung auswerten möchte. |`&clickcounter=desktop`|
|CONFIG|Legt eine zu verwendende Konfigurationsdatei fest. Die Angabe erfolgt mittels einer absoluten URL (`http://...` bzw. `https://...`) oder eines relativen Pfades. Im zweiten Fall wird der in der config.js(**[config.portalConf](config.js.de.md)**) angegebene Pfad mit diesem Parameter kombiniert und ergibt den kompletten Pfad zur config.json.|`&config=config.json`|
|FEATUREID|Zoomt auf die Features des WFS-Dienstes, der in der config.js konfiguriert ist (siehe **[config.zoomtofeature](config.js.de.md)**).|`&featureid=18,26`|
|FEATUREVIAURL|Erstellt die übergebenen Feature und fügt sie zu einem GeoJSON-Layer hinzu. Hierbei sollte für jedes FeatureSet immer eine `layerId` gesetzt werden und für jedes Feature das Feld `coordinates` als auch das Feld `label`. Die übergebenen Koordinaten sollten für die jeweiligen Geometrietypen entsprechend der GeoJSON Spezifikation RFC7946 übergeben werden. Die URL-Parameter hängen zudem von der Konfiguration des Moduls in der config.js ab (siehe **[config.featureviaurl](config.js.de.md)**.|`?featureviaurl=[{"layerId":"42","features":[{"coordinates":[10,53.5],"label":"TestPunkt"}]}]`|
|HIGHLIGHTFEATURE| Definiert welches Feature aus welchem layer gehighlighted werden soll. Dabei werden in einem String die LayerId und dann die FeatureId kommasepariert übergeben. |`&highlightfeature=`layerid`,`featureId|
|ISINITOPEN|Die übergebene Modul-ID wird initial geöffnet. Von Modulen des Typs Tools, die sich in einem Fenster öffnen, kann immer nur eins offen sein. |`&isinitopen=draw`|
|LAYERIDS|Mit diesem Parameter können initial anzuzeigende Layer überschrieben werden. Die Wirkung ist von **[config.Portalconfig.Baumtyp](config.json.md)** abhängig. Bei *light* werden die layerIds ergänzend sichtbar geschaltet. Ansonsten wird die Voreinstellung komplett überschrieben. Diese Einstellung kann um **[Sichtbarkeit](urlParameter.de.md)** und **[Transparenz](urlParameter.de.md)** ergänzt werden.|`&layerids=453,2128`|
|MARKER|Setzt einen Map Marker auf die angegebenen Koordinaten und zoomt auf diesen. Ist der Parameter `projection` angegeben, werden die Marker-Koordinaten aus der angegebenen Projektion für die Karte konvertiert. Die Koordinaten müssen dem in `projection` (wenn vorhanden) angegebenen oder alternativ dem für die Karte konfigurierten Koordinatensystem angehören (siehe **[config.namedProjections.epsg](config.js.de.md)**).|`&marker=565874,5934140`|
|MDID|Schaltet den Layer mit der angegebenen MetadatenId sichtbar. Kann nur im DefaultTree verwendet werden.|`&mdid=6520CBEF-D2A6-11D5-88C8-000102DCCF41`|
|PROJECTION|Koordinatensystem der angegebenen Koordinaten als EPSG-Code. Der Parameter **PROJECTION** funktioniert nur im Zusammenhang mt dem Parameter **ZOOMTOEXTENT**.|`&projection=EPSG:4326`|
|QUERY|Führt eine Adresssuche im Suchschlitz mit dem angegebenen String aus. Hausnummern müssen mit Komma getrennt werden.|`&query=Neuenfelder Straße,19`|
|STARTUPMODUL|Deprecated in 3.0.0 Bitte das Attribut "isInitOpen" verwenden. Die übergebene Modul-ID wird initial geöffnet. Von Modulen des Typs Tools, die sich in einem Fenster öffnen, kann immer nur eins offen sein. |`&isinitopen=draw`|
|STYLE| Definiert ob eine besondere Variante der Bedienelemente angezeigt werden soll, z.B. komplett ohne Bedienlemente zur Einbindung als Iframe ("simple") |`&style=simple`|
|TRANSPARENCY|nur gemeinsam mit layerids zu verwenden. Transparenz der Layer kommagetrennt von 0-100. Kann für jeden Layer in layerids angegeben werden.|`&layerids=453,2128&transparency=0,40`|
|VISIBILITY|nur gemeinsam mit layerids zu verwenden. Sichtbarkeit der Layer kommagetrennt als Boolean (true, false)|`&layerids=453,2128&visibility=true,false`|
|ZOOMLEVEL|Zoomt auf die Maßstabsstufe, die angegeben wurde (siehe **[config.view.options](config.js.de.md)**).|`&zoomlevel=2`|
|ZOOMTOEXTENT|Zoomt auf einen in der URL angegebenen Kartenausschnitt|`&zoomToExtent=510000,5850000,625000,6000000`|
|ZOOMTOGEOMETRY|Zoomt auf den Umring eines Features, das über einen WFS abgerufen wird. Die möglichen Parameter sind von **[config.zoomToGeometry](config.js.de.md)** abhängig. Alternativ zum namen des Features kann auch die Position im Array "geometries" zum Aufruf verwendet werden (Beginnend bei 1). |`&bzoomToGeometry=bergedorf`|
