p='js/app.js'
lines=open(p,encoding='utf-8').read().split('\n')
for i,l in enumerate(lines,1):
    if 'series-card' in l or 'seriesGrid' in l or 'seriesGrid.innerHTML' in l:
        print(f"{i}: {l}")
