#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>


const char* ssid = "SENAI";
const char* password = "1ndu5tr1@";
const char* url = "https://script.google.com/macros/s/AKfycbww5GBmTETDdrvqOENF2abVUIOl_QuVNlSubo0q7D2BdVCY7Gn7as_TOql4UTsXSyt6/exec";


const unsigned long updateInterval = 5000;
unsigned long lastUpdate = 0;


#define RX2_PIN 16  // TX Mega
#define TX2_PIN 17  // RX Mega


void setup() {
  Serial.begin(115200);
  Serial1.begin(9600, SERIAL_8N1, RX2_PIN, TX2_PIN);


  WiFi.begin(ssid, password);
  Serial.print("Conectando Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado!");
}


void loop() {
  if (millis() - lastUpdate >= updateInterval) {
    lastUpdate = millis();


    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(url);
      int httpCode = http.GET();


      if (httpCode == 200) processarJSON(http.getString());
      else if (httpCode == 302) {
        String redirectUrl = http.getLocation();
        http.end();
        http.begin(redirectUrl);
        if (http.GET() == 200) processarJSON(http.getString());
      }
      http.end();
    }
  }
}


void processarJSON(String payload) {
  StaticJsonDocument<1024> doc;  // tamanho maior para fila
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.println("Erro JSON");
    return;
  }


  // Agrupar estados por impressora
  for (char imp = 'A'; imp <= 'D'; imp++) {
    bool temEnviada = false;
    bool temImprimindo = false;


    if (doc.containsKey(String(imp))) {
      String status = doc[String(imp)].as<String>();
      if (status == "Enviada") temEnviada = true;
      if (status == "Imprimindo") temImprimindo = true;
      if (status == "Imprimindo+Fila") { temImprimindo = true; temEnviada = true; }
    }


    String statusFinal;
    if (temImprimindo && temEnviada) statusFinal = "Imprimindo+Fila";
    else if (temImprimindo) statusFinal = "Imprimindo";
    else if (temEnviada) statusFinal = "Enviada";
    else statusFinal = "Finalizado";


    String comando = String(imp) + ":" + statusFinal + "\n";
    Serial1.print(comando);


    Serial.print("Enviado ao Mega: ");
    Serial.println(comando);
  }
}
