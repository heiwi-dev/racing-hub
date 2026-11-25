import urllib.request
for u in ["https://unpkg.com/@google/model-viewer@4.4.0/dist/model-viewer.min.js","https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"]:
    try:
        r=urllib.request.urlopen(urllib.request.Request(u,method="HEAD"),timeout=20)
        print(r.status, r.headers.get('content-length'), r.headers.get('content-type'), u)
    except Exception as e:
        print("ERR", e, u)
