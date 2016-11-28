<?php
	# Voraussetzungen:
	# 1. extension=php_ldap.dll in php.ini einkommentieren
	# 2. Die Datei libsasl.dll aus dem PHP-Verzeichnis in den Ordner Apache/bin kopieren und Apache neu starten
	# 3. Für Apache das Modul mit .Exe von https://www.apachehaus.net/modules/mod_authnz_sspi/ laden und installieren nach Dokumentation
	# 4. In Apache den SSPI-Code für den Anwendungsordner deklarieren (siehe Beispiel für den Ordner ldap_test in der httpd.conf)

	//phpinfo();

	// falls in der einbindenden PHP-Datei die Variable BASE_DN_GLOBAL gesetzt ist, wird sie hier übernommen, sonst der Default-Wert (require kann keine Parameter übergeben bekommen), 16.10.14, CB
	// es können mehrere Such-Bereiche nacheinander in dem Array angegeben werden, die in der vorgegebenen Reihenfolge durchsucht werden.
	// Z.B. $BASE_DN_GLOBAL = array('OU=LGV,OU=Users,OU=KundenFHH,OU=Dataport,DC=fhhnet,DC=stadt,DC=hamburg,DC=de', 'OU=Users,OU=Polizei,DC=fhhnet,DC=stadt,DC=hamburg,DC=de');
	if(!isset($BASE_DN_GLOBAL) || !is_array($BASE_DN_GLOBAL)){
		$BASE_DN_GLOBAL = array('OU=Users,OU=KundenFHH,OU=Dataport,DC=fhhnet,DC=stadt,DC=hamburg,DC=de');
	}

	function connect_ldap($base_dn) {
		global $data, $domain, $user, $dn, $con;
		$username  = '';     // ldap rdn oder dn
		$password = '';  // entsprechendes password
		$server = 'fhhnet.stadt.hamburg.de';
		$username = $username.'@'.$server;
		$password = $password;
		$sasl_realm = 'ldap://fhhnet.stadt.hamburg.de';
		$sasl_authc_id = '';
		$sasl_authz_id = 'dn:uid='.$username.', ou=GV, dc=fhhnet, dc=stadt, dc=hamburg, dc=de';

		// Eine der beiden Arrayformen muss ausgewählt werden. Eine Einschränkung erhält weniger Informationen, dafür schneller
		$attributes = array( 0 => "dn",
		       1 => "mail",
		       2 => "cn",
		       3 => "displayname",
		       4 => "givenname",
		       5 => "sn",
		       6 => "samaccountname",
		       7 => "company",
		       8 => "memberof",
		       9 => "dn"
		      );
		//$attributes = array();

		//base_dn - LGV
		//$base_dn = 'OU=LGV,OU=Users,OU=KundenFHH,OU=Dataport,DC=fhhnet,DC=stadt,DC=hamburg,DC=de';
		//base_dn - FHH
		//$base_dn = 'OU=Users,OU=KundenFHH,OU=Dataport,DC=fhhnet,DC=stadt,DC=hamburg,DC=de';
		//$group_dn = 'OU=Verteilerlisten,OU=Exchangeverwaltung,OU=Gruppen,OU=GV,DC=fhhnet,DC=stadt,DC=hamburg,DC=de';

		// Windows-User über SSPI holen
		if (array_key_exists('REMOTE_USER', $_SERVER) == FALSE) {
			throw new Exception ("Kein Remote-User gemeldet. Ist SSPIAuth on?");
		}
		$cred = explode('\\',$_SERVER['REMOTE_USER']);
		if (count($cred) == 1) array_unshift($cred, "(no domain info - perhaps SSPIOmitDomain is On)");
		list($domain, $user) = $cred;

		// Filter sezten für den user
		// Wildcard hinter dem User-Namen entfernt 07.11.2014, Christa Becker
		//$filter = "(&(objectClass=user)(sAMAccountName=$user*))";
		$filter = "(&(objectClass=user)(sAMAccountName=$user))";

		// Verbinden zum ldap server
		$con = ldap_connect($server);
		if (!$con) {
			throw new Exception ("Keine Verbindung zum LDAP-Server möglich.");
		};
		ldap_set_option($con, LDAP_OPT_PROTOCOL_VERSION, 3);
		$bind = ldap_bind($con, $username, $password);
		if (!$bind) {
			throw new Exception ("LDAP bind fehlgeschlagen");
		};

		// Search active directory
		$result = @ldap_search($con, $base_dn, $filter, $attributes, 0, 0, 0, LDAP_DEREF_NEVER);
		if ($result === false) {
			throw new Exception ("Error in search query: ".ldap_error($con));
		}
		$data = ldap_get_entries($con, $result);
		if ($data["count"] == null) {
			throw new Exception ("Es wurden keine Eintraege im LDAP fuer User " .$user. " in Domain " .$domain. " unter " .$base_dn. " gefunden.");
		}
		elseif ($data["count"] != 1) {
			throw new Exception ("Es wurden " .$data["count"]. " Eintraege im LDAP fuer User " .$user. " in Domain " .$domain. " unter " .$base_dn. " gefunden.");
		}
		else {
			$dn = $data[0]["dn"];
		};

		// LOG ALL DATA
		/*$handle = fopen("i:\\Programme\\Apache24\\htdocs\\libs\\php\\" . $user. ".txt", "w");
		fwrite ($handle, "Alle Informationen zum Nutzer:" . $_SERVER['REMOTE_USER'] . " : ");
		$stringdata = print_r($data, true);
		fwrite ($handle, $stringdata);
		fclose ($handle);*/

		// SHOW ALL DATA
		/*echo '<h1>Alle Informationen zum Nutzer:</h1><pre>';
		print_r($data);
		echo '</pre>';
		echo "<br /><br />Verbindung schliessen";*/
	};

	function evaluateuser() {
		//$base_dn = 'OU=Users,OU=KundenFHH,OU=Dataport,DC=fhhnet,DC=stadt,DC=hamburg,DC=de'
		//$base_dn = 'OU=Users,OU=Polizei,DC=fhhnet,DC=stadt,DC=hamburg,DC=de';

		$base_dn = "";

		// es wird das BASE_DN_GLOBAL-Array durchlaufen und versucht, mit dem LDAP eine Verbindung herzustellen. Falls keine Einträge für eine base-dn gefunden werden, wird die nächste versucht.
		// Tritt ein anderer Fehler auf, wird abgebrochen und eine Exception geworfen mit der Fehlermeldung aus der Funktion "connect_ldap", 16.10.14, CB
		for($b=0;$b<count($GLOBALS["BASE_DN_GLOBAL"]);$b++){
			$base_dn = $GLOBALS["BASE_DN_GLOBAL"][$b];
			try{
				connect_ldap($base_dn);
				break;
			}
			catch(exception $ex){
				$message = $ex->getMessage();
				if(strncmp($message, "Es wurden keine Eintraege im LDAP fuer User", 43) == 0 && $b<count($GLOBALS["BASE_DN_GLOBAL"])-1){
					//echo "<br>Base-DN in evaluateuser:".$base_dn."<br>";
				}
				else{
					throw new Exception($message);
				}
			}
		}
		global $con,$data, $email, $displayname, $companystring, $memberOfArray, $memberOfString, $firstname, $lastname, $shortname;
		//Wir gehen davon aus, dass jeder Nutzer in der FHH eine eindeutige Kennung hat!
		$displayname = $data[0]["displayname"][0];
		$firstname = $data[0]["givenname"][0];
		$lastname = $data[0]["sn"][0];
		$shortname = $data[0]["samaccountname"][0];
		$companyArray = array();
		for ($j=0; $j<$data[0]["company"]["count"]; $j++)
		{
			$companyArray[$j] = $data[0]["company"][$j];
		}
		$companystring = implode('/', $companyArray);
		$email = $data[0]["mail"][0];
		$groupArray = array();
		for ($l=0; $l<$data[0]["memberof"]["count"]; $l++)
		{
				//$groupParts = explode(",", $data[0]["memberof"][$l]);
				//echo $groupParts[0];
				$memberOfArray[$l] = $data[0]["memberof"][$l];
		}
		$memberOfString = implode('/', $memberOfArray);
		//Return User, Companies and Groups in JSON-Format
		//$my_data = array('user'=>$displayname, 'company'=>$companyArray); //, 'groups'=>$groupArray);
		//echo json_encode($my_data);
	};

	/*function ismemberofgroupalt($groupname, $base_dn = 'OU=Users,OU=KundenFHH,OU=Dataport,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') {
		connect_ldap($base_dn);
		global $data;
		$groupArray = array();
		for ($l=0; $l<$data[0]["memberof"]["count"]; $l++)
		{
				$groupParts = explode(",", $data[0]["memberof"][$l]);
				if ($groupParts[0] == "CN=" .$groupname) {
					return True;
				};
		}

		// VERBINDUNG SCHLIESSEN
		ldap_close($con);

		return False;
	};*/

	function ismemberofgroup($groupToFind) {
		$base_dn = "";

		// es wird das BASE_DN_GLOBAL-Array durchlaufen und versucht, mit dem LDAP eine Verbindung herzustellen. Falls keine Einträge für eine base-dn gefunden werden, wird die nächste versucht.
		// Tritt ein anderer Fehler auf, wird abgebrochen und eine Exception geworfen mit der Fehlermeldung aus der Funktion "connect_ldap", 16.10.14, CB
		for($b=0;$b<count($GLOBALS["BASE_DN_GLOBAL"]);$b++){
			$base_dn = $GLOBALS["BASE_DN_GLOBAL"][$b];
			try{
				connect_ldap($base_dn);
				break;
			}
			catch(exception $ex){
				$message = $ex->getMessage();
				if(strncmp($message, "Es wurden keine Eintraege im LDAP fuer User", 43) == 0 && $b<count($GLOBALS["BASE_DN_GLOBAL"])-1){
					//echo "<br>Base-DN in ismemberofgroup:".$base_dn."<br>";
				}
				else{
					throw new Exception($message);
				}
			}
		}
		global $dn, $con;
    $filter = "(memberof:1.2.840.113556.1.4.1941:=".$groupToFind.")";
    $search = ldap_search($con, $dn, $filter, array("memberof"), 1);
    $items = ldap_get_entries($con, $search);

    // VERBINDUNG SCHLIESSEN
		ldap_close($con);

    if(!isset($items["count"])) {
        return false;
    }
    return (bool)$items["count"];
	}
?>
