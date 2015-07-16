$(document).ready(function () {
    var uuid = new Date().getTime() + "" + parseInt(Math.random() * 100000); // zufallswert bestimmen für spielerid
    var eb = new vertx.EventBus('/bridge');
    var spielernummer=-1;
    
    $("body").append("<div id='nachricht'></div>");
    eb.onopen = function () {

        eb.registerHandler('matheserver.spieler.' + uuid, function (message, replier) { // eigene adresse

            var typ = message.typ;
            if (typ === "spielernr") {
                $("#nachricht").html("Bitte gib deinen Namen ein:  " + message.wert);
                spielernummer = parseInt(message.wert);
                if (spielernummer === 1) {
                    $("body").append("<br><input type='text' id='name'></input><input type='button' id='start' value='OK'></input>");
                    $("#start").click(function () {
                        var name=$("#name").val();
                        eb.send("matheserver.spielfeld", {typ: "name",wert:name,nr:spielernummer});
                        //replier({typ:"start"});
                    });
                }
            }
        });
        eb.send("matheserver.spielfeld",{typ:"id",nr:uuid}); // schicke eigene uuid
        
    }
    
});