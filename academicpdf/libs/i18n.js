/**
 * Scribd Downloader
 * Translations Library
 * @version 2.4.1
 */

const I18n = {
    en: {
        popup: {
            title: "Academia & Scribd",
            subtitle: "Academic Download Suite",
            status: "Extension Active and Ready",
            how_to: "HOW TO USE",
            step1: "Open any document on <strong>Academia.edu</strong> or <strong>Scribd</strong>.",
            step2: "A <strong>floating panel</strong> will appear on the side. If not, refresh the page.",
            step3: "Click <strong>'Original PDF'</strong> to save your file or try other download methods.",
            tip: "Tip: The extension can be minimized/maximized from the header and dragged anywhere on the page.",
            footer: ""
        },
        overlay: {
            title: "⚡ Scribd Downloader",
            title_academia: "🎓 Academia Downloader",
            id: "Doc ID:",
            file: "File:",
            pages: "Pages:",
            analyzing: "Counting pages...",
            scroll_notice: "Ensure all pages are loaded",
            activate: "▶ ACTIVATE DOWNLOAD MODE",
            // Academia specific
            download_pdf: "ORIGINAL PDF",
            fetching_meta: "Fetching details...",
            // Main button: page-by-page screenshot scan
            hq_btn: "SMART SCAN (HQ)",
            hq_badge: "SAFE",
            hq_tooltip: "High-quality scan using original images if possible (Native HQ) or screen captures. Recommended for standard layouts.",
            hq_native_btn: "NATIVE HQ",
            hq_native_sub: "Extract original images",
            hq_native_badge: "SAFE",
            hq_native_tooltip: "Attempts to download original high-resolution images from the server. Best quality and sharpness.",
            hq_fit_btn: "SCANNER MODE",
            hq_fit_sub: "Tiled capture engine",
            hq_fit_badge: "RECOMMENDED",
            hq_fit_tooltip: "Native browser capture via scrolling/stitching. Fixes missing text and blurriness issues.",
            // Advanced options section
            adv_opts: "ADVANCED OPTIONS",
            // Secondary button: original PDF extraction
            vec_btn: "ORIGINAL PDF",
            vec_badge: "API",
            vec_tooltip: "Attempts to download the original PDF file from external servers. Faster, but may fail if the server doesn't expose it. If it fails, use one of the other saving methods.",
            // Warning for documents with many pages: recommends Original PDF
            large_doc_warning: "⚠️ Large document detected ({pages} pages). HQ Scan will generate multiple files and take hours. 100% recommended: use \"Original PDF\".",
            // Mini-warning shown when clicking HQ Scan on a large document
            hq_long_warning: "⏱ This will take a long time. Please keep this tab open.",
            // Dynamic button states during the process
            states: {
                loading: "Preparing scan...",
                fetching: "Downloading Academia PDF...",
                polling: "Waiting for server...",
                saving: "Generating PDF...",
                success: "PDF Saved!",
                error: "Error: "
            },
            // Specific error messages with context
            errors: {
                pdf_lib: "Reload the page (F5) and try again.",
                no_pages: "No pages found. Are you on a Scribd document?",
                capture: "Capture error. Check the extension permissions.",
                academia_failed: "Failed to download from Academia."
            },
            feedback_pause: "⚠️ Keep this tab open",
            feedback_desc: "You can use your PC or change windows, just don't close this tab until the process finishes."
        },
        toast: {
            init: { title: "Starting", desc: "Connecting to server..." },
            verify: { title: "Security Verification", desc: "Solving Cloudflare protection..." },
            verify_done: { title: "Verification Complete", desc: "Accessing document..." },
            wait: { title: "Generating Download Link", desc: "Synchronizing with external server..." },
            redirect: { title: "Redirecting", desc: "Entering final download phase..." },
            analyzing: { title: "Analyzing Document", desc: "Locating PDF data stream..." },
            validating: { title: "Verifying Integrity", desc: "Checking file size and format..." },
            success: { title: "Document Validated!", desc: "Download has started." },
            error_damaged: {
                title: "File Unavailable",
                desc: "The original PDF is empty or corrupted.",
                help: "<b>Download Failed:</b><br/>The original PDF file is not available or is corrupted on the external server. <br/><br/>👉 <b>Solution:</b> Close this tab and use one of the other saving methods in the extension panel. These alternative methods work on almost all documents."
            },
            error_timeout: { title: "Request Timed Out", desc: "The external server did not respond. Try again in a few minutes." }
        }
    },
    tr: {
        popup: {
            title: "Academia & Scribd",
            subtitle: "Akademik İndirme Paketi",
            status: "Eklenti Aktif ve Hazır",
            how_to: "NASIL KULLANILIR",
            step1: "Herhangi bir <strong>Academia.edu</strong> veya <strong>Scribd</strong> dokümanını açın.",
            step2: "Ekranın yan tarafında <strong>yüzen bir panel</strong> belirecektir. Panel görünmüyorsa sayfayı yenileyin.",
            step3: "Dosyayı kaydetmek için <strong>'Orijinal PDF'</strong> seçeneğine basın veya diğer kaydetme yöntemlerini deneyin.",
            tip: "İpucu: Eklentinin başlık kısmından minimize/maksimize edilebilir ayrıca sayfa içinde istenilen yere sürüklenebilir.",
            footer: ""
        },
        overlay: {
            title: "⚡ Scribd Downloader",
            title_academia: "🎓 Academia Downloader",
            id: "Doküman ID:",
            file: "Dosya:",
            pages: "Sayfa:",
            analyzing: "Sayfalar sayılıyor...",
            scroll_notice: "Tüm sayfaların yüklendiğinden emin olun",
            activate: "▶ İNDİRME MODUNU AKTİF ET",
            // Academia specific
            download_pdf: "ORİJİNAL PDF",
            fetching_meta: "Bilgiler alınıyor...",
            hq_btn: "AKILLI TARAMA (HQ)",
            hq_badge: "GÜVENLİ",
            hq_tooltip: "Mümkünse orijinal görselleri (Native HQ), değilse ekran görüntülerini kullanarak yüksek kaliteli PDF oluşturur.",
            hq_native_btn: "NATIVE HQ",
            hq_native_sub: "Orijinal görselleri çıkar",
            hq_native_badge: "GÜVENLİ",
            hq_native_tooltip: "Sunucudaki orijinal yüksek çözünürlüklü görselleri indirir. En net ve en kaliteli sonuç budur.",
            hq_fit_btn: "TARAYICI YÖNTEMİ",
            hq_fit_sub: "Gelişmiş parçalı tarama",
            hq_fit_badge: "ÖNERİLEN YÖNTEM",
            hq_fit_tooltip: "Tarayıcı tabanlı parçalı ekran yakalama. Metinlerin eksik çıkması veya bulanıklık sorunlarını giderir.",
            adv_opts: "GELİŞMİŞ SEÇENEKLER",
            vec_btn: "ORİJİNAL PDF",
            vec_badge: "API",
            vec_tooltip: "Orijinal PDF dosyasını harici sunuculardan indirmeye çalışır. Daha hızlıdır ancak sunucu dosyayı paylaşmıyorsa hata verebilir. Hata verirse diğer kaydetme yöntemlerinden birini kullanın.",
            large_doc_warning: "⚠️ Büyük doküman tespit edildi ({pages} sayfa). Akıllı Tarama çok uzun sürebilir ve birden fazla dosya oluşturabilir. %100 tavsiye edilen: \"Orijinal PDF\" kullanın.",
            hq_long_warning: "⏱ Bu işlem uzun sürecektir. Lütfen bu sekmeyi açık tutun.",
            states: {
                loading: "Tarama hazırlanıyor...",
                fetching: "Academia PDF indiriliyor...",
                polling: "Sunucu bekleniyor...",
                saving: "PDF Oluşturuluyor...",
                success: "PDF Kaydedildi!",
                error: "Hata: "
            },
            errors: {
                pdf_lib: "Sayfayı yenileyin (F5) ve tekrar deneyin.",
                no_pages: "Sayfa bulunamadı. Bir Scribd dokümanında mısınız?",
                capture: "Yakalama hatası. Eklenti izinlerini kontrol edin.",
                academia_failed: "Academia'dan indirme başarısız oldu."
            },
            feedback_pause: "⚠️ Lütfen bu sekmeyi açık tutun",
            feedback_desc: "Bilgisayarınızı kullanmaya devam edebilirsiniz ancak tarama bitene kadar bu sekmeyi kapatmayın veya üzerine başka bir sekme açmayın."
        },
        toast: {
            init: { title: "Başlatılıyor", desc: "Sunucuya bağlanılıyor..." },
            verify: { title: "Güvenlik Doğrulaması", desc: "Cloudflare koruması aşılıyor..." },
            verify_done: { title: "Doğrulama Tamamlandı", desc: "Dokümana erişiliyor..." },
            wait: { title: "İndirme Bağlantısı Oluşturuluyor", desc: "Harici sunucu ile senkronize ediliyor..." },
            redirect: { title: "Yönlendiriliyor", desc: "İndirme aşamasına geçiliyor..." },
            analyzing: { title: "Doküman Analiz Ediliyor", desc: "PDF veri akışı bulunuyor..." },
            validating: { title: "Bütünlük Doğrulanıyor", desc: "Dosya boyutu ve formatı kontrol ediliyor..." },
            success: { title: "Doküman Doğrulandı!", desc: "İndirme başladı." },
            error_damaged: {
                title: "Dosya Mevcut Değil",
                desc: "Orijinal PDF boş veya bozuk.",
                help: "<b>İndirme Başarısız:</b><br/>Orijinal PDF dosyası harici sunucuda mevcut değil veya bozuk. <br/><br/>👉 <b>Çözüm:</b> Bu sekmeyi kapatın ve eklenti panelindeki diğer kaydetme yöntemlerinden birini kullanın. Bu alternatif yöntemler neredeyse tüm dokümanlarda çalışır."
            },
            error_timeout: { title: "İstek Zaman Aşımına Uğradı", desc: "Harici sunucu yanıt vermedi. Birkaç dakika sonra tekrar deneyin." }
        }
    }
};

// Exportar para distintos contextos de ejecución
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
} else if (typeof window !== 'undefined') {
    window.I18n = I18n; // Content Script / Popup
}
// El Service Worker maneja esto por separado con su copia embebida en background.js
