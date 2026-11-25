import re
p='css/style.css'
s=open(p,encoding='utf-8').read()
pos=['0.09','0.1','0.12','0.13','0.14','0.16','0.18','0.22']
for v in pos:
    s,n=re.subn(r'letter-spacing:\s*'+re.escape(v)+r'em', 'letter-spacing: 0.06em', s)
    print('tracking +'+v, n)
for v in ['-0.028','-0.035','-0.05']:
    s,n=re.subn(r'letter-spacing:\s*'+re.escape(v)+r'em', 'letter-spacing: -0.03em', s)
    print('tracking '+v, n)
for v in ['1.6','1.65','1.7','1.75','1.78','1.55']:
    s,n=re.subn(r'line-height:\s*'+re.escape(v)+r';\n', 'line-height: 1.5;\n', s)
    print('leading '+v, n)
for v in ['0.94','0.95','0.98']:
    s,n=re.subn(r'line-height:\s*'+re.escape(v)+r';', 'line-height: 1.1;', s)
    print('heading '+v, n)
for v in ['1.22','1.26','1.28']:
    s,n=re.subn(r'line-height:\s*'+re.escape(v)+r';', 'line-height: 1.2;', s)
    print('heading '+v, n)
s,n=re.subn(r'line-height:\s*1\.55 !important;', 'line-height: 1.45 !important;', s)
print('pull', n)
open(p,'w',encoding='utf-8').write(s)
