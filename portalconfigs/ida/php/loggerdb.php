<?php
    $pg_table = "ida_orders";

    function write2DB ($query) {
        /*Default Rz² QS*/
        $server = $_SERVER['HTTP_HOST'];
        $pg_host = "qsausk2.dpaorins.de";
        $pg_port = "5433";
        $pg_db = "ida";
        $pg_user = "ida";
        $pg_pw = "ida_2017";

        /*checkt die Umgebung des Server anhand der domain und passt host und port an*/
        /*Azure QS */
        if(strpos($server, "test.geoportal-hamburg.de")!== false){
            $pg_host = "localhost";
            $pg_port = "5432";
        }
        /*Azure PROD*/
        elseif(strpos($server, "geoportal-hamburg.de")!== false){
            $pg_host = "localhost";
            $pg_port = "5432";
        }
        /*RZ² PROD*/
        elseif(strpos($server, "geofos")!== false){
            $pg_host = "prodfortf2.dpaorinp.de";
            $pg_port = "5433";
        }

        /*baut eine Verbindung zur DB auf und schreibt eine neue Zeile mit den übergebenen Parametern*/
        $con = pg_connect("dbname=".$pg_db." host=".$pg_host." password=".$pg_pw." user=".$pg_user." port=".$pg_port);

        if (!$con){
            throw new Exception("Die Datenbankverbindung konnte nicht hergestellt werden. Abbruch!");
        }
        // Prüfe DB Status busy
        $busy = pg_connection_status($con);
        if ($busy != PGSQL_CONNECTION_OK){
            throw new Exception("Die Datenbankverbindung ist ausgelastet. Abbruch!");
        }

        pg_send_query($con, $query);
        $result = pg_get_result($con);

        if (!$result) {
            throw new Exception("Interner Fehler aufgetreten, weil result = null. Abbruch!");
        }
        $resultError = pg_result_error($result);
        if (!$resultError){
            if (pg_num_rows($result) > 0) {
                $fetchedRow = pg_fetch_array($result, 0, PGSQL_ASSOC);
            }
            else {
                $fetchedRow = NULL;
            }
            $json = json_encode(array("result" => $fetchedRow));
        }
        else {
            throw new Exception("Fehler aufgetreten " . $resultError);
        }

        pg_close($con);
        return $json;
    }
?>
