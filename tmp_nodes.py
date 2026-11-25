import struct,json
for p in ["assets/models/f1-2026.glb","assets/models/gt3-2026.glb"]:
    d=open(p,'rb').read(); jlen,_=struct.unpack('<II',d[12:20]); j=json.loads(d[20:20+jlen])
    print("==",p)
    for i,n in enumerate(j.get('nodes',[])):
        print(i, repr(n.get('name')), 'mesh' if 'mesh' in n else '', n.get('translation',''), n.get('scale',''))
