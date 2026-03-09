/* =========================
   SITE INTERACTIVITY (CANONICAL)
   - Active nav highlighting
   - Mobile menu toggle
   - Experience accordion (robust expand/collapse)
   - Back-to-top button
   - Projects: Unity WebGL controls (Load + Fullscreen + Skeleton)
   - Projects: 2 galleries (graphics + animations)
   ========================= */

(function () {
    // --- Active nav link (single-page sections) ---
    const navAnchors = Array.from(document.querySelectorAll("[data-nav]"))
        .filter(a => ((a.getAttribute("href") || "").trim().startsWith("#")));

    const sectionIds = navAnchors
        .map(a => (a.getAttribute("href") || "").trim().slice(1))
        .filter(Boolean);

    const sections = sectionIds
        .map(id => document.getElementById(id))
        .filter(Boolean);

    function setActiveSection(id) {
        navAnchors.forEach(a => {
            const href = (a.getAttribute("href") || "").trim();
            a.classList.toggle("active", href === ("#" + id));
        });
    }

    // Initial state (hash or default to first section)
    const initialHash = (location.hash || "").replace("#", "");
    if (initialHash && sectionIds.includes(initialHash)) setActiveSection(initialHash);
    else if (sectionIds.length) setActiveSection(sectionIds[0]);

    // Scroll-based highlighting (modern portfolio behaviour)
    if (sections.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                // Pick the most visible intersecting section
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visible && visible.target && visible.target.id) {
                    setActiveSection(visible.target.id);
                }
            },
            {
                root: null,
                // Trigger when section is around the middle of the viewport
                rootMargin: "-40% 0px -55% 0px",
                threshold: [0.1, 0.2, 0.35, 0.5, 0.65, 0.8]
            }
        );

        sections.forEach(sec => observer.observe(sec));
    }



    // --- Mobile menu toggle ---
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");
    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
        navLinks.addEventListener("click", (e) => {
            const a = e.target.closest('a[href^="#"]');
            if (a) navLinks.classList.remove("open");
        });
    }

    // --- Back to top ---
    const toTop = document.getElementById("toTop");
    if (toTop) {
        const onScroll = () => {
            if (window.scrollY > 400) toTop.classList.add("show");
            else toTop.classList.remove("show");
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    // --- Scroll fade-in for .card and .tile elements ---
    // Add js-fade to <html> so CSS opacity:0 activates only now (prevents blank page on slow JS)
    const fadeEls = Array.from(document.querySelectorAll(".card, .tile"));
    if ("IntersectionObserver" in window && fadeEls.length) {
        document.documentElement.classList.add("js-fade");
        const fadeObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        fadeObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08 }
        );
        fadeEls.forEach(el => fadeObserver.observe(el));
    } else {
        // Fallback: show all immediately if IntersectionObserver not supported
        fadeEls.forEach(el => el.classList.add("visible"));
    }

    /* =========================
       COMPANY LOGO LINKS — scroll to experience tile + auto-expand first accordion
       ========================= */
    document.querySelectorAll('.company-logo[href^="#"]').forEach((logo) => {
        logo.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = logo.getAttribute("href").slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;

            // Smooth scroll to the tile
            target.scrollIntoView({ behavior: "smooth", block: "start" });

            // Auto-expand the first accordion inside the tile if not already open
            const firstAccItem = target.querySelector(".acc-item");
            if (firstAccItem && !firstAccItem.classList.contains("open")) {
                expand(firstAccItem);
            }
        });
    });

    /* =========================
       COMPANY LOGO LINKS — scroll to experience tile + auto-expand first accordion
       ========================= */
    document.querySelectorAll('.company-logo[href^="#"]').forEach((logo) => {
        logo.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = logo.getAttribute("href").slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            const firstAccItem = target.querySelector(".acc-item");
            if (firstAccItem && !firstAccItem.classList.contains("open")) {
                expand(firstAccItem);
            }
        });
    });

    /* =========================
       ACCORDION (Experience Page)
       ========================= */
    document.querySelectorAll(".acc-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const item = btn.closest(".acc-item");
            if (!item) return;

            document.querySelectorAll(".acc-item.open").forEach((openItem) => {
                if (openItem !== item) collapse(openItem);
            });

            item.classList.contains("open") ? collapse(item) : expand(item);
        });
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

    function expand(item) {
        const btn = item.querySelector(".acc-btn");
        const panel = item.querySelector(".acc-panel");

        item.classList.add("open");
        if (btn) btn.setAttribute("aria-expanded", "true");

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
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (panel) panel.style.maxHeight = "0px";
    }

    /* =========================
       PROJECTS: Unity WebGL embeds
       - Click-to-load overlay
       - Loading skeleton overlay
       - Fullscreen button (wrapper fullscreen)
       ========================= */

    function findEmbedForIframeId(iframeId) {
        const iframe = document.getElementById(iframeId);
        if (!iframe) return null;
        const embed = iframe.closest("[data-unity-embed]");
        if (!embed) return null;
        return { embed, iframe };
    }

    function setOverlay(embed, name, show) {
        const el = embed.querySelector(`[data-unity-overlay="${name}"]`);
        if (!el) return;
        if (show) el.removeAttribute("hidden");
        else el.setAttribute("hidden", "");
    }

    function loadUnityEmbed(iframeId) {
        const found = findEmbedForIframeId(iframeId);
        if (!found) return;

        const { embed, iframe } = found;
        const src = (embed.getAttribute("data-unity-src") || "").trim();
        if (!src) return;

        // Already loaded?
        if (iframe.dataset.loaded === "1") {
            // If somehow overlays are still visible, force-hide loading.
            setOverlay(embed, "loading", false);
            setOverlay(embed, "click", false);
            return;
        }

        // Show loading, hide click overlay
        setOverlay(embed, "click", false);
        setOverlay(embed, "loading", true);

        // Attach listeners BEFORE setting src (prevents race on fast loads)
        const onLoad = () => {
            setOverlay(embed, "loading", false);
            iframe.removeEventListener("load", onLoad);
            iframe.removeEventListener("error", onError);
        };

        const onError = () => {
            // If load fails, stop loading overlay and bring back click overlay
            setOverlay(embed, "loading", false);
            setOverlay(embed, "click", true);
            iframe.dataset.loaded = ""; // allow retry
            iframe.removeEventListener("load", onLoad);
            iframe.removeEventListener("error", onError);
        };

        iframe.addEventListener("load", onLoad, { once: true });
        iframe.addEventListener("error", onError, { once: true });

        // Start load
        iframe.dataset.loaded = "1";
        iframe.src = src;

        // Extra safety: if browser never fires load (rare), auto-hide after 12s
        window.setTimeout(() => {
            // Only hide if still showing loading
            const loadingEl = embed.querySelector('[data-unity-overlay="loading"]');
            if (loadingEl && !loadingEl.hasAttribute("hidden")) {
                setOverlay(embed, "loading", false);
            }
        }, 12000);
    }

    function requestFullscreen(el) {
        const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
        if (req) req.call(el);
    }

    function exitFullscreen() {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
        if (exit) exit.call(document);
    }

    function fullscreenUnityEmbed(iframeId) {
        const found = findEmbedForIframeId(iframeId);
        if (!found) return;

        const { embed, iframe } = found;

        // Load first so fullscreen isn't blank
        if (iframe.dataset.loaded !== "1") loadUnityEmbed(iframeId);

        // Use native browser fullscreen on the wrapper div.
        // The canvas fills the wrapper via CSS (width/height 100%),
        // so this works for all Unity builds without needing postMessage.
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || null;
        if (fsEl === embed) {
            exitFullscreen();
            return;
        }

        requestFullscreen(embed);
    }

    // Button actions: Load / Fullscreen
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-unity-action]");
        if (!btn) return;

        const action = btn.getAttribute("data-unity-action");
        const target = btn.getAttribute("data-unity-target");
        if (!target) return;

        if (action === "load") loadUnityEmbed(target);
        if (action === "fullscreen") fullscreenUnityEmbed(target);
    });

    // Fullscreen styling class + body scroll lock
    function syncFullscreenClass() {
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || null;

        document.querySelectorAll("[data-unity-embed]").forEach((embed) => {
            embed.classList.toggle("is-fullscreen", fsEl === embed);
        });

        document.body.classList.toggle("unity-body-fullscreen", !!fsEl);
    }

    document.addEventListener("fullscreenchange", syncFullscreenClass);
    document.addEventListener("webkitfullscreenchange", syncFullscreenClass);

    // Ensure overlays start visible (click overlay on)
    document.querySelectorAll("[data-unity-embed]").forEach((embed) => {
        setOverlay(embed, "click", true);
        setOverlay(embed, "loading", false);

        const iframe = embed.querySelector("iframe");
        if (iframe) {
            iframe.removeAttribute("src"); // ensures click-to-load behavior
            iframe.dataset.loaded = "";
        }
    });

    /* =========================
       Reusable gallery controller (FIXED COUNTER + SCOPED KEYS)
       - Counter updates immediately
       - Skips missing files safely
       - Keyboard only triggers the last-interacted gallery
       ========================= */
    let activeGalleryKeys = null; // tracks which gallery should receive keyboard events

    function initGallery({ imgId, prevId, nextId, counterId, sources, keyLeft, keyRight }) {
        const img = document.getElementById(imgId);
        const prev = document.getElementById(prevId);
        const next = document.getElementById(nextId);
        const counter = document.getElementById(counterId);

        if (!img || !prev || !next || !counter) return;
        if (!sources || !sources.length) return;

        const isVideo = img.tagName.toLowerCase() === "video";

        let index = 0;

        // Set this gallery as active when user interacts with it
        const activate = () => { activeGalleryKeys = { keyLeft, keyRight, setImage: (n) => setImage(n), getIndex: () => index }; };
        prev.addEventListener("click", activate);
        next.addEventListener("click", activate);
        img.closest(".project-media")?.addEventListener("click", activate);

        function updateCounter() {
            counter.textContent = `${index + 1} / ${sources.length}`;
        }

        function setImage(nextIndex) {
            index = (nextIndex + sources.length) % sources.length;
            updateCounter();
            img.src = sources[index];
            if (isVideo) { img.load(); img.play().catch(() => {}); }
        }

        img.addEventListener("error", () => {
            let attempts = 0;
            let nextIndex = index;

            while (attempts < sources.length) {
                attempts += 1;
                nextIndex = (nextIndex + 1) % sources.length;
                if (nextIndex === index) break;

                index = nextIndex;
                updateCounter();
                img.src = sources[index];
                if (isVideo) { img.load(); img.play().catch(() => {}); }
                return;
            }
        });

        prev.addEventListener("click", () => setImage(index - 1));
        next.addEventListener("click", () => setImage(index + 1));

        setImage(0);

        return { keyLeft, keyRight, setImage: (n) => setImage(n), getIndex: () => index };
    }

    // Single global keyboard handler — only fires for the active gallery
    window.addEventListener("keydown", (e) => {
        if (!activeGalleryKeys) return;
        if (e.key === activeGalleryKeys.keyLeft)  activeGalleryKeys.setImage(activeGalleryKeys.getIndex() - 1);
        if (e.key === activeGalleryKeys.keyRight) activeGalleryKeys.setImage(activeGalleryKeys.getIndex() + 1);
    });

    /* =========================
       Projects: Custom Graphics Gallery
       ========================= */
    initGallery({
        imgId: "projectGalleryImage",
        prevId: "galleryPrev",
        nextId: "galleryNext",
        counterId: "galleryCounter",
        sources: [
            "../assets/gallery/placeholder-1.jpg",
            "../assets/gallery/placeholder-2.jpg",
            "../assets/gallery/placeholder-3.jpg",
            "../assets/gallery/placeholder-4.jpg",
            "../assets/gallery/placeholder-5.jpg",
            "../assets/gallery/placeholder-6.jpg",
            "../assets/gallery/placeholder-7.jpg",
            "../assets/gallery/placeholder-8.jpg",
            "../assets/gallery/placeholder-9.jpg",
            "../assets/gallery/placeholder-10.jpg",
            "../assets/gallery/placeholder-11.jpg",
            "../assets/gallery/placeholder-12.jpg",
            "../assets/gallery/placeholder-13.jpg",
            "../assets/gallery/placeholder-14.jpg",
            "../assets/gallery/placeholder-15.jpg",
            "../assets/gallery/placeholder-16.jpg",
            "../assets/gallery/placeholder-17.jpg",
            "../assets/gallery/placeholder-18.jpg",
            "../assets/gallery/placeholder-19.jpg",
            "../assets/gallery/placeholder-20.jpg",
            "../assets/gallery/placeholder-21.jpg",
            "../assets/gallery/placeholder-22.jpg",
            "../assets/gallery/placeholder-23.jpg",
            "../assets/gallery/placeholder-24.jpg",
            "../assets/gallery/placeholder-25.jpg",
            "../assets/gallery/placeholder-26.jpg",
            "../assets/gallery/placeholder-27.jpg",
            "../assets/gallery/placeholder-28.jpg",
        ],
        keyLeft: "ArrowLeft",
        keyRight: "ArrowRight",
    });

    /* =========================
       Projects: Animations Gallery (GIF-ready)
       ========================= */
    initGallery({
        imgId: "animationGalleryImage",
        prevId: "animPrev",
        nextId: "animNext",
        counterId: "animCounter",
        sources: [
            "assets/animations/placeholder-1.mp4",
            "assets/animations/placeholder-2.mp4",
            "assets/animations/placeholder-3.mp4",
            "assets/animations/placeholder-4.mp4",
            "assets/animations/placeholder-5.mp4",
            "assets/animations/placeholder-6.mp4",
            "assets/animations/placeholder-7.mp4",
            "assets/animations/placeholder-8.mp4",
        ],
        keyLeft: "a",
        keyRight: "d",
    });
    /* =========================
       Timeline runner dots (scroll-reactive) + collision colour effect
       - Each dot travels top→bottom of its item as the section scrolls through
       - When any two dots overlap within 14px, both flash a shared random colour
       - Colour is stable while overlapping, fades back to red when they separate
       - Collision state tracked per pair to avoid per-frame flicker
       ========================= */
    (function initTimelineRunnerDots(){
        const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) return;

        const items = Array.from(document.querySelectorAll(".timeline-item"));
        if (!items.length) return;

        let ticking = false;

        function clamp01(v){ return Math.max(0, Math.min(1, v)); }
        function easeInOut(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }

        // Generate a vivid random colour (bright enough for dark background)
        function randomVividColour(){
            const hue = Math.floor(Math.random() * 360);
            return {
                bg:     `hsl(${hue}, 100%, 62%)`,
                glow:   `hsl(${hue}, 100%, 72%)`,
                shadow: `hsla(${hue}, 100%, 55%, 0.55)`
            };
        }

        // Collision state: key = "i-j", value = colour object or null
        const collisionState = {};

        // Apply a colour to a dot
        function applyColour(dot, colour){
            dot.style.background    = colour.bg;
            dot.style.boxShadow     = `0 0 0 5px hsla(${colour.glow}, 0.28), 0 0 22px ${colour.shadow}`;
        }

        // Reset dot back to default red (CSS takes over via transition)
        function resetColour(dot){
            dot.style.background = "";
            dot.style.boxShadow  = "";
        }

        function update(){
            ticking = false;

            const vh = window.innerHeight || document.documentElement.clientHeight || 800;

            const scrollBottom = window.scrollY + vh;
            const pageHeight   = document.documentElement.scrollHeight;
            const atBottom     = pageHeight - scrollBottom <= 5;

            // Step 1: move each dot and record its absolute screen Y centre
            const dotData = []; // { dot, screenY }

            for (const item of items){
                const dot = item.querySelector(".timeline-dot");
                if (!dot) continue;

                const rect = item.getBoundingClientRect();
                const h    = Math.max(1, rect.height);

                const entered = vh - rect.top;
                const total   = h + vh;
                const p       = atBottom ? 1 : clamp01(entered / total);
                const eased   = easeInOut(p);

                const travel  = Math.max(0, item.offsetHeight);
                const y       = eased * travel;

                dot.style.setProperty("--dot-runner-y", `${y.toFixed(1)}px`);

                const isActive = p > 0.10 && p < 0.95;
                dot.classList.toggle("dot-active", isActive);

                // Absolute screen Y of dot centre after transform
                // getBoundingClientRect() already reflects the CSS transform
                const dotRect  = dot.getBoundingClientRect();
                const screenY  = dotRect.top + dotRect.height / 2;
                dotData.push({ dot, screenY });
            }

            // Step 2: check every pair for collision (within 14px = one dot-width)
            const collisionThreshold = 14;
            const activePairs = new Set();

            for (let i = 0; i < dotData.length; i++){
                for (let j = i + 1; j < dotData.length; j++){
                    const dist = Math.abs(dotData[i].screenY - dotData[j].screenY);
                    const key  = `${i}-${j}`;

                    if (dist <= collisionThreshold){
                        activePairs.add(key);

                        // New collision — assign a random colour
                        if (!collisionState[key]){
                            collisionState[key] = randomVividColour();
                        }

                        // Apply shared colour to both dots
                        applyColour(dotData[i].dot, collisionState[key]);
                        applyColour(dotData[j].dot, collisionState[key]);

                    } else {
                        // They've separated — clear the stored colour
                        if (collisionState[key]){
                            collisionState[key] = null;
                        }
                    }
                }
            }

            // Step 3: reset any dot not involved in an active collision this frame
            // Build set of dot indices currently colliding
            const collidingIndices = new Set();
            for (const key of activePairs){
                const [i, j] = key.split("-").map(Number);
                collidingIndices.add(i);
                collidingIndices.add(j);
            }
            for (let i = 0; i < dotData.length; i++){
                if (!collidingIndices.has(i)){
                    resetColour(dotData[i].dot);
                }
            }
        }

        function requestTick(){
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }

        let resizeTimer = null;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(requestTick, 120);
        }, { passive: true });

        window.addEventListener("scroll", requestTick, { passive: true });
        requestTick();
    })();

})();