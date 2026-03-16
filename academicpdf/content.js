/**
 * Scribd Downloader
 * Content Script with i18n
 * @version 2.4.0
 */

// I18n loaded from libs/i18n.js




const AppState = {
  currentDocId: null,
  isProcessing: false,
  cachedName: null,
  cachedUrl: null,
  language: 'tr' // Default
};

// ... Utils and PDFHandler (unchanged) ...
const Utils = {
  getDocumentId: () => {
    try {
      const url = window.location.href;
      if (url.includes('academia.edu')) {
        const match = url.match(/(\d+)\//);
        return match ? match[1] : 'academia_doc';
      }
      let match = url.match(/(?:doc|document|embeds|read|book|audiobook)\/(\d+)/);
      if (match) return match[1];
      const iosUrl = document.querySelector('meta[property="al:ios:url"]');
      if (iosUrl) {
        match = iosUrl.content.match(/scribd:\/\/doc\/(\d+)/);
        if (match) return match[1];
      }
      return null;
    } catch (e) { return null; }
  },
  isEmbedView: () => window.location.href.includes('/embeds/'),
  countPages: () => {
    const isAcademia = window.location.host.includes('academia.edu');
    if (isAcademia) {
      return document.querySelectorAll(".outer_page, .outer-page, [id^='outer_page_'], .page-container").length;
    }
    return document.querySelectorAll("div.outer_page_container div[id^='outer_page_']").length;
  },
  sendMessageAsync: (msg) => new Promise(resolve => {
    try {
      if (!chrome.runtime?.id) {
        console.warn('[SPD] Extension context invalidated (Reloaded).');
        return resolve({ success: false, error: 'Context invalidated' });
      }
      chrome.runtime.sendMessage(msg, response => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || {});
        }
      });
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  }),
  getJsPDF: () => {
    // En un content script de Chrome MV3, jsPDF UMD siempre elige la rama
    // GLOBAL porque typeof module y typeof exports son 'undefined' dentro
    // del scope léxico de la IIFE. Asignar window.module no las afecta.
    // jsPDF registra su clase en: globalThis.jspdf = { jsPDF: class JsPDF... }
    if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
    if (globalThis.jspdf?.jsPDF) return globalThis.jspdf.jsPDF;

    // Fallbacks por si alguna versión del bundle usa una clave distinta
    if (window.jspdf?.default) return window.jspdf.default;

    // Algunas builds antiguas exponían la clase directamente como window.jsPDF
    if (typeof window.jsPDF === 'function') return window.jsPDF;

    return null;
  },
  getCleanFilename: () => {
    try {
      // 1. Check cache first (essential for embed views)
      if (AppState.cachedName && AppState.cachedName !== "documento") {
        return AppState.cachedName;
      }

      // 2. URL Slug detection (Very reliable for Scribd main pages)
      const url = window.location.href;
      const slugMatch = url.match(/\/document\/\d+\/([^\/?#]+)/) || url.match(/\/doc\/\d+\/([^\/?#]+)/);
      if (slugMatch && slugMatch[1]) {
        const slug = decodeURIComponent(slugMatch[1]).replace(/[_-]/g, ' ').trim();
        // Ignore generic words that often appear in slugs
        if (slug && slug.length > 3 && !['embeds', 'read', 'content'].includes(slug.toLowerCase())) {
          console.log('[SPD] Title from slug:', slug);
          return sanitizeFilename(slug);
        }
      }

      // 3. JSON-LD (Extremely reliable for main pages)
      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (ldJson) {
        try {
          const data = JSON.parse(ldJson.innerText);
          const name = data.name || data.headline || (data['@graph'] && data['@graph'].find(o => o.name)?.name);
          if (name && name.length > 3) {
            console.log('[SPD] Title from JSON-LD:', name);
            return sanitizeFilename(name);
          }
        } catch (e) { }
      }

      // 4. Metadata tags (Best cross-platform fallback)
      const metaTitle = document.querySelector('meta[property="og:title"]') || 
                        document.querySelector('meta[name="twitter:title"]') ||
                        document.querySelector('meta[name="title"]');
      if (metaTitle && metaTitle.content.trim()) {
        const cleaned = metaTitle.content.replace(/[\s-·•|]*Scribd[\s-·•|]*/gi, '')
                                         .replace(/Read online for free/gi, '')
                                         .replace(/Scribd/gi, '')
                                         .trim();
        if (cleaned && cleaned.length > 3) {
          console.log('[SPD] Title from meta:', cleaned);
          return sanitizeFilename(cleaned);
        }
      }

      // 5. Academia.edu Title Detection
      if (window.location.host.includes('academia.edu')) {
        const h1 = document.querySelector('h1');
        if (h1 && h1.innerText.trim()) return sanitizeFilename(h1.innerText.trim());
      }

      // 6. Scribd Title Detection - More robust selectors (including dynamic ones)
      const selectors = [
        '.doc_title',
        'h1.title',
        'h1[class*="FEwI7T"]', // CSS Module variant
        '[data-e2e="doc_page_title"]',
        '.document_title',
        '.header-title',
        'span.title_text',
        '.doc_name'
      ];
      
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.trim()) {
          const txt = el.innerText.trim();
          if (txt.length > 2) {
            console.log('[SPD] Title from selector:', selector, txt);
            return sanitizeFilename(txt);
          }
        }
      }

      const embedTitle = document.querySelector('.title');
      if (embedTitle && embedTitle.innerText.trim()) return sanitizeFilename(embedTitle.innerText.trim());
      
      // 7. document.title fallback
      let docTitle = document.title || "documento";
      // Filter out site names and generic prefixes
      docTitle = docTitle.replace(/[\s-·•|]*Scribd[\s-·•|]*/gi, '')
                        .replace(/Read online for free/gi, '')
                        .replace(/Lea en línea gratis/gi, '')
                        .replace(/[\s-·•|]*Academia\.edu[\s-·•|]*/gi, '')
                        .trim();
      
      const finalName = sanitizeFilename(docTitle);
      console.log('[SPD] Fallback title:', finalName);
      return (finalName && finalName.length > 3) ? finalName : "documento";
    } catch (e) { return `documento_${Date.now()}`; }
  },
  saveDocName: (id, name, fullUrl) => {
    if (!id) return;
    const data = {};
    if (name) data[`doc_${id}`] = name;
    if (fullUrl) data[`url_${id}`] = fullUrl;
    chrome.storage.local.set(data);
  },
  loadDocData: (id) => {
    return new Promise(resolve => {
      chrome.storage.local.get([`doc_${id}`, `url_${id}`], (result) => {
        resolve({ name: result[`doc_${id}`] || null, fullUrl: result[`url_${id}`] || null });
      });
    });
  },
  waitForImages: async (container) => {
    // Specifically target Scribd's lazy images (.absimg) and regular imgs
    const imgs = Array.from(container.querySelectorAll('img, .absimg'));
    console.log(`[SPD-DEBUG] Waiting for ${imgs.length} images...`);
    
    const promises = imgs.map(img => {
      // Force loading for Scribd lazy images if they have data-lazy but no src
      if (img.dataset.lazy && (!img.src || img.src.includes('clear.alpha.png'))) {
          img.src = img.dataset.lazy;
      }

      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = () => {
             // Second check for naturalHeight to ensure it's not a broken placeholder
             if (img.naturalHeight > 0 || img.tagName === 'DIV') resolve();
             else setTimeout(resolve, 500); // Small grace period for late renders
        };
        // Safety timeout for individual images
        setTimeout(resolve, 5000);
      });
    });
    await Promise.all(promises);
  },
  inlineObjectSvgs: async (container) => {
    console.log('[SPD-DEBUG] Rasterizing SVG objects with DOM parser:', container);
    const objects = Array.from(container.querySelectorAll('object[data*=".svg"]'));
    for (const obj of objects) {
      try {
        const url = obj.data;
        if (!url) continue;
        console.log('[SPD-DEBUG] Fetching SVG:', url);
        const response = await Utils.sendMessageAsync({ action: "fetch_text", url: url });
        if (response.success && response.data) {
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(response.data, 'image/svg+xml');
          
          // Preload images inside the SVG document
          const internalImages = Array.from(svgDoc.querySelectorAll('image, img'));
          for (const imgEl of internalImages) {
            let src = imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href') || imgEl.getAttribute('src');
            if (src && !src.startsWith('data:')) {
              // Resolve relative to the SVG's location
              const absUrl = new URL(src, url).href;
              console.log('[SPD-DEBUG] Preloading internal SVG image:', absUrl);
              const imgRes = await Utils.sendMessageAsync({ action: "fetch_image", url: absUrl });
              if (imgRes.success && imgRes.data) {
                imgEl.setAttribute('href', imgRes.data);
                imgEl.setAttribute('xlink:href', imgRes.data);
                if (imgEl.tagName.toLowerCase() === 'img') imgEl.src = imgRes.data;
              }
            }
          }

          const serializer = new XMLSerializer();
          const updatedSvgText = serializer.serializeToString(svgDoc);
          const base64Svg = btoa(unescape(encodeURIComponent(updatedSvgText)));
          const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

          const imgEl = document.createElement('img');
          imgEl.src = dataUrl;
          imgEl.setAttribute('width', obj.width || obj.getAttribute('width') || '100%');
          imgEl.setAttribute('height', obj.height || obj.getAttribute('height') || '100%');
          imgEl.style.cssText = obj.style.cssText;
          imgEl.className = obj.className;
          
          obj.parentNode.replaceChild(imgEl, obj);
          console.log('[SPD-DEBUG] Rasterized SVG successfully with DOM preloader.');
        }
      } catch (e) {
        console.error('[SPD-DEBUG] SVG rasterization failed:', e);
      }
    }
  },
  preloadExternalImages: async (container) => {
    const currentOrigin = window.location.origin;
    console.log('[SPD-DEBUG] Starting aggressive image preload on:', container);

    const processElement = async (el) => {
      // 1. Handle Tag-based images
      const tagName = el.tagName?.toLowerCase();
      if (tagName === 'img' || tagName === 'image') {
        try {
          let src = '';
          if (tagName === 'image') {
            src = el.getAttribute('href') || el.getAttribute('xlink:href');
          } else {
            src = el.currentSrc || el.src;
          }

          if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
            const url = new URL(src, window.location.href);
            if (url.origin !== currentOrigin) {
              console.log('[SPD-DEBUG] Fetching cross-origin image:', src);
              const response = await Utils.sendMessageAsync({ action: "fetch_image", url: src });
              if (response.success && response.data) {
                if (tagName === 'image') {
                  el.setAttribute('href', response.data);
                  el.setAttribute('xlink:href', response.data);
                  console.log('[SPD-DEBUG] Updated SVG <image> with Base64');
                } else {
                  el.src = response.data;
                  console.log('[SPD-DEBUG] Updated <img> with Base64');
                }
              } else {
                console.warn('[SPD-DEBUG] Fetch failed for:', src, response.error);
              }
            }
          }
        } catch (e) { }
      }

      // 2. Handle CSS background-images
      try {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundImage;
        if (bg && bg.startsWith('url(')) {
          let src = bg.match(/url\((['"]?)(.*?)\1\)/)?.[2];
          if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
            const url = new URL(src, window.location.href);
            if (url.origin !== currentOrigin) {
              console.log('[SPD-DEBUG] Fetching cross-origin BG:', src);
              const response = await Utils.sendMessageAsync({ action: "fetch_image", url: src });
              if (response.success && response.data) {
                el.style.backgroundImage = `url("${response.data}")`;
                console.log('[SPD-DEBUG] Updated BG with Base64');
              }
            }
          }
        }
      } catch (e) { }

      // 3. Recursive traversal (including Shadow DOM)
      if (el.shadowRoot) {
        await traverse(el.shadowRoot);
      }
      for (const child of el.children) {
        await processElement(child);
      }
    };

    const traverse = async (root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node = walker.nextNode();
      while (node) {
        await processElement(node);
        node = walker.nextNode();
      }
    };

    await traverse(container);
    console.log('[SPD-DEBUG] Preload finished.');
  }
};

const PDFHandler = {
  init: () => {
    const JsPDF = Utils.getJsPDF();
    if (!JsPDF) throw new Error("Librería PDF no cargada. Recarga la página (F5) o reinstala la extensión.");
    const doc = new JsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });
    // Use a custom flag to manage the first page instead of immediate deletion
    doc.spdFirstPage = true;
    return doc;
  },
  // Método legado (no se usa ya en el flujo principal pero se conserva por compatibilidad)
  addPage: (doc, imgData, rect) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const dpr = window.devicePixelRatio || 1;
          let sx = rect.x * dpr, sy = rect.y * dpr, sw = rect.width * dpr, sh = rect.height * dpr;
          canvas.width = sw; canvas.height = sh;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
          const A4_W = 595.28; const A4_H = 841.89;
          doc.addPage([A4_W, A4_H]);
          const scale = (A4_W - 20) / sw; const printH = sh * scale; const printW = A4_W - 20;
          if (printH <= A4_H) {
            const posY = (A4_H - printH) / 2;
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', 10, posY, printW, printH, undefined, 'SLOW');
          } else {
            const scaleH = (A4_H - 20) / sh; const printW_H = sw * scaleH; const posX = (A4_W - printW_H) / 2;
            doc.addImage(canvas.toDataURL('image/png'), 'PNG', posX, 10, printW_H, A4_H - 20, undefined, 'SLOW');
          }
          resolve();
        } catch (err) { reject(err); }
      };
      img.onerror = () => reject(new Error("Image Load Error"));
      img.src = imgData;
    });
  },
  // Recibe el data-URL ya renderizado por html2canvas (recortado al elemento).
  // No necesita img.onload porque el data-URL ya está listo.
  addPageFromCanvas: (doc, dataUrl, rect) => {
    return new Promise((resolve, reject) => {
      try {
        if (!dataUrl || dataUrl.length < 100) return resolve();

        const A4_W = 595.28; const A4_H = 841.89;
        const sw = Math.max(1, rect.width); const sh = Math.max(1, rect.height);
        
        if (doc.spdFirstPage) {
            doc.spdFirstPage = false;
        } else {
            doc.addPage([A4_W, A4_H]);
        }

        const scale = (A4_W - 20) / sw; const printH = sh * scale; const printW = A4_W - 20;
        const imgFormat = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';

        if (printH <= A4_H) {
          const posY = (A4_H - printH) / 2;
          doc.addImage(dataUrl, imgFormat, 10, posY, printW, printH, undefined, 'SLOW');
        } else {
          const scaleH = (A4_H - 20) / sh; const printW_H = sw * scaleH; const posX = (A4_W - printW_H) / 2;
          doc.addImage(dataUrl, imgFormat, posX, 10, printW_H, A4_H - 20, undefined, 'SLOW');
        }
        resolve();
      } catch (err) { reject(err); }
    });
  }
};

