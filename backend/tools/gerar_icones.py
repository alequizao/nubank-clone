# -*- coding: utf-8 -*-
"""Gera os ícones e o splash do PWA (roxo Nubank + wordmark "nu")."""
from PIL import Image, ImageDraw, ImageFont

ROXO = (130, 10, 209)
BRANCO = (255, 255, 255)
FONTE = "/usr/share/fonts/truetype/lato/Lato-Black.ttf"
BASE = "/www/wwwroot/publishdev.com.br/nubank/assets"


def wordmark(img, cx, cy, altura):
    """Desenha 'nu' em branco, centralizado em (cx, cy) com a altura pedida."""
    d = ImageDraw.Draw(img)
    tam = int(altura * 1.38)
    f = ImageFont.truetype(FONTE, tam)
    x0, y0, x1, y1 = d.textbbox((0, 0), "nu", font=f)
    d.text((cx - (x1 + x0) / 2, cy - (y1 + y0) / 2), "nu", font=f, fill=BRANCO)


def quadrado(lado, margem_logo=0.42, raio=None, fundo=ROXO):
    img = Image.new("RGB", (lado, lado), fundo)
    if raio:
        mask = Image.new("L", (lado, lado), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, lado - 1, lado - 1], raio, fill=255)
        base = Image.new("RGB", (lado, lado), fundo)
        img = Image.composite(base, Image.new("RGB", (lado, lado), fundo), mask)
    wordmark(img, lado / 2, lado / 2, lado * margem_logo)
    return img


quadrado(1024).save(f"{BASE}/icon.png")
quadrado(1024, margem_logo=0.30).save(f"{BASE}/adaptive-icon.png")
quadrado(196).save(f"{BASE}/favicon.png")

splash = Image.new("RGB", (1284, 2778), ROXO)
wordmark(splash, 642, 1389, 300)
splash.save(f"{BASE}/splash.png")

print("Ícones gerados em", BASE)
