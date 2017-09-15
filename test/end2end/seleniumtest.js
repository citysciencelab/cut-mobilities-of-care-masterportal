var webdriver = require("selenium-webdriver"),
    until = webdriver.until;

    driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

// Seite öffnen und tests durchführen
driver.get("https://localhost:9001/dist/1.2.1/mastertest/").then(function () {
    console.log("started");
    var loader = driver.findElement(webdriver.By.id("loader"));

    if (driver.findElement(webdriver.By.id("loader"))) {
        console.log("loader gefunden...");
    }
    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
        function () {
            checkPlus(loader);
        }
    );
    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
        function () {
            checkMinus(loader);
        }
    );
    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
        function () {
            checkLocate();
        }
    );
    // driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
    //     function () {
    //         checkPOI();
    //     }
    // );

    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
        function () {
            checkAttributions(loader);
        }
    );

    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
        function () {
            checkSearch(loader);
        }
    );

});

// Browser schließen
 driver.quit();

function checkPlus (loader) {
    var plus = driver.findElement(webdriver.By.css("span.glyphicon.glyphicon-plus"));

    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
        function () {
            plus.click();
        }
    );

}

function checkMinus () {
    var minus = driver.findElement(webdriver.By.css("span.glyphicon.glyphicon-minus")),
        loader = driver.findElement(webdriver.By.id("loader"));

    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
        function () {
            minus.click();
        }
    );
};

function checkLocate () {
    console.log("");
    console.log("***Checking Geolocate***");
    var geolocate = driver.findElement(webdriver.By.id("geolocate")),
        loader = driver.findElement(webdriver.By.id("loader"));

    if (geolocate) {

        driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
            function () {
                geolocate.click();
            }
        );
        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.id("geolocation_marker"))));

    }
};

function checkPOI () {
    console.log("");
    console.log("***Checking POI***");
    driver.findElement(webdriver.By.id("geolocatePOI")).click();
    driver.findElement(webdriver.By.linkText("2000m")).click();

    driver.findElement(webdriver.By.xpath("//div[@id='poiList']/div/div/span")).click();

};

function checkAttributions () {
    console.log("");
    console.log("***Checking Attributions***");
    var view = driver.findElement(webdriver.By.css("div.attributions-view")).getText(),
        loader = driver.findElement(webdriver.By.id("loader"));

    if (view) {

        var attrtext = driver.findElement(webdriver.By.xpath("//dd[span[text()='Attributierung für Fachlayer']]")),
        attrtitel = driver.findElement(webdriver.By.xpath("//dt[text()='Krankenhäuser:']"));

        if (attrtitel) {
            console.log("attributions-titel für Krankenhaus gefunden...");
        }
        if (attrtext) {
            console.log("attributions-text für Krankenhaus gefunden...");
        }
    }

};

function checkSearch () {
    console.log("");
    console.log("***Checking Search***");
    var searchbar = driver.findElement(webdriver.By.id("searchInput")),
        loader = driver.findElement(webdriver.By.id("loader")),
        searchButton = driver.findElement(webdriver.By.css("button.btn.btn-default.btn-search"));

    if (searchbar) {

        searchbar.sendKeys("haus");

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']")))).then();

        driver.wait(until.elementIsNotVisible(loader), 100000, "Loader nach timeout noch sichtbar").then(
            function () {
                searchButton.click();
            }
        );

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//li[text()='festgestellt']"))));
        driver.findElement(webdriver.By.xpath("//li[text()='festgestellt']")).click();

        driver.findElement(webdriver.By.id("Hausbruch1-Neugraben-Fischbek10BPlan")).click();

        searchbar.clear();
        searchbar.sendKeys("haus");

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']"))));

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.css("li.list-group-item.results"))));
        driver.findElement(webdriver.By.css("li.list-group-item.results")).click();

        driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
            function () {
                return;
            }
        );
        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']/li[text()='im Verfahren']"))));
        driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']/li[text()='im Verfahren']")).click();

        driver.findElement(webdriver.By.id("Hausbruch40BPlan")).click();

        searchbar.clear();
        searchbar.sendKeys("haus");

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']"))));

        driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
            function () {
                searchButton.click();
            }
        );

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//li[text()='Krankenhaus']"))));
        driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']/li[text()='Krankenhaus']")).click();

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.css("li[id*='Albertinen-Krankenhaus']"))));
        driver.findElement(webdriver.By.css("li[id*='Albertinen-Krankenhaus']")).click();
        searchbar.clear();
        searchbar.sendKeys("haus");

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']"))));

        driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
            function () {
                searchButton.click();
            }
        );

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//li[text()='Stadtteil']"))));
        driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']/li[text()='Stadtteil']")).click();

        driver.findElement(webdriver.By.id("HausbruchStadtteil")).click();

        searchbar.clear();
        searchbar.sendKeys("haus");

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']"))));

        driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar").then(
            function () {
                searchButton.click();
            }
        );

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.xpath("//li[text()='Straße']"))));
        driver.findElement(webdriver.By.xpath("//ul[@id='searchInputUL']/li[text()='Straße']")).click();

        driver.wait(until.elementIsVisible(driver.findElement(webdriver.By.id("HausbrucherBahnhofstraßeStraße"))));
        driver.findElement(webdriver.By.id("HausbrucherBahnhofstraßeStraße")).click();

    }

};
