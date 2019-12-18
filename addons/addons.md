# Addons #
In diesem Ordner werden *Addons* für das *Masterportal* untergebracht. Folgende Struktur ist zu beachten:

1. Jedes *Addon* liegt in einem eigenen Ordner, welcher so heißt, wie in **addonsConf.json** als key definiert. In diesen Ordnern liegen alle für die jeweiligen *Addons* benötigten Dateien einschließlich der **doc.md** Dateien.

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

2. Direkt in dem Ordner muss die Konfigurationsdatei **addonsConf.json** liegen. Diese beinhaltet einen JSON bestehend aus den Namen der *Addons* als Keys und die vom *addons/[key]* Ordner aus relativen Pfade zu deren *Entrypoints* als Values. Das nachfolgende Beispiel basiert auf die oben beschriebene beispielhafte Ordnerstruktur.

#### Beispiel **addonsConf.json** ####
```
{
  "exampleAddon": "entrypoint.js",
  "myAddon1": "loader.js",
  "myAddon2": "subFolder/init.js"
}
```

3. Es sollten hier ausschließlich nur die Dateien landen, welche zu *addons* gehören.
