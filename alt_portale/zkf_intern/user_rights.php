<?php
/**
 * user_rights.php
 *
 * User-Rights-Managemet
 *
 * @author     Christa Becker
 * @copyright  2014 Landesbetrieb Geoinformation und Vermessung
 * @version    1.0
 * @see        http://wscd0096/atlas_innere_sicherheit/
 * @since      17.07.2014
 * @deprecated -
 */

	/**
	 * Dieses Skript stellt eine Verbindung zur activedirectory.php her, die den Abgleich mit dem AD herstellt.
	 * Dort werden diverse Variablen aus dem AD ausgelesen und im PHP gesetzt. Hier erfolgt nun eine Auswertung
	 * dieser Variablen und eine Feststellung, welcher Nutzergruppe mit welchen Rechten der User zugeordnet ist.
	 * Die Benennung der Nutzergruppe muss identisch mit dem Federführer des Verfahrens sein, um Schreibrechte
	 * zu erhalten.
	 */


	require ('activedirectory.php');

	evaluateuser();

	if (ismemberofgroup('CN=U-LGV-Fluechtlingsportal,OU=Gruppen,OU=GV,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){
	//if (ismemberofgroup('CN=Fluechtlinge,OU=Gruppen,OU=GV,DC=fhhnet,DC=stadt,DC=hamburg,DC=de') == TRUE){

	}
	else {
			throw new Exception ('Sie besitzen keine Berechtigungen für diese Anwendung. Bitte wenden Sie sich an Ihren Administrator.');

	}
