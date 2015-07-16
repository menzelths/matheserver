$(document).ready(function () {
    var uuid = new Date().getTime() + "" + parseInt(Math.random() * 100000); // zufallswert bestimmen für spielerid
    var eb = new vertx.EventBus('/bridge');
    var spielernummer=-1;
    var aufgabennummer=0;
    var richtig=0;
    
    $("body").append("<div id='nachricht'></div>");
    eb.onopen = function () {

        eb.registerHandler('matheserver.spieler.' + uuid, function (message, replier) { // eigene adresse

            var typ = message.typ;
            if (typ === "spielernr") {
                $("#nachricht").html("Bitte gib deinen Namen ein:  ");
                spielernummer = parseInt(message.wert);
                
                    $("body").append("<br><input type='text' id='name'></input><input type='button' id='start' value='OK'></input>");
                    $("#start").click(function () {
                        var name=$("#name").val();
                        eb.send("matheserver.spielfeld", {typ: "name",wert:name,nr:spielernummer,uuid:uuid});
                        //replier({typ:"start"});
                    });
                
            } else if (typ==="bitteWarten"){
                $("body").html("<div id='platz'></div><div id='ausgabe'>Ok, "+message.wert+" ...<p>Bitte kurz warten, ehe es los geht!</div><div id='aufgabe'></div><div id='info'</div>");
            } else if (typ==="nachricht"){
                $("body").html(message.wert);
            } else if (typ==="neueAufgabe"){
                var aufgabe=message.wert;
                //$("#").html("<div id='ausgabe'></div><div id='aufgabe'></div>");
                aufgabennummer++;
                if (aufgabennummer===1){
                    
                    $("#ausgabe").html("Los geht's!");
                } 
                $("#aufgabe").html("Aufgabe Nr. "+aufgabennummer+"<br>"+aufgabe.term);
                //$("body").append("<br>Ergebnis: "+aufgabe.ergebnis);
                $("#aufgabe").append("<br><input id='lsg' type='text'></input><br><input type='button' value='OK' id='knopf'></input>");
                $("#knopf").click(function(){
                    var lsg=parseInt($("#lsg").val());
                    
                    if (lsg===aufgabe.ergebnis){
                        richtig++;
                        $("#ausgabe").html("Richtig!<br>"+richtig+" / "+aufgabennummer+" richtig!");
                        eb.send("matheserver.spielfeld", {typ: "neueAufgabe",richtig:true,nr:spielernummer,uuid:uuid});
                    } else {
                        $("#ausgabe").html("Falsch!<br>Richtig wäre "+aufgabe.ergebnis+" gewesen!<br>"+richtig+" / "+aufgabennummer+" richtig!");
                        eb.send("matheserver.spielfeld", {typ: "neueAufgabe",richtig:false,nr:spielernummer,uuid:uuid});
                    }
                    
                    
                });
            } else if (typ==="platz"){
                $("#platz").html("Platz: "+(message.wert+1));
                if (message.fertig===true){
                    $("#ausgabe").html("Spiel ist beendet.");
                    $("#aufgabe").html("Du hast "+richtig+" / "+aufgabennummer +" richtig!");
                }
                $("#info").html("");
                for (var i=0;i<message.info.length;i++){
                    $("#info").append((i+1)+". "+message.info[i].name+": "+message.info[i].richtig+" / "+message.info[i].gesamt+"<br>");
                }
                
            }
        });
        eb.send("matheserver.spielfeld",{typ:"id",nr:uuid}); // schicke eigene uuid
        
    }
    
});