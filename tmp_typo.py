import re
css = open('css/style.css', encoding='utf-8').read()
i=0; line=1; blocks=[]; depth=0; start=0; sel_start=0
for idx,ch in enumerate(css):
    if ch=='\n': line+=1
    if ch=='{':
        if depth==0: sel_start=start; start_line=line
        depth+=1
    elif ch=='}':
        depth-=1
        if depth==0:
            blocks.append((start_line, css[sel_start:idx])); start=idx+1
for ln,b in blocks:
    if any(k in b for k in ('font-family','letter-spacing','line-height','font-weight','font-size')):
        first=b.split('{',1)[0].strip().replace('\n',' ')
        props=[m.group(1)+':'+m.group(2).strip() for m in re.finditer(r'(font-family|letter-spacing|line-height|font-weight|font-size)\s*:\s*([^;]+);',b)]
        if props: print(f"{ln}\t{first}\t"+' | '.join(props))
