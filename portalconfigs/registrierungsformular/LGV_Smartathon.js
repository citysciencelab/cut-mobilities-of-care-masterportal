/*
* prüft ob die einzelnen Eingabeparameter gültig sind und ruft anschließend send(...) auf
*/
var countErwartungen=0;

var vorname,nachname,geschlecht,alter,beruf,firma,cbAgendaSetter,cbSolutionMachine,cbDataExpert,cbProcedureShark,cdFinanceGuru,cbEinblick,cbOpenData,cbIdeen,cbNetzwerk,cbAnderes,anderesField,cbGruppenleiter,cbInformation,cbFotoVideo,email;

function setTestData(){
	$('#vornameField').val("Jonas");
	$('#nachnameField').val("Weiter");
	$('#geschlechtField').val("männlich");
	$('#alterField').val("27");
	$('#berufField').val("IT");
	$('#firmaField').val("LGV");
	
	$('#checkboxAgendaSetter').prop("checked",false);
	$('#checkboxSolutionMachine').prop("checked",false);
	$('#checkboxDataExpert').prop("checked",false);
	$('#checkboxProcedureShark').prop("checked",true);
	$('#checkboxFinanceGuru').prop("checked",true);
	
	$('#checkboxEinblick').prop("checked",false);
	$('#checkboxOpenData').prop("checked",false);
	$('#checkboxIdeen').prop("checked",false);
	$('#checkboxNetzwerk').prop("checked",true);
	$('#checkboxAnderes').prop("checked",false);
	
	$('#checkboxGruppenleiter').prop("checked",true);
	
	$('#checkboxInformation').prop("checked",true);
	$('#checkboxFotoVideo').prop("checked",true);

	$('#emailField').val("jonas.weiter@gv.hamburg.de");
}




function checkBoxAnderes(){
	if($('#checkboxAnderes').prop("checked")){
		$('#checkboxAnderes').after('<input type="text" class="form-control" id="anderesField"  placeholder="Anderes">');
	}
	else {
		$('#anderesField').remove();
		
	}
}

function checkEigenschaften(agendaSetter,solutionMachine,dataExpert,procedureShark,financeGuru){
	var ready= false;
	var countEigenschaften=0;
	if (agendaSetter==true){
		countEigenschaften++;
	}
	if (solutionMachine==true){
		countEigenschaften++;
	}
	if (dataExpert==true){
		countEigenschaften++;
	}
	if (procedureShark==true){
		countEigenschaften++;
	}
	if (financeGuru==true){
		countEigenschaften++;
	}
	if (countEigenschaften>2 || countEigenschaften<1){
		errorMsg = "Mind. 1, Max. 2 Eigenschaften müssen ausgewählt werden";
		$("#checkboxAgendaSetter" + "+ .text-danger").html("");
		$("#checkboxAgendaSetter").after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
		$("#checkboxAgendaSetter").parent().addClass("has-error");
		
		errorMsg = "Mind. 1, Max. 2 Eigenschaften müssen ausgewählt werden";
		$("#checkboxSolutionMachine" + "+ .text-danger").html("");
		$("#checkboxSolutionMachine").after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
		$("#checkboxSolutionMachine").parent().addClass("has-error");
		
		errorMsg = "Mind. 1, Max. 2 Eigenschaften müssen ausgewählt werden";
		$("#checkboxDataExpert" + "+ .text-danger").html("");
		$("#checkboxDataExpert").after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
		$("#checkboxDataExpert").parent().addClass("has-error");
		
		errorMsg = "Mind. 1, Max. 2 Eigenschaften müssen ausgewählt werden";
		$("#checkboxProcedureShark" + "+ .text-danger").html("");
		$("#checkboxProcedureShark").after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
		$("#checkboxProcedureShark").parent().addClass("has-error");
		
		errorMsg = "Mind. 1, Max. 2 Eigenschaften müssen ausgewählt werden";
		$("#checkboxFinanceGuru" + "+ .text-danger").html("");
		$("#checkboxFinanceGuru").after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
		$("#checkboxFinanceGuru").parent().addClass("has-error");
		ready=false;
	}
	else{
		$("#checkboxAgendaSetter" + "+ .text-danger").html("");
		$("#checkboxAgendaSetter").parent().removeClass("has-error");
		
		$("#checkboxSolutionMachine" + "+ .text-danger").html("");
		$("#checkboxSolutionMachine").parent().removeClass("has-error");
		
		$("#checkboxDataExpert" + "+ .text-danger").html("");
		$("#checkboxDataExpert").parent().removeClass("has-error");
		
		$("#checkboxProcedureShark" + "+ .text-danger").html("");
		$("#checkboxProcedureShark").parent().removeClass("has-error");
		
		$("#checkboxFinanceGuru" + "+ .text-danger").html("");
		$("#checkboxFinanceGuru").parent().removeClass("has-error");
		ready=true;
	}
	
	return ready;
}

