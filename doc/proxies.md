>Zurück zur **[Dokumentation Masterportal](doc.md)**.

**Aktuell**
Die GDI-DE empfiehlt serverseitig einen CORS-Header einzurichten. Daher ist die Möglichkeit URLs über einen Proxy anzufragen deprecated.
Siehe für nähere Infos **[GDI-DE](https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile)** in Kapitel 4.7.1.

**Deprecated**
Viele Funktionen des Masterportals stellen XHR-Anfragen an andere Domains, z.B. WMS GetFeatureInfo-Anfragen oder Anfragen an WFS- oder CSW-Dienste. Diese werden von der in allen Browsern implementierten **[Same-Origin-Policy](https://de.wikipedia.org/wiki/Same-Origin-Policy)** untersagt. Das Masterportal setzt daher für die Dienste, die per XHR auf einer anderen Domain angefragt werden sollen, lokale Proxies auf dem Server voraus, wo es läuft. URLs werden für solche Anfragen standardmäßig in lokale Proxy-URLs übersetzt. Hierbei werden alle "." im Hostnamen der URL durch "_" ersetzt.

**Beispiel:**

Lautet die URL eines WMS Server z.B.:
**https://geodienste.hamburg.de/HH-WMS-Gruenes-Netz**

dann wird sie vom Portal übersetzt in:
*/geodienste_hamburg_de/HH-WMS-Gruenes-Netz*

und angefragt.

Hierfür muss ein ReverseProxy eingerichtet werden.

**Beispiel für Apache-Server:**

Ein Apache Proxy, für das Beispiel oben:

`ProxyPass /geodienste_hamburg_de https://geodienste.hamburg.de`
`ProxyPassReverse /geodienste_hamburg_de https://geodienste.hamburg.de`

Diese Anweisung muss in *„Apache24\conf\httpd.conf“*  stehen und bedeutet: “Leite alle Anfragen an */geodienste_hamburg_de* weiter an  **[https://geodienste-hamburg.de](https://geodienste-hamburg.de)**, nehme die Antwort entgegen und gebe sie als /geodienste_hamburg_de zurück“.
