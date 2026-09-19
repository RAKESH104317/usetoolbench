document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.tool-form');

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const statusBox = form.parentElement.querySelector('.status-box');
      const tool = form.dataset.tool;
      const fileInput = form.querySelector('input[type="file"]');

      if (!fileInput.files[0]) {
        statusBox.textContent = 'Please select a file before converting.';
        statusBox.className = 'status-box error';
        return;
      }

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      statusBox.textContent = 'Processing your document...';
      statusBox.className = 'status-box';

      try {
        const response = await fetch(`/api/v1/convert/${tool}`, {
          method: 'POST',
          body: formData,
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'A conversion error occurred.');
        }

        statusBox.className = 'status-box success';
        const outputName = payload.outputFileName || 'converted-file';
        statusBox.innerHTML = `
          <strong>Conversion complete.</strong><br />
          ${payload.message}<br />
          <a class="download-btn" href="${payload.downloadUrl}" download="${outputName}" target="_blank" rel="noreferrer">Download file</a>
        `;
      } catch (error) {
        statusBox.className = 'status-box error';
        statusBox.textContent = error.message;
      }
    });
  });
});
