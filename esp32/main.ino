#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h> // added for HTTPS support
#include <ArduinoJson.h>

#ifndef LED_BUILTIN
#define LED_BUILTIN 2  // define LED pin (update if using a different pin)
#endif

const char* ssid     = "riku_guest";
const char* password = "12345678@";
const char* apiBaseUrl = "https://esp32-01-mriganka-patras-projects-83632c76.vercel.app/api"; // update with your server address

// Function to GET pumpState from the API
int getValue() {
  String url = String(apiBaseUrl) + "?key=password";
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, url); // now client remains in scope
 
  int httpCode = http.GET();
  Serial.println(httpCode);
  if(httpCode <= 0) {
    Serial.print("GET error: ");
    Serial.println(http.errorToString(httpCode).c_str());
    http.end();
    return 0;
  }
  
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
void setPumpValue(bool state) {
  bool newState = state;
  
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, apiBaseUrl);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["key"] = "password";
  doc["pumpState"] = newState;
  String body;
  serializeJson(doc, body);
  
  int httpCode = http.POST(body);
  if(httpCode <= 0) {
    Serial.print("POST error: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }
  http.end();
}

void setWaterLevel(int level) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    String url = String(apiBaseUrl) + "/waterLevel";  // changed to dedicated waterLevel endpoint
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["key"] = "password";
    doc["waterLevel"] = level;
    String body;
    serializeJson(doc, body);
    
    int httpCode = http.POST(body);
    if(httpCode <= 0) {
        Serial.print("POST waterLevel error: ");
        Serial.println(http.errorToString(httpCode).c_str());
    } else {
        Serial.print("POST waterLevel returned: ");
        Serial.println(httpCode);
    }
    http.end();
}

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  
  Serial.println("Starting");
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println("Connected");
}

void loop() {
  setWaterLevel(analogRead(34)); // Read water level from pin 34 (update if using a different pin)
}