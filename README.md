<div align="center">

<a href="https://buymeacoffee.com/abdullaherturk" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

# 🖥️ Academia & Scribd Downloader 🚀

![Platform](https://img.shields.io/badge/Platform-Chrome%20%7C%20Edge-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)
![Tech](https://img.shields.io/badge/Tech-JavaScript%20%26%20CSS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

[![Made for Chrome & Edge](https://img.shields.io/badge/Made%20for-Chrome%20%26%20Edge-4285F4.svg?style=flat&logo=googlechrome&logoColor=white)](https://github.com/abdullah-erturk/Ping-Monitor/archive/refs/heads/main.zip)
![Open Source?](https://img.shields.io/badge/Open%20source%3F-Of%20course%21%20%E2%9D%A4-009e0a.svg?style=flat)

![sample](https://github.com/abdullah-erturk/Academia-Scribd-Downloader/blob/main/preview.jpg)


### Nedir?
Bu eklenti Chrome ve Edge tarayıcıları için hazırlanmıştır. Eklenti, Akademik araştırmalarınızı ve döküman okuma süreçlerinizi kolaylaştırmak için geliştirilmiştir. Modern arayüzü ve güçlü teknik altyapısı ile dökümanları kesintisiz kaydetmenize olanak tanır.

### What is it?
This extension is designed for Chrome and Edge browsers. It's designed to facilitate your academic research and document reading processes. With its modern interface and powerful technical infrastructure, it allows you to save documents seamlessly.
</div>

---

## Download Link:
[![Stable?](https://img.shields.io/badge/Release-v1.svg?style=flat)](https://github.com/abdullah-erturk/Academia-Scribd-Downloader/archive/refs/heads/main.zip)

<details>
<summary><strong>Türkçe Tanıtım</strong></summary>


### Temel Özellikler

#### 1. Akıllı Tarama (HQ Modu) 🛡️
En gelişmiş indirme yöntemidir. Döküman üzerinde indirme kısıtlaması olsa dahi çalışır.
- **Evrensel Tarama Motoru:** Her sayfayı dijital olarak yeniden işlemek için `html2canvas` kullanır.
- **Tamamen Yerel Kayıt:** Tarama ve PDF oluşturma işlemleri doğrudan tarayıcınız içinde yapılır; hiçbir veriniz harici sunuculara gönderilmez ve herhangi bir dış servise bağımlı değildir.
- **Ekrandan Bağımsız:** Ekran boyutunuz veya çözünürlüğünüz ne olursa olsun, sayfaları tam kalite ve boyutta yakalar.
- **Otomatik Temizleme:** Tarama sırasında Outline çubukları, headerlar ve kayıt bantları gibi fazlalık ögeleri otomatik olarak gizler.
- **Dipnot Koruma:** Sayfa sınırlarını akıllıca belirleyerek dipnotların ve sayfa altı metinlerin kesilmesini engeller.

#### 2. Orijinal PDF (API Modu) ⚡
Dökümanın orijinal vektörel dosyasını harici API sunucuları (downacademia.net, scribd.vdownloaders.com ve ilide.info vb.) üzerinden çekmeye çalışır.
- **Hızlı İndirme:** Vektörel kaliteyi korur ve saniyeler içinde iner.
- **Servis Bağımlılığı:** Bu özellik, bahsedilen harici servislerin aktif ve dökümana erişebilir olmasına bağlıdır. Eğer harici sunucular kapalıysa veya dökümana ulaşamazlarsa bu buton hata verecektir.
- **Kesin Çözüm Vurgusu:** Harici servislerin çalışmadığı veya dökümanı bulamadığı durumlarda, eklentinin kendi motorunu kullanan ve hiçbir sunucuya bağımlı olmayan **"Akıllı Tarama (HQ)"** yöntemini kullanmanız %100 kesin çözümdür.

#### 3. Premium Arayüz Kullanımı 🎨
- **Cam Tasarım (Glassmorphism):** Modern, şeffaf ve göz yormayan karanlık mod destekli arayüz.
- **Panel Küçültme:** Küçük ekranlarda yer kazanmak için paneli tek tıkla (`−` butonu ile) minimize edebilirsiniz.
- **Dil Seçeneği:** Türkçe ve İngilizce tam destek.

### Kurulum ve Kullanım

1. Bu depoyu indirin ve klasöre çıkartın.
2. `chrome://extensions` adresine gidin ve **"Geliştirici Modu"**nu açın.
3. **"Paketlenmiş öğe yükle"** butonuna basın ve projedeki `academicpdf` klasörünü seçin.
4. Academia veya Scribd üzerinde bir döküman açın, sağ alttaki panel üzerinden indirme işlemini başlatın.

---

</details>

<details>
<summary><strong>English Description</strong></summary>


### Key Features

#### 1. Smart Scan (HQ Mode) 🛡️
The most advanced method to save documents, even those with restricted download permissions.
- **Universal Capture Engine:** Uses `html2canvas` to digitally render each page.
- **Fully Local & Private:** The entire process happens directly within your browser. No data is sent to external servers, making it 100% independent of third-party availability.
- **Viewport Independent:** Captures full pages regardless of your screen size or resolution.
- **Auto-Cleanup:** Automatically hides persistent UI elements (Outline bars, headers, signup banners) during capture to ensure a clean PDF.
- **Footnote Preservation:** Ensures document boundaries are respected, saving 100% of the content including bottom footnotes.

#### 2. Original PDF (API Mode) ⚡
Attempts to fetch the original document file directly from external processing servers (like downacademia.net, scribd.vdownloaders.com, or ilide.info).
- **Direct Download:** Fast and preserves the original document quality (vector-based).
- **Service Dependency:** This feature relies on the availability of external API services. If these third-party servers are offline or cannot located the document, this mode will fail.
- **Reliable Fallback:** In case of external server failure, using **"Smart Scan (HQ)"** is the 100% reliable alternative as it uses the extension's internal engine and does not depend on any external services.

#### 3. Premium UI/UX 🎨
- **Glassmorphism Design:** A modern, sleek interface with blur effects and dark mode support.
- **Minimize Toggle:** The overlay panel can be minimized to a small pill-sized header to save screen space on smaller devices.

### Installation

1. Clone or download this repository.
2. Navigate to `chrome://extensions` in your browser.
3. Enable **"Developer mode"**.
4. Click **"Load unpacked"** and select the `academicpdf` folder.

---
</details>
<div align="center">

Made with ❤️ by [Abdullah ERTÜRK](https://github.com/abdullah-erturk)

[🌐 erturk.netlify.app](https://erturk.netlify.app)

</div>
