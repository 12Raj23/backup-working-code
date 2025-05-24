package com.example.buttonapp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.InetSocketAddress;
import java.net.Socket;

@CrossOrigin(origins = "*")
@RestController
public class ButtonController {

    private String lastConnectedIp;
    private int lastConnectedPort;

   

    // DTO for server details
    public static class ServerDetails {
        private String ipAddress;
        private String port;

        public String getIpAddress() {
            return ipAddress;
        }

        public void setIpAddress(String ipAddress) {
            this.ipAddress = ipAddress;
        }

        public String getPort() {
            return port;
        }

        public void setPort(String port) {
            this.port = port;
        }
    }

    @PostMapping("/connect")
    public ResponseEntity<String> connectServer(@RequestBody ServerDetails serverDetails) {
        try {
            lastConnectedIp = serverDetails.getIpAddress();
            lastConnectedPort = Integer.parseInt(serverDetails.getPort());

            // Test the connection
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(lastConnectedIp, lastConnectedPort), 3000);
            }

            System.out.println("Successfully connected to " + lastConnectedIp + ":" + lastConnectedPort);
            return ResponseEntity.ok("Connection established successfully");
        } catch (Exception e) {
            System.err.println("Connection failed: " + e.getMessage());
            return ResponseEntity.status(500).body("Failed to connect: " + e.getMessage());
        }
    }

    // DTO for button command
    public static class CommandData {
        private String value;

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }

    @PostMapping("/button1")
    public ResponseEntity<String> handleButtonCommand(@RequestBody CommandData commandData) {
        String command = commandData.getValue();
        System.out.println("Received button command: " + command);

        if (lastConnectedIp == null || lastConnectedPort == 0) {
            return ResponseEntity.status(400).body("No active server connection. Please connect first.");
        }

        boolean success = sendTcpCommand(lastConnectedIp, lastConnectedPort, command);
        if (success) {
            return ResponseEntity.ok("Command sent: " + command);
        } else {
            return ResponseEntity.status(500).body("Failed to send command.");
        }
    }

    // TCP Socket command sender
    private boolean sendTcpCommand(String ip, int port, String message) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(ip, port), 3000);
            OutputStream output = socket.getOutputStream();
            PrintWriter writer = new PrintWriter(output, true);
            writer.println(message);
            System.out.println("Command sent to " + ip + ":" + port + " => " + message);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send TCP command: " + e.getMessage());
            return false;
        }
    }
}
