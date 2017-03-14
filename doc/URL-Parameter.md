>Zurück zur [Dokumentation Masterportal](doc.md).


Es ist möglich, über Parameter in der URL spezielle Einstellungen der Konfiguration zu überschreiben bzw. initiale Aktionen auszuführen. Als Trennzeichen zwischen URL und Parameterauflistung wird ein "?" verwendet. Die einzelnen Parameter werden durch "&" miteinander verknüpft.

**Beispiel:**

*http://geoportal-hamburg.de/Geoportal/geo-online/?layerIDs=453,1731,2426&visibility=true,true,false&transparency=0,40,0&center=565874,5934140&zoomlevel=2*

**Folgende Parameter existieren:**

|Name|Beschreibung|Beispiel|
|----|------------|--------|
|bezirk|Zoomt auf den Umring des angegebenen Hamburger Bezirks.|`&bezirk=wandsbek`|
|center|Verschiebt den Kartenausschnitt auf die angegebene Adresse. Die Koordinaten müssen dem angegebenen Koordinatensystem angehören (siehe [config.namedProjections.epsg](config.js.md)).|`&center=565874,5934140`|
|ismenubarvisible|Steuert das initiale Anzeigen oder Verbergen der Menüleiste.|`&ismenubarvisible=false`|
|layerids|Legt fest, dass die Layer mit den angegebenen IDs initial ausgewählt und sichtbar geschaltet werden.|`&layerids=453,2128`|
|query|Führt eine Adresssuche im Suchschlitz mit dem angegebenen String aus.|`&query=Tegelweg`|
|startupmodul|Die übergebene Tool-ID wird initial geöffnet. Dies ist nur mit einer begrenzten Anzahl an Tools möglich.|`&startupmodul=routing`|
|transparency|nur gemeinsam mit layerids zu verwenden. Transparenz der Layer von 0-100. Kann für jeden Layer in layerids angegeben werden.|`&layerids=453,2128&transparency=0,40`|
|visibility|nur gemeinsam mit layerids zu verwenden. Sichtbarkeit der Layer als Boolean (true, false)|`&layerids=453,2128&visibility=true,false`|
|zoomlevel|Zoomt auf die Maßstabsstufe, die angegeben wurde (siehe [config.view.options](config.js.md)).|`&zoomlevel=2`|