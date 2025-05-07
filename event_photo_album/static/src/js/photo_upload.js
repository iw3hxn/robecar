/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.PhotoUploadWidget = publicWidget.Widget.extend({
    selector: '.js_photo_upload',
    events: {
        'change input[type="file"]': '_onFileChange',
        'dragenter .drop-zone': '_onDragEnter',
        'dragover .drop-zone': '_onDragOver',
        'dragleave .drop-zone': '_onDragLeave',
        'drop .drop-zone': '_onDrop',
        'submit': '_onSubmit',
        'click .remove-image': '_onRemoveImage',
    },

    start() {
        this._super(...arguments);
        this.dropZone = this.el.querySelector('.drop-zone');
        this.previewContainer = this.el.querySelector('.preview-container');
        this.errorContainer = this.el.querySelector('.upload-error');
        this.fileInput = this.el.querySelector('input[type="file"]');
        this.progressBar = this.el.querySelector('.upload-progress');
        this.progressBarInner = this.progressBar?.querySelector('.progress-bar');
        this.fileCounter = this.el.querySelector('.selected-files-count');
        this.fileCounterSpan = this.fileCounter?.querySelector('.counter');

        this.previewImagesContainer = document.createElement('div');
        this.previewImagesContainer.className = 'row preview-images';
        this.previewContainer.innerHTML = '';
        this.previewContainer.appendChild(this.previewImagesContainer);
        this.submitButton = this.el.querySelector('button[type="submit"]');
        this.filesToUpload = new DataTransfer();

        return Promise.resolve();
    },

    _showError(message) {
        if (!this.errorContainer) {
            // Se non esiste il container degli errori, lo creiamo
            this.errorContainer = document.createElement('div');
            this.errorContainer.className = 'alert alert-danger mt-3';
            this.el.querySelector('form').prepend(this.errorContainer);
        }

        this.errorContainer.textContent = message;
        this.errorContainer.classList.remove('d-none');

        // Nascondi il messaggio dopo 5 secondi
        setTimeout(() => {
            this.errorContainer.classList.add('d-none');
        }, 5000);
    },

    _onFileChange(ev) {
        const files = ev.target.files;
        if (files && files.length) {
            this._clearPreviews();
            this.filesToUpload = new DataTransfer();
            this._processFiles(files);
        }
    },

    _onDragEnter(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.dropZone.classList.add('drag-over');
    },

    _onDragOver(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.dropZone.classList.add('drag-over');
    },

    _onDragLeave(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if (!this.dropZone.contains(ev.relatedTarget)) {
            this.dropZone.classList.remove('drag-over');
        }
    },

    _onDrop(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.dropZone.classList.remove('drag-over');

        const dt = ev.dataTransfer || (ev.originalEvent && ev.originalEvent.dataTransfer);
        if (dt && dt.files) {
            this._clearPreviews();
            this.filesToUpload = new DataTransfer();
            this._processFiles(dt.files);
        }
    },

    _processFiles(files) {
        Array.from(files).forEach(file => this._handleFile(file));
    },

    _updateFileCounter() {
        const count = this.filesToUpload.files.length;
        if (count > 0) {
            this.fileCounter.classList.remove('d-none');
            this.fileCounterSpan.textContent = count;
            this.submitButton.classList.remove('d-none');  // Mostra il pulsante
        } else {
            this.fileCounter.classList.add('d-none');
            this.submitButton.classList.add('d-none');     // Nasconde il pulsante
        }
    },

    _handleFile(file) {
        if (!file.type.startsWith('image/')) {
            this._showError(`${file.name} non è un'immagine valida`);
            return;
        }

        if (file.size > 25 * 1024 * 1024) {
            this._showError(`${file.name} supera il limite di 25MB`);
            return;
        }

        this.filesToUpload.items.add(file);
        this.fileInput.files = this.filesToUpload.files;

        this._createPreview(file);
        this.previewContainer.classList.remove('d-none');
        this._updateFileCounter();
    },

    _createPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const col = document.createElement('div');
            col.className = 'col-6 col-sm-4 col-md-3 mb-3';
            col.dataset.fileName = file.name;

            const card = document.createElement('div');
            card.className = 'card h-100 position-relative';

            // Pulsante rimozione
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image btn btn-danger btn-sm position-absolute end-0 top-0 m-1';
            removeBtn.innerHTML = '<i class="fa fa-times"></i>';
            removeBtn.dataset.fileName = file.name;

            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'card-img-top';
            img.style.objectFit = 'cover';
            img.style.height = '150px';

            card.appendChild(removeBtn);
            card.appendChild(img);
            col.appendChild(card);
            this.previewImagesContainer.appendChild(col);
        };
        reader.readAsDataURL(file);
    },

    _clearPreviews() {
        this.previewImagesContainer.innerHTML = '';
        this.previewContainer.classList.add('d-none');
        this.filesToUpload = new DataTransfer();
        this.fileInput.files = this.filesToUpload.files;
        this._updateFileCounter();
    },

    _onRemoveImage(ev) {
        ev.preventDefault();
        const fileName = ev.currentTarget.dataset.fileName;
        const previewEl = this.el.querySelector(`[data-file-name="${fileName}"]`);

        // Rimuovi il file dal DataTransfer
        const newDataTransfer = new DataTransfer();
        Array.from(this.filesToUpload.files)
            .filter(file => file.name !== fileName)
            .forEach(file => newDataTransfer.items.add(file));

        this.filesToUpload = newDataTransfer;
        this.fileInput.files = this.filesToUpload.files;

        // Rimuovi l'anteprima
        if (previewEl) {
            previewEl.remove();
        }

        this._updateFileCounter();

        if (this.filesToUpload.files.length === 0) {
            this.previewContainer.classList.add('d-none');
        }
    },

    _onSubmit(ev) {
        const fileInput = this.filesToUpload;
        if (fileInput.files.length === 0) {
            ev.preventDefault();
            this._showError('Seleziona almeno un\'immagine da caricare');
            return;
        }

        // Disable the submit button and add loading state
        this.submitButton.setAttribute('disabled', 'disabled');
        this.submitButton.innerHTML = '<i class="fa fa-spinner fa-spin me-2"></i>Caricamento...';

        // Disable all remove buttons in the preview
        const removeButtons = this.el.querySelectorAll('.remove-image');
        removeButtons.forEach(button => {
            button.setAttribute('disabled', 'disabled');
            button.style.pointerEvents = 'none';
            button.style.opacity = '0.5';
        });

        // Add overlay to preview container to indicate read-only state
        this.previewImagesContainer.classList.add('uploading');

        // Previeni il submit normale
        ev.preventDefault();

        // Mostra la barra di progresso
        this.progressBar.classList.remove('d-none');

        // Array di tutti i file da caricare
        const files = Array.from(fileInput.files);
        let currentFileIndex = 0;
        const totalFiles = files.length;

        // Imposta timeout globale per l'intero processo di upload
        const timeoutDuration = 300000; // 5 minuti
        this.uploadTimeout = setTimeout(() => {
            this._handleUploadError('Il caricamento è scaduto. Riprova con file più piccoli o una connessione migliore.');
        }, timeoutDuration);

        const uploadNext = () => {
            if (currentFileIndex >= totalFiles) {
                clearTimeout(this.uploadTimeout);
                window.location.href = '/event/photo/album?success=true';
                return;
            }

            const formData = new FormData();
            formData.append('photos[]', files[currentFileIndex]);

            const csrfToken = document.querySelector('input[name="csrf_token"]').value;
            formData.append('csrf_token', csrfToken);

            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && this.progressBarInner) {
                    const fileProgress = (e.loaded / e.total);
                    const totalProgress = ((currentFileIndex + fileProgress) / totalFiles) * 100;

                    this.progressBarInner.style.width = totalProgress + '%';
                    this.progressBarInner.setAttribute('aria-valuenow', totalProgress);
                    this.progressBarInner.textContent =
                        `${Math.round(totalProgress)}% (File ${currentFileIndex + 1}/${totalFiles})`;
                }
            });

            xhr.onload = () => {
                if (xhr.status === 200) {
                    currentFileIndex++;
                    uploadNext();
                } else {
                    clearTimeout(this.uploadTimeout);
                    this._handleUploadError(`Errore durante il caricamento del file ${currentFileIndex + 1}`);
                }
            };

            xhr.onerror = () => {
                clearTimeout(this.uploadTimeout);
                this._handleUploadError(`Errore di rete durante il caricamento del file ${currentFileIndex + 1}`);
            };

            xhr.onabort = () => {
                clearTimeout(this.uploadTimeout);
                this._handleUploadError('Upload annullato');
            };

            // Imposta timeout per la singola richiesta
            xhr.timeout = 120000; // 2 minuto per file
            xhr.ontimeout = () => {
                clearTimeout(this.uploadTimeout);
                this._handleUploadError(`Timeout durante il caricamento del file ${currentFileIndex + 1}`);
            };

            xhr.open('POST', '/event/photo/upload', true);
            xhr.send(formData);
        };

        // Inizia con il primo file
        uploadNext();
    },

    _handleUploadError(message) {
        // Ripristina lo stato del pulsante
        this.submitButton.removeAttribute('disabled');
        this.submitButton.innerHTML = '<i class="fa fa-upload me-2"></i>Carica Foto';

        // Riabilita i pulsanti di rimozione
        const removeButtons = this.el.querySelectorAll('.remove-image');
        removeButtons.forEach(button => {
            button.removeAttribute('disabled');
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
        });

        // Rimuovi la classe uploading
        this.previewImagesContainer.classList.remove('uploading');

        // Nascondi la barra di progresso
        this.progressBar.classList.add('d-none');

        // Mostra il messaggio di errore
        this._showError(message);
    }

});

export default publicWidget.registry.PhotoUploadWidget;