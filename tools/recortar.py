"""Separa frente y espalda de cada PNG de ../CAMISETAS y los guarda recortados en assets/prendas.

Las imagenes de origen ya traen transparencia. Cada lado se recorta por su caja
de alfa, se lleva a un alto comun y se guarda como WebP con alfa.
Uso: python -I tools/recortar.py <carpeta_origen> <carpeta_destino>
"""
import sys, json
from pathlib import Path
import numpy as np
from PIL import Image

SRC = Path(sys.argv[1])
DST = Path(sys.argv[2])
DST.mkdir(parents=True, exist_ok=True)

# archivo de origen -> slug
NOMBRES = {
    "Maillot Peñarol Amarillo y Negro_ Frente y Espalda.png": "penarol-retro",
    "Camiseta de fútbol blanca Suárez 9.png": "uruguay-suarez",
    "Camisetas Boca Juniors Frente y Espalda.png": "boca-paredes",
    "Camisetas Real Madrid Valverde Rosa.png": "real-madrid-valverde",
    "Camisetas de fútbol negras con detalles turquesa.png": "noruega-haaland",
    "Camisetas Deportivo frente y espalda.png": "deportivo-gimenez",
    "Camiseta Bayern a rayas, vista frontal y trasera.png": "bayern-buzo",
    "Sudaderas Brasil frente y espalda.png": "brasil-buzo",
    "Chaqueta The North Face_ vista frontal y trasera.png": "north-face-campera",
}

OUT_H = 900  # alto de salida de cada lado
info = {}
for fname, slug in NOMBRES.items():
    im = Image.open(SRC / fname).convert("RGBA")
    a = np.array(im)[:, :, 3]
    # limpiar halo: alfa baja fuera de la prenda
    arr = np.array(im)
    arr[:, :, 3] = np.where(a < 40, 0, a)
    im = Image.fromarray(arr)
    a = arr[:, :, 3]
    w = im.width
    # columna de corte: la columna con menos alfa en el tercio central
    cols = (a > 0).sum(axis=0)
    lo, hi = int(w * 0.38), int(w * 0.62)
    cut = lo + int(np.argmin(cols[lo:hi]))
    info[slug] = {}
    for lado, (x0, x1) in (("frente", (0, cut)), ("espalda", (cut, w))):
        part = im.crop((x0, 0, x1, im.height))
        pa = np.array(part)[:, :, 3]
        ys, xs = np.where(pa > 0)
        box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        part = part.crop(box)
        s = OUT_H / part.height
        part = part.resize((round(part.width * s), OUT_H), Image.LANCZOS)
        out = DST / f"{slug}-{lado}.webp"
        part.save(out, "WEBP", quality=86, method=6)
        info[slug][lado] = [part.width, part.height]
        print(slug, lado, part.size, out.stat().st_size // 1024, "KB")

(DST / "medidas.json").write_text(json.dumps(info, indent=1))
