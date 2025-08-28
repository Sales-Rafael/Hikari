// Definição dos LEDs
int LEDVermelho_preImpressor1 = 6, LEDVerde_preImpressor1 = 5, LEDVermelho_Impressor1 = 4, LEDVerde_Impressor1 = 2, LEDAzul_Impressor1 = 20;
int LEDVermelho_preImpressor2 = 11, LEDVerde_preImpressor2 = 10, LEDVermelho_Impressor2 = 9, LEDVerde_Impressor2 = 8, LEDAzul_Impressor2 = 3;
int LEDVermelho_preImpressor3 = 24, LEDVerde_preImpressor3 = 22, LEDVermelho_Impressor3 = 15, LEDVerde_Impressor3 = 14, LEDAzul_Impressor3 = 12;
int LEDVermelho_preImpressor4 = 28, LEDVerde_preImpressor4 = 26, LEDVermelho_Impressor4 = 17, LEDVerde_Impressor4 = 16, LEDAzul_Impressor4 = 7;


void setup() {
  Serial.begin(115200);
  Serial1.begin(9600);


  int leds[] = {
    LEDVermelho_preImpressor1, LEDVerde_preImpressor1, LEDVermelho_Impressor1, LEDVerde_Impressor1, LEDAzul_Impressor1,
    LEDVermelho_preImpressor2, LEDVerde_preImpressor2, LEDVermelho_Impressor2, LEDVerde_Impressor2, LEDAzul_Impressor2,
    LEDVermelho_preImpressor3, LEDVerde_preImpressor3, LEDVermelho_Impressor3, LEDVerde_Impressor3, LEDAzul_Impressor3,
    LEDVermelho_preImpressor4, LEDVerde_preImpressor4, LEDVermelho_Impressor4, LEDVerde_Impressor4, LEDAzul_Impressor4
  };


  for (int i = 0; i < 20; i++) pinMode(leds[i], OUTPUT);


  inicializarLEDs();
  Serial.println("Mega pronto. Aguardando comandos do ESP32...");
}


void loop() {
  if (Serial1.available()) {
    String comando = Serial1.readStringUntil('\n');
    comando.trim();


    if (comando.length() < 3) return;


    char imp = comando.charAt(0);
    String status = comando.substring(2);


    atualizarLEDs(imp, status);


    Serial.print("Comando recebido: ");
    Serial.print(imp);
    Serial.print(" - ");
    Serial.println(status);
  }
}


void inicializarLEDs() {
  // Tudo "livre"
  for (int i = 0; i < 4; i++) {
    digitalWrite(LEDVerde_preImpressor1 + i * 6, HIGH);
  }
}


void atualizarLEDs(char imp, String status) {
  int pre, ver, ledPre, ledImp, ledAzul;


  switch(imp){
    case 'A': pre=LEDVerde_preImpressor1; ver=LEDVerde_Impressor1; ledPre=LEDVermelho_preImpressor1; ledImp=LEDVermelho_Impressor1; ledAzul=LEDAzul_Impressor1; break;
    case 'B': pre=LEDVerde_preImpressor2; ver=LEDVerde_Impressor2; ledPre=LEDVermelho_preImpressor2; ledImp=LEDVermelho_Impressor2; ledAzul=LEDAzul_Impressor2; break;
    case 'C': pre=LEDVerde_preImpressor3; ver=LEDVerde_Impressor3; ledPre=LEDVermelho_preImpressor3; ledImp=LEDVermelho_Impressor3; ledAzul=LEDAzul_Impressor3; break;
    case 'D': pre=LEDVerde_preImpressor4; ver=LEDVerde_Impressor4; ledPre=LEDVermelho_preImpressor4; ledImp=LEDVermelho_Impressor4; ledAzul=LEDAzul_Impressor4; break;
    default: return;
  }


  if(status == "Enviada") {           // impressora com OS enviada
    digitalWrite(pre, LOW);           // pre impressora vermelho
    digitalWrite(ledPre, HIGH);       // pre impressora aceso
    digitalWrite(ver, HIGH);          // impressora desligada
    digitalWrite(ledImp, LOW);
    digitalWrite(ledAzul, LOW);       // azul apagado
  }
  else if(status == "Finalizado") {   // impressora livre
    digitalWrite(pre, HIGH);          // pre impressora verde
    digitalWrite(ledPre, LOW);
    digitalWrite(ver, LOW);           // impressora verde
    digitalWrite(ledImp, HIGH);
    digitalWrite(ledAzul, LOW);
  }
  else if(status == "Imprimindo") {   // impressora imprimindo
    digitalWrite(pre, LOW);          
    digitalWrite(ledPre, LOW);
    digitalWrite(ver, HIGH);            
    digitalWrite(ledImp, LOW);        // impressora azul
    digitalWrite(ledAzul, HIGH);      
  }
  else if(status == "Imprimindo+Fila") { // impressora imprimindo e com fila
    digitalWrite(pre, LOW);           // pre impressora vermelho
    digitalWrite(ledPre, HIGH);       // pre vermelho
    digitalWrite(ver, HIGH);           // impressora azul
    digitalWrite(ledImp, LOW);
    digitalWrite(ledAzul, HIGH);      // LED azul aceso junto
  }
}
