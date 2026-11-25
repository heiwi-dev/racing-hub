import struct,json
for p in ["assets/models/f1-2026.glb","assets/models/gt3-2026.glb"]:
    d=open(p,'rb').read(); jlen,_=struct.unpack('<II',d[12:20]); j=json.loads(d[20:20+jlen])
    print(p)
    for i,img in enumerate(j.get('images',[])[:6]):
        bv=j['bufferViews'][img['bufferView']]
        print('  img',i,img.get('mimeType'),img.get('name'),round(bv['byteLength']/1024),'KB')
    print('  accessors',len(j.get('accessors',[])),'anims',len(j.get('animations',[])))
