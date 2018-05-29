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
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC+6X2D2VfNNrQB
fLA9zoQz4SapDt56YR/HdM5FEVWoULPH/x0F3QC6TdhUysbAGL6plI32my+YEMy+
3MIwgN+3TY8KHEgXYIR5hHlYlbFkAxZ3JBL7gy/3mPB8Bk/uKJXDUMCiBvkfcVuQ
ElWgLvI7Fxc4GqGScuCua06YJ+cxw9b7z8ws3DdLkam9LkXViYVfPcBZAVcu2Wp2
LBveTqTuaZgfA3+HVmCJeJfSaWQLWYm5RCUd7UyAyoWxku/p7mhPI4lMTTWeF+6c
Yh8KD1lrkYcmurO930lbfpgs8OUUFWE1ScQ3+svsmoX97+npU31riMdS4akRfESW
felCxdLpAgMBAAECggEBAJ1MaLxwIaXWAq6O+++Q7uCIDICS3cBbsgF3PlUuGTOb
euW4T0N7epQGe84xXVz9hmrXGbks2CQlA23nGqE4Lhwr7UVZVBTe04gEHK9ed1B+
Ms5rjLBqwOTywIKP+N+z1OGe8XkO4ciEb/rfAGoBBFinh9wUJTgzKujLRXCcwCMB
WPSltjqf8LTis2wSgA+XpfzCfVlSq/xTqkPgXOHlH7bBag77+UBQ0XsdNsxJMbJn
Jkq79p5g6E4buKLhsf1MtqOm9iCZVbkd02AxJ7wVn7KTEIeC19QxYoqoQUJpwShL
4/APHKo2b133AvR8LBChAKF31U+68I2TjKDSKfxG2xkCgYEA9nugvebzGUqQ7mxP
bOaYRSPmQhv056bQZ4hIoWpQjLds4/WUSsiXAX8RV6jKTFRTQbde+AGYi0Ea20QC
ZGNPjMShhzRdiBb7ganrhPJ9r455i9LQi8oo/jYtUyhB9RylCn5NwA8UVF8Kkqey
1pvDTBfsy4qLro0Y4+/3d2WSK5cCgYEAxkiR18Kr+Nc4H4QoeSNSR85MZhusJDZj
iBz9yW0SH0A5//x2P/rOHdDAH9Ac7RYm2RvCrMW+xwmQUyKoFZOd5nPxZtvoyHQ8
HvpZgxLjVOLzKJdhgcwD79EKBgSQlB2lSL+PfkUfWbsQVvSUcDsKSMXfZ7dhktJF
f9MzJwzhxX8CgYEA8VtRpWL2/PcFQFKS28JZrKpgmK+jewrf2+GZrWXbhk8+s2IQ
WcJeC7sPklTX8zJHbHxQ5G07oHCaCcdoyEBu7xrESQ6/37kRgoCO/VouNLBA2OgQ
CjJlPbhzXZB4Nbpc6g+PtteNQqjmQ4EvH/LapDJxT0ZVTREhJGIgYqv1G/UCgYEA
tYc0tiJMTPnEMN5OK3ER4BlXSlflRhXhE3jvQ1wurhufveME41gbIaK+caGXCdsw
360RkhlLqm7wCZx945sMgTH+fJuxxurbK8Uo893z8AACe1Pz+d+sbv6ivZWqQ1/M
tQhjN0fTBtRChklOKF108eDtwcdadg85f2f8ubCKdcMCgYBcAUQFPSYAqR3tauSL
QMww+aubslhnw/aF0pcgwa9rG4x6/HHjHfoSqYrWLkqQlYCkR48CZSnP8RfsyWrO
fBj+bV19ogbTId2OUeBJmGjfJOp5B3DreYm3HIL7nglqoQ9QX+LUv2Pvz/J0ckd1
nMJ2Ex2EuCsMCFtCRp+tRMjkaQ==
-----END RSA PRIVATE KEY-----
EOD;
$data_input = <<<XML
<paymentdata xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.dataport.de/de-de/fhhgateway/payment" xsi:schemaLocation="http://www.dataport.de/de-de/fhhgateway/payment https://hamburggateway/fvp/fv/Dataport/ExternalPayment/Schemas/V1/paymentdata.xsd"><metadata version="1.0" encoding="UTF-8" schema="paymentdata.xsd"/><sid>$sid</sid><key>$key</key><price>$price</price><currency>$currency</currency><successurl>$successurl</successurl><failureurl>$failureurl</failureurl><cancelurl>$cancelurl</cancelurl><name>$name</name><orderid>$orderid</orderid><description>$description</description></paymentdata>
XML;

