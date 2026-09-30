import qrcode
from PIL import Image, ImageDraw, ImageFont

# =========================
# НАСТРОЙКИ
# =========================

URL = "https://kazan-stavropol.ru/"   # <-- сюда вставь свой сайт

OUTPUT = "qr_kazan.png"

# Цвета в стиле вывески
ORANGE = (255, 105, 0)
DARK = (25, 25, 25)
WHITE = (255, 255, 255)

# Размер изображения
SIZE = 1000

# =========================
# СОЗДАЁМ QR
# =========================

qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=1,
    border=4
)

qr.add_data(URL)
qr.make(fit=True)

matrix = qr.get_matrix()

# Размер одного квадратика
qr_size = len(matrix)
margin = 70
available = SIZE - margin * 2
cell = available // qr_size

# Фактический размер QR
qr_pixels = qr_size * cell

# Холст
img = Image.new("RGB", (SIZE, SIZE + 180), WHITE)
draw = ImageDraw.Draw(img)

# =========================
# РИСУЕМ QR
# =========================

for y, row in enumerate(matrix):
    for x, value in enumerate(row):
        if value:
            left = margin + x * cell
            top = margin + y * cell
            right = left + cell
            bottom = top + cell

            # Закруглённые модули
            radius = max(2, cell // 4)

            draw.rounded_rectangle(
                (left, top, right, bottom),
                radius=radius,
                fill=ORANGE
            )

# =========================
# БЕЛАЯ ОБЛАСТЬ В ЦЕНТРЕ
# =========================

center_x = SIZE // 2
center_y = margin + qr_pixels // 2

box_w = 300
box_h = 130

draw.rounded_rectangle(
    (
        center_x - box_w // 2,
        center_y - box_h // 2,
        center_x + box_w // 2,
        center_y + box_h // 2
    ),
    radius=35,
    fill=WHITE,
    outline=ORANGE,
    width=8
)

# =========================
# ШРИФТ
# =========================

# Если Arial не найден, можно заменить путь
FONT_PATH = "C:/Windows/Fonts/arialbd.ttf"

font_kazan = ImageFont.truetype(FONT_PATH, 58)
font_bottom = ImageFont.truetype(FONT_PATH, 48)

# =========================
# "КАЗАН" В ЦЕНТРЕ
# =========================

text = "КАЗАН"

bbox = draw.textbbox((0, 0), text, font=font_kazan)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]

draw.text(
    (
        center_x - text_w / 2,
        center_y - text_h / 2 - 5
    ),
    text,
    font=font_kazan,
    fill=DARK
)

# =========================
# НИЖНЯЯ НАДПИСЬ
# =========================

bottom_text = "Веб Сайт"

bbox = draw.textbbox((0, 0), bottom_text, font=font_bottom)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]

draw.text(
    (
        SIZE // 2 - text_w / 2,
        SIZE + 55
    ),
    bottom_text,
    font=font_bottom,
    fill=DARK
)

# =========================
# СОХРАНЕНИЕ
# =========================

img.save(OUTPUT, quality=100)

print(f"Готово! Файл сохранён как: {OUTPUT}")