async function captureElementWithHtml2Canvas(element) {
  if (typeof html2canvas !== 'function') {
    throw new Error('html2canvas no disponible. Recarga la extensión (F5).');
  }
  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: true,
    scale: window.devicePixelRatio || 1,
    backgroundColor: '#ffffff',
    logging: false,
    // Fix for CSP error: ignore script tags completely to avoid cloning them into the iframe
    ignoreElements: (el) => {
      if (el.tagName === 'SCRIPT' || el.tagName === 'NOSCRIPT' || el.tagName === 'IFRAME') return true;
      
      const cls = el.className || "";
      const id = el.id || "";
      return id === 'sdl-overlay' || 
             id === 'spd-clean-style' || 
             (typeof cls === 'string' && (
               cls.includes('outline--toggle') || 
               cls.includes('js-outline-toggle') || 
               cls.includes('Sticky') || 
               cls.includes('fixed') || 
               cls.includes('Floating') ||
               cls.includes('SignupBar') ||
               cls.includes('ds-signup-banner') ||
               cls.includes('toolbar_drop') ||
               cls.includes('global_header') ||
               cls.includes('mobile_overlay') ||
               cls.includes('promo_banner')
             ));
    }
  });
  // Switch to JPEG 0.75 for better memory handling in image-heavy documents
  return canvas.toDataURL('image/jpeg', 0.75);
}

