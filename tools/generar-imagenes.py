"""Genera la identidad visual de PULSO y las ilustraciones de producto (SVG + PNG)."""
import json, os, subprocess, sys

ROOT = next((a for a in sys.argv[1:] if not a.startswith("--")), ".")
PROD = os.path.join(ROOT, "assets/img/products")
BRAND = os.path.join(ROOT, "assets/img/brand")
os.makedirs(PROD, exist_ok=True)
os.makedirs(BRAND, exist_ok=True)

COLORS = {
    "cobalto": ("Cobalto", "#2C46B5"),
    "tinta": ("Tinta", "#141A3D"),
    "cal": ("Cal", "#F1F2F4"),
    "pista": ("Pista", "#E5532E"),
    "senal": ("Señal", "#FFE14D"),
    "hielo": ("Hielo", "#C9D4FF"),
    "grafito": ("Grafito", "#3B4150"),
    "musgo": ("Musgo", "#56704F"),
}

def lum(hexc):
    h = hexc.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def shade(hexc, f):
    h = hexc.lstrip("#")
    c = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    if f < 0:
        c = [int(v * (1 + f)) for v in c]
    else:
        c = [int(v + (255 - v) * f) for v in c]
    return "#%02x%02x%02x" % tuple(max(0, min(255, v)) for v in c)

# ---------- Wordmark (letras dibujadas a mano, condensadas) ----------
LETTERS = {
    "P": (39, "M5,60 V5 H20 A14,14 0 0 1 20,33 H5"),
    "U": (36, "M5,0 V42 A13,13 0 0 0 31,42 V0"),
    "L": (32, "M5,0 V55 H32"),
    "S": (36, "M34,5 H17.5 A12.5,12.5 0 0 0 17.5,30 H18.5 A12.5,12.5 0 0 1 18.5,55 H2"),
    "O": (38, None),
}

def wordmark_group(color, x=0, y=0, scale=1.0, stroke=10):
    parts, cx = [], 0
    for ch in "PULSO":
        w, d = LETTERS[ch]
        if d:
            parts.append(f'<path d="{d}" transform="translate({cx},0)"/>')
        else:
            parts.append(f'<rect x="{cx + 5}" y="5" width="28" height="50" rx="14"/>')
        cx += w + 7
    return (f'<g transform="translate({x},{y}) scale({scale}) skewX(-8)" fill="none" stroke="{color}" '
            f'stroke-width="{stroke}" stroke-linejoin="miter" stroke-miterlimit="4">{"".join(parts)}</g>')

WORD_W = sum(w for w, _ in LETTERS.values()) + 7 * 4  # 209

PULSE = "M0,30 H22 L30,12 L40,50 L48,30 H70"

def mark_group(fg, bg, x=0, y=0, size=100, r=22):
    s = size / 100
    return (f'<g transform="translate({x},{y}) scale({s})"><rect width="100" height="100" rx="{r}" fill="{bg}"/>'
            f'<path d="{PULSE}" transform="translate(15,20)" fill="none" stroke="{fg}" stroke-width="9" '
            f'stroke-linecap="round" stroke-linejoin="round"/></g>')

def write(path, s):
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)

def brand_assets():
    c, t, w = COLORS["cobalto"][1], COLORS["tinta"][1], "#FFFFFF"
    write(f"{BRAND}/logo.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 64">'
          f'{mark_group(w, c, 0, 2, 60, 16)}{wordmark_group(t, 82, 2)}</svg>')
    write(f"{BRAND}/logo-blanco.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 64">'
          f'{mark_group(c, w, 0, 2, 60, 16)}{wordmark_group(w, 82, 2)}</svg>')
    write(f"{BRAND}/wordmark.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -2 222 64">'
          f'{wordmark_group(t)}</svg>')
    write(f"{BRAND}/isotipo.svg", f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
          f'{mark_group(w, c)}</svg>')
    write(os.path.join(ROOT, "favicon.svg"), f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
          f'{mark_group(w, c)}</svg>')

