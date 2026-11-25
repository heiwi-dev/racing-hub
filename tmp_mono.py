p='css/style.css'
s=open(p,encoding='utf-8').read()
s=s.replace('var(--font-mono)', 'var(--font-sans)')
s=s.replace('  --font-mono: var(--font-sans);\n','')
open(p,'w',encoding='utf-8').write(s)
print('remaining mono:', s.count('--font-mono'))
