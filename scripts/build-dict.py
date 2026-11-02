import unicodedata,re,json,os,random
def norm(s):
    s=unicodedata.normalize("NFD",s.strip().lower())
    return "".join(c for c in s if unicodedata.category(c)!="Mn")
ok=re.compile(r"^[a-z]+$")
lex=set();conj=set();icf={}
for l in open("data/lexico",encoding="utf-8"):
    w=norm(l)
    if ok.match(w):lex.add(w)
for l in open("data/conj",encoding="utf-8"):
    w=norm(l.split(",")[0])
    if ok.match(w):conj.add(w)
for l in open("data/icf",encoding="utf-8"):
    p=l.strip().split(",")
    if len(p)<2:continue
    w=norm(p[0])
    if ok.match(w):
        try:v=float(p[1])
        except:continue
        icf[w]=min(v,icf.get(w,99))
base=lex|conj
def bases(w):
    out=[]
    if w.endswith("s"):out.append(w[:-1])
    if w.endswith("es"):out.append(w[:-2])
    for suf,rep in (("oes","ao"),("aes","ao"),("aos","ao"),("eis","el"),("eis","il"),("ais","al"),("ois","ol"),("uis","ul"),("is","il"),("ns","m"),("as","o"),("a","o"),("a","")):
        if w.endswith(suf):out.append(w[:-len(suf)]+rep)
    return out
derived=set()
for _ in range(2):
    cur=base|derived
    for w in icf:
        if 4<=len(w)<=6 and w not in cur and any(b in cur for b in bases(w)):derived.add(w)
valid=base|derived
print("base",len(base),"derivadas",len(derived))
os.makedirs("public/dict",exist_ok=True)
for n in (4,5,6):
    v=sorted(w for w in valid if len(w)==n)
    json.dump(v,open(f"public/dict/valid-{n}.json","w"),separators=(",",":"))
    c=sorted(w for w in v if w in lex and icf.get(w,99)<=14)
    json.dump(c,open(f"public/dict/common-{n}.json","w"),separators=(",",":"))
    print(n,"validas",len(v),"comuns",len(c),os.path.getsize(f"public/dict/valid-{n}.json")//1024,"KB")
