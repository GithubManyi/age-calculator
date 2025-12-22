// Export Manager - Handles PDF, Image, and CSV exports
class ExportManager {
    constructor() {
        // Check for required libraries
        this.hasHtml2Canvas = typeof html2canvas !== 'undefined';
        this.hasJsPDF = typeof jsPDF !== 'undefined';
    }
    
    // Export as Image
    async exportAsImage() {
        if (!this.hasHtml2Canvas) {
            this.loadHtml2Canvas();
            return;
        }
        
        try {
            const resultsSection = document.querySelector('.results-section');
            if (!resultsSection) {
                showNotification('No results to export', 'error');
                return;
            }
            
            showNotification('Creating image...', 'info');
            
            const canvas = await html2canvas(resultsSection, {
                scale: 2,
                useCORS: true,
                backgroundColor: getComputedStyle(document.body).backgroundColor
            });
            
            const image = canvas.toDataURL('image/png');
            this.downloadImage(image, 'agemaster-results.png');
            
            showNotification('Image downloaded!', 'success');
        } catch (error) {
            console.error('Error exporting image:', error);
            showNotification('Failed to export image', 'error');
        }
    }
    
    // Export as PDF
    async exportAsPDF() {
        if (!this.hasHtml2Canvas || !this.hasJsPDF) {
            this.loadHtml2Canvas();
            this.loadJsPDF();
            return;
        }
        
        try {
            const resultsSection = document.querySelector('.results-section');
            if (!resultsSection) {
                showNotification('No results to export', 'error');
                return;
            }
            
            showNotification('Creating PDF...', 'info');
            
            const canvas = await html2canvas(resultsSection, {
                scale: 2,
                useCORS: true
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('agemaster-results.pdf');
            
            showNotification('PDF downloaded!', 'success');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            showNotification('Failed to export PDF', 'error');
        }
    }
    
    // Export as CSV
    exportAsCSV() {
        try {
            const data = window.tabEnhancer?.currentData;
            if (!data) {
                showNotification('No data to export', 'error');
                return;
            }
            
            const csvContent = this.convertToCSV(data);
            this.downloadCSV(csvContent, 'agemaster-data.csv');
            
            showNotification('CSV downloaded!', 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            showNotification('Failed to export CSV', 'error');
        }
    }
    
    // Helper methods
    downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    convertToCSV(data) {
        const rows = [];
        
        // Add headers
        rows.push(['Category', 'Value', 'Unit']);
        
        // Add age data
        const ageData = data.age_data;
        rows.push(['Age', Math.floor(ageData.years), 'years']);
        rows.push(['Age', ageData.months, 'months']);
        rows.push(['Age', ageData.days, 'days']);
        rows.push(['Age', ageData.weeks, 'weeks']);
        rows.push(['Age', ageData.total_hours, 'hours']);
        rows.push(['Age', ageData.total_minutes, 'minutes']);
        rows.push(['Age', ageData.total_seconds, 'seconds']);
        
        // Add planetary ages
        if (data.planetary_ages) {
            rows.push([]);
            rows.push(['PLANETARY AGES', '', '']);
            Object.entries(data.planetary_ages).forEach(([planet, age]) => {
                rows.push([planet.charAt(0).toUpperCase() + planet.slice(1), age.toFixed(2), 'years']);
            });
        }
        
        // Add time perception
        if (data.time_perception) {
            rows.push([]);
            rows.push(['TIME PERCEPTION', '', '']);
            rows.push(['Factor', data.time_perception.toFixed(2), 'x']);
        }
        
        return rows.map(row => row.join(',')).join('\n');
    }
    
    loadHtml2Canvas() {
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        document.head.appendChild(script);
        this.hasHtml2Canvas = true;
    }
    
    loadJsPDF() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
        script.onload = () => {
            this.hasJsPDF = true;
        };
    }
}

// Initialize globally
window.exportManager = new ExportManager();

// ========== ADD TO SHARE TAB HTML ==========
// In results.html, inside the share-content div, add:
/*
<div class="export-options mt-2">
    <h4>Export Results</h4>
    <div class="export-buttons">
        <button class="btn btn-export" id="exportPDF">
            <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button class="btn btn-export" id="exportImage">
            <i class="fas fa-image"></i> Image
        </button>
        <button class="btn btn-export" id="exportCSV">
            <i class="fas fa-file-csv"></i> CSV
        </button>
    </div>
</div>
*/

// ========== ADD TO SHARE.JS ==========
// Add event listeners in share.js:
/*
document.getElementById('exportPDF')?.addEventListener('click', () => {
    window.exportManager.exportAsPDF();
});
document.getElementById('exportImage')?.addEventListener('click', () => {
    window.exportManager.exportAsImage();
});
document.getElementById('exportCSV')?.addEventListener('click', () => {
    window.exportManager.exportAsCSV();
});
*/