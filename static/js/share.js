// Enhanced Social Sharing Functionality for AgeMaster - FIXED VERSION
class SocialSharing {
    constructor() {
        this.shareData = {
            title: 'AgeMaster - Discover Your Age in New Ways',
            text: 'Check out my age analysis on AgeMaster!',
            url: window.location.href,
            ageData: null
        };
        
        this.shareStats = {
            totalShares: 0,
            platforms: {}
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateShareButtons();
        this.loadShareStats();
        this.setupQRCode();
        this.setupWebShare();
    }
    
    bindEvents() {
        // WhatsApp
        document.getElementById('shareWhatsApp')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareToWhatsApp();
        });
        
        // Facebook
        document.getElementById('shareFacebook')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareToFacebook();
        });
        
        // Twitter
        document.getElementById('shareTwitter')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareToTwitter();
        });
        
        // Instagram
        document.getElementById('shareInstagram')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareToInstagram();
        });
        
        // LinkedIn
        document.getElementById('shareLinkedIn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareToLinkedIn();
        });
        
        // Telegram
        document.getElementById('shareTelegram')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareToTelegram();
        });
        
        // Reddit
        document.getElementById('shareReddit')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareToReddit();
        });
        
        // Email
        document.getElementById('shareEmail')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareViaEmail();
        });
        
        // SMS
        document.getElementById('shareSMS')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareViaSMS();
        });
        
        // Copy URL
        document.getElementById('copyUrl')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyToClipboard();
        });
        
        // Copy Age Summary
        document.getElementById('copySummary')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyAgeSummary();
        });
        
        // Download as Image
        document.getElementById('downloadImage')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadAsImage();
        });
        
        // Download as PDF
        document.getElementById('downloadPDF')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadAsPDF();
        });
        
        // Print
        document.getElementById('printResults')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.printResults();
        });
        
        // QR Code
        document.getElementById('qrCodeBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.generateQRCode();
        });
        
        // Web Share API
        document.getElementById('webShare')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.webShare();
        });
        
        // Share to clipboard with image
        document.getElementById('shareImageClipboard')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.shareImageToClipboard();
        });
    }
    
    // Enhanced WhatsApp sharing
    shareToWhatsApp() {
        const message = this.generateShareMessage();
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
        this.logShare('whatsapp');
    }
    
    // Enhanced Facebook sharing
    shareToFacebook() {
        const url = encodeURIComponent(this.shareData.url);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(this.shareData.text)}`, '_blank', 'width=600,height=400');
        this.logShare('facebook');
    }
    
    // Enhanced Twitter sharing
    shareToTwitter() {
        const message = this.generateShareMessage();
        const encodedMessage = encodeURIComponent(message.substring(0, 280));
        const url = encodeURIComponent(this.shareData.url);
        window.open(`https://twitter.com/intent/tweet?text=${encodedMessage}&url=${url}`, '_blank', 'width=600,height=400');
        this.logShare('twitter');
    }
    
    // Instagram sharing
    shareToInstagram() {
        if (/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)) {
            const message = this.generateShareMessage();
            const encodedMessage = encodeURIComponent(message);
            
            window.location.href = `instagram://create?caption=${encodedMessage}`;
            
            setTimeout(() => {
                window.open(`https://www.instagram.com/create/story?text=${encodedMessage}`, '_blank');
            }, 500);
        } else {
            const message = this.generateShareMessage();
            navigator.clipboard.writeText(message).then(() => {
                this.showNotification('📋 Instagram message copied! Open Instagram and paste in your story or post.', 'success');
                window.open('https://www.instagram.com', '_blank');
            });
        }
        this.logShare('instagram');
    }
    
    // LinkedIn sharing
    shareToLinkedIn() {
        const url = encodeURIComponent(this.shareData.url);
        const title = encodeURIComponent(this.shareData.title);
        const summary = encodeURIComponent(this.shareData.text);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
        this.logShare('linkedin');
    }
    
    // Telegram sharing
    shareToTelegram() {
        const message = this.generateShareMessage();
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(this.shareData.url)}&text=${encodedMessage}`, '_blank');
        this.logShare('telegram');
    }
    
    // Reddit sharing
    shareToReddit() {
        const url = encodeURIComponent(this.shareData.url);
        const title = encodeURIComponent(`My Age Analysis: ${this.shareData.text}`);
        window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
        this.logShare('reddit');
    }
    
    // Enhanced Email sharing
    shareViaEmail() {
        const subject = encodeURIComponent(`My Age Analysis: ${this.shareData.title}`);
        const body = encodeURIComponent(this.generateEmailBody());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        this.logShare('email');
    }
    
    // SMS sharing
    shareViaSMS() {
        const message = this.generateShareMessage();
        const encodedMessage = encodeURIComponent(message);
        window.location.href = `sms:?body=${encodedMessage}`;
        this.logShare('sms');
    }
    
    // Enhanced clipboard copy
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.shareData.url);
            this.showNotification('🔗 Link copied to clipboard!', 'success');
            this.logShare('clipboard');
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = this.shareData.url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('🔗 Link copied to clipboard!', 'success');
            this.logShare('clipboard');
        }
    }
    
    // Copy age summary text
    async copyAgeSummary() {
        if (!this.shareData.ageData) {
            this.showNotification('No age data available', 'error');
            return;
        }
        
        const summary = this.generateShareMessage();
        try {
            await navigator.clipboard.writeText(summary);
            this.showNotification('📋 Age summary copied!', 'success');
            this.logShare('copy_summary');
        } catch (err) {
            this.showNotification('Failed to copy summary', 'error');
        }
    }
    
    // Enhanced image download - FIXED
    async downloadAsImage() {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection || resultsSection.innerHTML.trim() === '') {
            this.showNotification('❌ No age results to download. Please calculate your age first.', 'error');
            return;
        }
        
        if (typeof html2canvas === 'undefined') {
            this.showNotification('❌ Image generation library not loaded. Please refresh the page.', 'error');
            return;
        }
        
        this.showNotification('🖼️ Generating image...', 'info');
        
        try {
            const overlay = this.createLoadingOverlay('Creating your age visualization...');
            
            const tempContainer = document.createElement('div');
            tempContainer.style.cssText = `
                position: fixed;
                top: -9999px;
                left: -9999px;
                width: 800px;
                background: ${getComputedStyle(document.body).backgroundColor};
                padding: 20px;
                z-index: -9999;
            `;
            
            const clone = resultsSection.cloneNode(true);
            
            clone.querySelectorAll('button, input, .tab-btn, .calculate-btn, .no-print, .no-capture').forEach(el => {
                el.remove();
            });
            
            clone.querySelectorAll('.tab-content').forEach(el => {
                el.style.display = 'block';
            });
            
            tempContainer.appendChild(clone);
            document.body.appendChild(tempContainer);
            
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                backgroundColor: getComputedStyle(document.body).backgroundColor,
                logging: false,
                allowTaint: true,
                removeContainer: true
            });
            
            document.body.removeChild(tempContainer);
            
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];
            const age = this.shareData.ageData?.years || 'age';
            link.download = `agemaster-${age}yo-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            if (overlay && overlay.parentNode) {
                overlay.remove();
            }
            
            this.showNotification('✅ Image downloaded successfully!', 'success');
            this.logShare('download_image');
            
        } catch (error) {
            console.error('Image download failed:', error);
            this.showNotification('❌ Failed to generate image. Please try a smaller section.', 'error');
        }
    }
    
    // Download as PDF - FIXED
    async downloadAsPDF() {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection || resultsSection.innerHTML.trim() === '') {
            this.showNotification('❌ No age results to download. Please calculate your age first.', 'error');
            return;
        }
        
        this.showNotification('📄 Creating PDF...', 'info');
        
        try {
            if (typeof jspdf !== 'undefined') {
                const { jsPDF } = window.jspdf;
                
                const tempContainer = document.createElement('div');
                tempContainer.style.cssText = `
                    position: fixed;
                    top: -9999px;
                    left: -9999px;
                    width: 800px;
                    background: white;
                    padding: 40px;
                    z-index: -9999;
                `;
                
                const clone = resultsSection.cloneNode(true);
                
                clone.querySelectorAll('button, input, .tab-btn, .no-print').forEach(el => {
                    el.remove();
                });
                
                clone.querySelectorAll('.tab-content').forEach(el => {
                    el.style.display = 'block';
                });
                
                tempContainer.appendChild(clone);
                document.body.appendChild(tempContainer);
                
                const canvas = await html2canvas(clone, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: 'white',
                    logging: false
                });
                
                document.body.removeChild(tempContainer);
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgData = canvas.toDataURL('image/png');
                const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
                
                const pageCount = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    pdf.text(
                        `Generated by AgeMaster • ${new Date().toLocaleDateString()} • Page ${i} of ${pageCount}`,
                        pdfWidth / 2,
                        pdf.internal.pageSize.getHeight() - 10,
                        { align: 'center' }
                    );
                }
                
                pdf.save(`agemaster-results-${Date.now()}.pdf`);
            } else {
                await this.downloadAsImage();
                return;
            }
            
            this.showNotification('✅ PDF downloaded successfully!', 'success');
            this.logShare('download_pdf');
            
        } catch (error) {
            console.error('PDF download failed:', error);
            this.showNotification('❌ Failed to create PDF. Trying image download instead...', 'warning');
            
            setTimeout(() => this.downloadAsImage(), 1000);
        }
    }
    
    // Enhanced print functionality - FIXED
    printResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection || resultsSection.innerHTML.trim() === '') {
            this.showNotification('❌ No age results to print. Please calculate your age first.', 'error');
            return;
        }
        
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>AgeMaster Results</title>
                <meta charset="utf-8">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Inter', sans-serif;
                        padding: 20px;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                    }
                    
                    .print-container {
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        border: 1px solid #e5e7eb;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #3b82f6;
                    }
                    
                    .print-header h1 {
                        color: #3b82f6;
                        font-size: 28px;
                        margin-bottom: 10px;
                    }
                    
                    .print-header .date {
                        color: #6b7280;
                        font-size: 14px;
                    }
                    
                    .print-content {
                        margin-top: 20px;
                    }
                    
                    .age-highlight {
                        text-align: center;
                        margin: 30px 0;
                        padding: 30px;
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        border-radius: 16px;
                        color: white;
                    }
                    
                    .main-age {
                        font-size: 72px;
                        font-weight: 800;
                        line-height: 1;
                        margin-bottom: 10px;
                    }
                    
                    .age-subtitle {
                        font-size: 20px;
                        opacity: 0.9;
                    }
                    
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin: 30px 0;
                    }
                    
                    .stat-card {
                        background: #f8fafc;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        border: 1px solid #e5e7eb;
                    }
                    
                    .stat-value {
                        font-size: 24px;
                        font-weight: 700;
                        color: #3b82f6;
                        margin-bottom: 5px;
                    }
                    
                    .stat-label {
                        font-size: 14px;
                        color: #6b7280;
                    }
                    
                    .print-section {
                        margin: 30px 0;
                        padding: 20px;
                        background: #f8fafc;
                        border-radius: 10px;
                    }
                    
                    .print-section h3 {
                        color: #1e40af;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #3b82f6;
                    }
                    
                    .print-footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        font-size: 12px;
                        color: #9ca3af;
                    }
                    
                    button, input, .tab-btn, .calculate-btn, .no-print {
                        display: none !important;
                    }
                    
                    .tab-content {
                        display: block !important;
                        margin-bottom: 30px;
                    }
                    
                    @media print {
                        body {
                            padding: 10px;
                        }
                        
                        .print-container {
                            border: none;
                            padding: 10px;
                        }
                        
                        .no-print {
                            display: none !important;
                        }
                    }
                    
                    @page {
                        margin: 0.5in;
                    }
                </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="print-header">
                        <h1>AgeMaster Results</h1>
                        <p class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>
                    
                    <div class="age-highlight">
                        ${this.generatePrintAgeHighlight()}
                    </div>
                    
                    <div class="print-content">
                        ${this.cleanHTMLForPrint(resultsSection.innerHTML)}
                    </div>
                    
                    <div class="print-footer">
                        <p>Created with ❤️ by AgeMaster | ${window.location.origin}</p>
                        <p>For more features, visit the website</p>
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 500);
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.showNotification('❌ Popup blocked! Please allow popups to print.', 'error');
            return;
        }
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        this.logShare('print');
    }
    
    // QR Code generation with modal
    generateQRCode() {
        const url = this.shareData.url;
        
        let modal = document.getElementById('qrModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'qrModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Share via QR Code</h3>
                        <span class="modal-close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div id="qrCodeContainer" class="qr-container"></div>
                        <div class="qr-instructions">
                            <p>📱 Scan this QR code with your phone's camera to view your age analysis</p>
                            <div class="qr-url">
                                <input type="text" id="qrUrlDisplay" readonly value="${url}">
                                <button class="btn-small" id="copyQrUrl">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn" id="downloadQR">
                            <i class="fas fa-download"></i> Download QR Code
                        </button>
                        <button class="btn" onclick="this.closest('.modal').style.display='none'">
                            Close
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
            
            modal.querySelector('#copyQrUrl').addEventListener('click', () => {
                const input = modal.querySelector('#qrUrlDisplay');
                input.select();
                document.execCommand('copy');
                this.showNotification('QR URL copied!', 'success');
            });
            
            modal.querySelector('#downloadQR').addEventListener('click', () => {
                this.downloadQRCode();
            });
        }
        
        const qrContainer = modal.querySelector('#qrCodeContainer');
        qrContainer.innerHTML = '';
        
        if (typeof QRCode !== 'undefined') {
            new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark: '#4361ee',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            qrContainer.innerHTML = '<p style="color: #ef4444; text-align: center;">QR Code library not loaded</p>';
        }
        
        modal.style.display = 'block';
        this.logShare('qr_code');
    }
    
    // Download QR code as image
    downloadQRCode() {
        const qrContainer = document.querySelector('#qrCodeContainer canvas');
        if (qrContainer) {
            const link = document.createElement('a');
            link.download = `agemaster-qr-${Date.now()}.png`;
            link.href = qrContainer.toDataURL('image/png');
            link.click();
            this.showNotification('QR Code downloaded!', 'success');
        } else {
            this.showNotification('QR Code not generated yet', 'error');
        }
    }
    
    // Web Share API (modern browsers)
    async webShare() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: this.shareData.title,
                    text: this.generateShareMessage(),
                    url: this.shareData.url
                });
                this.logShare('web_share');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.showNotification('Share cancelled', 'info');
                }
            }
        } else {
            this.showNotification('Web Share not supported in your browser', 'info');
        }
    }
    
    // Share image to clipboard
    async shareImageToClipboard() {
        this.showNotification('🖼️ Creating image for clipboard...', 'info');
        
        try {
            const resultsSection = document.getElementById('resultsSection');
            const canvas = await html2canvas(resultsSection, { scale: 2 });
            
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    this.showNotification('✅ Image copied to clipboard!', 'success');
                    this.logShare('image_clipboard');
                } catch (err) {
                    this.showNotification('❌ Could not copy image', 'error');
                }
            });
        } catch (error) {
            console.error('Image clipboard share failed:', error);
            this.showNotification('❌ Failed to create image', 'error');
        }
    }
    
    // Helper methods
    generateShareMessage() {
        if (this.shareData.ageData) {
            const age = this.shareData.ageData.years;
            const days = this.shareData.ageData.total_days.toLocaleString();
            const hours = this.shareData.ageData.total_hours.toLocaleString();
            return `🎉 I'm ${age} years old! That's ${days} days, ${hours} hours of life! Discover your age in amazing ways with AgeMaster: ${this.shareData.url}`;
        }
        return `Discover your age in amazing ways with AgeMaster! ${this.shareData.url}`;
    }
    
    generateEmailBody() {
        if (this.shareData.ageData) {
            const age = this.shareData.ageData.years;
            const months = this.shareData.ageData.months;
            const days = this.shareData.ageData.days;
            const totalDays = this.shareData.ageData.total_days.toLocaleString();
            
            return `Hello!

I just discovered my age in amazing detail using AgeMaster!

📊 My Age Analysis:
• ${age} years, ${months} months, ${days} days old
• ${totalDays} total days lived
• Born on a ${this.shareData.ageData.weekdayBorn || 'beautiful day'}

Check out my full age analysis here: ${this.shareData.url}

Discover your own age in new ways at: ${window.location.origin}

Best regards`;
        }
        return `Check out this amazing age calculator! ${this.shareData.url}`;
    }
    
    cleanHTMLForPrint(html) {
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        tempDiv.querySelectorAll('button, input, textarea, select, .no-print').forEach(el => {
            el.remove();
        });
        
        tempDiv.querySelectorAll('.tab-content').forEach(el => {
            el.style.display = 'block';
        });
        
        return tempDiv.innerHTML;
    }
    
    generatePrintAgeHighlight() {
        if (!this.shareData.ageData) {
            return `
                <div class="main-age">Calculate Your Age</div>
                <div class="age-subtitle">Discover your age in amazing detail</div>
            `;
        }
        
        const data = this.shareData.ageData;
        return `
            <div class="main-age">${data.years}</div>
            <div class="age-subtitle">
                Years Old<br>
                ${data.months} months • ${data.days} days • ${data.total_days.toLocaleString()} total days
            </div>
        `;
    }
    
    updateShareButtons() {
        const shareUrlInput = document.getElementById('shareUrl');
        if (shareUrlInput) {
            shareUrlInput.value = this.shareData.url;
        }
        
        this.updateShareCount();
        this.updatePlatformLinks();
    }
    
    updatePlatformLinks() {
        const platforms = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareData.url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.shareData.text)}&url=${encodeURIComponent(this.shareData.url)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareData.url)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(this.shareData.url)}&description=${encodeURIComponent(this.shareData.text)}`
        };
        
        Object.entries(platforms).forEach(([platform, url]) => {
            const link = document.querySelector(`[data-social="${platform}"]`);
            if (link) {
                link.href = url;
            }
        });
    }
    
    updateShareData(data) {
        if (data) {
            this.shareData.ageData = data.age_data;
            this.shareData.text = `I'm ${data.age_data.years} years old! Discovered with AgeMaster - ${data.age_data.total_days.toLocaleString()} days, ${data.age_data.total_hours.toLocaleString()} hours, and counting!`;
            
            const birthDate = document.getElementById('birthDate')?.value;
            if (birthDate) {
                this.shareData.url = `${window.location.origin}?birthdate=${encodeURIComponent(birthDate)}`;
            }
            
            this.updateShareButtons();
        }
    }
    
    loadShareStats() {
        const savedStats = localStorage.getItem('agemaster_share_stats');
        if (savedStats) {
            this.shareStats = JSON.parse(savedStats);
        }
    }
    
    saveShareStats() {
        localStorage.setItem('agemaster_share_stats', JSON.stringify(this.shareStats));
    }
    
    logShare(platform) {
        this.shareStats.totalShares++;
        this.shareStats.platforms[platform] = (this.shareStats.platforms[platform] || 0) + 1;
        
        this.saveShareStats();
        this.updateShareCount();
    }
    
    updateShareCount() {
        const shareCount = document.getElementById('shareCount');
        if (shareCount) {
            shareCount.textContent = this.shareStats.totalShares.toLocaleString();
        }
        
        Object.entries(this.shareStats.platforms).forEach(([platform, count]) => {
            const element = document.getElementById(`${platform}ShareCount`);
            if (element) {
                element.textContent = count.toLocaleString();
            }
        });
    }
    
    createLoadingOverlay(message) {
        const overlay = document.createElement('div');
        overlay.className = 'share-loading-overlay';
        overlay.innerHTML = `
            <div class="share-loading-content">
                <div class="share-loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-family: Inter, sans-serif;
        `;
        
        overlay.querySelector('.share-loading-content').style.cssText = `
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        overlay.querySelector('.share-loading-spinner').style.cssText = `
            width: 50px;
            height: 50px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top-color: #3b82f6;
            border-radius: 50%;
            margin: 0 auto 1rem;
            animation: spin 1s linear infinite;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    showNotification(message, type = 'info') {
        document.querySelectorAll('.share-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `share-notification ${type}`;
        
        const icons = {
            success: '✓',
            error: '✗',
            info: 'ℹ',
            warning: '⚠'
        };
        
        notification.innerHTML = `
            <div class="share-notification-icon">${icons[type] || icons.info}</div>
            <div class="share-notification-content">${message}</div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : 
                        type === 'error' ? '#ef4444' : 
                        type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            font-family: Inter, sans-serif;
        `;
        
        notification.querySelector('.share-notification-icon').style.cssText = `
            font-size: 1.2rem;
            font-weight: bold;
        `;
        
        notification.querySelector('.share-notification-content').style.cssText = `
            flex: 1;
            font-size: 0.95rem;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    setupQRCode() {
    }
    
    setupWebShare() {
        const webShareBtn = document.getElementById('webShare');
        if (webShareBtn && navigator.share) {
            webShareBtn.style.display = 'flex';
        }
    }
}

// Initialize social sharing
let socialSharing = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        socialSharing = new SocialSharing();
        window.socialSharing = socialSharing;
    });
} else {
    socialSharing = new SocialSharing();
    window.socialSharing = socialSharing;
}

// Export functions for use in other scripts
window.updateShareData = function(data) {
    if (socialSharing) {
        socialSharing.updateShareData(data);
    }
};

window.generateQRCode = function() {
    if (socialSharing) {
        socialSharing.generateQRCode();
    }
};

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Add CSS for share features
const shareStyles = document.createElement('style');
shareStyles.textContent = `
    .share-options {
        background: var(--card);
        padding: 2rem;
        border-radius: 16px;
        border: 1px solid var(--border);
        margin-top: 1rem;
    }
    
    .social-sharing-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
        margin: 1.5rem 0;
    }
    
    .social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.8rem 1rem;
        background: var(--background);
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--text-primary);
        text-decoration: none;
        transition: all 0.3s;
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .social-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .social-btn.whatsapp { color: #25D366; border-color: #25D366; }
    .social-btn.whatsapp:hover { background: #25D366; color: white; }
    
    .social-btn.facebook { color: #1877F2; border-color: #1877F2; }
    .social-btn.facebook:hover { background: #1877F2; color: white; }
    
    .social-btn.twitter { color: #000000; border-color: #000000; }
    .social-btn.twitter:hover { background: #000000; color: white; }
    
    .social-btn.instagram { 
        color: #E1306C;
        border-color: #E1306C;
        background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        border-image: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D) 1;
    }
    .social-btn.instagram:hover { 
        background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
        -webkit-text-fill-color: white;
        color: white;
        border-color: transparent;
    }
    
    .social-btn.linkedin { color: #0A66C2; border-color: #0A66C2; }
    .social-btn.linkedin:hover { background: #0A66C2; color: white; }
    
    .social-btn.telegram { color: #26A5E4; border-color: #26A5E4; }
    .social-btn.telegram:hover { background: #26A5E4; color: white; }
    
    .social-btn.reddit { color: #FF4500; border-color: #FF4500; }
    .social-btn.reddit:hover { background: #FF4500; color: white; }
    
    .social-btn.email { color: #EA4335; border-color: #EA4335; }
    .social-btn.email:hover { background: #EA4335; color: white; }
    
    .social-btn.sms { color: #34C759; border-color: #34C759; }
    .social-btn.sms:hover { background: #34C759; color: white; }
    
    .social-btn.qr { color: #8B5CF6; border-color: #8B5CF6; }
    .social-btn.qr:hover { background: #8B5CF6; color: white; }
    
    .social-btn.web-share { color: #6366F1; border-color: #6366F1; }
    .social-btn.web-share:hover { background: #6366F1; color: white; }
    
    .share-actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 0.75rem;
        margin: 1.5rem 0;
    }
    
    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.9rem 1rem;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 10px;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 500;
        font-size: 0.9rem;
    }
    
    .action-btn:hover {
        background: var(--primary-blue);
        color: white;
        border-color: var(--primary-blue);
        transform: translateY(-2px);
    }
    
    .share-link-container {
        margin: 1.5rem 0;
        padding: 1.5rem;
        background: var(--background);
        border-radius: 12px;
        border: 1px solid var(--border);
    }
    
    .share-link {
        display: flex;
        gap: 0.5rem;
    }
    
    .share-link input {
        flex: 1;
        padding: 0.8rem 1rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--card);
        color: var(--text-primary);
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
    }
    
    .share-stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border);
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .share-stat {
        text-align: center;
    }
    
    .share-stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-blue);
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 10000;
        align-items: center;
        justify-content: center;
    }
    
    .modal-content {
        background: var(--card);
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border);
    }
    
    .modal-close {
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary);
    }
    
    .modal-close:hover {
        color: var(--text-primary);
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
    }
    
    .qr-container {
        display: flex;
        justify-content: center;
        margin: 1.5rem 0;
    }
    
    .qr-instructions {
        text-align: center;
        margin-top: 1.5rem;
        color: var(--text-secondary);
    }
    
    .qr-url {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    
    .qr-url input {
        flex: 1;
        padding: 0.8rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--background);
        color: var(--text-primary);
    }
    
    @media (max-width: 768px) {
        .social-sharing-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .share-actions-grid {
            grid-template-columns: 1fr;
        }
        
        .share-link {
            flex-direction: column;
        }
        
        .share-stats {
            flex-direction: column;
            gap: 1rem;
        }
    }
    
    @media (max-width: 480px) {
        .social-sharing-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(shareStyles);

// ========== EXPORT FUNCTIONALITY ==========

// Add event listeners for export buttons
document.getElementById('exportPDF')?.addEventListener('click', () => {
    if (typeof window.exportManager !== 'undefined' && typeof window.exportManager.exportAsPDF === 'function') {
        window.exportManager.exportAsPDF();
    } else {
        alert('PDF export feature is not available. Please try another format.');
    }
});

document.getElementById('exportImage')?.addEventListener('click', () => {
    if (typeof window.exportManager !== 'undefined' && typeof window.exportManager.exportAsImage === 'function') {
        window.exportManager.exportAsImage();
    } else {
        alert('Image export feature is not available. Please try another format.');
    }
});

document.getElementById('exportCSV')?.addEventListener('click', () => {
    if (typeof window.exportManager !== 'undefined' && typeof window.exportManager.exportAsCSV === 'function') {
        window.exportManager.exportAsCSV();
    } else {
        alert('CSV export feature is not available. Please try another format.');
    }
});