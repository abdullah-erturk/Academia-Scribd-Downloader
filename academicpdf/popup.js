/**
 * Scribd Downloader
 * Popup Logic with i18n
 * @version 1.0
 */

// I18n is loaded from libs/i18n.js

function updateUI(lang) {
    if (!window.I18n || !window.I18n[lang]) return;

    const t = window.I18n[lang].popup;

    document.getElementById('txt-title').innerText = t.title;
    document.getElementById('txt-subtitle').innerText = t.subtitle;
    document.getElementById('txt-status').innerText = t.status;

    // innerHTML en todos los steps porque las traducciones pueden tener etiquetas <strong>
    document.getElementById('txt-step1').innerHTML = t.step1;
    document.getElementById('txt-step2').innerHTML = t.step2;
    document.getElementById('txt-step3').innerHTML = t.step3;

    // Toggle Buttons
    document.getElementById('btn-tr').classList.toggle('active', lang === 'tr');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
}

document.addEventListener('DOMContentLoaded', () => {
    // Load saved preference
    chrome.storage.local.get(['language'], (result) => {
        const lang = result.language || 'tr'; // Default TR
        updateUI(lang);
    });

    // Listeners
    document.getElementById('btn-tr').addEventListener('click', () => {
        chrome.storage.local.set({ language: 'tr' }, () => updateUI('tr'));
    });

    document.getElementById('btn-en').addEventListener('click', () => {
        chrome.storage.local.set({ language: 'en' }, () => updateUI('en'));
    });

});
