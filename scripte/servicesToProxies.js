/**
* Script zum erstellen von Proxies
* kann mit node servicesToProxies.js Pfad_zur_services.json aufgerufen werden
* erstellt
*/


var fs = require("fs"),
_ = require("underscore"),
url = require("url"),
// arguments kommt von Note.js und enthält die in der Konsole übergebenen Argumente
targetFile = "",
targetFileLocal = "";

// nimmt den ersten Teil (bis zum ersten punkt) der Domain als proxy namen
// note: "www." wurde vorher schon aus den domains gelöscht
function getProxyName (domain) {
    // alle Punkte durch Unterstriche ersetzen
    return domain.split(".").join("_");
}
// erstellt einen localen Proxyeintrag
// Bei Internet Url wird auf den 96er weitergeleitet
// Bei Fhh urls wird ein rewrite eingefügt
function appendToLocalProxies (proxyName, domain, port, isLast, proxyForFHHNet) {
    if (proxyForFHHNet) {
        domain = "wscd0096";
    }
    var entry = "{\n" +
                "   context: \"/" + proxyName + "\",\n" +
                "   host: \"" + domain + "\",\n" +
                "   port: " + port + ",\n" +
                "   https: false,\n" +
                "   changeOrigin: false,\n" +
                "   xforward: false";

    if (!proxyForFHHNet) {
        entry += ",\n   rewrite: {\n" +
                "       \"^/" + proxyName + "\": \"\"\n" +
                "   }";
    }

    entry += "\n}";

    if (!isLast) {
        entry += ",\n";
    }
    console.log(entry);
    fs.appendFile(targetFileLocal,
               entry,
        function (err) {
            if (err) {
                return console.log(err);
        }
   });
}
// Erstellt den Apacheproxy für Proxies, die aus dem FHHnet auf das Internet
// @param: proxyForFHHNet ProxyRemote erstellen für Proxies, die aus dem FHHnet auf das Internet zugreifen
function appendToApacheProxies (protocol, domain, port, proxyName, proxyForFHHNet) {
    if (protocol) {
            domain = protocol + "//" + domain;
    }

    var proxy = "/" + proxyName + " " + domain;

    if (port) {
        proxy += ":" + port;
    }
    var outputString = "ProxyPass " + proxy + "\nProxyPassReverse " + proxy + "\n\n";

    // für Proxies, die aus dem FHHnet auf das Internet zugreifen sollen muss ein ProxyRemote erstellt werden
    if (proxyForFHHNet) {
        outputString = "ProxyRemote " + domain + " http://wall.lit.hamburg.de:80\n" + outputString;
    }
     console.log(outputString);
    fs.appendFile(targetFile, outputString, function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

// Erstellt die Proxies.
function writeEntry (entry, isLast, proxyForFHHNet) {
    var protocol = entry[0],
    domain = entry[1],
    port = entry[2];

    if (!port) {
        port = "80";
    }
    if (domain) {

        var proxyName = getProxyName(domain);

        // die domain ist ein Proxy
        // (z.B. /geofos)
        if (proxyName === domain) {
            console.log("===============> domain: " + domain + " Achtung: eventuell Teil einer anderen Domain");
           // return;
        }
        // lokalen proxy erstellen
        appendToLocalProxies(proxyName, domain, port, isLast, proxyForFHHNet);

        // apache proxy erstellen
        appendToApacheProxies(protocol, domain, port, proxyName, proxyForFHHNet);
    }
}

function readfileAndGenerateProxies (allDomains, proxyForFHHNet) {

          // In entry array werden alle aus der Json extrahierten url eintraege gespeichert
          var entryArray = [];

          _.each(allDomains, function (layer) {
                var hostname = url.parse(layer.url).hostname;

                if (hostname) {

                    // duplikate vermeiden, die sich nur durch ein "www" in der Domain unterscheiden
                    // hostname = hostname.replace(/www\d?\./, "");
                    // Tripel aus protocol, domain und port in array sammeln
                    entryArray.push([url.parse(layer.url).protocol, hostname, url.parse(layer.url).port]);
                }
            });
          // doppelte domain rauswerfen
          entryArray = _.unique(entryArray, function (item) {
            return item[1].replace(/www\d?\./, "");
            });
          // für jeden eintrag im array einen Proxy schreiben
          _.each(entryArray, function (entry, index) {
                var isLast = false;

                if ((entryArray.length - 1) === index) {
                    isLast = true;
                }
                // proxies erstellen
                writeEntry(entry, isLast, proxyForFHHNet);
          });
}

function printHelpText () {
    console.log("### @Params: name of targetfile");
    console.log("### @Params: (Values: \"true/false\"): Should a remoteProxy be created (needed when target Server is within fhhnet and Proxiy targets are in the Internet");
    console.log("### @Params 4-x:  Paths to Json Files");
    console.log("### Example: servicesToProxies \"proxiesFuer96er\" \"true\" \"../components/lgv-config/rest-services-fhhnet.json\" \"../components/lgv-config/services-fhhnet.json\"  \n\n");
}

function main () {
    printHelpText();
    var arguments = process.argv;

    // json laden
    if (typeof arguments[4] !== "undefined") {
        if (targetFile === "") {
            // Apache Zieldatei
            targetFile = arguments[2] + ".conf";
        }
        var proxyForFHHNet = false;

        if (typeof arguments[3] !== "undefined" && arguments[3] === "true") {
            proxyForFHHNet = true;
            console.log("RemoteProxies are being created.\n");
        }
        // Lokale Zieldatei
        targetFileLocal = "local_" + targetFile;

        // datei löschen
        fs.writeFile(targetFile, "");
        fs.writeFile(targetFileLocal, "");

        var allDomains = [];

        for (var i = 4; i < arguments.length; i++) {
            var data = fs.readFileSync(arguments[i], "utf8"),
            obj = JSON.parse(data.toString("utf8").replace(/^\uFEFF/, ""));

            allDomains = allDomains.concat(obj);
        }
        console.log(allDomains.length);
        readfileAndGenerateProxies(allDomains, proxyForFHHNet);
        console.log("\nWritten: apache proxies to " + targetFile);
        console.log("Written: local proxies to " + targetFileLocal);
    }
    else {
        console.log("Bitte den Pfad zur Json als argument übergeben");
    }
}

main();