function checkInputs(){
	this.vorname = $('#vornameField').val();
	this.nachname = $('#nachnameField').val();
	this.geschlecht = $('#geschlechtField').val();
	this.alter = $('#alterField').val();
	this.beruf = $('#berufField').val();
	this.firma = $('#firmaField').val();
	this.cbAgendaSetter = $("#checkboxAgendaSetter").prop('checked');
	this.cbSolutionMachine = $("#checkboxSolutionMachine").prop('checked');
	this.cbDataExpert = $("#checkboxDataExpert").prop('checked');
	this.cbProcedureShark = $("#checkboxProcedureShark").prop('checked');
	this.cbFinanceGuru = $("#checkboxFinanceGuru").prop('checked');
	this.cbEinblick = $("#checkboxEinblick").prop('checked');
	this.cbOpenData = $("#checkboxOpenData").prop('checked');
	this.cbIdeen = $("#checkboxIdeen").prop('checked');
	this.cbNetzwerk = $("#checkboxNetzwerk").prop('checked');
	this.cbAnderes = $("#checkboxAnderes").prop('checked');
	this.anderesField = $('#anderesField').val();
	this.cbGruppenleiter = $("#checkboxGruppenleiter").prop('checked');
	this.cbInformation = $("#checkboxInformation").prop('checked');
	this.cbFotoVideo = $("#checkboxFotoVideo").prop('checked');
	this.email = $('#emailField').val();
	
	
	var readyVorname = check(this.vorname,"#vornameField");
	var readyNachname = check(this.nachname,"#nachnameField");
	var readyAlter = check(this.alter,"#alterField");
	var readyBeruf = check(this.beruf,"#berufField");
	var readyEmail = check(this.email,"#emailField");
	var readyCBInformation = check(this.cbInformation,"#checkboxInformation");
	var readyCBFotoVideo = check(this.cbFotoVideo,"#checkboxFotoVideo");
	var readyCBEigenschaften=checkEigenschaften(this.cbAgendaSetter,this.cbSolutionMachine,this.cbDataExpert,this.cbProcedureShark,this.cbFinanceGuru);
	
	if(readyVorname==true && readyNachname==true && readyAlter==true && readyBeruf==true && readyEmail==true && readyCBInformation ==true && readyCBFotoVideo==true && readyCBEigenschaften==true){
		// wenn alle Eingaben ok sind
		openCheckDialog(vorname,nachname,geschlecht,alter,beruf,firma,cbAgendaSetter,cbSolutionMachine,cbDataExpert,cbProcedureShark,cbFinanceGuru,cbEinblick,cbOpenData,cbIdeen,cbNetzwerk,cbAnderes,anderesField, cbGruppenleiter,cbInformation,cbFotoVideo);
	}
}

