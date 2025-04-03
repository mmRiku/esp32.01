#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // added for HTTPS support
#include <ArduinoJson.h>

const char* ssid     = "riku_guest";
const char* password = "123456789@";
const char* apiBaseUrl = "https://your_server/api/"; // update with your server address

// Function to GET pumpState from the API
int getValue() {
  HTTPClient http;
  String url = String(apiBaseUrl) + "?key=password";
  {
    WiFiClientSecure client;
    client.setInsecure();
    http.begin(client, url); // changed to use HTTPS client
  }
  int httpCode = http.GET();
  int value = 0;
  if(httpCode == 200) {
    String payload = http.getString();
    // Assuming payload is like: {"pumpState": true} or false.
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, payload);
    if (!error && doc.containsKey("pumpState")) {
      bool pumpState = doc["pumpState"];
      value = pumpState ? 1 : 0;
    }
  }
  http.end();
  return value;
}

// Function to POST toggled pumpState to the API and return new value.
// It reads current pumpState, toggles it, then posts the new value.
void setValue(bool state) {
  bool newState = state;
  
  HTTPClient http;
  {
    WiFiClientSecure client;
    client.setInsecure();
    http.begin(client, apiBaseUrl); // changed to use HTTPS client
  }
  http.addHeader("Content-Type", "application/json");
  StaticJsonDocument<200> doc;
  doc["key"] = "password";
  doc["pumpState"] = newState;
  String body;
  serializeJson(doc, body);
  
  int httpCode = http.POST(body);
  http.end();
}

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void loop() {
  // Call getValue(), set LED on/off based on the pump state.
  int pumpVal = getValue();
  digitalWrite(LED_BUILTIN, pumpVal ? HIGH : LOW);
  delay(1000); // wait 1 second
  
  // Call setValue() to toggle pump state at the API.
  setValue(true); // toggle to true
  delay(1000); // wait 1 second
  setValue(false); // toggle to false
  delay(1000); // wait 1 second
}