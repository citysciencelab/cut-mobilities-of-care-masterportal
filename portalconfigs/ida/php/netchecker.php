<?php
    # Erzeugt Variable $paymentURL und $portalURL
    include "checkEnvironment.php";

    $orderid = $_GET['ORDERID'] or die ("Auftragsnummer fehlt.");

    if ($needsPayment === True) {
        # Parameter auslesen
        $config = json_decode(file_get_contents("../config.json"));
        $payment = $config->{"Portalconfig"}->{"payment"} or die ("Payment nicht konfiguriert.");
        $url = $payment->{"startingURL"} . "?ORDERID=" . $orderid;
    }
    else {
        $url = $portalURL . "?status=success&ORDERID=" . $orderid;
    }

    header("HTTP/1.1 301 Moved Permanently");
    header("Location: " . $url);
?>
