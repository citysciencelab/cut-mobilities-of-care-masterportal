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
$url = $paymentURL . "/hamburggateway/fvp/fv/Dataport/ExternalPayment/Default.aspx";
$private_key1 = <<<EOD
-----BEGIN RSA PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8L0hdhiyVrMtV
OgI/LREKJ/EOMIEIcWbiVEyYuUO3BlVR6VhCHDq/Xjc+CLpcaYD2Tu/7vl4KoeOs
lTaHcBMB7EVKu3uVdaCWhx35oBFXqInQNiK0Og1CmIliYODbmCF1efPvVVPADgCc
8KKLBjSI3xBuO/HmNXy2VAd0bS6Q1nlB/gTYM+YKA7nGtvqWmTXYGeQdVwvIvxVw
g7uuddjWdO1s5cbkh1zT92V1lio3DaXtU9hqHEq0xhYGxWN6gPnE9fgr7Ir3Zqw+
dUq7iKNkylfytXj+wv/6Bjkm6/6SXtbcx7Z06FNJdUcpG2PmtMm+Z6Iz852Ug3C5
7nG4YHPLAgMBAAECggEAMIV4gTTRVh5hpy332lZCaH3395KmEok63+yge1h5jz2A
zkf+S71/oEworkQN2ToS2G9uDVj+YntvetZWYwGQxRQooaZJrTXRHD7mibCuCA4a
yqbKt/Gn7Z3q/oTANZ66MdIqBXHY0FJL8itRncsRzKDHWcT3EEaGS3TLH0fvk8Rn
gXPa7DP3WdOIBuJeHTsZWtSY7OjcsQebv+4p5/qn3ngwzwwMb1q8fgiK2ZYTfMYK
dA/yQ7OypsUVCytrcHt2Qp331UwaPjh0i2aq/y0DDXBvfj+8Zi3uSrDeR/bVrYFU
/hTeNwyYF/ljktaIwXC6AlCymBSpeypiFcstdcJVUQKBgQDwly3GVM9l2E3FiJVM
sfnS0Cvzt4SOoTgl+4nfBb/K0TgkMHOpKnb8zwKxVtwle0NqPyVDmn2iaG8On09q
zj8+hCpL0lscIvegCcHlGnYvInU0x25PCm1mIuZQwQKA41mzgTS70yBrcg/fLV6g
2cvfqKkXE5i3kUCQ60pI+YenHQKBgQDIPNYOVhTZq+zjod8Q4y4eX53kQVCKZZsp
4ZnQsEcKN0qNjsli6NQcnyoT7Md0ho+di8k5hiyqYbxDHts5D4jNff88b1L2YneM
3Aa25QiadbpqDzO7bGAy19WRjBpPDDSzYT4D0F6BwQM+KqtoD8QMXj17/sOmejgJ
1HCKS6bKBwKBgBOSCJwwe+pp7PGbiaGCfLLkUh7yF6tOe/XC/1UP76j82dc/xbjG
BoXMBQkN6rx1yWcUGeDk6UFTw2zqEpi6jDR2pcYjJ1wjkAcJpCcRvvlYkTYo3tU5
IOsE/b0l5iE73SkX4oVAyEtVLOtXknH9JXNdEdwZsPuFqj3fldxXx+wVAoGBAICZ
YbhvXJC3tDo1ubd00Ce9rP/tWranrtFlDI5UyCste3oSnBAkDCYdqr6FMUwLJ609
G40QORtsDabl6FFrQqcHJqc/r/6BGtqibMWFrtLUjVaUUNssLVQ5/fWuDy95XVdf
Op7kce3Pci+448C/b1+qHr7Fzg3bLKZTg7ut/n59AoGAIjkzm/PuwJn5qC1T0kbW
Wf8wwboXkgUsjHDwUgWQhDhmDUFR7FnDfnk3ncs8J0TDifeNfYKiR2/tDPgAE7SW
5X33m01sLUXf9oyETZIN8FdlLQruRtocNTFBEGoT0f0vEncnxEZ6BYOAgYD21U8X
NqzaeeEvfykPzYeqTDxR3qM=
-----END RSA PRIVATE KEY-----
EOD;
$data_input = <<<XML
<paymentdata xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.dataport.de/de-de/fhhgateway/payment" xsi:schemaLocation="http://www.dataport.de/de-de/fhhgateway/payment https://hamburggateway/fvp/fv/Dataport/ExternalPayment/Schemas/V1/paymentdata.xsd"><metadata version="1.0" encoding="UTF-8" schema="paymentdata.xsd"/><sid>$sid</sid><key>$key</key><price>$price</price><currency>$currency</currency><successurl>$successurl</successurl><failureurl>$failureurl</failureurl><cancelurl>$cancelurl</cancelurl><name>$name</name><orderid>$orderid</orderid><description>$description</description></paymentdata>
XML;

