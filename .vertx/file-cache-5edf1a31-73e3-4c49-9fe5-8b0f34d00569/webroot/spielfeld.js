$(document).ready(function () {
    var anmeldung=true;
    var anzahlAufgaben=20;
    //var spielerliste=[];
    var namen=[];
    var aufgaben=[];
    var spieleranzahl=1;
    var spielerListe2=[];
    var aufgabenListe=[];
    var fertig=false;
    var eb = new vertx.EventBus('/bridge');
    $("body").append("<div id='start'>Anzahl Aufgaben:<br><input type='text' id='anzahl' value='20'></input><br><input type='button' value='Los gehts' id='knopf'></input></div>");
    $("body").append("<div id='namen'></div>");
   
    eb.onopen = function () {

        eb.registerHandler('matheserver.spielfeld', function (message, replier) {

            var typ = message.typ;
            if (typ === "id" && anmeldung === true) {
                var uuid = message.nr;
                //spielerliste[spieleranzahl]=uuid;
               // var s=new spieler(uuid,"");
                
                eb.send("matheserver.spieler."+uuid,{typ:"spielernr",wert:spieleranzahl});
                  
            } else if (typ === "id" && anmeldung === false) {
                eb.send("matheserver.spieler."+uuid,{typ:"nachricht",wert:"Zu spät angemeldet, bitte warten ..."});
            } else if (typ==="name"){
                namen[message.nr]=message.wert;
                var s=new spieler(message.uuid,message.wert);
                spielerListe2.push(s);
                s.nr=spielerListe2.length-1;
                $("#namen").append("<br>"+message.wert);
                eb.send("matheserver.spieler."+message.uuid,{typ:"bitteWarten",wert:message.wert,anzahl:spieleranzahl});
                spieleranzahl++;  
            } else if (typ==="neueAufgabe"){
                var nr=message.nr-1;
                spielerListe2[nr].gesamt++;
                if (message.richtig===true){
                    spielerListe2[nr].richtig++;
                }
                var an=spielerListe2[nr].holeAufgabenNummer();
                if (an>-1){
                eb.send("matheserver.spieler."+spielerListe2[nr].uuid,{typ:"neueAufgabe",wert:aufgaben[an],richtig:spielerListe2[nr].richtig,gesamt:spielerListe2[nr].gesamt,platz:-1,anzahlSpieler:spielerListe2.length, anzahlAufgabe:anzahlAufgaben});
            } else {
                fertig=true;
            }
                // alle spieler durchgehen
                
                var spielerListe3=[];
                for (var i=0;i<spielerListe2.length;i++){
                    spielerListe3.push(spielerListe2[i]);
                }
                spielerListe3.sort(function(a,b){
                   return(b.richtig/b.gesamt-a.richtig/a.gesamt); 
                });
                
                $("body").html("");
                for (var i=0;i<spielerListe3.length;i++){
                    spielerListe2[spielerListe3[i].nr].platz=i;
                    var sn=spielerListe3[i].nr;
                    eb.send("matheserver.spieler."+spielerListe2[sn].uuid,{typ:"platz",wert:i,fertig:fertig,info:spielerListe3});
                    $("body").append((i+1)+". "+spielerListe2[sn].name+": "+spielerListe2[sn].richtig+" / "+spielerListe2[sn].gesamt+"<br>");
                }
                
            }
        });
    }
    
    $("#knopf").click(function(){
        anmeldung=false;
        anzahlAufgaben=parseInt($("#anzahl").val());
        aufgaben=erstelleAufgaben(anzahlAufgaben);
        
        for (var i=0;i<spielerListe2.length;i++){
            var liste=[];
        for (var j=0;j<anzahlAufgaben;j++){
            liste[j]=j;
            
        }
            spielerListe2[i].setListe(liste);
            var nr=spielerListe2[i].holeAufgabenNummer();
            
            eb.send("matheserver.spieler."+spielerListe2[i].uuid,{typ:"neueAufgabe",wert:aufgaben[nr],richtig:0,gesamt:0,platz:-1,anzahlSpieler:spielerListe2.length, anzahlAufgabe:anzahlAufgaben});
        }
    });
    
    function erstelleAufgaben(anzahl){
        var operator=["+","-","*","/"];
        var aufgaben=[];
        for (var i=0;i<anzahl;i++){
            var operatorwahl=parseInt(Math.random()*4);
            var zahl1=parseInt(Math.random()*20+1);
            var zahl2=parseInt(Math.random()*20+1);
            if (operatorwahl===3){
                zahl1=zahl1*zahl2;
            }
            var ergebnis=0;
            switch(operatorwahl){
                case 0:
                    ergebnis=zahl1+zahl2;
                    break;
                case 1:
                    ergebnis=zahl1-zahl2;
                    break;
                case 2:
                    ergebnis=zahl1*zahl2;
                    break;
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
        this.richtig=0;
        this.gesamt=0;
        this.nr=0;
        this.platz=0;
        
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