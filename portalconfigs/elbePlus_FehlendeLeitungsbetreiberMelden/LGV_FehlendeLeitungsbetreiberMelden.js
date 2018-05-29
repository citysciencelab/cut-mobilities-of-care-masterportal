/*
* prüft ob die einzelnen Eingabeparameter gültig sind und ruft anschließend send(...) auf
*/
function checkInputs(){
		var firma = $("#FirmaField").val(),
        webseite = $("#WebseiteField").val(),
        ansprechpartner = $("#AnsprechpartnerField").val(),
        emailBetreiber = $("#EmailBetreiberField").val(),
        emailMelder = $("#EmailMelderField").val(),
            
		readyFirma = check(firma,"#FirmaField"),
        readyWebseite = check(webseite,"#WebseiteField"),
        readyAnsprechpartner = check(ansprechpartner,"#AnsprechpartnerField"),    
        readyEmailBetreiber = check(emailBetreiber,"#EmailBetreiberField"), 
        readyEmailMelder = check(emailMelder,"#EmailMelderField");
        
        if (webseite === ""){
            webseite = "keine Angabe";
        }
        if (ansprechpartner === ""){
            ansprechpartner = "keine Angabe";
        }
        if (emailBetreiber === ""){
            emailBetreiber = "keine Angabe";
        }
    
		if(readyFirma === true && readyWebseite === true && readyAnsprechpartner === true && readyEmailBetreiber === true && readyEmailMelder === true){
			//wenn alle Eingaben ok sind
            send(firma,webseite,ansprechpartner,emailBetreiber,emailMelder);
        }
	}
    /*
    * wird für jeden input aufgerufen und prüft seine Gültigkeit
    * Rückgabe true oder false
    */
	function check(input,id){
		var matches,
        errorMsg,
		ready=false;
        
		
        if(id=="#FirmaField"){
			if(input.length<2){
				errorMsg = "Es werden mind. 2 Buchstaben erwartet";
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
        else if(id=="#WebseiteField"){
			matches = input.match(/(https:|http:|www)/g);
			if(!matches && input.length>0){
				errorMsg = "Es wird am Anfang 'www.', 'http://', 'https://' oder ein leeres Feld erwartet";
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
        else if(id=="#AnsprechpartnerField"){
			matches = input.match(/^\D+$/g);
			if(!matches && input.length>0){
				errorMsg = "Es dürfen keine Ziffern angegeben werden";
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
        else if(id=="#EmailBetreiberField"){
			matches = input.search("@");
			if(matches == -1 && input.length>0){
				errorMsg = "Bitte geben Sie eine gültige E-mail Adresse ein oder lassen das Feld leer";
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
        else if(id=="#EmailMelderField"){
			matches = input.search("@");
			if(matches == -1 || input.length<3){
				errorMsg = "Bitte geben Sie eine gültige E-mail Adresse ein";
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


    function send(firma,webseite,ansprechpartner,emailBetreiber,emailMelder){
		//Maximale Zeichenanzahl darf 255 nicht überschreiten (Mail von Daniela Ensinger am 01.06.2016)
		if(firma.length > 255){
			firma=firma.substr(0,254);
		}
		if(webseite.length > 255){
			webseite=webseite.substr(0,254);
		}
		if(ansprechpartner.length > 255){
			ansprechpartner=ansprechpartner.substr(0,254);
		}
		if(emailBetreiber.length > 255){
			emailBetreiber=emailBetreiber.substr(0,254);
		}
		if(emailMelder.length > 255){
			emailMelder=emailMelder.substr(0,254);
		}
		
		var request_parameter = "<wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:ows='http://www.opengis.net/ows/1.1' service='WPS' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd'>";
		request_parameter += "<ows:Identifier>elbeplus_Leitungsbetreiber.fmw</ows:Identifier>";
		request_parameter += "<wps:DataInputs>";
		
		request_parameter += "<wps:Input>";
		request_parameter += "<ows:Identifier>Firma</ows:Identifier>";
		request_parameter += "<wps:Data>";
		request_parameter += "<wps:LiteralData dataType='string'>"+firma+"</wps:LiteralData>";
		request_parameter += "</wps:Data>";
		request_parameter += "</wps:Input>";
		
		request_parameter += "<wps:Input>";
		request_parameter += "<ows:Identifier>Webseite</ows:Identifier>";
		request_parameter += "<wps:Data>";
		request_parameter += "<wps:LiteralData dataType='string'>"+webseite+"</wps:LiteralData>";
		request_parameter += "</wps:Data>";
		request_parameter += "</wps:Input>";
		
		request_parameter += "<wps:Input>";
		request_parameter += "<ows:Identifier>Ansprechpartner</ows:Identifier>";
		request_parameter += "<wps:Data>";
		request_parameter += "<wps:LiteralData dataType='string'>"+ansprechpartner+"</wps:LiteralData>";
		request_parameter += "</wps:Data>";
		request_parameter += "</wps:Input>";
		
		request_parameter += "<wps:Input>";
		request_parameter += "<ows:Identifier>EmailBetreiber</ows:Identifier>";
		request_parameter += "<wps:Data>";
		request_parameter += "<wps:LiteralData dataType='string'>"+emailBetreiber+"</wps:LiteralData>";
		request_parameter += "</wps:Data>";
		request_parameter += "</wps:Input>";
		
		request_parameter += "<wps:Input>";
		request_parameter += "<ows:Identifier>EmailMelder</ows:Identifier>";
		request_parameter += "<wps:Data>";
		request_parameter += "<wps:LiteralData dataType='string'>"+emailMelder+"</wps:LiteralData>";
		request_parameter += "</wps:Data>";
		request_parameter += "</wps:Input>";

		request_parameter += "</wps:DataInputs>";
		request_parameter += "</wps:Execute>";
		
		var request = new XMLHttpRequest();
//RZ2 Internet
		var url = "/geodienste_hamburg_de/HH_WPS?Request=Execute&Service=WPS&Version=1.0.0&Identifier=elbeplus_Leitungsbetreiber.fmw";		  
		  
		request.open('POST', url, true);
		request.onreadystatechange = function(){
				if(this.readyState == 4){
					if(this.status == 200){
						//erfolgreich
						//console.log("Erfolgreich: " + this.responseText);
                        openDialog("Meldung erfolgreich","Ihre Meldung des Leitungsbetreibers war erfolgreich!");
					}
					else{
						//fehlerhaft
						//console.log("Fehlerhaft: " + this.statusText);
                        openDialog("Meldung fehlgeschlagen","Entschuldigung, Ihre Meldung ist fehlgeschlagen. Bitte versuchen Sie es in ein paar Minuten erneut!");
					}
				}
			};
		request.send(request_parameter);
        $("#FirmaField").val("");
        $("#WebseiteField").val("");
        $("#AnsprechpartnerField").val("");
        $("#EmailBetreiberField").val("");
        $("#EmailMelderField").val("");
	   }
function openDialog(header,text) {
    $("#confirmModalHeader").html(header);
    $("#confirmModalText").html(text);
    $("#confirmModal").modal({backdrop: "static"});
    $("#confirmModal").modal()
}