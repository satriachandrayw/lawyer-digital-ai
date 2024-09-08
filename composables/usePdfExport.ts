import { ref } from 'vue';
import { useNuxtApp } from '#app';
import Quill from 'quill';

export function usePdfExport() {
  const isExporting = ref(false);

  const exportToPdf = async (editor: Quill, filename: string) => {
    if (process.client) {
      const { $html2pdf } = useNuxtApp();
      isExporting.value = true;
      try {
        // Get the HTML content from the Quill editor
        const content = editor.root.innerHTML;

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        
        // Apply base styles to the container
        tempContainer.style.cssText = `
          font-family: Arial, sans-serif;
          color: #000000;
          background-color: #ffffff;
          padding: 0;
          max-width: 100%;
          margin: 0;
        `;
        
        // Apply specific styles to elements
        const styleElements = (selector: string, styles: string) => {
          tempContainer.querySelectorAll(selector).forEach(el => {
            (el as HTMLElement).style.cssText = styles;
          });
        };

        styleElements('h1', 'font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #000000;');
        styleElements('h2', 'font-size: 20px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; color: #000000;');
        styleElements('p', 'font-size: 12px; line-height: 1.5; margin-bottom: 12px; color: #000000;');
        styleElements('ul, ol', 'margin-left: 20px; margin-bottom: 12px;');
        styleElements('li', 'font-size: 12px; line-height: 1.5; margin-bottom: 6px; color: #000000;');

        // Remove any Quill-specific classes or attributes
        tempContainer.querySelectorAll('*').forEach(el => {
          el.removeAttribute('class');
          el.removeAttribute('data-quill-clone');
          // Add any other attributes that might be added by Quill
        });

        const opt = {
          margin: [15, 15, 15, 15], // [top, left, bottom, right] margins in millimeters
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await $html2pdf().set(opt).from(tempContainer).save();
      } catch (error) {
        console.error('Error exporting PDF:', error);
      } finally {
        isExporting.value = false;
      }
    } else {
      console.error('PDF export is only available in the browser');
    }
  };

  return {
    isExporting,
    exportToPdf
  };
}
