import json
import urllib.request
import urllib.error

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/chatbot',
    data=json.dumps({'prompt': 'What is Krishi-AI?'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        body = resp.read().decode()
        print(body)
except urllib.error.HTTPError as e:
    print('HTTP', e.code)
    print(e.read().decode())
except Exception as e:
    print('ERROR', repr(e))
