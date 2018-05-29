<?php

# Erzeugt Variable $paymentURL und $portalURL
include "checkEnvironment.php";

const XMLENCNS = "http://www.w3.org/2000/09/xmldsig#";
const RSA_SHA256 = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
const EXC_C14N = "http://www.w3.org/2001/10/xml-exc-c14n#";
const ENVELOPED_SIG = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
const SHA256 = "http://www.w3.org/2001/04/xmlenc#sha256";

# Parameter auslesen
$orderid = $_GET["ORDERID"] or die ("ORDERID nicht übergeben.");
$config = json_decode(file_get_contents("../config.json"));
$payment = $config->{"Portalconfig"}->{"payment"} or die ("Payment nicht konfiguriert.");
$price = $payment->{"price"} or die ("Preis nicht konfiguriert.");
$currency = $payment->{"currency"} ? $payment->{"currency"} : "EUR";
$successurl = $payment->{"successURL"} . "?ORDERID=" . $orderid or die ("successURL nicht konfiguriert.");
$failureurl = $payment->{"failureURL"} . "?ORDERID=" . $orderid or die ("failureURL nicht konfiguriert.");
$cancelurl = $payment->{"cancelURL"} . "?ORDERID=" . $orderid or die ("cancelURL nicht konfiguriert.");
$name = "anonym";
$description = $payment->{"description"} ? $payment->{"description"} : "Auskunft über Immobilienwerte in Hamburg und die zur Wertermittlung erforderlichen Daten aus IDA.HH.";
$key = $payment->{"key"} or die ("Key nicht konfiguriert.");
$sid = $payment->{"sid"} or die ("sID nicht konfiguriert.");
#FVS steht für Fachverfahren-Secure -> angemeldete Benutzer
#FVP steht für Fachverfahren-Public -> anonyme Bezahlschnittstelle
$url = $paymentURL . "/hamburggateway/fvp/fv/Dataport/ExternalPayment/Default.aspx";
$private_key1 = <<<EOD
-----BEGIN RSA PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDmnVFmuoHd/0H8
r0/QqAJvKw54meha9GGG0UrDB6lJ+rokGcD4E7T0EeHISIoTsXyDOxirM3PlJ33a
mluG4Uv7DGh7ve+w24aWugBuXhUQb1ya3gqFmjXrL+j7vz3JRofOgOgpe8ppl2np
qmJQBiawISWF0trsV+zDzNUmdabPWfdZ2JWWHZFotPEdGzoltfuDu7XyhL0M1+kM
QJNRfeohjUDbFRlG/OFtYvdPYcB9xumYoBjlwpgm52bTRBbCVFmlz8+GGHYfiaWV
wiIMlLqSPDOq4M/dj3bpyTNL9oz+8CY6kTLYJx6hisHhC3FhGekc8A7xwxx7AEDA
QalVjRGzAgMBAAECggEATP0iKtCDAJDx/6CrXbZpMaHHL/35szu4v2BpvBh3rMn2
kIzEfk1d8MlzfgCxkAeF0O3Ou4Du5Qa9Hli/y5S1X/dxfjYXqgxvrywjbrUcBSOY
X99W1el4rK6O8lSTFPnl5svkNc0s8vlok2idb6fODKjUNQwCqDpmQavFURSf/sKg
wme4MjPdxxmubaAfNteHt5e0vr0zWfqpgMua3YXy98XfjpdSqk35fkncdG06nfB7
qAmJshfaUZY5nEVEGY8pZEiQcPxkei3TF08kt+Pav1PFJlm65yLzvSQ81hog6AP0
MYk0VPPn7IKgglWLqC5uhT80LHuL1aAqCkRr8sqDQQKBgQD/MPrwggWCt6R7LLgd
hMdq4/2ZQ/4IeQygutiUryK0IOZ4GX+/RulWEYYP+NUs+gwdshiNelBFXjlNy36N
uCwtXcz2uZPU08ZzXhsYPWx7HzITgH7qs2YW8udkZiZdotyjqVKB/97Hq6U+JVW6
uBFprNoejTMoo4mhOYQPofH4YQKBgQDnWGZ0TJKWaJ6qP9QehkrXimVDuMnR07cF
3UB/PDwO0fGwNt9wAINz0FzgnlYz1fkMjXYaGkK1VXrqoZc4M5MMQ07VpRys63ZI
wFxmLJ2oNykyecvskqOXHtcdLuhzwqh1LQ8GDDIlFlMRc+ngG4ASKCokKRRCsNbd
jvj3oeiykwKBgQCflukH6bg6hFA3u8K0qynvHf+ljtDaSaFtDwyNB23DimO3LfMn
Etivu6vEZ1AhnYpgM9WI/Logd4mMrjtJs6jlAilBDtN1oK8VzP9SzG8AHIU7jvtQ
Gbs5lNTCg+NwYX5sV2LC69pNsnlXgQ+5Ao3ZMYEC5DjfLE7Q5eBBynxBYQKBgQC1
6GDHWd55vlHkdMQKLHZ0/TGbCpZHEz56sfqhEW/4B0UP1lXi78RtMI2XYWlO4RUv
tZwD8lo507kO/Xi2jHc30UUP4QCnR45+riL5hGODfbw7IGIk5zkS/wEOxW+qdomX
eZKyoqxbVS6ELqzbt0QBAuv/+v0fY4XQOTezH/ClWQKBgDPtwLEMskXuAhi88ROE
S/DpX3vne5rDexP/TCpfEXfOiza9UKdWzyUxmrIlm2+E+HBHWuoMGauzmnuZnmi8
2x3zcq8M9ZMOOw4YgEVXFNLlYpTwMwLfJ+LJQ9SxLuFdhVYmWTq6sBUZ7cuyRny/
eXzR9u2nApYWBG5/xR19WJug
-----END RSA PRIVATE KEY-----
EOD;
$data_input = <<<XML
<paymentdata xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.dataport.de/de-de/fhhgateway/payment" xsi:schemaLocation="http://www.dataport.de/de-de/fhhgateway/payment https://hamburggateway/fvp/fv/Dataport/ExternalPayment/Schemas/V1/paymentdata.xsd"><metadata version="1.0" encoding="UTF-8" schema="paymentdata.xsd"/><sid>$sid</sid><key>$key</key><price>$price</price><currency>$currency</currency><successurl>$successurl</successurl><failureurl>$failureurl</failureurl><cancelurl>$cancelurl</cancelurl><name>$name</name><orderid>$orderid</orderid><description>$description</description></paymentdata>
XML;