$data_xml = new SimpleXMLElement($data_input);

$keydoc = new DOMDocument();
$keydoc->formatOutput = true;
$keydoc->preserveWhiteSpace = false;
$keydoc->loadXML("<RSAKeyValue><Modulus>vul9g9lXzTa0AXywPc6EM+EmqQ7eemEfx3TORRFVqFCzx/8dBd0Auk3YVMrGwBi+qZSN9psvmBDMvtzCMIDft02PChxIF2CEeYR5WJWxZAMWdyQS+4Mv95jwfAZP7iiVw1DAogb5H3FbkBJVoC7yOxcXOBqhknLgrmtOmCfnMcPW+8/MLNw3S5GpvS5F1YmFXz3AWQFXLtlqdiwb3k6k7mmYHwN/h1ZgiXiX0mlkC1mJuUQlHe1MgMqFsZLv6e5oTyOJTE01nhfunGIfCg9Za5GHJrqzvd9JW36YLPDlFBVhNUnEN/rL7JqF/e/p6VN9a4jHUuGpEXxEln3pQsXS6Q==</Modulus><Exponent>AQAB</Exponent><P>9nugvebzGUqQ7mxPbOaYRSPmQhv056bQZ4hIoWpQjLds4/WUSsiXAX8RV6jKTFRTQbde+AGYi0Ea20QCZGNPjMShhzRdiBb7ganrhPJ9r455i9LQi8oo/jYtUyhB9RylCn5NwA8UVF8Kkqey1pvDTBfsy4qLro0Y4+/3d2WSK5c=</P><Q>xkiR18Kr+Nc4H4QoeSNSR85MZhusJDZjiBz9yW0SH0A5//x2P/rOHdDAH9Ac7RYm2RvCrMW+xwmQUyKoFZOd5nPxZtvoyHQ8HvpZgxLjVOLzKJdhgcwD79EKBgSQlB2lSL+PfkUfWbsQVvSUcDsKSMXfZ7dhktJFf9MzJwzhxX8=</Q><DP>8VtRpWL2/PcFQFKS28JZrKpgmK+jewrf2+GZrWXbhk8+s2IQWcJeC7sPklTX8zJHbHxQ5G07oHCaCcdoyEBu7xrESQ6/37kRgoCO/VouNLBA2OgQCjJlPbhzXZB4Nbpc6g+PtteNQqjmQ4EvH/LapDJxT0ZVTREhJGIgYqv1G/U=</DP><DQ>tYc0tiJMTPnEMN5OK3ER4BlXSlflRhXhE3jvQ1wurhufveME41gbIaK+caGXCdsw360RkhlLqm7wCZx945sMgTH+fJuxxurbK8Uo893z8AACe1Pz+d+sbv6ivZWqQ1/MtQhjN0fTBtRChklOKF108eDtwcdadg85f2f8ubCKdcM=</DQ><InverseQ>XAFEBT0mAKkd7Wrki0DMMPmrm7JYZ8P2hdKXIMGvaxuMevxx4x36EqmK1i5KkJWApEePAmUpz/EX7MlqznwY/m1dfaIG0yHdjlHgSZho3yTqeQdw63mJtxyC+54JaqEPUF/i1L9j78/ydHJHdZzCdhMdhLgrDAhbQkafrUTI5Gk=</InverseQ><D>nUxovHAhpdYCro7775Du4IgMgJLdwFuyAXc+VS4ZM5t65bhPQ3t6lAZ7zjFdXP2GatcZuSzYJCUDbecaoTguHCvtRVlUFN7TiAQcr153UH4yzmuMsGrA5PLAgo/437PU4Z7xeQ7hyIRv+t8AagEEWKeH3BQlODMq6MtFcJzAIwFY9KW2Op/wtOKzbBKAD5el/MJ9WVKr/FOqQ+Bc4eUftsFqDvv5QFDRex02zEkxsmcmSrv2nmDoThu4ouGx/Uy2o6b2IJlVuR3TYDEnvBWfspMQh4LX1DFiiqhBQmnBKEvj8A8cqjZvXfcC9HwsEKEAoXfVT7rwjZOMoNIp/EbbGQ==</D></RSAKeyValue>");

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