function check(input,id){
	var matches,
	matches2,
	errorMsg,
	ready=false;
	
	if(id=='#vornameField'){
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
	else if(id=='#nachnameField'){
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
	else if(id=='#alterField'){
		if(isNaN(input)==true || input>100 || input<18 || parseInt(input)==undefined){
			
			errorMsg = "Bitte geben Sie ein gültiges Alter (18-100) ein";
			$(id + "+ .text-danger").html("");
			$(id).after("<span class='text-danger'><small>" + errorMsg + "</small></span>");
			$(id).parent().addClass("has-error");
			ready=false;
		}
		else{
			$(id).val(Math.round(input));
			this.alter=Math.round(input);
			$(id + "+ .text-danger").html("");
			$(id).parent().removeClass("has-error");
			ready=true;
		}
	}
	else if(id=='#berufField'){
		matches = input.match(/^[a-zA-ZÄÖÜäöü,;.:\-_#'+~*`ß?}=\])\[({&%§"!°\s]+$/g);
		if(!matches || input.length<2){
			errorMsg = "Bitte geben Sie einen gültigen Beruf ein<br>- Zahlen sind nicht erlaubt<br>- Folgende Sonderzeichen sind erlaubt: , ; . : \ - _ # ' + ~ * ` ß ? } = ] ) [ ( { & % § ! °";
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
	else if(id=="#emailField"){
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
	
	else if(id=="#checkboxInformation"){
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
	else if(id=="#checkboxFotoVideo"){
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

function send(){
    $("#checkModal").toggle();

	var request_parameter = "<wps:Execute xmlns:wps='http://www.opengis.net/wps/1.0.0' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:ows='http://www.opengis.net/ows/1.1' service='WPS' version='1.0.0' xsi:schemaLocation='http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd'>";
	request_parameter += "<ows:Identifier>smartathon_registrierung.fmw</ows:Identifier>";
	request_parameter += "<wps:DataInputs>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Vorname</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(this.vorname)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Nachname</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(this.nachname)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Geschlecht</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(this.geschlecht)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Alter</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.alter+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Beruf</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(this.beruf)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";

	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Firma</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(this.firma)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>AgendaSetter</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbAgendaSetter+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>SolutionMachine</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbSolutionMachine+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>DataExpert</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbDataExpert+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>ProcedureShark</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbProcedureShark+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>FinanceGuru</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbFinanceGuru+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Einblick</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbEinblick+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>OpenData</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbOpenData+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Ideen</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbIdeen+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Netzwerk</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbNetzwerk+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Anderes</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbAnderes+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>AnderesFeld</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(this.anderesField)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Gruppenleiter</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbGruppenleiter+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>AGBInformation</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbInformation+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>AGBFotoVideo</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+this.cbFotoVideo+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "<wps:Input>";
	request_parameter += "<ows:Identifier>Email</ows:Identifier>";
	request_parameter += "<wps:Data>";
	request_parameter += "<wps:LiteralData dataType='string'>"+encodeURIComponent(this.email)+"</wps:LiteralData>";
	request_parameter += "</wps:Data>";
	request_parameter += "</wps:Input>";
	
	request_parameter += "</wps:DataInputs>";
	request_parameter += "</wps:Execute>";

	
	//console.log(request_parameter);
	var request = new XMLHttpRequest();
	//RZ2 Internet
	var url = "/geodienste_hamburg_de/HH_WPS?Request=Execute&Service=WPS&Version=1.0.0&Identifier=smartathon_registrierung.fmw";

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

	$("#vornameField").val("");
	$("#nachnameField").val("");
	$("#geschlechtField").val("weiblich");
	$("#alterField").val("");
	$("#berufField").val("");
	$("#firmaField").val("");
	$("#checkboxAgendaSetter").prop('checked',false);
	$("#checkboxSolutionMachine").prop('checked',false);
	$("#checkboxDataExpert").prop('checked',false);
	$("#checkboxProcedureShark").prop('checked',false);
	$("#checkboxFinanceGuru").prop('checked',false);
	$("#checkboxEinblick").prop('checked',false);
	$("#checkboxOpenData").prop('checked',false);
	$("#checkboxIdeen").prop('checked',false);
	$("#checkboxNetzwerk").prop('checked',false);
	$("#checkboxAnderes").prop('checked',false);
	$("#checkboxGruppenleiter").prop('checked',false);
	$("#checkboxInformation").prop('checked',false);
	$("#checkboxFotoVideo").prop('checked',false);
	$("#emailField").val("");
}
function openCheckDialog(vorname,nachname,geschlecht,alter,beruf,firma,cbAgendaSetter,cbSolutionMachine,cbDataExpert,cbProcedureShark,cbFinanceGuru,cbEinblick,cbOpenData,cbIdeen,cbNetzwerk,cbAnderes,anderesField, cbGruppenleiter,cbInformation,cbFotoVideo) {
	if(cbAgendaSetter==true){cbAgendaSetter="glyphicon glyphicon-ok"} else{cbAgendaSetter="glyphicon glyphicon-remove"}
	if(cbSolutionMachine==true){cbSolutionMachine="glyphicon glyphicon-ok"} else{cbSolutionMachine="glyphicon glyphicon-remove"}
	if(cbDataExpert==true){cbDataExpert="glyphicon glyphicon-ok"} else{cbDataExpert="glyphicon glyphicon-remove"}
	if(cbProcedureShark==true){cbProcedureShark="glyphicon glyphicon-ok"} else{cbProcedureShark="glyphicon glyphicon-remove"}
	if(cbFinanceGuru==true){cbFinanceGuru="glyphicon glyphicon-ok"} else{cbFinanceGuru="glyphicon glyphicon-remove"}
	
	if(cbEinblick==true){cbEinblick="glyphicon glyphicon-ok"} else{cbEinblick="glyphicon glyphicon-remove"}
	if(cbOpenData==true){cbOpenData="glyphicon glyphicon-ok"} else{cbOpenData="glyphicon glyphicon-remove"}
	if(cbIdeen==true){cbIdeen="glyphicon glyphicon-ok"} else{cbIdeen="glyphicon glyphicon-remove"}
	if(cbNetzwerk==true){cbNetzwerk="glyphicon glyphicon-ok"} else{cbNetzwerk="glyphicon glyphicon-remove"}
	if(cbAnderes==true){cbAnderes="glyphicon glyphicon-ok"} else{cbAnderes="glyphicon glyphicon-remove"}
	if(cbGruppenleiter==true){cbGruppenleiter="glyphicon glyphicon-ok"} else{cbGruppenleiter="glyphicon glyphicon-remove"}
	
   text="<table class='table table-striped'>";
    text+="<tr><th style='width:30%;'>Vorname</th><td style='width:30%;'>" + vorname + "</td><td style='width:30%;'></td></tr>";
    text+="<tr><th>Nachname</th><td>" + nachname + "</td><td></td></tr>";
    text+="<tr><th>Geschlecht</th><td>" + geschlecht + "</td><td></td></tr>";
    text+="<tr><th>Alter</th><td>" + alter + "</td><td></td></tr>";
    text+="<tr><th>Beruf</th><td>" + beruf + "</td><td></td></tr>";
    text+="<tr><th>Firma</th><td>" + firma + "</td><td></td></tr>";
	text+="<tr><th>Eigenschaften</th><td>AgendaSetter</td><td><span class='"+cbAgendaSetter+"' aria-hidden='true'></span></td></tr>";
	text+="<tr><th></th><td>SolutionMachine</td><td><span class='"+cbSolutionMachine+"' aria-hidden='true'></span></td></tr>";
	text+="<tr><th></th><td>DataExpert</td><td><span class='"+cbDataExpert+"' aria-hidden='true'></span></td></tr>";
	text+="<tr><th></th><td>ProcedureShark</td><td><span class='"+cbProcedureShark+"' aria-hidden='true'></span></td></tr>";
	text+="<tr><th></th><td>FinanceGuru</td><td><span class='"+cbFinanceGuru+"' aria-hidden='true'></span></td></tr>";
	
	text+="<tr><th>Erwartungen</th><td>Einblick</td><td><span class='"+cbEinblick+"' aria-hidden='true'></span></td></tr>";
	text+="<tr><th></th><td>OpenData</td><td><span class='"+cbOpenData+"' aria-hidden='true'></span></td></tr>";
	text+="<tr><th></th><td>Ideen</td><td><span class='"+cbIdeen+"' aria-hidden='true'></span></td></tr>";
	text+="<tr><th></th><td>Netzwerk</td><td><span class='"+cbNetzwerk+"' aria-hidden='true'></span></td></tr>";
	
	if(cbAnderes=="glyphicon glyphicon-remove"){
		text+="<tr><th></th><td>Anderes</td><td><span class='"+cbAnderes+"' aria-hidden='true'></span></td></tr>";
	}
	else{
		text+="<tr><th></th><td>"+anderesField+"</td><td><span class='"+cbAnderes+"' aria-hidden='true'></span></td></tr>";
	}
	text+="<tr><th>Gruppenleiter</th><td><span class='"+cbGruppenleiter+"' aria-hidden='true'></span></td><td></td></tr>";
	text+="<tr><th>Email</th><td>" + email + "</td><td></td></tr>";
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