# ---------- Prendas ----------
# Cada prenda: capas (path, rol). Rol: body | dark | rib | accent | trim
G = {}
G["tee"] = dict(
    body="M225,80 Q300,140 375,80 L430,98 Q500,135 545,200 L492,252 Q465,232 442,218 Q448,430 452,640 Q300,655 148,640 Q152,430 158,218 Q135,232 108,252 L55,200 Q100,135 170,98 Z",
    back="M225,80 Q300,98 375,80 L430,98 Q500,135 545,200 L492,252 Q465,232 442,218 Q448,430 452,640 Q300,655 148,640 Q152,430 158,218 Q135,232 108,252 L55,200 Q100,135 170,98 Z",
    inner="M225,80 Q300,100 375,80 Q300,140 225,80 Z",
    collar="M225,80 Q300,140 375,80",
    stitches=["M108,252 L55,200", "M150,628 Q300,642 450,628", "M492,252 L545,200"],
    folds=["M200,300 Q230,450 210,600", "M390,280 Q370,420 395,600", "M300,200 Q310,380 290,560"],
    logo=(370, 200), accent=["M442,218 Q448,430 452,640 L438,641 Q434,430 428,222 Z", "M158,218 Q152,430 148,640 L162,641 Q166,430 172,222 Z"],
)
G["tank"] = dict(
    body="M205,70 Q300,190 395,70 L428,75 Q420,200 470,255 Q462,450 462,640 Q300,656 138,640 Q138,450 130,255 Q180,200 172,75 Z",
    back="M205,70 Q300,120 395,70 L428,75 Q420,200 470,255 Q462,450 462,640 Q300,656 138,640 Q138,450 130,255 Q180,200 172,75 Z",
    inner="M205,70 Q300,120 395,70 Q300,190 205,70 Z",
    collar="M205,70 Q300,190 395,70",
    stitches=["M428,75 Q420,200 470,255", "M172,75 Q180,200 130,255", "M140,628 Q300,642 460,628"],
    folds=["M210,320 Q240,460 220,600", "M390,320 Q365,460 385,600"],
    logo=(360, 230), accent=["M470,255 Q462,450 462,640 L448,641 Q450,450 456,262 Z"],
)
G["longsleeve"] = dict(
    body="M225,80 Q300,140 375,80 L430,98 Q480,120 500,180 L575,545 L525,562 L450,290 Q448,460 452,640 Q300,655 148,640 Q152,460 150,290 L75,562 L25,545 L100,180 Q120,120 170,98 Z",
    back="M225,80 Q300,98 375,80 L430,98 Q480,120 500,180 L575,545 L525,562 L450,290 Q448,460 452,640 Q300,655 148,640 Q152,460 150,290 L75,562 L25,545 L100,180 Q120,120 170,98 Z",
    inner="M225,80 Q300,100 375,80 Q300,140 225,80 Z",
    collar="M225,80 Q300,140 375,80",
    rib=["M567,507 L575,545 L525,562 L515,525 Z", "M33,507 L25,545 L75,562 L85,525 Z"],
    stitches=["M150,628 Q300,642 450,628", "M430,98 Q445,200 450,290", "M170,98 Q155,200 150,290"],
    folds=["M210,300 Q240,450 215,600", "M390,300 Q365,450 385,600", "M500,250 Q520,380 545,500", "M100,250 Q80,380 55,500"],
    logo=(372, 205), accent=["M500,180 L575,545 L562,549 L488,190 Z", "M100,180 L25,545 L38,549 L112,190 Z"],
)
G["hoodie"] = dict(
    under="M205,95 Q190,18 300,12 Q410,18 395,95 Q300,60 205,95 Z",
    body="M205,95 Q240,165 300,175 Q360,165 395,95 L440,110 Q490,130 510,195 L585,560 L530,580 L455,300 Q455,470 458,610 L458,650 L142,650 L142,610 Q145,470 145,300 L70,580 L15,560 L90,195 Q110,130 160,110 Z",
    back="M205,95 Q300,60 395,95 L440,110 Q490,130 510,195 L585,560 L530,580 L455,300 Q455,470 458,610 L458,650 L142,650 L142,610 Q145,470 145,300 L70,580 L15,560 L90,195 Q110,130 160,110 Z",
    inner="M205,95 Q240,165 300,175 Q360,165 395,95 Q300,55 205,95 Z",
    collar="M205,95 Q240,165 300,175 Q360,165 395,95",
    rib=["M142,610 L458,610 L458,650 L142,650 Z", "M576,520 L585,560 L530,580 L520,542 Z", "M24,520 L15,560 L70,580 L80,542 Z"],
    pocket="M195,465 L405,465 L432,600 L168,600 Z",
    strings=[("M272,168 Q268,240 264,300", (264, 306)), ("M328,168 Q332,240 336,300", (336, 306))],
    stitches=["M195,465 L405,465", "M440,110 Q452,210 455,300", "M160,110 Q148,210 145,300"],
    folds=["M215,250 Q235,360 220,450", "M385,250 Q365,360 380,450", "M510,260 Q530,390 555,510", "M90,260 Q70,390 45,510"],
    logo=(372, 225), accent=[],
)
G["jacket"] = dict(
    body="M218,70 L382,70 L440,100 Q492,125 510,190 L585,555 L532,575 L458,300 Q458,470 460,640 Q300,655 140,640 Q142,470 142,300 L68,575 L15,555 L90,190 Q108,125 160,100 Z",
    back="M218,70 L382,70 L440,100 Q492,125 510,190 L585,555 L532,575 L458,300 Q458,470 460,640 Q300,655 140,640 Q142,470 142,300 L68,575 L15,555 L90,190 Q108,125 160,100 Z",
    yoke="M160,100 L218,70 L382,70 L440,100 Q492,125 510,190 L520,240 Q300,280 80,240 L90,190 Q108,125 160,100 Z",
    collarband="M212,40 L388,40 L392,95 Q300,118 208,95 Z",
    zipper="M300,105 L300,642",
    rib=["M577,515 L585,555 L532,575 L524,537 Z", "M23,515 L15,555 L68,575 L76,537 Z"],
    stitches=["M80,240 Q300,280 520,240", "M140,610 Q300,625 460,610", "M210,420 L245,520", "M390,420 L355,520"],
    folds=["M215,320 Q235,450 220,590", "M385,320 Q365,450 380,590", "M510,280 Q530,400 555,500", "M90,280 Q70,400 45,500"],
    logo=(375, 300), accent=["M520,300 L540,400 L528,404 L508,304 Z", "M80,300 L60,400 L72,404 L92,304 Z"],
)
G["leggings"] = dict(
    body="M190,60 L410,60 L415,110 Q440,350 450,660 L370,665 Q345,400 305,240 L295,240 Q255,400 230,665 L150,660 Q160,350 185,110 Z",
    back="M190,60 L410,60 L415,110 Q440,350 450,660 L370,665 Q345,400 305,240 L295,240 Q255,400 230,665 L150,660 Q160,350 185,110 Z",
    rib=["M190,60 L410,60 L415,110 L185,110 Z"],
    stitches=["M300,110 L300,240", "M185,110 Q300,125 415,110", "M160,640 L230,645", "M370,645 L448,640"],
    folds=["M240,300 Q250,450 215,600", "M360,300 Q350,450 385,600"],
    logo=(390, 150), accent=["M415,110 Q440,350 450,660 L436,661 Q428,350 403,112 Z", "M185,110 Q160,350 150,660 L164,661 Q172,350 197,112 Z"],
)
G["shorts"] = dict(
    body="M170,130 L430,130 L438,180 Q460,330 482,450 L322,472 L300,338 L278,472 L118,450 Q140,330 162,180 Z",
    back="M170,130 L430,130 L438,180 Q460,330 482,450 L322,472 L300,338 L278,472 L118,450 Q140,330 162,180 Z",
    rib=["M170,130 L430,130 L438,180 L162,180 Z"],
    strings=[("M290,180 Q280,230 268,262", (266, 268)), ("M310,180 Q320,230 332,262", (334, 268))],
    stitches=["M300,180 L300,338", "M124,425 L280,448", "M320,448 L476,425"],
    folds=["M210,250 Q225,350 200,430", "M390,250 Q375,350 400,430"],
    logo=(395, 410), accent=["M455,330 Q470,390 482,450 L462,453 Z", "M145,330 Q130,390 118,450 L138,453 Z"],
)
G["joggers"] = dict(
    body="M180,60 L420,60 L428,115 Q465,380 455,620 L455,665 L360,665 L360,620 Q340,400 303,250 L297,250 Q260,400 240,620 L240,665 L145,665 L145,620 Q135,380 172,115 Z",
    back="M180,60 L420,60 L428,115 Q465,380 455,620 L455,665 L360,665 L360,620 Q340,400 303,250 L297,250 Q260,400 240,620 L240,665 L145,665 L145,620 Q135,380 172,115 Z",
    rib=["M180,60 L420,60 L428,115 L172,115 Z", "M145,620 L240,620 L240,665 L145,665 Z", "M360,620 L455,620 L455,665 L360,665 Z"],
    strings=[("M292,115 Q285,170 276,205", (274, 211)), ("M308,115 Q315,170 324,205", (326, 211))],
    stitches=["M300,115 L300,250", "M178,140 Q215,175 225,230", "M422,140 Q385,175 375,230"],
    folds=["M230,300 Q250,450 210,580", "M370,300 Q350,450 390,580", "M200,420 Q215,470 200,520"],
    logo=(220, 330), accent=["M428,115 Q465,380 455,620 L442,620 Q452,380 416,117 Z"],
)
G["bra"] = dict(
    body="M150,250 Q200,200 225,110 L265,110 Q275,250 300,275 Q325,250 335,110 L375,110 Q400,200 450,250 Q470,400 455,520 L145,520 Q130,400 150,250 Z",
    back="M150,250 Q200,200 225,110 L265,110 Q290,200 300,205 Q310,200 335,110 L375,110 Q400,200 450,250 Q470,400 455,520 L145,520 Q130,400 150,250 Z",
    rib=["M147,460 L453,460 L455,520 L145,520 Z"],
    stitches=["M175,300 Q235,380 300,330 Q365,380 425,300", "M147,460 L453,460"],
    folds=["M200,320 Q240,380 260,420", "M400,320 Q360,380 340,420"],
    logo=(300, 490), accent=["M225,110 L265,110 L262,140 L222,140 Z", "M335,110 L375,110 L378,140 L338,140 Z"],
    logo_light=True,
)
G["cap"] = dict(
    body="M140,400 Q132,170 300,158 Q468,170 460,400 Q300,425 140,400 Z",
    back="M140,400 Q132,170 300,158 Q468,170 460,400 Q300,425 140,400 Z",
    brim="M140,392 Q300,428 460,392 Q492,440 440,468 Q300,505 160,468 Q108,440 140,392 Z",
    stitches=["M300,162 Q240,260 225,405", "M300,162 Q360,260 375,405", "M300,162 L300,412", "M150,385 Q300,410 450,385"],
    folds=["M200,220 Q180,300 190,380", "M410,220 Q430,300 410,380"],
    button=(300, 160), eyelets=[(220, 230), (380, 230)],
    logo=(300, 320), logo_scale=1.6, accent=[],
)
G["backpack"] = dict(
    under="M190,110 Q140,120 130,220 L130,560 L150,560 L150,220 Q160,140 205,130 Z M410,110 Q460,120 470,220 L470,560 L450,560 L450,220 Q440,140 395,130 Z",
    body="M170,130 Q170,82 215,82 L385,82 Q430,82 430,130 L442,598 Q442,642 398,642 L202,642 Q158,642 158,598 Z",
    back="M170,130 Q170,82 215,82 L385,82 Q430,82 430,130 L442,598 Q442,642 398,642 L202,642 Q158,642 158,598 Z",
    handle="M265,84 Q265,40 300,40 Q335,40 335,84",
    pocketr="M205,375 Q205,355 225,355 L375,355 Q395,355 395,375 L400,580 Q400,605 375,605 L225,605 Q200,605 200,580 Z",
    stitches=["M180,140 Q300,105 420,140", "M210,370 Q300,345 390,370"],
    folds=["M200,180 Q190,280 200,340", "M400,180 Q410,280 400,340"],
    logo=(300, 470), logo_scale=1.4, accent=["M168,250 L432,250 L433,268 L167,268 Z"],
)
G["socks"] = dict(sock=True,
    body="M260,80 L360,80 L362,420 Q365,470 410,500 L500,545 Q545,570 525,615 Q505,650 455,630 L300,555 Q255,530 258,470 Z",
    rib=["M260,80 L360,80 L360,140 L260,140 Z"],
    heel="M258,470 Q255,530 300,555 L318,522 Q290,505 292,465 Z",
    toe="M480,535 L500,545 Q545,570 525,615 Q505,650 455,630 L470,590 Q490,560 480,535 Z",
    stitches=["M260,140 L360,140"], folds=["M290,200 Q300,320 285,420"],
    logo=(310, 260), accent=["M260,155 L360,155 L360,168 L260,168 Z", "M260,178 L360,178 L360,191 L260,191 Z"],
)

