<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=utf-8");

	# Erzeugt Variable $pg_table und Funktion write2DB
	include "loggerdb.php";
        
    $attr = $_POST["attr"];
    $value = $_POST["value"];
    $orderid = $_POST["orderid"];

    $query = "UPDATE ".$pg_table." ";
    $query .= "SET ".$attr." = '".$value."' ";
    $query .= "WHERE orderid = '".$orderid."' RETURNING *;";
	
	$json = write2DB($query);
    
    echo $json;
?>