$data_xml = new SimpleXMLElement($data_input);

$keydoc = new DOMDocument();
$keydoc->formatOutput = true;
$keydoc->preserveWhiteSpace = false;
$keydoc->loadXML("<RSAKeyValue><Modulus>vC9IXYYslazLVToCPy0RCifxDjCBCHFm4lRMmLlDtwZVUelYQhw6v143Pgi6XGmA9k7v+75eCqHjrJU2h3ATAexFSrt7lXWglocd+aARV6iJ0DYitDoNQpiJYmDg25ghdXnz71VTwA4AnPCiiwY0iN8Qbjvx5jV8tlQHdG0ukNZ5Qf4E2DPmCgO5xrb6lpk12BnkHVcLyL8VcIO7rnXY1nTtbOXG5Idc0/dldZYqNw2l7VPYahxKtMYWBsVjeoD5xPX4K+yK92asPnVKu4ijZMpX8rV4/sL/+gY5Juv+kl7W3Me2dOhTSXVHKRtj5rTJvmeiM/OdlINwue5xuGBzyw==</Modulus><Exponent>AQAB</Exponent><P>8JctxlTPZdhNxYiVTLH50tAr87eEjqE4JfuJ3wW/ytE4JDBzqSp2/M8CsVbcJXtDaj8lQ5p9omhvDp9Pas4/PoQqS9JbHCL3oAnB5Rp2LyJ1NMduTwptZiLmUMECgONZs4E0u9Mga3IP3y1eoNnL36ipFxOYt5FAkOtKSPmHpx0=</P><Q>yDzWDlYU2avs46HfEOMuHl+d5EFQimWbKeGZ0LBHCjdKjY7JYujUHJ8qE+zHdIaPnYvJOYYsqmG8Qx7bOQ+IzX3/PG9S9mJ3jNwGtuUImnW6ag8zu2xgMtfVkYwaTww0s2E+A9BegcEDPiqraA/EDF49e/7Dpno4CdRwikumygc=</Q><DP>E5IInDB76mns8ZuJoYJ8suRSHvIXq0579cL/VQ/vqPzZ1z/FuMYGhcwFCQ3qvHXJZxQZ4OTpQVPDbOoSmLqMNHalxiMnXCOQBwmkJxG++ViRNije1Tkg6wT9vSXmITvdKRfihUDIS1Us61eScf0lc10R3Bmw+4WqPd+V3FfH7BU=</DP><DQ>gJlhuG9ckLe0OjW5t3TQJ72s/+1atqeu0WUMjlTIKy17ehKcECQMJh2qvoUxTAsnrT0bjRA5G2wNpuXoUWtCpwcmpz+v/oEa2qJsxYWu0tSNVpRQ2ywtVDn99a4PL3ldV186nuRx7c9yL7jjwL9vX6oevsXODdssplODu63+fn0=</DQ><InverseQ>Ijkzm/PuwJn5qC1T0kbWWf8wwboXkgUsjHDwUgWQhDhmDUFR7FnDfnk3ncs8J0TDifeNfYKiR2/tDPgAE7SW5X33m01sLUXf9oyETZIN8FdlLQruRtocNTFBEGoT0f0vEncnxEZ6BYOAgYD21U8XNqzaeeEvfykPzYeqTDxR3qM=</InverseQ><D>MIV4gTTRVh5hpy332lZCaH3395KmEok63+yge1h5jz2Azkf+S71/oEworkQN2ToS2G9uDVj+YntvetZWYwGQxRQooaZJrTXRHD7mibCuCA4ayqbKt/Gn7Z3q/oTANZ66MdIqBXHY0FJL8itRncsRzKDHWcT3EEaGS3TLH0fvk8RngXPa7DP3WdOIBuJeHTsZWtSY7OjcsQebv+4p5/qn3ngwzwwMb1q8fgiK2ZYTfMYKdA/yQ7OypsUVCytrcHt2Qp331UwaPjh0i2aq/y0DDXBvfj+8Zi3uSrDeR/bVrYFU/hTeNwyYF/ljktaIwXC6AlCymBSpeypiFcstdcJVUQ==</D></RSAKeyValue>");

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
