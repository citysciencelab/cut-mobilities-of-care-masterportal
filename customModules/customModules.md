# Custom Modules #
In diesem Repository sind sämtliche *Custom Modules* für das Produkt *Masterportal* untergebracht. Folgende Struktur ist zu beachten:

1. Auf der Root-Ebene liegt die Konfigurationsdatei **customModulesConf.json**. Diese beinhaltet einen JSON bestehend aus den Namen der *Custom Modules* als Keys und deren jeweilige *Entrypoints* als Values.

2. Jedes *Custom Module* hat einen eigenen Ordner, welcher so heißt, wie in **customModulesConf.json** definiert. In diesen Ordnern liegen alle für die jeweiligen *CustomMoldules* benötigte Dateien und jeweils deren **doc.md** Dateien.

3. Es sollen hier nur ausschließlich die Dateien landen, welche zu *CustomModules* gehören. Dateien, wie zBsp. .less Dateien oder index.html Dateien, welche **portalspezifisch** sind, gehören in das **Portalconfigs** Repository.

## Anpassen eines *CustomModules* an die aktuellen Anforderungen
Eine Nutzung der *CustomModule* aus *Portalconfigs* heraus ist **nicht möglich**. Derzeit sind noch nicht alle *CustomModule* von *Portalconfigs* hierher umgezogen. Falls also ein *CustomModule* benötigt ist, welches noch nicht hier liegt, müssen folgende Schritte unternommen werden:

1. Ordner mit dem gewünschten Namen erstellen

2. Alle Dateien, welche für das *CustomModule* benötigt werden, von *Portalconfigs* in den besagten Ordner hierher verschieben

3. Den Eintrag in der Datei **customModulesConf.json** ergänzen, so wie { "customModuleName": "entryPoint.js" }

4. Leere **doc.md** Datei für das *CustomModule* anlegen

5. In der Datei **index.html** des entsprechenden *CustomModules* in *Portalconfigs* die Pfade analog zu *flaecheninfo* und *verkehrsportal* ändern

6. In der Datei **config.js** des entsprechenden *CustomModules* in *Portalconfigs* den Eintrag für die gewünschten *CustomModules* anlegen, so wie { "customModules": ["flaecheninfo", "verkehrsportal"] }

## Nutzung der neuen Struktur
- Zum Starten des Servers reicht ein **npm start**
- Zum Exportieren des Portals reicht ein **npm run build**

