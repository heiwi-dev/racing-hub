import re,os,glob
files=['index.html','series.html','css/style.css','js/app.js','js/series.js','js/data.js']
refs=set()
for f in files:
    t=open(f,encoding='utf-8').read()
    for m in re.findall(r"(?:src|href)=[\"']([^\"'#?]+)",t): refs.add(m)
    for m in re.findall(r"url\([\"']?([^\"')]+)",t): refs.add(m)
    for m in re.findall(r"[\"']((?:assets|css|js)/[^\"']+)[\"']",t): refs.add(m)
missing=[]
for r in sorted(refs):
    if r.startswith(('http','data:','mailto:','tel:')) or r in ('index.html','series.html'): continue
    if not os.path.exists(r): missing.append(r)
print("MISSING:",missing)
used=set()
for r in refs:
    used.add(os.path.normpath(r))
for f in glob.glob('assets/**/*',recursive=True)+['cars-off.webp','cars-on.webp']:
    if os.path.isfile(f) and os.path.normpath(f) not in used:
        print("UNUSED:",f, os.path.getsize(f))
