/* KARAHAN GROUP — site betiği (bağımlılık yok) */
(function () {
  "use strict";

  var WA_NUMBER = "905520928085";
  var GA_ID = ""; // Google Analytics 4 ölçüm kimliği (ör. G-XXXXXXXXXX). Boş bırakılırsa hiçbir analiz betiği yüklenmez.

  /* ---------- Menü ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("primary-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }
  var triggers = document.querySelectorAll(".nav-trigger");
  Array.prototype.forEach.call(triggers, function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.closest(".has-sub");
      var open = !li.classList.contains("is-open");
      li.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    setMenu(false);
    Array.prototype.forEach.call(document.querySelectorAll(".has-sub.is-open"), function (li) {
      li.classList.remove("is-open");
      var b = li.querySelector(".nav-trigger");
      if (b) { b.setAttribute("aria-expanded", "false"); b.focus(); }
    });
  });
  document.addEventListener("click", function (e) {
    Array.prototype.forEach.call(document.querySelectorAll(".has-sub.is-open"), function (li) {
      if (!li.contains(e.target)) {
        li.classList.remove("is-open");
        var b = li.querySelector(".nav-trigger");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    });
  });
  if (nav) {
    Array.prototype.forEach.call(nav.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  window.addEventListener("resize", function () { if (window.innerWidth > 1000) setMenu(false); });
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Formlar ---------- */
  var loadedAt = Date.now();
  var today = new Date();
  var iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");

  function fieldWrap(el) { return el.closest ? el.closest(".field") : el.parentNode; }
  function setError(el, msg) {
    var wrap = fieldWrap(el);
    if (!wrap) return;
    wrap.classList.toggle("has-error", !!msg);
    var err = wrap.querySelector(".error");
    if (err) err.textContent = msg || "";
    if (el.setAttribute) el.setAttribute("aria-invalid", msg ? "true" : "false");
  }
  function cleanPhone(v) { return String(v || "").replace(/[\s().\-]/g, ""); }
  function validPhone(v) {
    var p = cleanPhone(v);
    return /^(\+?90|0)?5\d{9}$/.test(p) || /^(\+?90|0)?[2-4]\d{9}$/.test(p) || /^\+\d{9,15}$/.test(p);
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function validate(form) {
    var ok = true, firstBad = null;
    var fields = form.querySelectorAll("[data-field]");
    Array.prototype.forEach.call(fields, function (el) {
      var msg = "";
      var val = (el.value || "").trim();
      var required = el.hasAttribute("data-required");
      if (el.type === "checkbox") {
        if (required && !el.checked) msg = "Devam etmek için bu kutuyu işaretleyin.";
      } else if (required && !val) {
        msg = "Bu alan zorunludur.";
      } else if (val) {
        if (el.type === "tel" && !validPhone(val)) msg = "Geçerli bir telefon numarası girin (ör. 0552 000 00 00).";
        if (el.type === "email" && !validEmail(val)) msg = "Geçerli bir e-posta adresi girin.";
        if (el.type === "number") {
          var n = Number(val), min = el.min === "" ? null : Number(el.min);
          if (isNaN(n) || (min !== null && n < min)) msg = "Geçerli bir sayı girin.";
        }
        if (el.type === "date" && val < iso) msg = "Geçmiş bir tarih seçilemez.";
      }
      setError(el, msg);
      if (msg) { ok = false; if (!firstBad) firstBad = el; }
    });
    var start = form.querySelector('[data-field][name="baslangic"], [data-field][name="giris"]');
    var end = form.querySelector('[data-field][name="bitis"], [data-field][name="cikis"]');
    if (start && end && start.value && end.value && end.value < start.value) {
      setError(end, "Bitiş tarihi başlangıç tarihinden önce olamaz.");
      ok = false; if (!firstBad) firstBad = end;
    }
    var radios = form.querySelectorAll("[data-radio-group]");
    Array.prototype.forEach.call(radios, function (g) {
      var checked = g.querySelector("input:checked");
      var wrap = g.closest(".field");
      var err = wrap && wrap.querySelector(".error");
      if (g.hasAttribute("data-required") && !checked) {
        if (err) err.textContent = "Bir seçenek belirleyin.";
        ok = false; if (!firstBad) firstBad = g.querySelector("input");
      } else if (err) { err.textContent = ""; }
    });
    if (firstBad && firstBad.focus) firstBad.focus();
    return ok;
  }

  function labelFor(form, el) {
    var id = el.id;
    var lab = id && form.querySelector('label[for="' + id + '"]');
    return lab ? lab.getAttribute("data-label") || lab.textContent.replace("*", "").trim() : el.name;
  }

  function buildMessage(form) {
    var title = form.getAttribute("data-title") || "Talep";
    var lines = ["KARAHAN GROUP — " + title, ""];
    Array.prototype.forEach.call(form.querySelectorAll("[data-field]"), function (el) {
      if (el.type === "checkbox") return;
      var v = (el.value || "").trim();
      if (!v) return;
      if (el.tagName === "SELECT" && el.selectedIndex >= 0) v = el.options[el.selectedIndex].text;
      lines.push(labelFor(form, el) + ": " + v);
    });
    Array.prototype.forEach.call(form.querySelectorAll("[data-radio-group]"), function (g) {
      var c = g.querySelector("input:checked");
      if (c) lines.push(g.getAttribute("data-label") + ": " + c.parentNode.textContent.trim());
    });
    lines.push("", "Bilgilendirme metnini okudum.");
    return lines.join("\n");
  }

  function waUrl(text) { return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); }

  Array.prototype.forEach.call(document.querySelectorAll("form[data-wa-form]"), function (form) {
    var status = form.querySelector(".form-status");
    Array.prototype.forEach.call(form.querySelectorAll('input[type="date"]'), function (d) { d.min = iso; });
    Array.prototype.forEach.call(form.querySelectorAll("[data-field]"), function (el) {
      el.addEventListener("input", function () { if (el.getAttribute("aria-invalid") === "true") setError(el, ""); });
    });
    var pre = new URLSearchParams(window.location.search).get("hizmet");
    var sel = form.querySelector('select[name="hizmet"]');
    if (pre && sel) {
      Array.prototype.forEach.call(sel.options, function (o) { if (o.value === pre) sel.value = pre; });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) { status.hidden = true; status.classList.remove("is-error"); }
      var hp = form.querySelector(".hp input");
      if (hp && hp.value) return; // spam tuzağı
      if (Date.now() - loadedAt < 2500) {
        if (status) { status.hidden = false; status.classList.add("is-error"); status.textContent = "Form çok hızlı gönderildi. Lütfen alanları kontrol edip tekrar deneyin."; }
        return;
      }
      if (!validate(form)) {
        if (status) { status.hidden = false; status.classList.add("is-error"); status.textContent = "Formda eksik veya hatalı alanlar var. Lütfen işaretli alanları düzeltin."; }
        return;
      }
      var url = waUrl(buildMessage(form));
      var w = window.open(url, "_blank");
      if (w) { try { w.opener = null; } catch (err) { /* yoksay */ } }
      if (status) {
        status.hidden = false;
        if (w) {
          status.innerHTML = "WhatsApp açıldı ve talebiniz mesaj olarak hazırlandı. <strong>Talebiniz, mesajı WhatsApp’ta gönderdiğinizde bize ulaşır.</strong> Pencere açılmadıysa <a href=\"" + url + "\" target=\"_blank\" rel=\"noopener\">buraya tıklayın</a>.";
        } else {
          status.classList.add("is-error");
          status.innerHTML = "Tarayıcı WhatsApp penceresini engelledi; talebiniz henüz iletilmedi. <a href=\"" + url + "\" target=\"_blank\" rel=\"noopener\">WhatsApp’ı açmak için tıklayın</a> veya <a href=\"tel:+905520928085\">0552 092 80 85</a> numarasını arayın.";
        }
        status.focus && status.setAttribute("tabindex", "-1");
        status.focus && status.focus();
      }
    });
  });

  /* ---------- Çerez tercihleri ---------- */
  var KEY = "kg-consent-v1";
  var banner = document.getElementById("cookie-banner");
  function readConsent() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function saveConsent(analytics) {
    try { localStorage.setItem(KEY, JSON.stringify({ necessary: true, analytics: !!analytics, at: new Date().toISOString() })); } catch (e) { /* depolama kapalı */ }
    if (banner) banner.hidden = true;
    if (analytics) loadAnalytics();
  }
  function loadAnalytics() {
    if (!GA_ID || window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }
  var current = readConsent();
  if (banner) {
    if (!current) banner.hidden = false;
    else if (current.analytics) loadAnalytics();
    var acc = banner.querySelector("[data-consent-accept]");
    var rej = banner.querySelector("[data-consent-reject]");
    if (acc) acc.addEventListener("click", function () { saveConsent(true); });
    if (rej) rej.addEventListener("click", function () { saveConsent(false); });
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-open-cookies]"), function (b) {
    b.addEventListener("click", function () {
      if (banner) { banner.hidden = false; var first = banner.querySelector("button"); if (first) first.focus(); }
    });
  });
})();
