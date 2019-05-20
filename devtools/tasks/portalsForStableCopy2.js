const fs = require("fs-extra"),
    //path = require("path"),
    //_ = require("underscore"),

    replaceInFile = require("replace-in-file"),

    // replace URLs in regular module files, based on replace-in-file
    portalsForStableReplace = require("./portalsForStableReplace2"),
    // replace URLs in custom module files, based on replace-in-file
    replaceUrlsForCustomModules = require("./replace2"),

    // execute shell commands
    execute = require("child-process-promise").exec,

    // portal version parsed from package.json file
    stableVersion = require("../../package.json").version.replace(/\./g, "_"),

    conf = {
        sourceFolder: "portalconfigs",
        targetFolder: "stablePortale",
        masterCodeFolder: "stablePortale/Mastercode/"+stableVersion,
        environment: "Internet",

        // folder where custom modules creation script saves its result
        tempPortalFolder: "dist/build",
        basicPortalFolder: "dist/Basic",

        // true for those modules to build
        modulesToBuild: {
            "activeCityMaps": true,
            "artenkataster": true,
            "badegewaesser": true,
            "bauinfo": true,
            "bebauungsplaene-test": true,
            "bodenlehrpfade": true,
            "bodenschutz": true,
            "bohrdaten": true,
            "boris": true,
            "DienstemanagerPreview": true,
            "dipas": true,
            "elbePlus_FehlendeLeitungsbetreiberMelden": true,
            "elbePlus_Nutzerregistrierung": true,
            "eventlotse": true,
            "eventlotseEN": true,
            "fachinfo_zum_grundstck": true,
            "feuer-und-flamme": true,
            "fhh-atlas": true,
            "flaecheninfo": true,
            "FlstSuche": true,
            "fluechtlingsunt_internet": true,
            "fluechtlingsunterkuenfte": true,
            "gbm": true,
            "geo-online": true,
            "geo-online_csw_extern": true,
            "geoportal-eimsbuettel": true,
            "geotourismus": true,
            "geotourismus_wms": true,
            "geowerkstatt-nutzer": true,
            "Geschuetzte-Dienste": true,
            "gewaesserunterhaltung": true,
            "gewiss": true,
            "grenznachweis": true,
            "gruendachstrategie": true,
            "gruener-ring": true,
            "hamburg_gruen": true,
            "hausboote": true,
            "hdb": true,
            "hochwasserschutz": true,
            "hundert-jahre-stadtgruen": true,
            "ida": true,
            "ida_testsuite": true,
            "itgbm_detail_map": true,
            "itgbm_main_map": true,
            "itgbm_result_map": true,
            "its-hackathon": true,
            "kehrwiederbecher": true,
            "kita": true,
            "krankenhausportal": true,
            "laerm-flug": true,
            "laerm-strasse": true,
            "local": true,
            "lup": true,
            "meinbaum-meinestadt": true,
            "mietenspiegel": true,
            "mietenspiegel-formular": true,
            "mml_afm-assistent": true,
            "mml_afm-folders": true,
            "mml_mapClient": true,
            "mml_mapClient_stage": true,
            "mml_mapClient_test": true,
            "mrh_bildungsatlas": true,
            "mrh_biotopverbundkarte": true,
            "mrh_erreichbarkeitsanalysen": true,
            "mrh_erreichbarkeitsanalysen_geschuetzt": true,
            "mrh_lieblingsplaetze": true,
            "mrh_maritime-landschaft-unterelbe": true,
            "mrh_pendlerportal": true,
            "mrhportal": true,
            "mrhportal_dev": true,
            "muenchen": true,
            "mysmartlife": true,
            "pflege-eims": true,
            "Planportal": true,
            "plis_test": true,
            "registrierungsformular": true,
            "saga": true,
            "Schallschutzportal": true,
            "schulbau": true,
            "schulinfosystem": true,
            "schutzgebiete": true,
            "sensor": true,
            "sga": true,
            "sharemap": true,
            "simple": true,
            "simpleTree": true,
            "solaratlas": true,
            "stadtwerkstatt": true,
            "stoerfallbetriebe": true,
            "strassenbaumkataster": true,
            "sub-historische-karten": true,
            "suburbia": true,
            "test": true,
            "trinkwasser": true,
            "ueberschwemm-festgesetzt": true,
            "ueberschwemm-kuenftige": true,
            "umweltpartnerschaft": true,
            "verkehr-geoportal_fhhnet": true,
            "verkehrsmodell": true,
            "verkehrsportal": true,
            "videokommunikation": true,
            "waermekataster": true,
            "wohnlagen": true,
            "wohnungsbau": true,
            "zkf_intern": true,
        },

        // relative paths to custom modules entry js files
        // although custom modules creation script does not expect the .js suffix, it is redundantly added
        // for the sake of readability
        customModules: {
            boris: "bodenrichtwertabfrage/view.js",
            flaecheninfo: "showParcelGFI.js",
            sga: "gfionaddress/view.js",
            verkehrsportal: "customModule.js"
        }
    };