$data_xml = new SimpleXMLElement($data_input);

$keydoc = new DOMDocument();
$keydoc->formatOutput = true;
$keydoc->preserveWhiteSpace = false;
$keydoc->loadXML("<RSAKeyValue><Modulus>5p1RZrqB3f9B/K9P0KgCbysOeJnoWvRhhtFKwwepSfq6JBnA+BO09BHhyEiKE7F8gzsYqzNz5Sd92ppbhuFL+wxoe73vsNuGlroAbl4VEG9cmt4KhZo16y/o+789yUaHzoDoKXvKaZdp6apiUAYmsCElhdLa7Ffsw8zVJnWmz1n3WdiVlh2RaLTxHRs6JbX7g7u18oS9DNfpDECTUX3qIY1A2xUZRvzhbWL3T2HAfcbpmKAY5cKYJudm00QWwlRZpc/Phhh2H4mllcIiDJS6kjwzquDP3Y926ckzS/aM/vAmOpEy2CceoYrB4QtxYRnpHPAO8cMcewBAwEGpVY0Rsw==</Modulus><Exponent>AQAB</Exponent><P>/zD68IIFgrekeyy4HYTHauP9mUP+CHkMoLrYlK8itCDmeBl/v0bpVhGGD/jVLPoMHbIYjXpQRV45Tct+jbgsLV3M9rmT1NPGc14bGD1sex8yE4B+6rNmFvLnZGYmXaLco6lSgf/ex6ulPiVVurgRaazaHo0zKKOJoTmED6Hx+GE=</P><Q>51hmdEySlmieqj/UHoZK14plQ7jJ0dO3Bd1Afzw8DtHxsDbfcACDc9Bc4J5WM9X5DI12GhpCtVV66qGXODOTDENO1aUcrOt2SMBcZiydqDcpMnnL7JKjlx7XHS7oc8KodS0PBgwyJRZTEXPp4BuAEigqJCkUQrDW3Y7496HospM=</Q><DP>n5bpB+m4OoRQN7vCtKsp7x3/pY7Q2kmhbQ8MjQdtw4pjty3zJxLYr7urxGdQIZ2KYDPViPy6IHeJjK47SbOo5QIpQQ7TdaCvFcz/UsxvAByFO477UBm7OZTUwoPjcGF+bFdiwuvaTbJ5V4EPuQKN2TGBAuQ43yxO0OXgQcp8QWE=</DP><DQ>tehgx1neeb5R5HTECix2dP0xmwqWRxM+erH6oRFv+AdFD9ZV4u/EbTCNl2FpTuEVL7WcA/JaOdO5Dv14tox3N9FFD+EAp0eOfq4i+YRjg328OyBiJOc5Ev8BDsVvqnaJl3mSsqKsW1UuhC6s27dEAQLr//r9H2OF0Dk3sx/wpVk=</DQ><InverseQ>M+3AsQyyRe4CGLzxE4RL8Olfe+d7msN7E/9MKl8Rd86LNr1Qp1bPJTGasiWbb4T4cEda6gwZq7Oae5meaLzbHfNyrwz1kw47DhiARVcU0uVilPAzAt8n4slD1LEu4V2FViZZOrqwFRnty7JGfL95fNH27acClhYEbn/FHX1Ym6A=</InverseQ><D>TP0iKtCDAJDx/6CrXbZpMaHHL/35szu4v2BpvBh3rMn2kIzEfk1d8MlzfgCxkAeF0O3Ou4Du5Qa9Hli/y5S1X/dxfjYXqgxvrywjbrUcBSOYX99W1el4rK6O8lSTFPnl5svkNc0s8vlok2idb6fODKjUNQwCqDpmQavFURSf/sKgwme4MjPdxxmubaAfNteHt5e0vr0zWfqpgMua3YXy98XfjpdSqk35fkncdG06nfB7qAmJshfaUZY5nEVEGY8pZEiQcPxkei3TF08kt+Pav1PFJlm65yLzvSQ81hog6AP0MYk0VPPn7IKgglWLqC5uhT80LHuL1aAqCkRr8sqDQQ==</D></RSAKeyValue>");

