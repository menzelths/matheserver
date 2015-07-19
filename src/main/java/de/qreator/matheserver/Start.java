/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.qreator.matheserver;

import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.StaticHandler;
import io.vertx.ext.web.handler.sockjs.BridgeOptions;
import io.vertx.ext.web.handler.sockjs.PermittedOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import java.io.IOException;
import java.net.InetAddress;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author thomas
 */
public class Start {

    public static void main(String[] s) {
        int port = 8080;
        if (s.length == 1) {
            port = Integer.parseInt(s[0]); // port festlegen: 

        }

        Vertx vertx = Vertx.vertx();
        io.vertx.core.http.HttpServer server = vertx.createHttpServer();

        Router router = Router.router(vertx);
        SockJSHandler sockJSHandler = SockJSHandler.create(vertx);
        PermittedOptions[] inboundPermitted = new PermittedOptions[3];
        inboundPermitted[0] = new PermittedOptions().setAddress("matheserver");
        inboundPermitted[1] = new PermittedOptions().setAddress("matheserver.spielfeld");
        inboundPermitted[2] = new PermittedOptions().setAddressRegex("matheserver.spieler\\..+");

        BridgeOptions options = new BridgeOptions();
        for (int i = 0; i < 3; i++) {
            options.addInboundPermitted(inboundPermitted[i]);
            options.addOutboundPermitted(inboundPermitted[i]);
        }

        sockJSHandler.bridge(options);

        router.route("/bridge/*").handler(sockJSHandler);
        router.route("/*").handler(StaticHandler.create()); // webroot unter src/main/resources/webroot
        server.requestHandler(router::accept).listen(port);

        EventBus eb = vertx.eventBus();

        MessageConsumer<JsonObject> consumer = eb.consumer("matheserver");
        consumer.handler(message -> {
            String typ = (message.body()).getString("typ");
            if (typ.equals("einaus")) {
                try {
                    Runtime.getRuntime().exec("sudo init 6");
                    System.out.println("System wird neu gestartet ...");
                } catch (IOException ex) {
                    ex.printStackTrace();
                }
            }
        });

        try {
            System.out.println("Spieler bitte mit Browser anmelden unter \nhttp://" + InetAddress.getLocalHost().getHostAddress() + ":" + port + "/spieler.html");

        } catch (Exception e) {
            e.printStackTrace();

        }
    }

}
