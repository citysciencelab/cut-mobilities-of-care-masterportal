<?php
    mb_internal_encoding("UTF-8");
    try {
        require ("urm.php");
        if ($accessgranted == 'all') {
            echo '<!DOCTYPE html>';
            echo '<html lang="de">';
            echo '<head>';
            echo '<meta charset="utf-8">';
            echo '<meta http-equiv="X-UA-Compatible" content="IE=edge">';
            echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
            echo '<title>Hamburger Mietenspiegel</title>';

            echo '<link rel="stylesheet" href="css/style.css">';
            echo '<script type="text/javascript" data-main="js/main" src="node_modules/requirejs/require.js"></script>';

            echo '</head>';
            echo '<body>';
            echo '<div id="loader"><img src="img/ajax-loader.gif"></div>';

            echo '<div id="dpidiv" style="height: 1in; left: -100%; position: absolute; top: -100%; width: 1in;"></div>';
            echo '<div id="map"></div>';
            echo '<div id="popup"></div>';
            echo '<div id="gfipopup"></div>';
            echo '<div id="searchMarker" class="glyphicon glyphicon-map-marker"></div>';
            echo '<div id="userinfos" class="copyright">';
            echo '<p>Herzlich Willkommen, ' . $firstname . " " . $lastname . '</p>';
            echo '</div>';
            echo '</body>';
            echo '</html>';
        }
    }
    catch (exception $e){
        echo '<!DOCTYPE html>';
        echo '<html lang="de">';
        echo '<head>';
        echo '<meta charset="utf-8">';
        echo '<meta http-equiv="X-UA-Compatible" content="IE=edge">';
        echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
        echo '<title>Hamburger Mietenspiegel</title>';
        echo '<h1>' . $firstname . " " . $lastname . ", " . $e->getMessage() . '</h1>';
        echo '</head>';
        echo '</html>';
    }
?>
