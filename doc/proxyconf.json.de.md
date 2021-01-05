Hier wird im folgenden die proxyconf-Datei in ihrem Aufbau und ihrer Funktion beschrieben.

# Warum brauche ich für die lokale Entwicklungsumgebung einen Proxy?

**Aktuell**
Die GDI-DE empfiehlt serverseitig einen CORS-Header einzurichten. Daher ist die Möglichkeit URLs über einen Proxy anzufragen deprecated.
Siehe für nähere Infos **[GDI-DE](https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile)** in Kapitel 4.7.1.

**Deprecated**
Ein Proxy wird benötigt um Daten von anderen Resourcen, die von einer anderne Domain geholt werden, laden zu dürfen. Wenn im Browser versucht wird direkt auf diese Daten zuzugreifen werden diese aufgrund der **[Same-Origin-Policy](https://de.wikipedia.org/wiki/Same-Origin-Policy)** geblockt.

***

# Wie funktioniert ein Proxy? #

Der Proxy nimmt die Requests vom localhost an andere Domains an und stellt sie selber an die eigentliche Domain und leitet diese wieder zurück an den Browser. Somit kann das Problem umgangen werden.
In der proxyconf_example.json bzw. proxyconf.json steht an welche Domain der unter localhost laufende Server den Request stellen soll.

***

# Wie muss der Proxy für das Masterportal konfiguriert werden? #

Im Beispiel ist der Proxyeintrag für das Masterportal zu sehen, um in der lokalen Entwicklungsumgebung die Hamburger Dienste über geodienste.hamburg.de zu nutzen.

**Beispiel**
```

{
  "/geodienste_hamburg_de": {
    "target": "http://geodienste.hamburg.de",
    "pathRewrite": {
      "^/geodienste_hamburg_de": ""
    },
    "agent": ""
  }
}

```

In der ersten Zeile des Objektes ist die vom Masterportal umgeschriebene Domain für die geodienste.hamburg.de Domain eingetragen. Darüber wird entschieden was der Proxy mit dem eingegangenen Request anstellen soll.
Im Beispielobjekt gibt es verschiedene Parameter die genutzt werden können:

1. **target**: hier wird die URL eingetragen an welche Domain der Request gestellt werden soll.
2. **pathRewrite**: enthält hier im Beispiel eine Ersetzungsregel um die vorher umgeschriebene Domain aus dem Request zu entfernen.
3. **agent**: Wird verwendet, um aus einem Intranet über einen Corporate Proxy ein target im Internet zu erreichen. Der Value des agent wird beim starten des Servers automatisch aus dem Proxy der Systemumgebung (process.env) gefüllt.
4. **Weitere Parameter** sind unter **[https://webpack.js.org/](https://webpack.js.org/configuration/dev-server/#devserverproxy)** zu finden.

In Hamburg gibt es auch den Fall, dass wir einen ReverseProxy eines unserer Server nutzen. Dann findet dort eine erneute Anfrage an die eigentliche Domain statt und vorher wird der Parameter **pathRewrite** nicht verwendet. Vorteil hierfür ist, dass die Weiterleitungsregeln nur einmal auf dem Server eingetragen werden und nicht noch extra bei jedem lokal vorgehalten werden müssen.