async function executeHQScan() {
  if (AppState.isProcessing) return;
  AppState.isProcessing = true;

  // Robust Fallback for HQ Scan states
  const FallbackStates = { loading: "Cargando...", saving: "Guardando...", success: "Listo!", error: "Error: " };
  const I18nSafe = window.I18n || { es: { overlay: { states: FallbackStates } } };
  const T = (I18nSafe[AppState.language]?.overlay?.states) || I18nSafe.es?.overlay?.states || FallbackStates;

  // Utilidad de zoom cross-browser: Chrome soporta `zoom`, Firefox requiere `transform:scale`
  const isFirefox = navigator.userAgent.includes('Firefox');
  const applyZoom = (level) => {
    if (isFirefox) {
      // Firefox: usamos transform en el wrapper principal del documento
      const scroller = document.querySelector('.document_scroller') || document.body;
      scroller.style.transformOrigin = 'top left';
      scroller.style.transform = `scale(${level})`;
    } else {
      document.body.style.zoom = level;
    }
  };
  const resetZoom = () => {
    if (isFirefox) {
      const scroller = document.querySelector('.document_scroller') || document.body;
      scroller.style.transform = '';
      scroller.style.transformOrigin = '';
    } else {
      document.body.style.zoom = '';
    }
  };

  // ─── SW Keepalive ─────────────────────────────────────────────────────────────
  // En Chrome MV3, el Service Worker se suspende ~30s después de quedar inactivo.
  // Abrimos un puerto persistente durante el scan para mantenerlo despierto,
  // evitando que los mensajes capture_tab lleguen a un SW dormido y fallen.
  function openSWKeepalive() {
    try {
      if (!chrome.runtime?.id) return null;
      const port = chrome.runtime.connect({ name: 'spd-keepalive' });
      let isDisconnected = false;
      
      const interval = setInterval(() => {
        try {
          if (!isDisconnected && chrome.runtime?.id) {
            port.postMessage({ type: 'heartbeat' });
          } else {
            clearInterval(interval);
          }
        } catch (e) {
          clearInterval(interval);
        }
      }, 20000);

      port.onDisconnect.addListener(() => {
        isDisconnected = true;
        clearInterval(interval);
      });
      return port;
    } catch (e) {
      console.warn('[SPD] Keepalive port failed:', e.message);
      return null;
    }
  }

  Interface.updateState('loading', T.loading);
  const originalOverflow = document.body.style.overflow;
  // Abrimos el puerto keepalive antes de empezar el scan.
  // Esto mantiene el Service Worker de Chrome despierto durante todo el proceso.
  const keepalivePort = openSWKeepalive();

  try {
    const isAcademia = window.location.host.includes('academia.edu');
    const pageSelector = isAcademia 
      ? ".outer_page, .outer-page, [id^='outer_page_'], .outline--element" 
      : "div.outer_page_container div[id^='outer_page_']";
    const cleanupSelector = isAcademia 
      ? ".ad-slot, .js-access-gating-banner, .site-header, .document-footer, .related-papers, .modal-open, .js-fob-banner, .js-nav-container, .js-sidebar, header, nav, footer, .ds2-5-modal, .LoginModal, .SignupBar, #preact-border-shadow-host, .left-rail--container, .right-rail--container, .premium-upsell, [id$='Overlay'], .UIPopup, .fancybox-overlay, .outline--wrapper, .ds-signup-banner, .safe-sticky-ctas--container, .StickyContainer, .TopNav-cls1, .js-outline-wrapper, .work-card-container > aside, .page-navigation-floating-bar, .outline--toggle, .js-tc-loswp--outline-toggle, .js-outline-toggle, div[class*='sticky'], div[class*='fixed'], div[class*='Floating']"
      : ".toolbar_drop, .global_header, .mobile_overlay, #scribd_c_wrapper, .promo_banner";

    const styleEl = document.createElement('style');
    styleEl.id = 'spd-clean-style';
    styleEl.innerHTML = `
        ${cleanupSelector} { 
            display: none !important; 
            visibility: hidden !important; 
            height: 0 !important; 
            width: 0 !important; 
            overflow: hidden !important; 
            opacity: 0 !important; 
            pointer-events: none !important; 
            position: absolute !important; 
            top: -9999px !important; 
            left: -9999px !important;
            z-index: -1 !important;
        } 
        .document_scroller, .js-scribd-document-container { overflow: visible !important; padding: 0 !important; margin: 0 !important; } 
        .outer_page, .outer_page_container, .outline--element { 
          margin: 0px auto !important; 
          padding: 0 !important; 
          border: none !important; 
          box-shadow: none !important; 
          position: relative !important; 
          overflow: visible !important; 
          visibility: visible !important;
          display: block !important;
          z-index: 10 !important;
        } 
        body { background: #525659 !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
        
        /* Academia Virtual Embed isolation */
        ${isAcademia ? `
          .work-card, .js-work-container, .outline, .outer_page_container { 
            position: absolute !important; 
            top: 0 !important; 
            bottom: auto !important;
            left: 0 !important; 
            width: 100% !important; 
            z-index: 2147483640 !important; 
            background: #525659 !important;
            padding-top: 0px !important;
            display: block !important;
            visibility: visible !important;
          }
          .work-card-container { padding: 0 !important; margin: 0 !important; display: block !important; overflow: visible !important; }
        ` : ''}
    `;
    document.head.appendChild(styleEl);

    // Wake up Academia viewer if it's not fully initialized or no pages found
    const findPages = () => document.querySelectorAll(pageSelector);
    
    if (isAcademia) {
      if (findPages().length === 0) {
        const seeFullBtn = document.querySelector('.js-show-full-reader, button[data-test-id="see-full-pdf"], .work-show-full-pdf-button, .js-access-gating-banner button');
        if (seeFullBtn) {
          seeFullBtn.click();
          await new Promise(r => setTimeout(r, 2000));
        }

        window.scrollTo(0, window.scrollY + 800);
        await new Promise(r => setTimeout(r, 800));
        window.scrollTo(0, window.scrollY - 800);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    const pages = findPages();
    const total = pages.length;
    if (total === 0) throw new Error("No pages found.");

    // "Pre-scan warming": Quickly scroll through to wake up observers
    if (!isAcademia) {
        console.log('[SPD] Warming up lazy observers...');
        const scroller = document.querySelector('.document_scroller') || window;
        for (let j = 0; j < Math.min(total, 20); j += 5) {
            pages[j].scrollIntoView({ behavior: 'auto', block: 'center' });
            await new Promise(r => setTimeout(r, 100));
        }
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 500));
    }

    const fname = Utils.getCleanFilename();
    console.log('[SPD] Starting HQ Scan for:', fname);

    // Dividimos en lotes para evitar "invalid string length" en documentos grandes.
    // El motor V8 tiene un límite ~512 MB para strings; acumular cientos de páginas
    // en PNG dentro de un único jsPDF lo supera. Guardamos un PDF por lote y
    // dejamos que el GC libere memoria entre lotes.
    const PAGES_PER_CHUNK = 50;
    const totalChunks = Math.ceil(total / PAGES_PER_CHUNK);
    const needsChunking = totalChunks > 1;

    for (let chunk = 0; chunk < totalChunks; chunk++) {
      const chunkStart = chunk * PAGES_PER_CHUNK;
      const chunkEnd = Math.min(chunkStart + PAGES_PER_CHUNK, total);
      const chunkLabel = needsChunking ? ` (parte ${chunk + 1}/${totalChunks})` : '';

      // Nuevo documento por lote → se libera al llamar pdf.save()
      const pdf = PDFHandler.init();

      for (let i = chunkStart; i < chunkEnd; i++) {
        const page = pages[i];

        resetZoom();
        page.scrollIntoView({ behavior: 'instant', block: 'center' });

        // Trigger lazy-loading for Scribd embeds with a "Super-Jiggle"
        if (!isAcademia) {
            const scroller = document.querySelector('.document_scroller') || window;
            const scrollTarget = (scroller === window) ? window : scroller;
            
            // Move container specifically
            if (scrollTarget.scrollBy) {
                scrollTarget.scrollBy(0, 10);
                await new Promise(r => setTimeout(r, 50));
                scrollTarget.scrollBy(0, -10);
            }
            // Traditional window jiggle as backup
            window.scrollBy(0, 2);
            await new Promise(r => setTimeout(r, 100));
            window.scrollBy(0, -2);
            await new Promise(r => setTimeout(r, 200));
        }

        // 2. Definitive Fix for Academia: Inline SVG Objects and then Preload Images
        await Utils.inlineObjectSvgs(page);
        await Utils.preloadExternalImages(page);
        
        // Wait for all images in the container to actually load
        await Utils.waitForImages(page);
        
        // Final settle time (much longer for embeds to ensure heavy images render)
        await new Promise(r => setTimeout(r, isAcademia ? 800 : 2000));

        // 3. Tomamos las coordenadas exactas del elemento en viewport
        const rect = page.getBoundingClientRect();

        let captureSuccess = false;
        let captureData = null;

        // Unified HTML2Canvas capture for all sites (Academia and Scribd)
        // This ensures full-page capture even if the container is larger than current viewport.
        try {
          captureData = await captureElementWithHtml2Canvas(page);
          captureSuccess = true;
        } catch (err) {
          console.warn('[SPD] html2canvas failed on page', i + 1, err);
          
          // Fallback to capture_tab for Scribd if html2canvas fails
          if (!isAcademia) {
            const overlay = document.getElementById('sdl-overlay');
            if (overlay) overlay.style.display = 'none';
            
            const res = await Utils.sendMessageAsync({ action: 'capture_tab' });
            
            if (overlay) overlay.style.display = 'flex';
            
            if (res.success && res.image) {
              captureData = res.image;
              captureSuccess = true;
            }
          }
        }

        if (captureSuccess && captureData) {
          // Si usamos html2canvas, el dataURL ya es el elemento exacto
          await PDFHandler.addPageFromCanvas(pdf, captureData, rect);
        } else {
          console.warn('[SPD] Capture failed on page', i + 1);
        }

        const pct = Math.round(((i + 1) / total) * 100);
        Interface.updateProgress(pct, `${i + 1}/${total}${chunkLabel}`);
      }

      // Guardar el lote y dar tiempo al GC antes de iniciar el siguiente
      Interface.updateState('saving', T.saving + chunkLabel);
      const partSuffix = needsChunking ? `_parte_${chunk + 1}_de_${totalChunks}` : '';
      pdf.save(`${fname}${partSuffix}.pdf`);
      await new Promise(r => setTimeout(r, 800));
    }

    Interface.updateState('success', T.success);

    // Cleanup: cerramos el keepalive y restauramos el estado de la página
    keepalivePort?.disconnect();
    resetZoom();
    document.body.style.overflow = originalOverflow || '';
    document.getElementById('spd-clean-style')?.remove();
    setTimeout(() => { AppState.isProcessing = false; document.getElementById('sdl-overlay')?.remove(); }, 5000);

  } catch (e) {
    console.error(e);
    keepalivePort?.disconnect();
    resetZoom();
    document.body.style.overflow = originalOverflow || '';
    document.getElementById('spd-clean-style')?.remove();
    Interface.updateState('error', T.error + e.message);
    AppState.isProcessing = false;
    if (document.getElementById('sdl-overlay')) document.getElementById('sdl-overlay').style.display = 'flex';
  }
}

