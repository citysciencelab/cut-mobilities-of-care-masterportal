/**
* Script zum erstellen von Proxies
* kann mit node servicesToProxies.js Pfad_zur_services.json aufgerufen werden
* erstellt
*/


var fs = require("fs"),
_ = require("underscore"),
url = require("url"),
// arguments kommt von Note.js und enthält die in der Konsole übergebenen Argumente
arguments = process.argv,
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
function appendToLocalProxies (proxyName, domain, isLast, proxyForFHHNet) {
    if (!proxyForFHHNet) {
        domain = "wscd0096";
    }
    var entry = "{\n" +
                "   context: \"/" + proxyName + "\",\n" +
                "   host: \"" + domain + "\",\n" +
                "   port: 80,\n" +
                "   https: false,\n" +
                "   changeOrigin: false,\n" +
                "   xforward: false";

    if (proxyForFHHNet) {
        entry += ",\n   rewrite: {\n" +
                "       \"^/" + proxyName + "\": \"\"\n" +
                "   }";
    }

    entry += "\n}";

    if (!isLast) {
        entry += ",";
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

    if (domain) {

        var proxyName = getProxyName(domain);

        // die domain ist ein Proxy
        // (z.B. /geofos)
        if (proxyName === domain) {
            console.log("domain: " + domain + " ausgelassen, da bereits proxy");
            return;
        }
        // lokalen proxy erstellen
        appendToLocalProxies(proxyName, domain, isLast, proxyForFHHNet);

        // apache proxy erstellen
        appendToApacheProxies(protocol, domain, port, proxyName, proxyForFHHNet);
    }
}

function printHelpText () {
    console.log("### @Params: Path to Json File");
    console.log("### @Params: (optional) (Values: \"true/false\"): Should a remoteProxy be created");
    console.log("### Example: servicesToProxies \"../components/lgv-config/services.json\" \"true\" \n\n");
}

printHelpText();

// json laden
if (typeof arguments[2] !== "undefined") {
    if (targetFile === "") {
        // Apache Zieldatei
        targetFile = "proxies_" + arguments[2].substring(arguments[2].lastIndexOf("/") + 1, arguments[2].lastIndexOf(".")) + ".txt";
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
    // In obj wird das geparste json Objekt gespeichert
    var obj = {};

    fs.readFile(arguments[2], "utf8", function (err, data) {
        // UTF8 BOM entfernen
        obj = JSON.parse(data.toString("utf8").replace(/^\uFEFF/, ""));
      if (err) {
        // Datei kann nicht gelesen werden
        return console.log(err);
      }

      // In entrz arraz werden alle aus der Json extrahierten url eintraege gespeichert
      var entryArray = [];

      _.each(obj, function (layer) {
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

        console.log("\nWritten: apache proxies to " + targetFile);
        console.log("Written: local proxies to " + targetFileLocal);
    });

}
else {
    console.log("Bitte den Pfad zur Json als argument übergeben");
}