DEFS = """
<defs>
 <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
  <rect width="6" height="6" fill="none"/><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-width="1.2" opacity=".5"/>
 </pattern>
 <linearGradient id="light" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
  <stop offset="1" stop-color="#000" stop-opacity=".28"/>
 </linearGradient>
 <filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
 <filter id="drop" x="-30%" y="-30%" width="160%" height="170%">
  <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#0a1033" flood-opacity=".22"/>
 </filter>
</defs>"""

def pulse_mark_small(x, y, color, s=1.0):
    return (f'<path d="{PULSE}" transform="translate({x - 35 * s},{y - 15 * s}) scale({s * 1.0}) scale(1,.75)" fill="none" '
            f'stroke="{color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>')

def garment_svg(key, base, accent, view="front", detail=False):
    g = G[key]
    dark = lum(base) < 0.45
    d_body = g["body"] if view == "front" else g["back"]
    shade_d, shade_l = shade(base, -0.28), shade(base, 0.18)
    stitch = shade(base, 0.35) if dark else shade(base, -0.35)
    out = []
    out.append(DEFS)
    cid = f"clip-{key}"
    out.append(f'<clipPath id="{cid}"><path d="{d_body}"/></clipPath>')
    if g.get("under"):
        out.append(f'<path d="{g["under"]}" fill="{shade_d}"/>')
    if g.get("brim"):
        out.append(f'<path d="{g["brim"]}" fill="{shade(base, -0.12)}"/>')
        out.append(f'<path d="{g["brim"]}" fill="url(#light)"/>')
    out.append(f'<g filter="url(#drop)"><path d="{d_body}" fill="{base}"/></g>')
    inner = [f'<g clip-path="url(#{cid})">']
    for a in g.get("accent", []):
        inner.append(f'<path d="{a}" fill="{accent}"/>')
    if g.get("yoke"):
        inner.append(f'<path d="{g["yoke"]}" fill="{accent}"/>')
    for r in g.get("rib", []):
        inner.append(f'<path d="{r}" fill="{shade(base, -0.12)}"/>')
        inner.append(f'<path d="{r}" fill="url(#weave)" opacity=".35"/>')
    if g.get("heel"):
        inner.append(f'<path d="{g["heel"]}" fill="{accent}"/><path d="{g["toe"]}" fill="{accent}"/>')
    for f in g.get("folds", []):
        inner.append(f'<path d="{f}" stroke="#fff" stroke-opacity=".13" stroke-width="34" fill="none" filter="url(#blur10)"/>')
        inner.append(f'<path d="{f}" transform="translate(26,4)" stroke="#000" stroke-opacity=".12" stroke-width="26" fill="none" filter="url(#blur10)"/>')
    inner.append(f'<rect width="600" height="700" fill="url(#weave)" opacity="{0.07 if dark else 0.05}"/>')
    inner.append(f'<rect width="600" height="700" fill="url(#light)"/>')
    inner.append("</g>")
    out += inner
    if view == "front" and g.get("inner"):
        out.append(f'<path d="{g["inner"]}" fill="{shade(base, -0.4)}"/>')
    if view == "front" and g.get("collar"):
        out.append(f'<path d="{g["collar"]}" fill="none" stroke="{shade(base, -0.15)}" stroke-width="14" stroke-linecap="round"/>')
    if g.get("collarband"):
        out.append(f'<path d="{g["collarband"]}" fill="{shade(base, -0.1)}"/><path d="{g["collarband"]}" fill="url(#light)"/>')
    if g.get("pocket") and view == "front":
        out.append(f'<path d="{g["pocket"]}" fill="{shade(base, -0.06)}" stroke="{stitch}" stroke-width="2" stroke-dasharray="7 6"/>')
    if g.get("pocketr") and view == "front":
        out.append(f'<path d="{g["pocketr"]}" fill="{shade(base, -0.08)}"/><path d="{g["pocketr"]}" fill="url(#light)"/>'
                   f'<path d="M215,372 Q300,350 385,372" stroke="{shade(base,-0.45)}" stroke-width="5" fill="none"/>')
    if g.get("handle"):
        out.append(f'<path d="{g["handle"]}" fill="none" stroke="{shade(base, -0.3)}" stroke-width="14" stroke-linecap="round"/>')
    for s in g.get("stitches", []):
        out.append(f'<path d="{s}" fill="none" stroke="{stitch}" stroke-opacity=".7" stroke-width="2" stroke-dasharray="7 6"/>')
    if g.get("zipper"):
        if view == "front":
            out.append(f'<path d="{g["zipper"]}" stroke="{shade(base,-0.45)}" stroke-width="9"/>'
                       f'<path d="{g["zipper"]}" stroke="{shade(base,0.3) if dark else shade(base,-0.2)}" stroke-width="5" stroke-dasharray="2 3"/>'
                       f'<rect x="293" y="108" width="14" height="30" rx="4" fill="{accent}"/>')
    for sd, end in (g.get("strings", []) if view == "front" else []):
        out.append(f'<path d="{sd}" fill="none" stroke="{accent}" stroke-width="7" stroke-linecap="round"/>'
                   f'<rect x="{end[0]-5}" y="{end[1]-10}" width="10" height="20" rx="3" fill="{shade(accent,-0.3)}"/>')
    if g.get("button"):
        bx, by = g["button"]
        out.append(f'<circle cx="{bx}" cy="{by}" r="11" fill="{shade(base,-0.2)}"/>')
    for ex, ey in g.get("eyelets", []):
        out.append(f'<circle cx="{ex}" cy="{ey}" r="5" fill="{shade(base,-0.4)}"/>')
    # Logo / estampado
    logo_col = accent if abs(lum(accent) - lum(base)) > 0.25 else ("#FFFFFF" if dark else COLORS["tinta"][1])
    if view == "front":
        lx, ly = g["logo"]
        s = g.get("logo_scale", 0.7)
        out.append(pulse_mark_small(lx, ly, logo_col, s))
    else:
        if key in ("tee", "longsleeve", "hoodie", "jacket", "tank"):
            by = 320 if key == "jacket" else 210
            out.append(wordmark_group(logo_col, 300 - WORD_W * 0.55, by, 0.95, 10))
            out.append(f'<path d="{PULSE}" transform="translate(230,{by + 90}) scale(2,1.2)" fill="none" stroke="{logo_col}" stroke-width="4" stroke-linecap="round"/>')
        elif key in ("leggings", "joggers", "shorts"):
            out.append(f'<g transform="translate(300,{90 if key!="shorts" else 158})">' +
                       wordmark_group(logo_col, -WORD_W * 0.22, -12, 0.42, 9) + "</g>")
        else:
            lx, ly = g["logo"]
            out.append(pulse_mark_small(lx, ly, logo_col, g.get("logo_scale", 0.55)))
    body = "".join(out)
    vb = "0 0 600 700"
    if detail:
        lx, ly = g["logo"]
        vb = f"{max(0, lx - 130)} {max(0, ly - 150)} 260 300"
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{body}</svg>'

