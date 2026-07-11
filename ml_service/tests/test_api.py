import urllib.request
import json

print("Testing /predict-energy...")
try:
    req1 = urllib.request.Request("http://127.0.0.1:8000/predict-energy", method="POST")
    req1.add_header('Content-Type', 'application/json')
    data1 = json.dumps({"temperature": 25.0, "irradiance": 800.0}).encode('utf-8')
    res1 = urllib.request.urlopen(req1, data=data1)
    print("Response Code:", res1.getcode())
    print("Response Body:", res1.read().decode())
except Exception as e:
    print("Error:", e)

print("\nTesting /detect-fault...")
try:
    req2 = urllib.request.Request("http://127.0.0.1:8000/detect-fault", method="POST")
    req2.add_header('Content-Type', 'application/json')
    data2 = json.dumps({"temperature": 25.0, "irradiance": 800.0, "voltage": 32.5, "current": 8.1}).encode('utf-8')
    res2 = urllib.request.urlopen(req2, data=data2)
    print("Response Code:", res2.getcode())
    print("Response Body:", res2.read().decode())
except Exception as e:
    print("Error:", e)
