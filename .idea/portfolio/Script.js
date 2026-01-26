/* =========================
   SITE INTERACTIVITY
   - Active nav highlighting
   - Mobile menu toggle
   - Accordion (Experience page)
   - Back-to-top button
   ========================= */

(function () {
    "use strict";

    /* =========================
       ACTIVE NAV LINK
       ========================= */
    const currentPage =
        (location.pathname.split("/").pop() || "index.html")
            .split("?")[0]
            .replace(".html", "")
            .toLowerCase() || "index";

    document.querySelectorAll("[data-nav]").forEach((link) => {
        const href = (link.getAttribute("href") || "")
            .split("?")[0]
            .replace(".html", "")
            .toLowerCase();

        if (href === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });

    /* =========================
       MOBILE MENU
       ========================= */
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });

        // Optional UX: close the menu after clicking a link on mobile
        navLinks.addEventListener("click", (e) => {
            if (e.target && e.target.matches("a")) navLinks.classList.remove("open");
        });
    }

    /* =========================
       BACK TO TOP BUTTON
       ========================= */
    const toTop = document.getElementById("toTop");

    if (toTop) {
        const handleScroll = () => {
            toTop.classList.toggle("show", window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
    }

    /* =========================
       ACCORDION (Experience page)
       ========================= */
    const accordionButtons = document.querySelectorAll(".acc-btn");

    if (accordionButtons.length) {
        accordionButtons.forEach((btn) => {
            btn.addEventListener("click", () => toggleAccordion(btn));
        });

        window.addEventListener(
            "resize",
            () => {
                document.querySelectorAll(".acc-item.open .acc-panel").forEach((panel) => {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                });
            },
            { passive: true }
        );
    }

    function toggleAccordion(btn) {
        const item = btn.closest(".acc-item");
        if (!item) return;

        // Close others
        document.querySelectorAll(".acc-item.open").forEach((openItem) => {
            if (openItem !== item) collapse(openItem);
        });

        item.classList.contains("open") ? collapse(item) : expand(item);
    }

    function expand(item) {
        const btn = item.querySelector(".acc-btn");
        const panel = item.querySelector(".acc-panel");

        item.classList.add("open");
        btn?.setAttribute("aria-expanded", "true");

        if (panel) {
            panel.style.maxHeight = "0px";
            requestAnimationFrame(() => {
                panel.style.maxHeight = panel.scrollHeight + "px";
            });
        }
    }

    function collapse(item) {
        const btn = item.querySelector(".acc-btn");
        const panel = item.querySelector(".acc-panel");

        item.classList.remove("open");
        btn?.setAttribute("aria-expanded", "false");
        if (panel) panel.style.maxHeight = "0px";
    }
})();
