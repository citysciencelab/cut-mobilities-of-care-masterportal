# Custom Modules #
In diesem Ordner werden *Custom Modules* für das *Masterportal* untergebracht. Folgende Struktur ist zu beachten:

1. Direkt in dem Ordner liegt die Konfigurationsdatei **customModulesConf.json**. Diese beinhaltet einen JSON bestehend aus den Namen der *Custom Modules* als Keys und die vom *customModules* Ordner aus relativen Pfade zu deren *Entrypoints* als Values.

#### Beispiel **customModulesConf.json** ####
```
{
  "myCustomModule1": "loader.js",
  "myCustomModule2": "subFolder/init.js",
}
```

2. Jedes *Custom Module* liegt in einem eigenen Ordner, welcher so heißt, wie in **customModulesConf.json** definiert. In diesen Ordnern liegen alle für die jeweiligen *CustomMoldules* benötigte Dateien einschließlich der **doc.md** Dateien.

#### Beispiel entsprechende Ordnerstruktur ####
```
myMasterPortalFolder/
    customModules/
        myCustomModule1/
            loader.js
            anotherFile.js
            doc.md
            [...]
        myCustomModule2/
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

3. Es sollten hier ausschließlich nur die Dateien landen, welche zu *CustomModules* gehören.