async function executeAcademiaDownload() {
  if (AppState.isProcessing) return;
  AppState.isProcessing = true;

  const I18nSafe = window.I18n;
  const lang = AppState.language || 'tr';
  const T = (I18nSafe[lang] && I18nSafe[lang].overlay) ? I18nSafe[lang].overlay : I18nSafe.tr.overlay;

  try {
    Interface.updateState('loading', T.states.loading);
    const url = window.location.href;

    // Step 1: Parse
    Interface.updateState('fetching', T.states.fetching);
    const paperData = await window.AcademiaLogic.parsePaper(url);
    const docId = paperData.documentId;
    const title = Utils.getCleanFilename() || paperData.title || 'Academia_Document';

    // Step 2: Poll
    Interface.updateState('polling', T.states.polling);
    const downloadUrl = await window.AcademiaLogic.pollForDownloadUrl(docId);

    // Step 3: Trigger download via background (force_download)
    Interface.updateState('saving', T.states.saving);
    const downloadRes = await window.AcademiaLogic.triggerDownload(downloadUrl, title);

    if (downloadRes && downloadRes.success) {
      Interface.updateState('success', T.states.success);
    } else {
      throw new Error(downloadRes?.error || 'Download failed');
    }

    setTimeout(() => { AppState.isProcessing = false; }, 3000);

  } catch (e) {
    console.error('[Academia] Error:', e);
    Interface.updateState('error', T.errors.academia_failed + ' ' + e.message);
    AppState.isProcessing = false;
  }
}

