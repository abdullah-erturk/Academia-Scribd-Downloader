/**
 * Academia.edu Download Logic
 * Integrated into browser extension
 */

const AcademiaLogic = {
    parsePaper: async (url) => {
        const response = await fetch('https://downacademia.net/api/parse_paper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
        if (!response.ok) throw new Error(`Academia API error: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Parse failed');
        return data.data; // contains title and documentId
    },

    checkStatus: async (docId) => {
        const response = await fetch(`https://downacademia.net/api/check_status?id=${docId}`);
        if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
        const data = await response.json();
        return data;
    },

    pollForDownloadUrl: async (docId) => {
        for (let i = 0; i < 12; i++) {
            const statusData = await AcademiaLogic.checkStatus(docId);
            if (statusData.success && statusData.data?.status === 'completed') {
                return statusData.data.file?.url || '';
            }
            await new Promise((r) => setTimeout(r, 2000));
        }
        throw new Error('Download timed out');
    },

    triggerDownload: (url, filename) => {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({
                action: "force_download",
                url: url,
                docName: filename
            }, (response) => {
                resolve(response || { success: false, error: "No response from background" });
            });
        });
    }
};

window.AcademiaLogic = AcademiaLogic;
