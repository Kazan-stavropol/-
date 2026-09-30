document.documentElement.classList.replace("no-js", "js");

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ==========================================================
   1. ПЛЕЙСХОЛДЕРЫ ДЛЯ КАРТИНОК
   ========================================================== */

const TONES = {
  coffee: ["#dcc5a2", "#8a6a44"],
  butter: ["#f0e2b9", "#c2a967"],
  olive: ["#cfd6ae", "#5f6b3c"],
  peach: ["#f4d3bd", "#cc8f69"],
  latte: ["#eadfcf", "#a89880"],
  sage: ["#bccab6", "#4f604c"],
  roast: ["#5a4636", "#241b15"]
};

function placeholderFor(img) {
  const w = Number(img.getAttribute("width")) || 800;
  const h = Number(img.getAttribute("height")) || 600;
  const tone = img.dataset.placeholderTone || "latte";
  const label = img.dataset.placeholderLabel || img.alt || "Фото";
  const [a, b] = TONES[tone] || TONES.latte;
  const m = Math.min(w, h);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="1" stop-color="${b}"/>
        </linearGradient>
        <filter id="f">
          <feGaussianBlur stdDeviation="${m / 9}"/>
        </filter>
      </defs>

      <rect width="${w}" height="${h}" fill="url(#g)"/>

      <g filter="url(#f)">
        <circle
          cx="${w * .27}"
          cy="${h * .3}"
          r="${m * .27}"
          fill="#fff"
          opacity=".5"
        />

        <circle
          cx="${w * .75}"
          cy="${h * .72}"
          r="${m * .3}"
          fill="${b}"
          opacity=".7"
        />

        <circle
          cx="${w * .7}"
          cy="${h * .2}"
          r="${m * .16}"
          fill="#fff"
          opacity=".3"
        />
      </g>

      <text
        x="${w * .05}"
        y="${h * .95}"
        font-family="sans-serif"
        font-size="${Math.max(14, m / 26)}"
        fill="#fff"
        fill-opacity=".85"
      >${label}</text>
    </svg>
  `;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function setupImages(root = document) {
  $$("img[data-placeholder-tone]", root).forEach(img => {
    if (img.dataset.fallbackBound) return;

    img.dataset.fallbackBound = "true";

    img.addEventListener(
      "error",
      () => {
        if (img.dataset.fallbackApplied) return;

        img.dataset.fallbackApplied = "true";
        img.src = placeholderFor(img);
      },
      { once: true }
    );
  });
}

setupImages();

/* ==========================================================
   2. HERO VIDEO
   ========================================================== */

const heroVideo = $("#hero video");

if (heroVideo) {
  heroVideo.addEventListener(
    "error",
    () => {
      heroVideo.remove();
    },
    true
  );

  if (heroVideo.play) {
    heroVideo.play().catch(() => {});
  }
}

/* ==========================================================
   3. HEADER / МОБИЛЬНОЕ МЕНЮ
   ========================================================== */

const hdr = $("#hdr");

const setSolidHeader = () => {
  hdr?.classList.toggle(
    "solid",
    window.scrollY > window.innerHeight * 0.6
  );
};

window.addEventListener(
  "scroll",
  setSolidHeader,
  { passive: true }
);

setSolidHeader();

const burger = $("#burger");

const closeMenu = () => {
  document.body.classList.remove("menu-open");
  burger?.setAttribute("aria-expanded", "false");
};

burger?.addEventListener("click", () => {
  const isOpen =
    document.body.classList.toggle("menu-open");

  burger.setAttribute(
    "aria-expanded",
    String(isOpen)
  );
});

$$("[data-close]").forEach(link => {
  link.addEventListener("click", closeMenu);
});

/* ==========================================================
   4. ACTIVE NAV
   ========================================================== */

const navLinks = $$("#nav a");

if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        navLinks.forEach(link => {
          link.classList.toggle(
            "on",
            link.getAttribute("href") ===
              "#" + entry.target.id
          );
        });
      });
    },
    {
      rootMargin: "-45% 0px -50% 0px"
    }
  );

  [
    "about",
    "menu",
    "gallery",
    "video",
    "contacts"
  ].forEach(id => {
    const section = $("#" + id);

    if (section) {
      spy.observe(section);
    }
  });
}

/* ==========================================================
   5. REVEAL-АНИМАЦИИ
   ========================================================== */

if ("IntersectionObserver" in window) {
  const reveal = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("in");
        reveal.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -6% 0px"
    }
  );

  $$("[data-r]").forEach(element => {
    reveal.observe(element);
  });
} else {
  $$("[data-r]").forEach(element => {
    element.classList.add("in");
  });
}

/* ==========================================================
   6. МЕНЮ
   ==========================================================

   ВАЖНО:

   Блюда находятся в index.html внутри:

   <template data-menu-template="breakfasts">
      ...
   </template>

   <template data-menu-template="main">
      ...
   </template>

   и т.д.

   JS здесь только переключает категории.
   ========================================================== */
const buttons = document.querySelectorAll(".category-btn");
const sections = document.querySelectorAll(".menu-section");


buttons.forEach((button) => {

  button.addEventListener("click", () => {

    const target = button.dataset.section;


    // Убираем active со всех кнопок
    buttons.forEach((btn) => {
      btn.classList.remove("active");
    });


    // Убираем active со всех разделов
    sections.forEach((section) => {
      section.classList.remove("active");
    });


    // Активируем выбранную кнопку
    button.classList.add("active");


    // Показываем выбранный раздел
    const targetSection = document.getElementById(target);

    if (targetSection) {
      targetSection.classList.add("active");
    }


    // Возвращаем страницу наверх
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

});

/* ==========================================================
   7. LIGHTBOX — ГАЛЕРЕЯ + ВИДЕО
   ========================================================== */

const lb = $("#lb");
const lbc = $("#lbc");

let mode = "photo";
let currentIndex = 0;
let lastFocus = null;

const galleryImages =
  $$(".gal [data-i]");

const videoCards =
  $$(".vgrid [data-v]");

function getGalleryData() {
  return galleryImages.map(button => {
    const image = $("img", button);

    return {
      src: image?.src || "",
      w:
        Number(
          image?.getAttribute("width")
        ) || 800,
      h:
        Number(
          image?.getAttribute("height")
        ) || 600,
      alt:
        image?.alt || "Фото"
    };
  });
}

function getVideoData() {
  return videoCards.map(card => ({
    title:
      $("h3", card)
        ?.textContent
        .trim() || "Видео",

    src:
      card.dataset.videoSrc || "",

    poster:
      $("img", card)?.src || ""
  }));
}

function showLightboxContent() {
  if (!lbc) return;

  if (mode === "photo") {
    const gallery =
      getGalleryData();

    const item =
      gallery[currentIndex];

    if (!item) return;

    lbc.innerHTML = `
      <figure>
        <img
          src="${item.src}"
          width="${item.w}"
          height="${item.h}"
          alt="${item.alt}"
        >

        <figcaption>
          ${item.alt}
          ·
          ${currentIndex + 1}
          /
          ${gallery.length}
        </figcaption>
      </figure>
    `;

    return;
  }

  const videos =
    getVideoData();

  const video =
    videos[currentIndex];

  if (!video) return;

  if (video.src) {
    lbc.innerHTML = `
      <figure>
        <video
          src="${video.src}"
          controls
          autoplay
          playsinline
          ${
            video.poster
              ? `poster="${video.poster}"`
              : ""
          }
        ></video>

        <figcaption>
          ${video.title}
        </figcaption>
      </figure>
    `;
  } else {
    lbc.innerHTML = `
      <p class="empty">
        Здесь появится видео
        «${video.title}».
        Добавьте путь к видео
        в атрибут
        data-video-src
        соответствующей карточки
        в index.html.
      </p>
    `;
  }
}

function openLightbox(
  type,
  index
) {
  mode = type;
  currentIndex = index;
  lastFocus = document.activeElement;

  showLightboxContent();

  lb?.classList.add("open");

  document.body.style.overflow =
    "hidden";

  $(".x", lb)?.focus();
}

function closeLightbox() {
  lb?.classList.remove("open");

  if (lbc) {
    lbc.innerHTML = "";
  }

  document.body.style.overflow =
    "";

  lastFocus?.focus();
}

function stepLightbox(direction) {
  const length =
    mode === "photo"
      ? getGalleryData().length
      : getVideoData().length;

  if (!length) return;

  currentIndex =
    (
      currentIndex +
      direction +
      length
    ) % length;

  showLightboxContent();
}

galleryImages.forEach(button => {
  button.addEventListener(
    "click",
    () => {
      openLightbox(
        "photo",
        Number(button.dataset.i)
      );
    }
  );
});

videoCards.forEach(button => {
  button.addEventListener(
    "click",
    () => {
      openLightbox(
        "video",
        Number(button.dataset.v)
      );
    }
  );
});

$(".x", lb)?.addEventListener(
  "click",
  closeLightbox
);

$(".pv", lb)?.addEventListener(
  "click",
  () => stepLightbox(-1)
);

$(".nx", lb)?.addEventListener(
  "click",
  () => stepLightbox(1)
);

lb?.addEventListener(
  "click",
  event => {
    if (event.target === lb) {
      closeLightbox();
    }
  }
);

window.addEventListener(
  "keydown",
  event => {
    if (
      !lb?.classList.contains("open")
    ) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      stepLightbox(-1);
    }

    if (event.key === "ArrowRight") {
      stepLightbox(1);
    }
  }
);

/* Свайп на телефоне */

let touchStartX = 0;

lb?.addEventListener(
  "touchstart",
  event => {
    touchStartX =
      event.touches[0].clientX;
  },
  { passive: true }
);

lb?.addEventListener(
  "touchend",
  event => {
    const distance =
      event.changedTouches[0].clientX -
      touchStartX;

    if (Math.abs(distance) > 50) {
      stepLightbox(
        distance > 0 ? -1 : 1
      );
    }
  }
);

/* ==========================================================
   8. БРОНИРОВАНИЕ
   ==========================================================

   Сейчас это всё ещё ДЕМО.

   Форма показывает сообщение,
   но никуда данные не отправляет.
   ========================================================== */

const bookingForm =
  $("#bform");

if (bookingForm) {
  const dateInput =
    bookingForm.elements.date;

  const note =
    $("#bnote");

  if (dateInput) {
    dateInput.min =
      new Date()
        .toISOString()
        .slice(0, 10);
  }

  bookingForm.addEventListener(
    "submit",
    event => {
      event.preventDefault();

      const name =
        bookingForm.elements.name;

      const phone =
        bookingForm.elements.phone;

      const date =
        bookingForm.elements.date;

      if (
        !name.value.trim() ||
        phone.value.replace(/\D/g, "").length < 10 ||
        !date.value
      ) {
        if (note) {
          note.textContent =
            "Укажите имя, телефон и дату.";
        }

        return;
      }

      if (note) {
        note.textContent =
          `Спасибо, ${name.value.trim()}! ` +
          `Заявка принята — мы позвоним ` +
          `для подтверждения.`;
      }

      bookingForm.reset();
    }
  );
}

//Cloud Workflow
const form = document.getElementById("bform");
const note = document.getElementById("bnote");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const button = form.querySelector("button[type='submit']");

  button.disabled = true;
  note.textContent = "Отправляем заявку...";

  const data = Object.fromEntries(
    new FormData(form)
  );

  try {
    const response = await fetch(
      "https://damp-star-20ef.rwgjsrz5pk.workers.dev",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(data)
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Не удалось отправить заявку"
      );
    }

    note.textContent =
      "Заявка отправлена! Мы свяжемся с вами.";

    form.reset();

  } catch (error) {
    console.error(error);

    note.textContent =
      "Не удалось отправить заявку. Попробуйте ещё раз.";

  } finally {
    button.disabled = false;
  }
});