/* ============================================================
   エンポート 利用者獲得LP — main.js
   ・スクロールリビール（IntersectionObserver + 二重rAF）
   ・ヒーロー動画のごく控えめなパララックス
   ・ヘッダーの背景切り替え／モバイルメニュー
   ・写真プレースホルダーの読み込みフォールバック
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- スクロールリビール ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-stagger")
  );

  var showReveal = function (el) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add("is-visible");
      });
    });
  };

  if (prefersReduced || revealEls.length === 0) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            showReveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { showReveal(el); });
  }

  /* ---------- ヒーロー登場演出 ---------- */
  var hero = document.querySelector(".hero");
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("is-ready");
      });
    });
  }

  /* ---------- ヒーロー背景の控えめなパララックス ---------- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia && !prefersReduced) {
    var ticking = false;
    var updateParallax = function () {
      var shift = Math.min(window.scrollY * 0.1, 50); // 動かしすぎない上限
      heroMedia.style.setProperty("--parallax", shift + "px");
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- ヘッダー：スクロールで背景を切り替え ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var toggleHeader = function () {
      if (window.scrollY > 40) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    toggleHeader();
    window.addEventListener("scroll", toggleHeader, { passive: true });
  }

  /* ---------- モバイルメニュー ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  var body = document.body;
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 写真プレースホルダーの読み込み処理 ---------- */
  document.querySelectorAll(".photo-frame img[data-src]").forEach(function (img) {
    var src = img.getAttribute("data-src");
    var probe = new Image();
    probe.onload = function () {
      img.src = src;
      img.classList.add("is-loaded");
      var label = img.nextElementSibling;
      if (label && label.classList.contains("photo-label")) {
        label.style.display = "none";
      }
    };
    probe.onerror = function () {
      /* 画像未設置のときはプレースホルダー（背景パターン＋ラベル）のまま */
    };
    probe.src = src;
  });
})();
