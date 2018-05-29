<?php
/**
 * urm.php
 * PHP version 5.6
 *
 * User-Rights-Managemet
 *
 * @author     Michael Bieler
 * @copyright  2017 Landesbetrieb Geoinformation und Vermessung
 * @version    1.0
 * @see        http://geofos.fhhnet.stadt.hamburg.de/plis-vfdb
 * @since      04.04.2017
 * @deprecated -
 */

    /**
     * Dieses Skript stellt eine Verbindung zur activedirectory.php her, die den Abgleich mit dem AD herstellt.
     * Dort werden diverse Variablen aus dem AD ausgelesen und im PHP gesetzt. Hier erfolgt nun eine Auswertung
     * dieser Variablen und eine Feststellung, welcher Nutzergruppe mit welchen Rechten der User zugeordnet ist.
     */
    mb_internal_encoding("UTF-8");
    require ('../libs/php/activedirectory.php');
    evaluateuser();
    if (ismemberofgroup('CN=U-LGV-LGV_G12,OU=Gruppen,OU=GV,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){
        $accessgranted =  true;
    }
    // BSW
    elseif (ismemberofgroup('CN=U-BSW-WSB-WSB14,OU=Groups,OU=BSW,OU=BSU,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){
        $accessgranted =  true;
    }
    else {
        throw new Exception ('Sie besitzen keine Berechtigung, um dieses Mietenspiegel-Portal zu betreten.</br>Bitte wenden Sie sich an Ihren Administrator.');
        $accessgranted =  false;
    }
?>