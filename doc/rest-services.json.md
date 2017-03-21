>Zurück zur [Dokumentation Masterportal](doc.md).

# rest-services.json

Das in der *config.js* erzeugte Objekt enthält den Key *restConf*, dessen Value auf einen Pfad zu einer JSON – Datei verweist. Dieser Pfad wird initial ausgewertet und die Datei unter der entsprechenden URL geladen, ausgewertet und im Hauptspeicher abgelegt. Einzelne Module lesen die Webservice-Definition aus dieser Datei aus.

In dieser Datei werden alle Service-URLs definiert und gebündelt, die nicht vom Typ WFS oder WMS sind, also nicht für die visuelle Darstellung von Informationen herangezogen werden. Hier geht es zu einem [Beispiel](https://bitbucket.org/lgv-g12/lgv-config-public/src/master/rest-services-internet.json). 

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|id|ja|String||String als eindeutiger Identifikator dieses Eintrags in der rest-services.json.|`"1"`|
|name|ja|String||Die Bezeichung des Services.|`"CSW Summary"`|
|typ|ja|String||Der Typ des Services.|`"CSW"`|
|url|ja|String||Die URL des Webservices.|`"http://metaver.de/trefferanzeige?docuuid="`|


**Folgende Services werden üblicherweise hier definiert:**

1.	Druckservices
2.	Metadatenquellen (CSW HMDK)
3.	Routing Berechnungsdienst
4.	BKG Geokodierungsdienste
5.	Gazetteer URL
6.	WPS
7.	Email Services

Häufig unterscheiden sich die zu verwendenden URLs zwischen Intranet und Internet-Nutzung. Aus diesem Grund erscheint meist das Vorhalten zweier identischer Dateien sinnvoll, die sich nur hinsichtlich der Webservice-URLs unterscheiden.   
Hier kommen meist folgende Dateien zum Einsatz (Dateinamen frei wählbar):

-	rest-services-internet.json
-	rest-services-intranet.json

**Beispiel rest-services-internet.json**

```
#!json

[
  {
    "id": "1",
    "name": "CSW HMDK Summary",
    "url": "http://metaver.de/csw?service=CSW&version=2.0.2&request=GetRecordById&typeNames=csw:Record&elementsetname=summary",
    "typ": "CSW"
  },
  {
    "id" : "2",
    "name" : "Metadaten-URL",
    "url" : "http://metaver.de/trefferanzeige?docuuid=",
    "typ" : "URL"
  },
  {
    "id" : "7",
    "name" : "Routing",
    "url" : "/viomRouting",
    "providerID" : "HHBWVI",
    "typ" : "ID"
  }
]
```