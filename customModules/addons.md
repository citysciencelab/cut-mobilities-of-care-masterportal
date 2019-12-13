# Addons #
In diesem Ordner werden *Addons* für das *Masterportal* untergebracht. Folgende Struktur ist zu beachten:

1. Direkt in dem Ordner liegt die Konfigurationsdatei **addonsConf.json**. Diese beinhaltet einen JSON bestehend aus den Namen der *Addons* als Keys und die vom *addons* Ordner aus relativen Pfade zu deren *Entrypoints* als Values.

#### Beispiel **addonsConf.json** ####
```
{
  "myAddon1": "loader.js",
  "myAddon2": "subFolder/init.js",
}
```

2. Jedes *Addon* liegt in einem eigenen Ordner, welcher so heißt, wie in **addonsConf.json** definiert. In diesen Ordnern liegen alle für die jeweiligen *CustomMoldules* benötigte Dateien einschließlich der **doc.md** Dateien.

#### Beispiel entsprechende Ordnerstruktur ####
```
myMasterPortalFolder/
    addons/
        myAddon1/
            loader.js
            anotherFile.js
            doc.md
            [...]
        myAddon2/
            subFolder/
                init.js
                [...]
            doc.md
            anotherFile.js
            [...]
    devtools/
    doc/
    [...]
```

3. Es sollten hier ausschließlich nur die Dateien landen, welche zu *addons* gehören.
