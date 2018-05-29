<?php
	header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=utf-8");
	
	# Erzeugt Variable $pg_table und Funktion write2DB
	include "loggerdb.php";
    
    $orderid = $_POST["orderid"];
    $date = $_POST["date"];
    $time = $_POST["time"];
    $produkt = $_POST["produkt"];
    $jahr = $_POST["jahr"];
    $nutzung = $_POST["nutzung"];
    $lage = $_POST["lage"];
    $gebuehr = $_POST["gebuehr"];
    $status = $_POST["status"];

    $query = "INSERT INTO ".$pg_table." ";
    $query .= "VALUES('".$orderid."','".$date."','".$time."','".$produkt."','".$jahr."','".$nutzung."','".$lage."','".$gebuehr."','".$status."') RETURNING *;";
	
	$json = write2DB($query);
    
    echo $json;
?>
