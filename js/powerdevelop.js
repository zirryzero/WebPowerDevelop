(() => {
  const STORAGE_KEY = "pd_lang";
  const SUPPORTED_LANGS = new Set(["es", "en"]);
  const vars = { year: String(new Date().getFullYear()) };

  const resolveKey = (dictionary, keyPath) => {
    const parts = String(keyPath).split(".").filter(Boolean);
    let value = dictionary;
    for (const part of parts) {
      if (!value || typeof value !== "object" || !(part in value)) return null;
      value = value[part];
    }
    return typeof value === "string" ? value : null;
  };

  const interpolate = (template) =>
    String(template).replaceAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => (name in vars ? vars[name] : ""));

  const applyTranslations = (dictionary) => {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      if (!key) return;
      const value = resolveKey(dictionary, key);
      if (value == null) return;
      element.textContent = interpolate(value);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      const spec = element.getAttribute("data-i18n-attr");
      if (!spec) return;
      spec
        .split(/[;,]/g)
        .map((chunk) => chunk.trim())
        .filter(Boolean)
        .forEach((chunk) => {
          const splitIndex = chunk.indexOf(":");
          if (splitIndex === -1) return;
          const attr = chunk.slice(0, splitIndex).trim();
          const key = chunk.slice(splitIndex + 1).trim();
          if (!attr || !key) return;
          const value = resolveKey(dictionary, key);
          if (value == null) return;
          element.setAttribute(attr, interpolate(value));
        });
    });
  };

  const normalizeLang = (input) => {
    const raw = String(input || "").toLowerCase();
    const short = raw.split("-")[0];
    return SUPPORTED_LANGS.has(short) ? short : "es";
  };

  const detectLang = () => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeLang(saved);
    } catch {
      // ignore
    }

    const candidates = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const lang of candidates) {
      const normalized = normalizeLang(lang);
      if (SUPPORTED_LANGS.has(normalized)) return normalized;
    }
    return "es";
  };

  const loadDictionary = async (lang) => {
    const response = await fetch(`idiomas/${lang}/textos.json`, { cache: "no-store" });
    if (!response.ok) throw new Error(`i18n load failed: ${response.status}`);
    return response.json();
  };

  const setActiveLangButtons = (lang) => {
    document.querySelectorAll("[data-set-lang]").forEach((button) => {
      const buttonLang = button.getAttribute("data-set-lang");
      const active = buttonLang === lang;
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const setLanguage = async (lang, { persist } = { persist: true }) => {
    const normalized = normalizeLang(lang);
    try {
      const dictionary = await loadDictionary(normalized);
      applyTranslations(dictionary);
      document.documentElement.lang = normalized;
      setActiveLangButtons(normalized);

      if (persist) {
        try {
          window.localStorage.setItem(STORAGE_KEY, normalized);
        } catch {
          // ignore
        }
      }
    } catch (error) {
      console.warn("[PowerDevelop] i18n error:", error);
    }
  };

  document.querySelectorAll("[data-set-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.getAttribute("data-set-lang")));
  });

  setLanguage(detectLang(), { persist: false });

  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("site-nav");

  if (!header || !toggle || !nav) return;

  const setOpen = (isOpen) => {
    header.classList.toggle("is-nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  const isOpen = () => header.classList.contains("is-nav-open");

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  nav.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (!isOpen()) return;
    if (!header.contains(target)) setOpen(false);
  });

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 861px)").matches) setOpen(false);
  });
})();
