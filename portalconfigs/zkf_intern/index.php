

<?php
/*
* Php Script, dass ein Portal Schützt benötigt user_rights.php und activedirectory.php im root verzeichnis.
* eine index.html darf nicht vorhanden sein.
*/

    try {
       require('user_rights.php');
       if (!file_exists('user_rights.php') || !is_readable('user_rights.php')) {

            throw new Exception('Include file does not exists or is not readable.');
        }
        echo '
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Hamburger Fluechtlingsunterkuenfte</title>

            <link rel="stylesheet" href="css/style.css">
            <script type="text/javascript" data-main="js/main" src="node_modules/requirejs/require.js"></script>

        </head>
        <body>
            <div id="loader"><img src="img/ajax-loader.gif"></div>
            <!-- Hack um die Bildschirmauflösung zu bekommen -->
            <div id="dpidiv" style="height: 1in; left: -100%; position: absolute; top: -100%; width: 1in;"></div>
            <div id="map"></div>
            <div id="popup"></div>
            <div id="gfipopup"></div>
            <div id="searchMarker" class="glyphicon glyphicon-map-marker"></div>
        </body>
        </html>';
    }
    catch (exception $e){
    echo '  <div id="info" class="lgv_bug">';
    echo '      <img id="bug" alt="Fluechtlingsportal" src="img/Bild1.png" />';
    echo '      <p class="title" style="top:35px; font-weight: Bold; font-size: 40px;">Dieses Portal ist geschützt. Leider verfügen sie nicht über die benötigte Berechtigung, auf dieses Portal zuzugreifen.</p>';
    echo '  </div>';
    echo '  <p id="errorMessage"><br/><br/><br/><br/>'.($e->getMessage());
    echo '  <br/><br/><br/><a href="http://www.hamburg.de/bsu/landesbetrieb-geoinformation-und-vermessung">LGV Hamburg</a>';
    echo '  </p>';
    }
?>
