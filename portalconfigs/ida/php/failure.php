<?php
	# Erzeugt Variable $environment
	include "checkEnvironment.php";
	# Erzeugt Variable $pg_table und Funktion write2DB
	include "loggerdb.php";

	# Lese Parameter aus
	$transId = $_POST["TRANSACTIONID"] ? $_POST["TRANSACTIONID"] : "unset";
	$orderId = $_GET["ORDERID"] ? $_GET["ORDERID"] : "";

	# Prüfe Eingabedaten
	if ($orderid === "") {
		error_log("failure.php is missing ORDERID. Aborting!");
		exit();
	}

	# Logge TRANSACTIONID
	$query = "UPDATE " . $pg_table . " SET transactionid = '" . $transId . "' WHERE orderid = '" . $orderId . "' RETURNING *;";
	write2DB($query);

	# Logge Status
	$query = "UPDATE " . $pg_table . " SET status = 'failure' WHERE orderid = '" . $orderId . "' RETURNING *;";
	write2DB($query);

	# Erzeuge returnURL für redirect
	$returnURL = $portalURL . "?STATUS=FAILURE&ORDERID=" . $orderId;
	header("HTTP/1.1 301 Moved Permanently");
	header("Location: " . $returnURL);
	exit();
?>
