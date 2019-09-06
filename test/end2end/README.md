## Browsertests mit Selenium-Webdriver

1. Browser-Treiber installieren:
Um die Browsertests lokal ausführen zu können müssen Driver für den lokalen Browser installiert werden. Es sollte mindestens der Chromedriver installiert sein, optional können auch andere Browser automatisiert werden. Über die Variable "browser" (s.u.) können folgende Browser automatisiert werden:
 - "chrome": Chrome-Browser
 - "firefox": Firefox
 - "ie": InternetExplorer
 - "bs": beliebige Browser unter browserstack.com


Dazu den Treiber downloaden (siehe https://docs.seleniumhq.org/download/) und in den Umgebungsvariablen verfügbar machen (unter Windows in 'path'). Die exe muss dabei in einem Ordner liegen, in dem exe-Dateien ausgeführt werden können. 'chromedriver' muss dann in der Console ohne Adminrechte aufrufbar sein.


2. Test starten:
$ ./node_modules/.bin/mocha ./test/end2end/TestRunner.js

oder als admin (beim chromedriver kann das zu Problemen führen)
$ npm run browsertest

Das Startskript kann mit verschiedenen Parametern aufgerufen werden, in denen z.B. der lokale Proxy, der zu testende Browser oder Browserstackcredentials mitgegeben werden können:
$ browser=bs bs_user=[browserstackusername] bs_key=[browserstackkey] url=[url] proxy=[proxyurl] ./node_modules/.bin/mocha ./test/end2end/TestRunner.js

Die Parameter können für die lokale Umgebung einmal fest definiert werden und werden dann beim Ausführen der Tests immer benutzt. Dazu eine Datei ".env" im root-Verzeichnis anlegen und dort die Parameter angeben.