$dom_ele = dom_import_simplexml($data_xml);
$doc = new DOMDocument();
$doc->formatOutput = false;
$doc->preserveWhiteSpace = false;

$dom_ele = $doc->importNode($dom_ele, true);
$doc->appendChild($dom_ele);
$doc->encoding = "UTF8";

$digest = createDigestValue($doc);

$node = $doc->documentElement->appendChild($doc->createElementNS(XMLENCNS, "Signature"));
$node1 = $node->appendChild($doc->createElement("SignedInfo"));
$signedInfo = $node1;

$element = $node1->appendChild($doc->createElement("CanonicalizationMethod"));
$att = $doc->createAttribute("Algorithm");
$att->value = EXC_C14N;
$element->appendChild($att);

$element = $node1->appendChild($doc->createElement("SignatureMethod"));
$att = $doc->createAttribute("Algorithm");
$att->value = RSA_SHA256;
$element->appendChild($att);

$element = $node1->appendChild($doc->createElement("Reference"));
$att = $doc->createAttribute("URI");
$att->value = "";
$element->appendChild($att);

$element1 = $element->appendChild($doc->createElement("Transforms"));

$element2 = $element1->appendChild($doc->createElement("Transform"));
$att = $doc->createAttribute("Algorithm");
$att->value = ENVELOPED_SIG;
$element2->appendChild($att);

