get command: 
Invoke-RestMethod -Uri "http://localhost:3000/api?key=abcd" -Method Get

post command:
Invoke-RestMethod -Uri "http://localhost:3000/api?key=abcd" -Method Post -Body '{"key":"abcd","pumpState":true}' -ContentType 'application/json'