function deleteStablePortalsFolder () {
    fs.remove(conf.targetFolder).then(() => {
        console.log("Deleted folder "+process.cwd()+"/"+conf.targetFolder);
        createMasterCodeFolder();
    });
}

function createMasterCodeFolder () {
    var foldersToCopy = ["js", "css"];
    console.log("Started creating MasterCode folder");
    fs.mkdirs(conf.masterCodeFolder).then(() => {
        foldersToCopy.forEach((folderToCopy, index) => {
            fs.mkdirs(conf.masterCodeFolder+"/"+folderToCopy).then(() => {
                console.log("Created folder "+conf.masterCodeFolder+"/"+folderToCopy);
                fs.copy(conf.basicPortalFolder+"/"+folderToCopy, conf.masterCodeFolder+"/"+folderToCopy).then(() => {
                    replaceInFile.sync({
                        "files": conf.masterCodeFolder+"/css/style.css",
                        "from": /\/*(\.+\/)*lgv-config/g,
                        "to": "../../../lgv-config"
                    });
                    if (index === foldersToCopy.length -1) {
                        console.log("Finished creating MasterCode folder");
                        createStablePortalsFolder();
                    }
                });
            }).catch((error) => {
                console.error(error);
            });
        });
    }).catch((error) => {
        console.error(error);
    });
}

function copyPortal (portalName) {
    fs.readdir(conf.sourceFolder+"/"+portalName, (error, fileNames) => {
        if (!fileNames.length) {
            console.error("Source folder "+conf.sourceFolder+"/"+portalName+" was empty");
            return;
        }
        fileNames.forEach((sourceFile, index) => {
            fs.copy(conf.sourceFolder+"/"+portalName+"/"+sourceFile, conf.targetFolder+"/"+portalName+"/"+sourceFile).then(() => {
                portalsForStableReplace(conf.targetFolder+"/"+portalName+"/"+sourceFile, stableVersion);
                if (index === fileNames.length -1)  {
                    console.log("Finished building portal \""+portalName+"\"");
                }
            }).catch((error) => {
                console.error(error);
            });
        });
    });
}

function buildCustomModulesPortal (portalName) {
    var command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE ../"+conf.sourceFolder+"/"+portalName+"/"+conf.customModules[portalName].replace(/\.js$/, ""),
        redundantCustomModuleDataPath = conf.customModules[portalName].split("/")[0];

    console.log("Executing script "+command);
    execute(command).then(function (result) {
        console.log("Finished script "+command);
        fs.copy(conf.tempPortalFolder, conf.targetFolder+"/"+portalName).then(() => {
            fs.copy(conf.sourceFolder+"/"+portalName+"/", conf.targetFolder+"/"+portalName).then(() => {
                fs.remove(conf.targetFolder+"/"+portalName+"/"+redundantCustomModuleDataPath).then(() => {
                    replaceUrlsForCustomModules(conf.environment, conf.targetFolder+"/"+portalName, portalName === "geo-online" ? 3 : 2);
                    console.log("Finished building portal \""+portalName+"\"");
                });
            });
        });
    }).catch((error) => {
        console.error(error);
    });

}

function createStablePortalsFolder () {
    console.log("Started building portals");
    fs.readdir(conf.sourceFolder, (error, portalNames) => {
        if (!portalNames.length) {
            console.error("No source folders available in folder "+conf.sourceFolder);
        }
        portalNames.forEach((portalName, index) => {
            if (conf.modulesToBuild[portalName] !== true) {
                console.log("Ignored portal \""+portalName+"\"");
                return;
            }
            if (portalName === ".git" || portalName.match(/^\./) !== null) {
                console.log("Ignored hidden folder "+conf.targetFolder+"/"+portalName);
                return;
            }
            if (fs.statSync(conf.sourceFolder+"/"+portalName).isDirectory() === false) {
                console.log("Ignored file "+conf.targetFolder+"/"+portalName);
                return;
            }
            fs.mkdirs(conf.targetFolder+"/"+portalName).then(() => {
                if (conf.customModules[portalName] === undefined) {
                    copyPortal(portalName);
                }
                else {
                    buildCustomModulesPortal(portalName);
                }
            }).catch((error) => {
                console.error(error);
            });
        });
    });
}

const inquirer = require("inquirer"),
    questions = [{
        type: "input",
        name: "checkDelete",
        message: "This script will DELETE the following folder:\n"+process.cwd()+"/"+conf.targetFolder+"\nContinue? (Y/N)",
        default: "N"
    }];
inquirer.prompt(questions).then(function (answers) {
    if (answers.checkDelete.toUpperCase() === "Y") {
        console.log("\n----------------------------------------------\n");
        deleteStablePortalsFolder();
    }
});





