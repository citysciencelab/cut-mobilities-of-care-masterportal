<?php
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json; charset=utf-8');
    $server = $_SERVER['HTTP_HOST'];
	$pdfpath = $_POST['url'];
	$developURL = json_encode(array('url' => 'http://' . $server . '/portale/ida?filepath=' . $pdfpath));
    $intranetURL = json_encode(array('url' => 'https://' . $server . '/portale/ida?filepath=' . $pdfpath));
	$internetURL = json_encode(array('url' => 'https://' . $server . '/ida?filepath=' . $pdfpath));
	if ($server == 'localhost:9001') {
		echo $developURL;
	}
	elseif ($server == "wfalgqw001" || $server == "geofos.fhhnet.stadt.hamburg.de") {
		echo $intranetURL;
	}
	else {
		echo $internetURL;
	}
?>