function sanitizeFilename(name) { 
  // Remove forbidden FS characters but keep Turkish and other Unicode chars
  return name.replace(/[\\/?%*:|"<>\x00-\x1f]/g, '').trim(); 
}

// --- UI Interface ---

const Interface = {
  render: async () => {
    const existing = document.getElementById('sdl-overlay');
    const currentName = AppState.cachedName || "";
    const isAcademia = window.location.host.includes('academia.edu');
    
    // Improved viewer detection for Academia
    const hasViewer = isAcademia 
      ? !!document.querySelector('.outer_page, .outer-page, [id^="outer_page_"], .js-scribd-document-container') 
      : true;

    if (existing) {
      if (currentName && currentName !== "documento") return;
    }
    
    const docId = Utils.getDocumentId();
    if (!docId) return;
    const isEmbed = Utils.isEmbedView();

    // Cargar preferencia de idioma con manejo de contexto invalidado.
    // 'Extension context invalidated' ocurre si la extensión se recargó
    // sin recargar la pestaña del documento.
    try {
      chrome.storage.local.get(['language'], (res) => {
        if (chrome.runtime.lastError) {
          // Contexto inválido: usar idioma por defecto y continuar
          AppState.language = 'tr';
        } else {
          AppState.language = (res && res.language) || 'tr';
        }
        Interface.draw(docId, isEmbed);
      });
    } catch (e) {
      // Contexto de extensión ya no es válido: renderizar con fallback
      AppState.language = 'tr';
      Interface.draw(docId, isEmbed);
    }
  },

  draw: async (docId, isEmbed) => {
    let storedData = { name: null, fullUrl: null };
    try { storedData = await Utils.loadDocData(docId); } catch (e) { }

    if (!isEmbed) {
      const rawName = Utils.getCleanFilename();
      const rawUrl = window.location.href;
      if (rawName && rawName !== "documento") {
        console.log('[SPD] Detected and saving fresh name:', rawName);
        Utils.saveDocName(docId, rawName, rawUrl);
        AppState.cachedName = rawName;
        AppState.cachedUrl = rawUrl;
      }
    } else {
      // On embed pages, try to get from storage, but if that's generic, try current metadata
      if (storedData.name && storedData.name !== "documento") {
        AppState.cachedName = storedData.name;
      } else {
        const freshEmbedName = Utils.getCleanFilename();
        if (freshEmbedName && freshEmbedName !== "documento") {
          AppState.cachedName = freshEmbedName;
        }
      }
      if (storedData.fullUrl) AppState.cachedUrl = storedData.fullUrl;
    }

    const docName = AppState.cachedName || Utils.getCleanFilename();

    // I18N TEXTS
    // I18N TEXTS - Failsafe in case I18n lib isn't loaded (e.g. extension not reloaded)
    // Fallback usado solo si la librería i18n.js no cargó correctamente.
    // Debe mantenerse sincronizado con libs/i18n.js.
    const FallbackI18n = {
      tr: {
        overlay: {
          title: "⚡ Scribd Downloader", id: "Doküman ID:", file: "Dosya:", pages: "Sayfa:", analyzing: "Sayfalar sayılıyor...",
          activate: "▶ İNDİRME MODUNU AKTİF ET",
          hq_btn: "AKILLI TARAMA (HQ)", hq_badge: "%100 GÜVENLİ",
          hq_tooltip: "Her sayfayı tek tek yüksek çözünürlüklü PNG görseli olarak yakalar ve bir PDF dosyasında birleştirir.",
          adv_opts: "GELİŞMİŞ SEÇENEKLER",
          vec_btn: "ORİJİNAL PDF", vec_badge: "OTOMATİK",
          vec_tooltip: "Orijinal PDF dosyasını harici sunuculardan indirmeye çalışır. Hata verirse 'Akıllı Tarama (HQ)' kullanın.",
          large_doc_warning: "⚠️ Büyük doküman tespit edildi ({pages} sayfa). Akıllı Tarama çok uzun sürebilir ve birden fazla dosya oluşturabilir. %100 tavsiye edilen: \"Orijinal PDF\" kullanın.",
          states: { loading: "Tarama hazırlanıyor...", saving: "PDF Oluşturuluyor...", success: "PDF Kaydedildi!", error: "Hata: " }
        }
      }
    };
    const I18nSafe = window.I18n || FallbackI18n;
    const lang = AppState.language || 'tr';
    const T = (I18nSafe[lang] && I18nSafe[lang].overlay) ? I18nSafe[lang].overlay : (I18nSafe.tr?.overlay || FallbackI18n.tr.overlay);

    const overlay = document.createElement('div');
    overlay.id = 'sdl-overlay';

    const isAcademia = window.location.host.includes('academia.edu');
    const headerTitle = isAcademia ? (T.title_academia || "Academia Downloader") : T.title;

    let contentHtml = `
            <div class="sdl-card sdl-glass">
                <div class="sdl-header">
                    <span class="sdl-brand">${headerTitle}</span>
                    <div class="sdl-controls">
                        <button class="sdl-minimize" title="Minimize">−</button>
                    </div>
                </div>
                <div class="sdl-info-grid">
                    <div class="sdl-row"><span class="sdl-label">${T.id}</span><span class="sdl-value">${docId}</span></div>
                    <div class="sdl-row"><span class="sdl-label">${T.file}</span><span class="sdl-value sdl-truncate" title="${docName}">${docName}</span></div>
        `;

    // Declaradas antes del if/else: el handler de mainBtn.onclick las usa
    // desde fuera del bloque, por eso necesitan scope de función, no de bloque.
    const LARGE_DOC_THRESHOLD = 100;
    let isLargeDoc = false;

    if (isAcademia) {
      const pageCount = Utils.countPages();
      isLargeDoc = pageCount >= LARGE_DOC_THRESHOLD;
      const warningText = isLargeDoc ? (T.large_doc_warning || '⚠️ Büyük doküman ({pages} sayfa).').replace('{pages}', pageCount) : '';

      contentHtml += `
                <div class="sdl-row"><span class="sdl-label">${T.pages}</span><span class="sdl-value">${pageCount > 0 ? pageCount : T.analyzing}</span></div>
                </div>
                <div class="sdl-progress-track"><div id="sdl-progress-fill"></div></div>
                
                ${isLargeDoc ? `<div class="sdl-large-doc-warning"><p class="sdl-warning-text">${warningText}</p></div>` : ''}

                <div class="sdl-actions">
                    <div class="sdl-btn-container">
                        <button id="sdl-action-btn" class="sdl-btn sdl-btn-primary">
                            <span>${T.hq_btn}</span>
                            <span class="sdl-badge safe">${T.hq_badge}</span>
                        </button>
                        <span class="sdl-tooltip">${T.hq_tooltip}</span>
                    </div>
                    
                    <div class="sdl-divider">${T.adv_opts}</div>

                    <div class="sdl-btn-container">
                        <button id="sdl-bridge-btn" class="sdl-btn sdl-btn-vector" style="background: linear-gradient(135deg, #c9a84c, #7a5c20);">
                            <span>${T.download_pdf || "DOWNLOAD PDF"}</span>
                            <span class="sdl-badge safe">API</span>
                        </button>
                    </div>
                </div>
            `;
    } else if (!isEmbed) {
      contentHtml += `
                </div>
                <div class="sdl-actions">
                    <div class="sdl-btn-container">
                        <button id="sdl-action-btn" class="sdl-btn sdl-btn-glow">
                            <span>${T.activate}</span>
                            <span class="sdl-badge">GO</span>
                        </button>
                    </div>
                </div>
            `;
    } else {
      const pageCount = Utils.countPages();

      // Umbral a partir del cual advertimos al usuario: documentos grandes
      // tardan horas en el modo HQ y generan múltiples archivos.
      isLargeDoc = pageCount >= LARGE_DOC_THRESHOLD;

      // Construir el mensaje interpolando el número real de páginas
      const warningText = isLargeDoc
        ? (T.large_doc_warning || '⚠️ Large document detected.').replace('{pages}', pageCount)
        : '';

      contentHtml += `
                    <div class="sdl-row"><span class="sdl-label">${T.pages}</span><span class="sdl-value">${pageCount > 0 ? pageCount : T.analyzing}</span></div>
                </div>
                <div class="sdl-progress-track"><div id="sdl-progress-fill"></div></div>

                ${isLargeDoc ? `
                <div class="sdl-large-doc-warning">
                  <p class="sdl-warning-text">${warningText}</p>
                  <button id="sdl-warning-pdf-btn" class="sdl-btn sdl-btn-vector sdl-btn-warning-cta">
                    <span>${T.vec_btn}</span>
                    <span class="sdl-badge beta">${T.vec_badge}</span>
                  </button>
                </div>` : ''}

                 <div class="sdl-actions">
                    <div class="sdl-btn-container">
                        <button id="sdl-action-btn" class="sdl-btn sdl-btn-primary">
                            <span>${T.hq_btn}</span>
                            <span class="sdl-badge safe">${T.hq_badge}</span>
                        </button>
                        <span class="sdl-tooltip">${T.hq_tooltip}</span>
                        ${isLargeDoc ? `<p id="sdl-hq-toast" class="sdl-hq-toast" hidden></p>` : ''}
                    </div>

                    ${!isLargeDoc ? `
                    <div class="sdl-divider">${T.adv_opts}</div>

                    <div class="sdl-btn-container">
                        <button id="sdl-bridge-btn" class="sdl-btn sdl-btn-vector">
                            <span>${T.vec_btn}</span>
                            <span class="sdl-badge beta">${T.vec_badge}</span>
                        </button>
                        <span class="sdl-tooltip">${T.vec_tooltip}</span>
                    </div>` : ''}
                </div>
            `;
    }

    const existingOverlay = document.getElementById('sdl-overlay');
    if (existingOverlay) {
      // Just update the UI instead of re-creating if it already exists
      const valueEl = existingOverlay.querySelector('.sdl-value.sdl-truncate');
      if (valueEl) {
        valueEl.innerText = docName;
        valueEl.title = docName;
      }
      return;
    }

    overlay.innerHTML = contentHtml;
    document.body.appendChild(overlay);

    const mainBtn = document.getElementById('sdl-action-btn');
    const bridgeBtn = document.getElementById('sdl-bridge-btn');

    if (mainBtn) {
      if (isAcademia) {
        mainBtn.onclick = executeHQScan;
      } else {
        mainBtn.onclick = isEmbed
          ? () => {
            if (isLargeDoc) {
              const toast = document.getElementById('sdl-hq-toast');
              if (toast) {
                toast.textContent = T.hq_long_warning || '⏱ Bu işlem uzun sürebilir.';
                toast.hidden = false;
              }
              setTimeout(executeHQScan, 1800);
            } else {
              executeHQScan();
            }
          }
          : () => {
            window.location.href = `https://www.scribd.com/embeds/${docId}/content?start_page=1&view_mode=scroll&access_key=key-1`;
          };
      }
    }

    if (bridgeBtn) {
      if (isAcademia) {
        bridgeBtn.onclick = executeAcademiaDownload;
      } else {
        // Solo para Scribd embeds (documentos pequeños o banner manual)
        bridgeBtn.onclick = async () => {
          const freshName = Utils.getCleanFilename();
          let targetUrl = AppState.cachedUrl;
          if (!targetUrl) {
            const slug = freshName.replace(/\s+/g, '-').toLowerCase();
            targetUrl = `https://es.scribd.com/document/${docId}/${slug}`;
          }
          Utils.sendMessageAsync({ action: "open_external_downloader", docUrl: targetUrl, docName: freshName });
        };
      }
    }

    // El botón del banner de advertencia dispara la misma lógica de descarga
    // pero siempre existe (solo para documentos grandes).
    const warningPdfBtn = document.getElementById('sdl-warning-pdf-btn');
    if (warningPdfBtn) {
      warningPdfBtn.onclick = launchBridgeDownload;
    }

    const closeBtn = overlay.querySelector('.sdl-close');
    if (closeBtn) closeBtn.onclick = () => overlay.remove();

    const minBtn = overlay.querySelector('.sdl-minimize');
    if (minBtn) {
      minBtn.onclick = (e) => {
        e.stopPropagation();
        const card = overlay.querySelector('.sdl-card');
        if (card) {
          card.classList.toggle('sdl-minimized');
          minBtn.innerText = card.classList.contains('sdl-minimized') ? '+' : '−';
          minBtn.title = card.classList.contains('sdl-minimized') ? 'Expand' : 'Minimize';
        }
      };
    }

    // Listen for language changes live
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.language) {
        overlay.remove();
        Interface.render();
      }
    });
  },

  updateState: (state, text) => {
    const btn = document.getElementById('sdl-action-btn');
    if (btn) {
      btn.querySelector('span:first-child').innerText = text;
      if (state === 'loading') { btn.disabled = true; btn.style.cursor = 'wait'; }
      if (state === 'error') { btn.style.background = '#ff5252'; btn.disabled = false; btn.style.cursor = 'pointer'; }
      if (state === 'success') { btn.style.background = '#00e676'; btn.classList.add('sdl-pulse-success'); btn.disabled = true; }
    }
  },
  updateProgress: (percent, text) => {
    const fill = document.getElementById('sdl-progress-fill');
    const btn = document.getElementById('sdl-action-btn');
    if (fill) fill.style.width = `${percent}%`;
    if (text && btn) btn.querySelector('span:first-child').innerText = text;
  }
};

window.initSDL = () => { Interface.render(); };

// El intervalo verifica que el contexto de la extensión siga válido antes
// de llamar a la API. Si no, se detiene para no generar errores en consola.
if (window.SDL_Started) {
  window.initSDL();
} else {
  window.SDL_Started = true;
  const sdlInterval = setInterval(() => {
    // Verificar si el runtime sigue activo
    try {
      if (!chrome.runtime?.id) {
        clearInterval(sdlInterval);
        return;
      }
    } catch (e) {
      clearInterval(sdlInterval);
      return;
    }
    const id = Utils.getDocumentId();
    if (id && !document.getElementById('sdl-overlay')) Interface.render();
  }, 2000);
}
