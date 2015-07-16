$(document).ready(function () {
    var anmeldung=true;
    var anzahlAufgaben=20;
    var spielerliste=[];
    var namen=[];
    var aufgaben=[];
    var spieleranzahl=1;
    var spielerListe2=[];
    var aufgabenListe=[];
    var eb = new vertx.EventBus('/bridge');
    $("body").append("<div id='start'><input type='button' value='Los gehts' id='knopf'></input></div>");
    $("body").append("<div id='namen'></div>");
   
    eb.onopen = function () {

        eb.registerHandler('matheserver.spielfeld', function (message, replier) {

            var typ = message.typ;
            if (typ === "id" && anmeldung === true) {
                var uuid = message.nr;
                spielerliste[spieleranzahl]=uuid;
                eb.send("matheserver.spieler."+uuid,{typ:"spielernr",wert:spieleranzahl});
                spieleranzahl++;    
            } else if (typ === "id" && anmeldung === false) {
                eb.send("matheserver.spieler."+uuid,{typ:"nachricht",wert:"Zu spät angemeldet, bitte warten ..."});
            } else if (typ==="name"){
                namen[message.nr]=message.wert;
                var s=new spieler(message.uuid,message.wert);
                spielerListe2.push(s);
                $("#namen").append("<br>"+message.wert);
                eb.send("matheserver.spieler."+spielerliste[message.nr],{typ:"bitteWarten",wert:message.wert});
            }
        });
    }
    
    $("#knopf").click(function(){
        anmeldung=false;
        aufgaben=erstelleAufgaben(anzahlAufgaben);
        
        for (var i=0;i<spielerListe2.length;i++){
            var liste=[];
        for (var j=0;j<anzahlAufgaben;j++){
            liste[j]=j;
            
        }
            spielerListe2[i].setListe(liste);
            var nr=spielerListe2[i].holeAufgabenNummer();
            
            eb.send("matheserver.spieler."+spielerListe2[i].uuid,{typ:"neueAufgabe",wert:aufgaben[nr]});
        }
    });
    
    function erstelleAufgaben(anzahl){
        var operator=["+","-","*","/"];
        var aufgaben=[];
        for (var i=0;i<anzahl;i++){
            var operatorwahl=parseInt(Math.random()*4);
            var zahl1=parseInt(Math.random()*100+1);
            var zahl2=parseInt(Math.random()*100+1);
            if (operatorwahl===3){
                zahl1=zahl1*zahl2;
            }
            var ergebnis=0;
            switch(operatorwahl){
                case 0:
                    ergebnis=zahl1+zahl2;
                case 1:
                    ergebnis=zahl1-zahl2;
                case 2:
                    ergebnis=zahl1*zahl2;
                case 3:
                    ergebnis=zahl1/zahl2;
            }
            var term=zahl1+operator[operatorwahl]+zahl2;
            var r=new rechnung(term,ergebnis);
            aufgaben.push(r);
            
        }
        return aufgaben;
        
    }
    
    function rechnung(term,ergebnis) {
        this.term=term;
        this.ergebnis=ergebnis;
       
    }
    
    function spieler(uuid,name) {
        this.uuid=uuid;
        this.liste=[];
        this.name=name;
        
        
        this.setListe=function(liste){
            this.liste=liste;
        }
        this.holeAufgabenNummer=function(){
            var a=-1;
            if (this.liste.length>0){
            var z=parseInt(Math.random()*this.liste.length);
            a=this.liste[z];
            this.liste.splice(z,1); // wert aus liste löschen
        }
            return a;
        }
    }
});