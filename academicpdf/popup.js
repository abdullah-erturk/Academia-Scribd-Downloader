/**
 * Scribd Downloader
 * Popup Logic with i18n
 * @version 1.1  // ← minor version bump to indicate Arabic support
 */

function updateUI(lang) {
    if (!window.I18n || !window.I18n[lang]) return;

    const t = window.I18n[lang].popup;

    document.getElementById('txt-title').innerText = t.title;
    document.getElementById('txt-subtitle').innerText = t.subtitle;
    document.getElementById('txt-status').innerText = t.status;

    // innerHTML for steps & tip because they contain <strong> tags
    document.getElementById('txt-step1').innerHTML = t.step1;
    document.getElementById('txt-step2').innerHTML = t.step2;
    document.getElementById('txt-step3').innerHTML = t.step3;
    document.getElementById('txt-tip').innerHTML = t.tip;

    // Update active state for language buttons
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-tr').classList.toggle('active', lang === 'tr');
    document.getElementById('btn-ar').classList.toggle('active', lang === 'ar');
	
// RTL for Arabic
    document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', lang === 'ar');
}

document.addEventListener('DOMContentLoaded', () => {
    // Load saved language preference (fallback to 'en' now that we have Arabic)
    chrome.storage.local.get(['language'], (result) => {
        let lang = result.language;

        // If no saved language → default to 'en' (or 'ar' if you prefer Arabic default)
        if (!lang || !['en', 'tr', 'ar'].includes(lang)) {
            lang = 'en';  // ← you can change this to 'ar' if you want Arabic as default
        }

        updateUI(lang);
    });

    // Language button listeners
    document.getElementById('btn-en').addEventListener('click', () => {
        chrome.storage.local.set({ language: 'en' }, () => updateUI('en'));
    });

    document.getElementById('btn-tr').addEventListener('click', () => {
        chrome.storage.local.set({ language: 'tr' }, () => updateUI('tr'));
    });

    document.getElementById('btn-ar').addEventListener('click', () => {
        chrome.storage.local.set({ language: 'ar' }, () => updateUI('ar'));
    });
});