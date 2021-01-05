>**[back to Masterportal documentation](doc.md)**

>**_[GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Hence, the mechanism to request URLs via a proxy is _deprecated_. For additional information, please check _[chapter 4.7.1 of the GDI-DE documentation](https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile)_.**

# Proxy (*deprecated*)

Various Masterportal functions send XHR requests to other domains, e.g. `WMS GetFeatureInfo` requests or calls to `WFS` and `CSW` services. These are restricted by the **[same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy)** implemented in all browsers.

For this reason, the Masterportal requires local proxies on the server it's running on for all services that are requested via XHR from another domain. URLs for such requests are translated to local proxy URLs by default; here all dots (".") in the URL's hostname are replaced with underscores ("_").

## Example

Assuming a WMS server's URL is `https://geodienste.hamburg.de/HH-WMS-Gruenes-Netz`, the Masterportal translates it to `/geodienste_hamburg_de/HH-WMS-Gruenes-Netz` and uses this local address for its request.

For this purpose a reverse proxy must be set up.

## Example for an Apache server

An Apache server proxy for the previous example should hold the following directives:

```apache
ProxyPass /geodienste_hamburg_de https://geodienste.hamburg.de
ProxyPassReverse /geodienste_hamburg_de https://geodienste.hamburg.de
```

These directives belong in the `Apache24\conf\httpd.conf` file and colloquially translate to

>Forward all requests to **/geodienste_hamburg_de** to **[https://geodienste-hamburg.de](https://geodienste-hamburg.de)**, and return the answer as if from **/geodienste_hamburg_de**.
