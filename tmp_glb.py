import json,struct,os
for p in ["assets/models/f1-2026.glb","assets/models/gt3-2026.glb","assets/models/wec-hypercar.glb","assets/models/wrc-rally1.glb"]:
    d=open(p,'rb').read()
    magic,ver,length=struct.unpack('<4sII',d[:12])
    off=12; chunks=[]
    while off < len(d):
        clen,ctype=struct.unpack('<II',d[off:off+8]); chunks.append((ctype.to_bytes(4,'little').decode('ascii',' replace'),clen)); off+=8+clen
    jlen,jtype=struct.unpack('<II',d[12:20]); j=json.loads(d[20:20+jlen])
    imgs=j.get('images',[])
    imgbytes=sum(j['bufferViews'][i['bufferView']]['byteLength'] for i in imgs if 'bufferView' in i)
    meshes=sum(len(m.get('primitives',[])) for m in j.get('meshes',[]))
    print(os.path.basename(p), f"{length/1048576:.1f}MB", "imgs", len(imgs), f"{imgbytes/1048576:.1f}MB", "prims", meshes, "mats", len(j.get('materials',[])), "nodes", len(j.get('nodes',[])), "chunks", chunks)
