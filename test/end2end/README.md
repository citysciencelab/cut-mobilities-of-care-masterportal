Selenium-Webdriver

1. npm install --save-dev Selenium-Webdriver
2. Browser-Treiber installieren:
npm install --save--dev chromedriver bzw. downloaden und in path angeben.
3. damit der aktuelle selenium-webdriver funktioniert: node updaten auf v6
4. http://www.seleniumhq.org/download/ ie-treiber downloaden
5. npm install --global mocha als Admin, dann muss 'mocha' in Umgebungsvariablen und damit in console aufrufbar sein.

Test starten:
$ mocha /test/end2end/TestRunner.js 

oder als admin  
$ npm test