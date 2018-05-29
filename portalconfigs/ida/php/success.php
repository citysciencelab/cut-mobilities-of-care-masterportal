<?php
    # Erzeugt Variable $paymentURL und $portalURL
    include "checkEnvironment.php";
    # Erzeugt Variable $pg_table und Funktion write2DB
    include "loggerdb.php";

    # Lese Parameter aus
    $transId = $_POST["TRANSACTIONID"] ? $_POST["TRANSACTIONID"] : "unset";
    $transLink = $_POST["TRANSACTIONQUERYLINK"] ? $_POST["TRANSACTIONQUERYLINK"] : "";
    $orderId = $_GET["ORDERID"] ? $_GET["ORDERID"] : "";

    # Prüfe Eingabedaten
    if ($orderId === "") {
        error_log("success.php is missing ORDERID. Aborting!");
        exit();
    }

    # Logge TRANSACTIONID
    $query = "UPDATE " . $pg_table . " SET transactionid = '" . $transId . "' WHERE orderid = '" . $orderId . "' RETURNING *;";
    write2DB($query);

    # Erzeuge Check-URL und frage Status der Bezahlung mit cURL ab
    if (!isset($transLink)) {
        $query = "UPDATE " . $pg_table . " SET status = 'error no TRANSACTIONQUERYLINK' WHERE orderid = '" . $orderId . "' RETURNING *;";
        write2DB($query);
        error_log("success.php is missing TRANSACTIONQUERYLINK. Aborting!");
        exit();
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $paymentURL . $transLink);
    if ($curlProxy == True) {
        curl_setopt($ch, CURLOPT_PROXY, "10.61.16.6:3128");
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, Array("Content-Type: text/xml"));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); # Set so curl_exec returns the result instead of outputting it.
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); # Folgt evtl. Weiterleitungen
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); # keine SSL Zertifikats-Prüfung
    curl_setopt($ch, CURLOPT_TIMEOUT, 10); # Timeout 10 Sekunden
    $response = curl_exec($ch); # Get the response
    curl_close($ch); # Close the channel

    # Lese statusString aus response aus
    $statusString = "";
    if ($response == False) {
        $query = "UPDATE " . $pg_table . " SET status = 'error verivifing payment response: " . $paymentURL . $transLink . "' WHERE orderid = '".$orderId."' RETURNING *;";
    }
    else {
        $xml = simplexml_load_string($response);
        if (!$xml) {
            $query = "UPDATE " . $pg_table . " SET status = 'error parsing XML' WHERE orderid = '".$orderId."' RETURNING *;";
        }
        else {
            # erste Zeile ist immer PrePayUnpaid. Zweite Zeile ist neuer Status.
            foreach($xml->children() as $row) {
                $statusString = $row["statusIdString"] ? $row["statusIdString"] : "error no statusIdString";
            }
            $query = "UPDATE " . $pg_table . " SET status = '" . $statusString . "' WHERE orderid = '".$orderId."' RETURNING *;";
        }
    }
    write2DB($query);

    # Erzeuge returnURL für redirect anhand statusString
    if ($statusString == "PrePayPaid") {
        $returnURL = $portalURL . "?STATUS=SUCCESS&ORDERID=" . $orderId;
    }
    else if ($statusString == "PrePayUnpaid") {
        $returnURL = $portalURL . "?STATUS=FAILURE&ORDERID=" . $orderId;
    }
    else {
        $returnURL = $portalURL . "?STATUS=FATAL&ORDERID=" . $orderId;
    }
    header("HTTP/1.1 301 Moved Permanently");
    header("Location: " . $returnURL);
    exit();
?>
