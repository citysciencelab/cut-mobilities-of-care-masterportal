import store from "../app-store";

const proxyHost = store.getters.configJs?.proxyHost || "";

/**
 * Rewrites the URL by replacing the dots with underlined
 * If a proyHost is configured, it is prepended to the URL.
 * @deprecated in the next major-release!
 * @param {Stirng} url The URL to rewrite.
 * @returns {String} The rewritten URL with underlined instead of dots.
 */
function getProxyURL (url) {
    const parser = document.createElement("a");
    let protocol = "",
        result = url,
        hostname = "",
        port = "";

    parser.href = url;
    protocol = parser.protocol;

    if (protocol.indexOf("//") === -1) {
        protocol += "//";
    }

    port = parser.port;

    if (!parser.hostname) {
        parser.hostname = window.location.hostname;
    }

    if (parser.hostname === "localhost" || !parser.hostname) {
        return url;
    }

    if (port) {
        result = url.replace(":" + port, "");
    }

    result = url.replace(protocol, "");
    // www und www2 usw. raus
    // hostname = result.replace(/www\d?\./, "");
    hostname = parser.hostname.split(".").join("_");

    console.warn(`The parameter 'useProxy' is deprecated. Please set up a CORS header for the service with the URL: ${url}.`
    + " This is recommended by the GDI-DE"
    + " (https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile)"
    + " in chapter 4.7.1.!");

    return proxyHost + "/" + result.replace(parser.hostname, hostname);
}

export default getProxyURL;
