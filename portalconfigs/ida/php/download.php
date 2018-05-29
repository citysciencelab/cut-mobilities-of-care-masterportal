<?php
    # Erzeuge Ausgabe und schließe Fenster, wenn fertig geladen.
    echo "<span>Download gestartet...</span>";
    echo "<body onload='window.close();'></body>";
    # Erzeugt Variable $paymentURL und $portalURL
    include "checkEnvironment.php";
    # Erzeugt Variable $pg_table und Funktion write2DB
    include "loggerdb.php";

    # Lese Parameter aus
    $type = isset($_GET["TYPE"]) ? strtoupper ($_GET["TYPE"]) : "AUSKUNFT"; # "AUSKUNFT" oder "RECHNUNG"
    $orderId = $_GET["ORDERID"] ? $_GET["ORDERID"] : "";

    # Prüfe Eingabedaten
    if ($orderId === "") {
        error_log("download.php is missing ORDERID. Aborting!");
        exit();
    }

    # Baue Dateinamen zusammen
    if ($type == "RECHNUNG") {
        $file = "RE_" . $orderId . ".pdf";
    }
    else {
        $file = $orderId . ".pdf";
    }

    # Prüfe, ob bezahlt werden musste
    $downloadPermitted = True;
    $query = "SELECT status FROM ".$pg_table." WHERE orderid='".$orderId."';";
    $json = write2DB($query);
    $obj = json_decode($json);
    if ($obj->{'result'}) { # wenn kein Eintrag in DB vorhanden (z.B. bei Intranet-Anwendung) bleibt $downloadPermitted = True
        $status = $obj->{'result'}->{'status'};
        if ($status != "PrePayPaid") {
            $downloadPermitted = False;
        }
    }
    # Prüfe Abbruchbedingung
    if ($downloadPermitted == False) {
        error_log("download.php negates download of " . $file . " with status " . $status . ". Aborting!");
        exit();
    }

    # Initiiere Download
    $path = "../results/";
    $fullfile = $path.$file;
    if (!file_exists($fullfile)) {
        error_log("download.php cannot find file " . $file . ". Aborting!");
        exit();
    }
    header("Content-Disposition: attachment; filename=" . Urlencode($file));
    header("Content-Type: application/force-download");
    header("Content-Type: application/octet-stream");
    header("Content-Type: application/download");
    header("Content-Description: File Transfer");
    header("Content-Length: " . Filesize($fullfile));
    flush(); // this doesn't really matter.
    $fp = fopen($fullfile, "r");
    while (!feof($fp))
    {
        echo fread($fp, 65536);
        flush(); // this is essential for large downloads
    }
    fclose($fp);
?>
