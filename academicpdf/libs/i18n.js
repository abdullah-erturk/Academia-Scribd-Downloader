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
            step3: "Click <strong>'Download PDF'</strong> or <strong>'Smart Scan'</strong> to save your file.",
            footer: ""
        },
        overlay: {
            title: "⚡ Scribd Downloader",
            title_academia: "🎓 Academia Downloader",
            id: "Doc ID:",
            file: "File:",
            pages: "Pages:",
            analyzing: "Counting pages...",
            activate: "▶ ACTIVATE DOWNLOAD MODE",
            // Academia specific
            download_pdf: "ORIGINAL PDF",
            fetching_meta: "Fetching details...",
            // Main button: page-by-page screenshot scan
            hq_btn: "SMART SCAN (HQ)",
            hq_badge: "100% SAFE",
            hq_tooltip: "Captures each page individually as a high-resolution PNG image and assembles them into a PDF. Works even if the document has download restrictions.",
            // Advanced options section
            adv_opts: "ADVANCED OPTIONS",
            // Secondary button: original PDF extraction
            vec_btn: "ORIGINAL PDF",
            vec_badge: "AUTOMATIC",
            vec_tooltip: "Attempts to download the original PDF file from external servers. Faster, but may fail if the server doesn't expose it. If it fails, use 'Smart Scan (HQ)'.",
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
            }
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
                help: "<b>Download Failed:</b><br/>The original PDF file is not available or is corrupted on the external server. <br/><br/>👉 <b>Solution:</b> Close this tab and use the <b>'Smart Scan (HQ)'</b> option in the extension panel. This alternative method works on almost all documents."
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
            step3: "Dosyayı kaydetmek için <strong>'Orijinal PDF'</strong> veya <strong>'Akıllı Tarama'</strong> seçeneğine basın.",
            footer: ""
        },
        overlay: {
            title: "⚡ Scribd Downloader",
            title_academia: "🎓 Academia Downloader",
            id: "Doküman ID:",
            file: "Dosya:",
            pages: "Sayfa:",
            analyzing: "Sayfalar sayılıyor...",
            activate: "▶ İNDİRME MODUNU AKTİF ET",
            // Academia specific
            download_pdf: "ORİJİNAL PDF",
            fetching_meta: "Bilgiler alınıyor...",
            hq_btn: "AKILLI TARAMA (HQ)",
            hq_badge: "%100 GÜVENLİ",
            hq_tooltip: "Her sayfayı tek tek yüksek çözünürlüklü PNG görseli olarak yakalar ve bir PDF dosyasında birleştirir. Dokümanda indirme kısıtlaması olsa bile çalışır.",
            adv_opts: "GELİŞMİŞ SEÇENEKLER",
            vec_btn: "ORİJİNAL PDF",
            vec_badge: "OTOMATİK",
            vec_tooltip: "Orijinal PDF dosyasını harici sunuculardan indirmeye çalışır. Daha hızlıdır ancak sunucu dosyayı paylaşmıyorsa hata verebilir. Hata verirse 'Akıllı Tarama (HQ)' kullanın.",
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
            }
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
                help: "<b>İndirme Başarısız:</b><br/>Orijinal PDF dosyası harici sunucuda mevcut değil veya bozuk. <br/><br/>👉 <b>Çözüm:</b> Bu sekmeyi kapatın ve eklenti panelindeki <b>'Akıllı Tarama (HQ)'</b> seçeneğini kullanın. Bu yöntem neredeyse tüm dokümanlarda çalışır."
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
