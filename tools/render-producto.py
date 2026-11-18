"""Render fotorrealista de producto a partir de las siluetas planas de PULSO.

Toma cada SVG plano (color, paneles, costuras y estampados), lo convierte en una
prenda con volumen (efecto maniquí invisible), textura de tejido, arrugas,
iluminación de estudio y sombra suave. Exporta WebP con transparencia.

Uso: python3 tools/render-producto.py CARPETA_SVG_PLANOS CARPETA_SALIDA [filtro]
"""
import os, sys, subprocess, hashlib, io
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC, OUT = sys.argv[1], sys.argv[2]
FILT = sys.argv[3] if len(sys.argv) > 3 else ""
W, H = 1200, 1400          # resolución de trabajo
OW, OH = 900, 1050         # resolución final
os.makedirs(OUT, exist_ok=True)

# Detalle (zoom al logo) por tipo de prenda, en coordenadas 600x700
LOGO = {
    "playera-ritmo": (370, 200), "tank-sprint": (360, 230), "manga-larga-umbral": (372, 205),
    "hoodie-altitud": (372, 225), "rompevientos-viento-norte": (375, 300), "leggings-kinesis": (390, 150),
    "short-zancada": (395, 410), "jogger-transito": (220, 330), "top-impulso": (300, 490),
    "gorra-cadencia": (300, 320), "mochila-ruta-42": (300, 470), "calcetas-kilometro": (310, 280),
}
# Rigidez del material: tejidos de punto se arrugan más que una mochila
SOFT = {"mochila-ruta-42": 0.35, "gorra-cadencia": 0.5, "rompevientos-viento-norte": 1.25}
SHEEN = {"rompevientos-viento-norte": 0.16, "leggings-kinesis": 0.10, "top-impulso": 0.08, "mochila-ruta-42": 0.07}


def raster(svg_path):
    png = subprocess.run(["rsvg-convert", "-w", str(W), "-h", str(H), svg_path], capture_output=True, check=True).stdout
    return np.asarray(Image.open(io.BytesIO(png)).convert("RGBA")).astype(np.float32) / 255.0


def noise(shape, sigma, seed, aniso=None):
    rng = np.random.default_rng(seed)
    n = rng.standard_normal(shape).astype(np.float32)
    n = ndi.gaussian_filter(n, aniso if aniso else sigma)
    n -= n.mean(); n /= (n.std() + 1e-6)
    return n


