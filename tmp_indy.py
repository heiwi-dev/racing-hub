p='js/data.js'
lines=open(p,encoding='utf-8').read().split('\n')
# 1-based inclusive ranges, delete high range first
assert lines[446].strip()=='/* --- IndyCar --- */', lines[446]
assert lines[590].strip()=='}', repr(lines[590])
assert lines[591].strip()=='},', repr(lines[591])
assert lines[2314].strip()=="id: 'indycar',", lines[2314]
assert lines[2577].strip()=='}', repr(lines[2577])
assert lines[2578].strip()==']', repr(lines[2578])
del lines[2312:2578]   # 1-based 2313..2578
del lines[445:591]     # 1-based 446..591
open(p,'w',encoding='utf-8').write('\n'.join(lines))
print('lines now:', len(lines))