$element2 = $element1->appendChild($doc->createElement("Transform"));
$att = $doc->createAttribute("Algorithm");
$att->value = EXC_C14N;
$element2->appendChild($att);

$element1 = $element->appendChild($doc->createElement("DigestMethod"));
$att = $doc->createAttribute("Algorithm");
$att->value = SHA256;
$element1->appendChild($att);

$element1 = $element->appendChild($doc->createElement("DigestValue"));
$element1->nodeValue = $digest;

$node1 = $node->appendChild($doc->createElement("SignatureValue"));
$signature = $node1;

$node1 = $node->appendChild($doc->createElement("KeyInfo"));

$node1 = $node1->appendChild($doc->createElement("KeyValue"));

$node1 = $node1->appendChild($doc->createElement("RSAKeyValue"));
$rsakey = $node1;

$node2 = $node1->appendChild($doc->createElement("Modulus"));
$node2->nodeValue = $keydoc->getElementsByTagName("Modulus")->item(0)->nodeValue;

$node2 = $node1->appendChild($doc->createElement("Exponent"));
$node2->nodeValue = $keydoc->getElementsByTagName("Exponent")->item(0)->nodeValue;

$signature->nodeValue = sign($signedInfo,  $private_key1);

$result = $doc->saveXML();
$result = preg_replace('/^.+\n/', '', $result);

$base64 = base64_encode($result);

# Erzeuge Form mit PAYDATA und submitte onload
echo '<body onload="document.paymentform.submit()">';
echo '<span>Sie werden weitergeleitet. Einen Moment bitte.</span>';
echo '<form action="'.$url.'" name="paymentform" id="'.$sid.'" method="post" enctype="application/x-www-form-urlencoded" hidden>';
echo '<input type="text" value="'.$base64.'" id="PAYDATA" name="PAYDATA" readonly>';
echo '<button id = "PAYDATA_submit" type="submit">Senden</button>';
echo '</form>';
echo '</body>';


function ReadUnicodeFile($fn)
{
    $fc = "";
    $fh = fopen($fn,"rb") or die("Cannot open file for read: $fn<br>\n");
    $flen = filesize($fn);
    $bc = fread($fh, $flen);

    for ($i=0; $i<$flen; $i++)
    {
        $c = substr($bc,$i,1);

        if ((ord($c) != 0) && (ord($c) != 13))
            $fc = $fc . $c;
    }

    if ((ord(substr($fc,0,1)) == 255) && (ord(substr($fc,1,1)) == 254))
        $fc = substr($fc,2);

    return ($fc);
}


function createDigestValue(DOMDocument $request)
{
    $ns = $request->documentElement->namespaceURI;
    $body = $request
        ->getElementsByTagNameNS($ns, 'paymentdata')
        ->item(0);

    $content = $body->C14N(true, true); // <-- exclusive, with comments
    $hash = hash('SHA256', $content, true);
    $actualDigest = base64_encode($hash);
    return ($actualDigest);
}

function sign(DOMNode $signedInfo, $privatekeyPEM)
{
    // canonicalize the SignedInfo element for signing
    $c14nSignedInfo = $signedInfo->C14N(true, true);

    $passphrase = null;


    $privKey = openssl_pkey_get_private($privatekeyPEM, $passphrase);

    // sign the SignedInfo element using the private key
    if (!openssl_sign($c14nSignedInfo, $signature, $privKey, "sha256"))
    {
        throw new \UnexpectedValueException('Unable to sign the document. Error: ' . openssl_error_string());
    }

    $signature = base64_encode($signature);

    return $signature;
}
?>
