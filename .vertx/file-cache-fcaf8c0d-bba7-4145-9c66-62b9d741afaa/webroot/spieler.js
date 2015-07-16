$(document).ready(function () {
    var uuid = new Date().getTime() + "" + parseInt(Math.random() * 100000); // zufallswert bestimmen für spielerid
    var eb = new vertx.EventBus('/bridge');
    var spielernummer=-1;
    
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
                $("body").html("Ok, "+message.wert+" ...<p>Bitte kurz warten, ehe es los geht!")
            } else if (typ==="nachricht"){
                $("body").html(message.wert);
            } else if (typ==="neueAufgabe"){
                var aufgabe=message.wert;
                $("body").html(aufgabe.term);
                $("body").append("<br>Ergebnis: "+aufgabe.ergebnis);
            }
        });
        eb.send("matheserver.spielfeld",{typ:"id",nr:uuid}); // schicke eigene uuid
        
    }
    
});