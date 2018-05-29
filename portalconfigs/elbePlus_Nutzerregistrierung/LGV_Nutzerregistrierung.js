/*
* prüft ob die einzelnen Eingabeparameter gültig sind und ruft anschließend send(...) auf
*/
var anrede,vorname,nachname,firma,strasse,hausnr,plz,ort,tel,email,cbDaten,cbFirma;

function checkInputs(){
	this.anrede = $("#AnredeField").val();
	this.vorname = $("#VornameField").val();
	this.nachname = $("#NachnameField").val();
	this.firma = $("#FirmaField").val();
	this.strasse = $("#StraßeField").val();
	this.hausnr = $("#HausnrField").val();
	this.plz = $("#PLZField").val();
	this.ort = $("#OrtField").val();
	this.tel = $("#TelField").val();
	this.email = $("#EmailField").val();
	this.cbDaten = $("#checkboxDaten").prop('checked');
	this.cbFirma = $("#checkboxFirma").prop('checked');

	var readyVorname = check(this.vorname,"#VornameField"),
	readyNachname = check(this.nachname,"#NachnameField"),
	readyFirma = check(this.firma,"#FirmaField"),
	readyStraße = check(this.strasse,"#StraßeField"),
	readyHausnr = check(this.hausnr,"#HausnrField"),
	readyPLZ = check(this.plz,"#PLZField"),
	readyOrt = check(this.ort,"#OrtField"),
	readyTel = check(this.tel,"#TelField"),
	readyMail = check(this.email,"#EmailField"),
	readyCBDaten = check(this.cbDaten,"#checkboxDaten"),
	readyCBFirma = check(this.cbFirma,"#checkboxFirma");

	if(readyVorname === true && readyNachname === true && readyFirma === true && readyStraße === true && readyHausnr === true && readyPLZ === true && readyOrt === true && readyTel === true && readyTel === true && readyMail === true && readyCBDaten === true && readyCBFirma === true){
		// wenn alle Eingaben ok sind
        // wenn keine Firma angegeben wird, wird dem Registrierenden auch keine Firma angezeigt
        if(firma.indexOf("Keine Firma")=== -1) {
		  openCheckDialog(anrede, vorname, nachname,firma, strasse, hausnr, plz, ort, tel, email);
        }
        else {
            openCheckDialog(anrede, vorname, nachname,"", strasse, hausnr, plz, ort, tel, email);
        }
	}
}
/*
* wird für jeden input aufgerufen und prüft seine Gültigkeit
* Rückgabe true oder false
*/
function check(input,id){
	var matches,
        matches2,
	errorMsg,
	ready=false;
	if(id=="#EmailField"){
		matches = input.search("@");
        //matches2 laut wikipedia
        matches2 = input.match(/^[@A-Za-z0-9.!#%&'*+-\/=?^_`{|}~]+$/g);
		if(matches == -1 || input.length<3||!matches2){
			errorMsg = "Bitte geben Sie eine gültige E-mail Adresse ein<br>Folgende Sonderzeichen sind erlaubt: @ . ! # % & ' * + - / = ? ^ _ ' { | } ~";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#VornameField"){
//		matches = input.match(/^\D+$/g);
        matches = input.match(/^[a-zA-ZÄÖÜäöü,;.:\-_#'+~*`ß?}=\])\[({&%§"!°\s]+$/g);
		if(!matches || input.length<2){
			errorMsg = "Bitte geben Sie einen gültigen Vornamen ein<br>- Zahlen sind nicht erlaubt<br>- Folgende Sonderzeichen sind erlaubt: , ; . : \ - _ # ' + ~ * ` ß ? } = ] ) [ ( { & % § ! °";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#NachnameField"){
//		matches = input.match(/^\D+$/g);
         matches = input.match(/^[a-zA-ZÄÖÜäöü,;.:\-_#'+~*`ß?}=\])\[({&%§"!°\s]+$/g);
		if(!matches || input.length<2){
			errorMsg = "Bitte geben Sie einen gültigen Nachnamen ein<br>- Zahlen sind nicht erlaubt<br>- Folgende Sonderzeichen sind erlaubt: , ; . : \ - _ # ' + ~ * ` ß ? } = ] ) [ ( { & % § ! °";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#FirmaField"){
		/*
		if(input.length===0) {
			var datum= new Date();
			this.firma="Keine Firma ("+datum.getTime().toString()+")";
		ready=true;
		alert(ready);
		}
			*/
        //if(input.length>0) {
			
            matches = input.match(/^[0-9a-zA-ZÄÖÜäöü,;.:\-_#'+~*`ß?}=\])\[({&%§"!°\s]+$/g);
			var isBlank = input.match(/^\s*$/g);
            if(!matches || isBlank) {
			errorMsg = "Folgende Sonderzeichen sind erlaubt: , ; . : \ - _ # ' + ~ * ` ß ? } = ] ) [ ( { & % § ! °";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");

			ready=false;
            }
            else {
                $(id + "+ .text-danger").html("");
			    $(id).parent().removeClass("has-error");
                ready=true;
            }
		//}
		/*
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
        }
		*/
	}
	else if(id=="#StraßeField"){
        matches = input.match(/^[0-9a-zA-ZÄÖÜäöü,;.:\-_#'+~*`ß?}=\])\[({&%§"!°\s]+$/g);
		if(!matches ||input.length<2){
			errorMsg = "Bitte geben Sie einen gültigen Straßennamen ein<br>Folgende Sonderzeichen sind erlaubt: , ; . : \ - _ # ' + ~ * ` ß ? } = ] ) [ ( { & % § ! °";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#HausnrField"){
		matches = input.match(/^\d{1,4}[a-zA-Z]{0,1}$/g);
		if(!matches || input.length<1){
			errorMsg = "Bitte geben Sie eine gültige Hausnummer ein";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#PLZField"){
		matches = input.match(/^\d{5}$/g);
		if(!matches || input.length<1){
			errorMsg = "Bitte geben Sie eine gültige PLZ ein";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#OrtField"){
//		matches = input.match(/^\D+$/g);
        matches = input.match(/^[a-zA-ZÄÖÜäöü,;.:\-_#'+~*`ß?}=\])\[({&%§"!°\s]+$/g);
		if(!matches || input.length<2){
			errorMsg = "Bitte geben Sie einen gültigen Ortsnamen ein<br>- Zahlen sind nicht erlaubt<br>- Folgende Sonderzeichen sind erlaubt: , ; . : \ - _ # ' + ~ * ` ß ? } = ] ) [ ( { & % § ! °";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#TelField"){
	//regex von Grenznachweis-Modul verwendet
		matches = input.match(/^[0-9\s]+$/g);
		if(!matches || input.length<1){
			errorMsg = "Es sind nur Zahlen und Leerzeichen erlaubt";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#checkboxDaten"){
		if(input === false){
			errorMsg = "Bitte bestätigen Sie die AGBs";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=="#checkboxFirma"){
		if(input === false){
			errorMsg = "Bitte bestätigen Sie die AGBs";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	return ready;
}
/*
* Sendet den WPS-request
*/
//    function send(anrede,vorname,nachname,firma,strasse,hausnr,plz,ort,tel,email){
function send(){
    $("#checkModal").toggle();
	var anrede=this.anrede,
		vorname=this.vorname,
		nachname=this.nachname,
		firma=this.firma,
		strasse=this.strasse,
		hausnr=this.hausnr,
		plz=this.plz,
		ort=this.ort,
		tel=this.tel,
		email=this.email;
	//Maximale Zeichenanzahl darf 255 nicht überschreiten (Mail von Daniela Ensinger am 01.06.2016)
	if(vorname.length > 255){
		vorname=vorname.substr(0,254);
	}
	if(nachname.length > 255){
		nachname=nachname.substr(0,254);
	}
	if(firma.length > 255){
		firma=firma.substr(0,254);
	}
	if(strasse.length > 255){
		strasse=strasse.substr(0,254);
	}
	if(ort.length > 255){
		ort=ort.substr(0,254);
	}
	if(email.length > 255){
		email=email.substr(0,254);
	}

	var request_parameter = "<wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:ows='http://www.opengis.net/ows/1.1' service='WPS' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd'>";
	request_parameter += "<ows:Identifier>elbeplus_anmeldung.fmw</ows:Identifier>";
	request_parameter += "<wps:DataInputs>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Anrede</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+anrede+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Vorname</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(vorname)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Nachname</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(nachname)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Firma</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(firma)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Strasse</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(strasse)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Hausnummer</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+hausnr+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>PLZ</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+plz+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Ort</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(ort)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Telefon</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+tel+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Email</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(email)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "</wps:DataInputs>";
	request_parameter += "</wps:Execute>";

	var request = new XMLHttpRequest();
	//RZ2 Internet
	var url = "/geodienste_hamburg_de/HH_WPS?Request=Execute&Service=WPS&Version=1.0.0&Identifier=elbeplus_anmeldung.fmw";

	request.open('POST', url, true);
	request.onreadystatechange = function(){
			if(this.readyState == 4){
				if(this.status == 200 && this.responseText.indexOf("Translation Successful")!= -1){
					//erfolgreich
					/*
					console.log("readyState: "+this.readyState);
					console.log("status: "+this.status);
					console.log("responseText: " + this.responseText);
					console.log("responseText: " + this.responseText.indexOf("Translation Successful"));
					console.log("statusText: " + this.statusText);
					*/
					openMessageDialog("Anmeldung erfolgreich","Vielen Dank! Ihre Anmeldung war erfolgreich");
				}
				else{
					//fehlerhaft
					/*
					console.log("readyState: "+this.readyState);
					console.log("status: "+this.status);
					console.log("responseText: " + this.responseText);
					console.log("responseText: " + this.responseText.indexOf("Translation Successful"));
					console.log("statusText: " + this.statusText);
					*/
					openMessageDialog("Fehler bei der Anmeldung","Entschuldigung, Ihre Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es in ein paar Minuten erneut!");
				}
			}
		};
	request.send(request_parameter);
	//alert("Im Produktiven System würden jetzt die Daten gesendet werden.");

	$("#AnredeField").val("Firma");
	$("#VornameField").val("");
	$("#NachnameField").val("");
	$("#FirmaField").val("");
	$("#StraßeField").val("");
	$("#HausnrField").val("");
	$("#PLZField").val("");
	$("#OrtField").val("");
	$("#TelField").val("");
	$("#EmailField").val("");
	$("#checkboxDaten").prop('checked',false);
	$("#checkboxFirma").prop('checked',false);
}
function openCheckDialog(anrede, vorname, nachname,firma, strasse, hausnr, plz, ort, tel, email) {
    text="<table class='table table-striped'>";
    text+="<tr><th>Anrede</th><td>" + anrede + "</td></tr>";
    text+="<tr><th>Vorname</th><td>" + vorname + "</td></tr>";
    text+="<tr><th>Nachname</th><td>" + nachname + "</td></tr>";
    text+="<tr><th>Firma</th><td>" + firma + "</td></tr>";
    text+="<tr><th>Straße</th><td>" + strasse + "</td></tr>";
    text+="<tr><th>Hausnummer</th><td>" + hausnr + "</td></tr>";
    text+="<tr><th>Postleitzahl</th><td>" + plz + "</td></tr>";
    text+="<tr><th>Ort</th><td>" + ort + "</td></tr>";
    text+="<tr><th>Telefon</th><td>" + tel + "</td></tr>";
    text+="<tr><th>Email</th><td>" + email + "</td></tr>";
    text+="</table>";

    $("#checkModalHeader").html("Bitte überprüfen Sie Ihre Datenangaben");
    $("#checkModalText").html("");
    $("#checkModalText").append(text);
    $("#checkModal").modal({backdrop: "static"});
}

function openMessageDialog(header,text) {
    $("#confirmModalHeader").html(header);
    $("#confirmModalText").html(text);
    $("#confirmModal").modal({backdrop: "static"});
}