import re
_FLAT_RE = re.compile(r'<(?:path|rect)[^>]*(?:url\(#light\)|url\(#weave\)|url\(#blur10\))[^>]*/>')

def flatten(svg):
    """Quita sombreados ilustrados: deja solo color base, paneles, costuras y estampados."""
    return _FLAT_RE.sub("", svg).replace(' filter="url(#drop)"', "")

def socks_svg(base, accent, view="front", detail=False):
    one = garment_svg("socks", base, accent).split(">", 1)[1].rsplit("</svg>", 1)[0]
    two = garment_svg("socks", shade(base, -0.15 if lum(base) > 0.4 else 0.15), accent).split(">", 1)[1].rsplit("</svg>", 1)[0]
    vb = "0 0 600 700" if not detail else "180 120 300 340"
    if view == "back":
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><g transform="translate(560,40) scale(-1,1)">{one}</g></svg>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">'
            f'<g transform="translate(-40,30) rotate(-8 300 350) scale(.92)">{two}</g>'
            f'<g transform="translate(40,10) rotate(4 300 350) scale(.92)">{one}</g></svg>')

# ---------- Catálogo ----------
CATALOG = [
    dict(id="playera-ritmo", g="tee", colors=[("tinta", "senal"), ("cobalto", "cal"), ("cal", "pista")]),
    dict(id="tank-sprint", g="tank", colors=[("pista", "cal"), ("cal", "cobalto"), ("grafito", "senal")]),
    dict(id="hoodie-altitud", g="hoodie", colors=[("cobalto", "senal"), ("grafito", "pista"), ("hielo", "tinta")]),
    dict(id="rompevientos-viento-norte", g="jacket", colors=[("tinta", "pista"), ("senal", "tinta"), ("musgo", "cal")]),
    dict(id="leggings-kinesis", g="leggings", colors=[("tinta", "cobalto"), ("musgo", "senal"), ("pista", "tinta")]),
    dict(id="short-zancada", g="shorts", colors=[("cobalto", "senal"), ("tinta", "pista"), ("cal", "cobalto")]),
    dict(id="jogger-transito", g="joggers", colors=[("grafito", "senal"), ("tinta", "cobalto"), ("hielo", "tinta")]),
    dict(id="top-impulso", g="bra", colors=[("pista", "cal"), ("hielo", "cobalto"), ("tinta", "senal")]),
    dict(id="gorra-cadencia", g="cap", colors=[("cal", "cobalto"), ("tinta", "senal"), ("pista", "cal")]),
    dict(id="calcetas-kilometro", g="socks", colors=[("cal", "cobalto"), ("tinta", "pista"), ("senal", "tinta")]),
    dict(id="mochila-ruta-42", g="backpack", colors=[("tinta", "senal"), ("grafito", "pista"), ("cobalto", "cal")]),
    dict(id="manga-larga-umbral", g="longsleeve", colors=[("senal", "tinta"), ("cobalto", "senal"), ("grafito", "hielo")]),
]

def main():
    flat = "--flat" in sys.argv
    brand_assets()
    count = 0
    for p in CATALOG:
        for (bc, ac) in p["colors"]:
            base, acc = COLORS[bc][1], COLORS[ac][1]
            for view, det in (("front", False), ("back", False), ("detail", True)):
                v = "front" if view == "detail" else view
                if p["g"] == "socks":
                    svg = socks_svg(base, acc, v, det)
                else:
                    svg = garment_svg(p["g"], base, acc, v, det)
                if flat:
                    if view == "detail":
                        continue
                    svg = flatten(svg)
                write(f"{PROD}/{p['id']}--{bc}--{view}.svg", svg)
                count += 1
    print("product images:", count)

if __name__ == "__main__":
    main()
