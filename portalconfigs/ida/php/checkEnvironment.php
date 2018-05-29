<?php
    $server = $_SERVER['HTTP_HOST']; # PHP Server Host. Nicht der client.
    $paymentURL = ""; # Über diese URL wird die Bezahlkomponente angesprochen
    $portalURL = ""; # Auf diese URL wird nach der Zahlung aus success.php usw. zurück verwiesen.
    $curlProxy = False; # Gibt an, ob in success.php curl einen Proxy braucht. Nur im Intranet = True
    $needsPayment = True; # Gibt an, ob eine Bezahlung notwendig ist. Nur Internet und dev.

    // Netzwerk feststellen.
    if ($server == "wfalgqw001" || $server == "wfalgqw001.fhhnet.stadt.hamburg.de" || $server == "test-geofos" || $server == "test-geofos.fhhnet.stadt.hamburg.de") {
        $paymentURL = "https://stage.gateway.hamburg.de";
        $portalURL = "http://wfalgqw001.fhhnet.stadt.hamburg.de/ida";
        $curlProxy = True;
        $needsPayment = False;
    }
    else if ($server == "wfalgpw001" || $server == "wfalgpw001.fhhnet.stadt.hamburg.de" || $server == "geofos" || $server == "geofos.fhhnet.stadt.hamburg.de") {
        $paymentURL = "https://gateway.hamburg.de";
        $portalURL = "http://geofos.fhhnet.stadt.hamburg.de/ida";
        $curlProxy = True;
        $needsPayment = False;
    }
    else if ($server == "test.geoportal-hamburg.de") {
        $paymentURL = "https://stage.gateway.hamburg.de";
        $portalURL = "http://test.geoportal-hamburg.de/ida";
        $curlProxy = False;
        $needsPayment = True;
    }
    else {
        $paymentURL = "https://gateway.hamburg.de";
        $portalURL = "https://geoportal-hamburg.de/ida";
        $curlProxy = False;
        $needsPayment = True;
    }
?>