def render(path, name):
    pid = name.split("--")[0]
    seed = int(hashlib.md5(name.split("--")[0].encode() + name.split("--")[2].encode()).hexdigest()[:8], 16)
    img = raster(path)
    rgb, a = img[..., :3], img[..., 3]
    m = a > 0.5
    soft = SOFT.get(pid, 1.0)

    # --- Altura: volumen desde el borde + arrugas ---
    dist = ndi.distance_transform_edt(m).astype(np.float32)
    D = 140.0
    body = np.sqrt(np.clip(dist / D, 0, 1))
    folds = 0.055 * noise(m.shape, 0, seed, aniso=(150, 45)) + 0.045 * noise(m.shape, 110, seed + 1)
    wrink = 0.006 * noise(m.shape, 0, seed + 2, aniso=(26, 8))
    hgt = body * 1.0 + soft * (folds + wrink) * np.clip(dist / 30, 0, 1)
    # Pliegues en uniones de paneles y costuras (cambios de color del albedo)
    lum = rgb @ np.array([0.3, 0.59, 0.11], np.float32)
    lb = ndi.gaussian_filter(lum, 1.2)
    edge = np.hypot(ndi.sobel(lb, 0), ndi.sobel(lb, 1))
    edge = ndi.gaussian_filter(np.clip(edge * 3, 0, 1), 2.5)
    hgt -= 0.10 * edge
    hgt = ndi.gaussian_filter(hgt, 2.5)

    # --- Normales e iluminación de estudio ---
    S = 42.0
    gy, gx = np.gradient(hgt)
    nx, ny, nz = -gx * S, -gy * S, np.ones_like(hgt)
    nl = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    nx, ny, nz = nx / nl, ny / nl, nz / nl
    L = np.array([-0.45, -0.65, 0.95]); L /= np.linalg.norm(L)
    diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    fill = np.clip(nx * 0.6 + ny * 0.2 + nz * 0.8, 0, 1)            # luz de relleno desde la derecha
    Hv = L + np.array([0, 0, 1.0]); Hv /= np.linalg.norm(Hv)
    spec = np.clip(nx * Hv[0] + ny * Hv[1] + nz * Hv[2], 0, 1) ** 28

    # Oclusión ambiental: cavidades y bordes
    cav = hgt - ndi.gaussian_filter(hgt, 18)
    ao = np.clip(1 + 1.6 * cav, 0.55, 1.15) * (0.82 + 0.18 * np.clip(dist / 25, 0, 1))

    # --- Textura de tejido ---
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    knit = np.sin(xx * 2 * np.pi / 4.0) * np.sin(yy * 2 * np.pi / 5.0)
    grain = noise(m.shape, 0.8, seed + 3)
    heather = noise(m.shape, 2.5, seed + 4)
    tex = 1 + 0.035 * knit + 0.025 * grain + 0.02 * heather
    if pid == "mochila-ruta-42":   # cordura: trama más marcada
        tex = 1 + 0.07 * np.sign(np.sin(xx * 2 * np.pi / 6) * np.sin(yy * 2 * np.pi / 6)) + 0.03 * grain

    alb = np.power(np.clip(rgb, 0, 1), 2.2) * tex[..., None]
    shade = (0.30 + 0.78 * diff + 0.14 * fill) * ao
    col = alb * shade[..., None] + (SHEEN.get(pid, 0.035) * spec)[..., None]
    # Gradación tipo foto: leve viñeta interna y tono cálido en altas luces
    col *= (1.0 - 0.10 * np.clip((yy / H - 0.15), 0, 1))[..., None]
    col = np.power(np.clip(col, 0, 1), 1 / 2.2)
    col = np.clip(col * np.array([1.0, 0.995, 0.985], np.float32), 0, 1)

    # --- Sombra de contacto y ambiental ---
    sh1 = ndi.shift(a, (34, 10), order=1)
    sh = 0.30 * ndi.gaussian_filter(sh1, 28) + 0.18 * ndi.gaussian_filter(ndi.shift(a, (12, 4), order=1), 8)
    sh = np.clip(sh, 0, 0.5)
    out_a = a + sh * (1 - a)
    out_rgb = np.where(out_a[..., None] > 1e-4, (col * a[..., None]) / np.maximum(out_a[..., None], 1e-4), 0)
    rgba = np.dstack([np.clip(out_rgb, 0, 1), out_a])
    im = Image.fromarray((rgba * 255).astype(np.uint8), "RGBA")
    front = im.resize((OW, OH), Image.LANCZOS)
    return im, front


def main():
    files = sorted(f for f in os.listdir(SRC) if f.endswith(".svg") and FILT in f)
    for f in files:
        name = f[:-4]
        full, out = render(os.path.join(SRC, f), name)
        out.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=84, method=6)
        if name.endswith("--front"):
            pid = name.split("--")[0]
            lx, ly = LOGO[pid]
            sx = W / 600
            cw, ch = 280 * sx, 327 * sx
            x0 = int(np.clip(lx * sx - cw / 2, 0, W - cw)); y0 = int(np.clip(ly * sx - ch * 0.45, 0, H - ch))
            det = full.crop((x0, y0, int(x0 + cw), int(y0 + ch))).resize((OW, OH), Image.LANCZOS)
            det.save(os.path.join(OUT, name.replace("--front", "--detail") + ".webp"), "WEBP", quality=84, method=6)
        print("ok", name, flush=True)


if __name__ == "__main__":
    main()
