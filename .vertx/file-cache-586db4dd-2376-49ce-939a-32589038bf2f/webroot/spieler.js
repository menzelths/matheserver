$(document).ready(function () {
    var uuid = new Date().getTime() + "" + parseInt(Math.random() * 100000); // zufallswert bestimmen für spielerid
    var eb = new vertx.EventBus('/bridge');
    var spielernummer = -1;
    var aufgabennummer = 0;
    var richtig = 0;
    var anzahlAufgaben = 0;
    var b = 400;

    $("body").append("<div id='nachricht'></div>");
    eb.onopen = function () {

        eb.registerHandler('matheserver.spieler.' + uuid, function (message, replier) { // eigene adresse

            var typ = message.typ;
            if (typ === "spielernr") {


            } else if (typ === "bitteWarten") {
                $("body").html("<div id='platz'></div><div id='ausgabe'>Ok, " + message.wert + " ...<p>Bitte kurz warten, ehe es los geht!</div><div id='aufgabe'></div><div id='info'</div>");
                spielernummer = parseInt(message.anzahl);
            } else if (typ === "nachricht") {
                $("body").html(message.wert);
            } else if (typ === "neueAufgabe") {
                var aufgabe = message.wert;
                anzahlAufgaben = message.anzahlAufgaben;
                //$("#").html("<div id='ausgabe'></div><div id='aufgabe'></div>");
                aufgabennummer++;
                if (aufgabennummer === 1) {

                    $("#ausgabe").html("Los geht's!");
                }
                $("#aufgabe").html("Aufgabe Nr. " + aufgabennummer + "<br>" + aufgabe.term);
                //$("body").append("<br>Ergebnis: "+aufgabe.ergebnis);
                $("#aufgabe").append("<br><input id='lsg' type='text'></input><br><input type='button' value='OK' id='knopf'></input>");
                $("#lsg").focus();
                $("#lsg").on('keypress', function (event) {
                    if (event.which === 13) {

                        $("#knopf").trigger("click");
                    }
                });
                $("#knopf").click(function () {
                    var lsg = parseInt($("#lsg").val());

                    if (lsg === aufgabe.ergebnis) {
                        richtig++;
                        $("#ausgabe").html("Richtig!<br>" + richtig + " / " + aufgabennummer + " richtig!");
                        eb.send("matheserver.spielfeld", {typ: "neueAufgabe", richtig: true, nr: spielernummer, uuid: uuid});
                    } else {
                        $("#ausgabe").html("Falsch!<br>Richtig wäre " + aufgabe.ergebnis + " gewesen!<br>" + richtig + " / " + aufgabennummer + " richtig!");
                        eb.send("matheserver.spielfeld", {typ: "neueAufgabe", richtig: false, nr: spielernummer, uuid: uuid});
                    }


                });
            } else if (typ === "platz") {
                $("#platz").html("Platz: " + (message.wert + 1));
                if (message.fertig === true) {
                    $("#ausgabe").html("Spiel ist beendet.");
                    $("#aufgabe").html("");
                }
                $("#info").html("");

                var hoehe = message.info.length * 20;
                b = $(window).width()*.9;
                $("body").append("<br><canvas id='bild' width='"+b+"px' height='" + hoehe + "px'></canvas>");
                var ctx = $("#bild")[0].getContext("2d");
                
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, b, hoehe);
                ctx.strokeStyle = "#0000ff";

                ctx.strokeRect(0, 0, b, hoehe);
                ctx.font="18px Verdana";
                for (var i = 0; i < message.info.length; i++) {
                    //$("#info").append((i+1)+". "+message.info[i].name+": "+message.info[i].richtig+" / "+message.info[i].gesamt+"<br>");
                    if (message.info[i].uuid === uuid) { // eigener wert
                        ctx.fillStyle = "#aaaaff";
                        ctx.fillRect(0, i * 20 + 1, b, 18);
                    }
                    var breite = b * message.info[i].richtig / anzahlAufgaben;
                    ctx.fillStyle = "#00ff00";
                    ctx.fillRect(0, i * 20 + 3, breite, 12);
                    var breite2 = b * (message.info[i].gesamt - message.info[i].richtig) / anzahlAufgaben;
                    ctx.fillStyle = "#ff0000";
                    ctx.fillRect(breite, i * 20 + 3, breite2, 12);
                    var text=message.info[i].name;
                    ctx.fillStyle="rgba(255,255,0,0.7)";
                    ctx.fillRect(0,i*20,ctx.measureText(text)+20,20);
                    ctx.fillStyle="#000000";
                    
                    
                    ctx.fillText(message.info[i].name,10,i*20-2);
                }

            }
        });
        $("#nachricht").html("Bitte gib deinen Namen ein:  ");


        $("body").append("<br><input type='text' id='name'></input><input type='button' id='start' value='OK'></input>");
        $("#name").on('keypress', function (event) {
            if (event.which === 13) {

                $("#start").trigger("click");
            }
        });
        $("#start").click(function () {
            var name = $("#name").val();
            eb.send("matheserver.spielfeld", {typ: "name", wert: name, uuid: uuid});
            //replier({typ:"start"});
        });


    }

});