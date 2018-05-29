<?php
	header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=utf-8");
	
	# Erzeugt Variable $pg_table und Funktion write2DB
	include "loggerdb.php";
    
    $attr = $_POST["attr"];
    $orderid = $_POST["orderid"];

    $query = "SELECT ".$attr." FROM ".$pg_table." WHERE orderid='".$orderid."';";
	
	$json = write2DB($query);
    
    echo $json;
?>