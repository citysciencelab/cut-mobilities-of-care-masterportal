# Portal aufsetzen
## Die Konfigurationsdateien herunterladen
1. Um ein eigenes Portal aufzusetzen, laden Sie bitte zunächst mit einem Klick auf den nachfolgenden Link die [letzte stabile Version aus Bitbucket](https://bitbucket.org/lgv-g12/lgv/downloads/examples.zip) herunter.

2. Im nächsten Schritt entpacken Sie die ZIP-Datei durch einen Rechtsklick auf den Ordner examples.zip.

3. Um das Portal öffentlich zugänglich zu machen (zum Beispiel im Internet), ist es notwendig, das Portal auf einem Webserver aufzusetzen. Dazu verschieben Sie den entpackten Ordner auf den Webserver (z.B. in das htdocs-Verzeichnis eines Apache-Servers). 

4. Der Ordner enthält die folgende Struktur:

    **components**

    **css**

    **doc**

    **fonts**

    **img**

    **js**

    **lgv-config**

    **portale**

    Der Ordner *lgv-config* enthält die globalen [Konfigurationsdateien](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/doc.md?at=doc-md&fileviewer=file-view-default) [*services.json*](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/services.json.md), [*rest-services.json*](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/rest-services.json.md) und [*style.json*](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/style.json.md).

    Im Ordner *portale* befinden sich zwei vorkonfigurierte Beispiel-Anwendungen (simple und simpleTree) jeweils mit den portalspezifischen Konfigurationsdateien [*config.js*](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/config.js.md?fileviewer=file-view-default) und [*config.json*](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/config.json.md?fileviewer=file-view-default).

5. Wenn Sie den Ordnernamen *examples* belassen haben, können Sie die Beispielportale mit folgenden URLs über einen Browser aufrufen. Anderenfalls ersetzen Sie bitte *examples* durch den von Ihnen gewählten Ordnernamen.

    **[Name des Webservers]/examples/portale/simple/index.html** oder
    
    **[Name des Webservers]/examples/portale/simpleTree/index.html**

![Browseraufruf.JPG](https://bitbucket.org/repo/88K5GB/images/864809418-Browseraufruf.JPG)
###### So sollte der Browseraufruf des Portals *simple* aussehen

## Und so wird aus einer Beispiel-Anwendung ein individuelles Portal
1. Gegebenenfalls können Sie die globalen Konfigurationsdateien im Ordner *lgv-config* anpassen (z.B. Luftbilder anderer Bundesländer verfügbar machen, neue Icons hinzufügen, bestehende Icons verändern etc.)

2. Anschließend duplizieren Sie bitte den Ordner *simple* oder *simpleTree* im Verzeichnis *portale* und benennen ihn um (z.B. in *mein_portal*), sodass Sie nun drei Ordner im Verzeichnis *portale* haben.

3. Sie können nun die Konfigurationsdateien ([config.js](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/config.js.md?fileviewer=file-view-default) und [config.json](https://bitbucket.org/lgv-g12/lgv/src/5f1770187077f652ac92ce9ea48904a14865130e/doc/config.json.md?fileviewer=file-view-Default)) innerhalb des neuen Ordners *mein_portal* anpassen (z.B. die Themen im Themenbaum festlegen, die passenden Werkzeuge zur Verfügung stellen, die Hintergrundkarten anpassen, den Namen des Portals ändern ...)

4. Ihr neues Portal können Sie nun mit folgender URL über den Browser abrufen:
 
    **[Name des Webservers]/examples/portale/mein_portal/index.html**

#### Beispielcode für ein erstes individuelles Portal 
```
#!javascript
{
  "Portalconfig":
  {
    "PortalTitle": "GeoViewer",
    ...
    "controls": {
      ...
      "poi": true,
      ...
    },
   ...
  },
  "Themenconfig":
  {
    "Hintergrundkarten":
    {
      "Layer": [
        {
          "id": "94",
          "visibility": true,
          "gfiAttributes": "ignore"
        }, 
		...      ]
    },
    "Fachdaten":
    {
      "Ordner": [
	    {
		  "Titel": "Test", 
		  "Layer": [
        {
          "id": "45",
          "styleId": "45",
		  "visibility": true,
		  "mouseHoverField": ["belegung_absolut"],
          "clusterDistance": 40
        },
        {
          "id": "1561"
        }
		]
		}
		], 
		"Layer": [
        {
          "id": "1711",
          ...
          "mouseHoverField": ["name", "anzahl_planbetten"],
          ...            },
            ...
          ],
          "clusterDistance": 140
        }
      ]
    }
  }
}


```
###### Ursprünglicher Code-Ausschnitt der config.json

________________________________________________
________________________________________________
```
#!javascript

{
  "Portalconfig":
  {
    "PortalTitle": "VerkehrsPortal",
     ...
    "controls": {
      ...
      "poi": false,
      ...
    },
    ...
  },
  "Themenconfig":{
    "Hintergrundkarten":{
      "Layer": [
        {
          "id": "95",
          "visibility": true,
          "gfiAttributes": "ignore"
        }, 
		 {
          "id": "94",
          "visibility": true,
          "gfiAttributes": "ignore"
        }, 
        ...      ]
    },
    "Fachdaten":
    {
      "Ordner": [
	    {
		  "Titel": "Test", 
		  "Layer": [
                {
          "id": "1561"
        }
		]
		}
		]
    }
  }
}

```
###### Code-Ausschnitt der config.json mit vorgenommenen Veränderungen

________________________________________________
________________________________________________

![VerkehrsPortal.JPG](https://bitbucket.org/repo/88K5GB/images/224471267-VerkehrsPortal.JPG)
###### Dies könnte der Browseraufruf eines individuell erstellten Portals sein



