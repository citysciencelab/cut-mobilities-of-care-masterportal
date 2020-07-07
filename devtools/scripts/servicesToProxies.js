/**
* Script zum erstellen von Proxies
* kann mit node servicesToProxies.js Pfad_zur_services.json aufgerufen werden
* erstellt
*/
const fse = require("fs-extra"),
    url = require("url");
    // arguments kommt von Note.js und enthält die in der Konsole übergebenen Argumente

let targetFile = "",
    targetFileLocal = "";

/**
 * nimmt den ersten Teil (bis zum ersten punkt) der Domain als proxy namen
 * note: "www." wurde vorher schon aus den domains gelöscht
 * @param {String} domain parameter
 * @returns {String} domain
 */
function getProxyName (domain) {
    // alle Punkte durch Unterstriche ersetzen
    return domain.split(".").join("_");
}

/**
 * erstellt einen localen Proxyeintrag
 * Bei Internet Url wird auf den 96er weitergeleitet
 * Bei Fhh urls wird ein rewrite eingefügt
 * @param {String} proxyName parameter
 * @param {String} domain parameter
 * @param {String} port parameter
 * @param {String} isLast parameter
 * @param {String} proxyForFHHNet parameter
 * @returns {Void} desc
 */
function appendToLocalProxies (proxyName, domain, port, isLast, proxyForFHHNet) {
    let localDom = domain,
        entry;

    if (proxyForFHHNet) {
        localDom = "wscd0096";
    }
    entry = "{\n" +
                "   context: \"/" + proxyName + "\",\n" +
                "   host: \"" + localDom + "\",\n" +
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
    /* eslint-disable no-console */
    /* eslint-disable vars-on-top */
    console.log(entry);

    fse.appendFile(targetFileLocal,
        entry,
        function (err) {
            if (err) {
                return console.log(err);
            }
            return "";
        });
}

/**
 * Erstellt den Apacheproxy für Proxies, die aus dem FHHnet auf das Internet
 * @param {String} protocol parameter
 * @param {String} domain parameter
 * @param {String} port parameter
 * @param {String} proxyName parameter
 * @param {Object} proxyForFHHNet ProxyRemote erstellen für Proxies, die aus dem FHHnet auf das Internet zugreifen
 * @returns {void}
 */
function appendToApacheProxies (protocol, domain, port, proxyName, proxyForFHHNet) {
    let path,
        proxy,
        outputString;

    if (protocol) {
        path = protocol + "//" + domain;
    }

    proxy = "/" + proxyName + " " + path;

    if (port) {
        proxy += ":" + port;
    }
    outputString = "ProxyPass " + proxy + "\nProxyPassReverse " + proxy + "\n\n";

    // für Proxies, die aus dem FHHnet auf das Internet zugreifen sollen muss ein ProxyRemote erstellt werden
    if (proxyForFHHNet) {
        outputString = "ProxyRemote " + path + " http://wall.lit.hamburg.de:80\n" + outputString;
    }
    console.log(outputString);

    fse.appendFile(targetFile, outputString, function (err) {
        if (err) {
            return console.log(err);
        }
        return "";
    });
}

/**
 * Erstellt die Proxies.
 * @param {Array} entry parameter
 * @param {Array} isLast parameter
 * @param {Array} proxyForFHHNet parameter
 * @returns {void}
 */
function writeEntry (entry, isLast, proxyForFHHNet) {
    const protocol = entry[0],
        domain = entry[1];

    let proxyName,
        port = entry[2];

    if (!port) {
        port = "80";
    }
    if (domain) {
        proxyName = getProxyName(domain);

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

/**
 *
 * @param {Object} allDomains parameter
 * @param {Object} proxyForFHHNet parameter
 * @returns {void}
 */
function readfileAndGenerateProxies (allDomains, proxyForFHHNet) {

    // In entry array werden alle aus der Json extrahierten url eintraege gespeichert
    let entryArray = [];

    allDomains.forEach(layer => {
        const hostname = url.parse(layer.url).hostname;

        if (hostname) {

            // duplikate vermeiden, die sich nur durch ein "www" in der Domain unterscheiden
            // hostname = hostname.replace(/www\d?\./, "");
            // Tripel aus protocol, domain und port in array sammeln
            entryArray.push([url.parse(layer.url).protocol, hostname, url.parse(layer.url).port]);
        }
    });
    // doppelte domain rauswerfen
    entryArray = [...new Set(entryArray)];
    // für jeden eintrag im array einen Proxy schreiben
    entryArray.forEach((entry, index) => {
        let isLast = false;

        if ((entryArray.length - 1) === index) {
            isLast = true;
        }
        // proxies erstellen
        writeEntry(entry, isLast, proxyForFHHNet);
    });
}

/**
 * @returns {void}
 */
function printHelpText () {
    console.log("### @Params: name of targetfile");
    console.log("### @Params: (Values: \"true/false\"): Should a remoteProxy be created (needed when target Server is within fhhnet and Proxiy targets are in the Internet");
    console.log("### @Params 4-x:  Paths to Json Files");
    console.log("### Example: servicesToProxies \"proxiesFuer96er\" \"true\" \"../components/lgv-config/rest-services-fhhnet.json\" \"../components/lgv-config/services-fhhnet.json\"  \n\n");
}

/**
 * @returns {void}
 */
function main () {
    printHelpText();
    const args = process.argv;
    let proxyForFHHNet,
        allDomains;

    // json laden
    if (typeof args[4] !== "undefined") {
        if (targetFile === "") {
            // Apache Zieldatei
            targetFile = args[2] + ".conf";
        }
        proxyForFHHNet = false;

        if (typeof args[3] !== "undefined" && args[3] === "true") {
            proxyForFHHNet = true;
            console.log("RemoteProxies are being created.\n");
        }
        // Lokale Zieldatei
        targetFileLocal = "local_" + targetFile;

        // datei löschen
        fse.writeFile(targetFile, "");
        fse.writeFile(targetFileLocal, "");

        allDomains = [];

        for (let i = 4; i < args.length; i++) {
            const data = fse.readFileSync(args[i], "utf8"),
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
