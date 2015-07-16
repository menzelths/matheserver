$(document).ready(function () {
    var anmeldung=true;
    var spielerliste=[];
    var namen=[];
    var spieleranzahl=1;
    var eb = new vertx.EventBus('/bridge');
    $("body").html("<div id='namen'></div>");
   
    eb.onopen = function () {

        eb.registerHandler('matheserver.spielfeld', function (message, replier) {

            var typ = message.typ;
            if (typ === "id" && anmeldung === true) {
                var uuid = message.nr;
                spielerliste[spieleranzahl]=uuid;
                eb.send("matheserver.spieler."+uuid,{typ:"spielernr",wert:spieleranzahl});
                spieleranzahl++;    
               
            } else if (typ==="name"){
                namen[message.nr]=message.wert;
                $("#namen").append(message.wert);
                eb.send("matheserver.spieler."+spielerliste[message.nr],{typ:"bitteWarten",wert:message.wert});
            }
        });
    }
});