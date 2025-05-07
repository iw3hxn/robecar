/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { rpc } from "@web/core/network/rpc";

publicWidget.registry.PhotoGalleryWidget = publicWidget.Widget.extend({
    selector: '.container',
    events: {
        'click img[data-photo-id]': '_onPhotoClick',
    },

    start() {
        this._super(...arguments);
        this._injectModalStyles();
        return Promise.resolve();
    },

    _injectModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .custom-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.9);
            }
            .custom-modal.show {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .custom-modal-content {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 95%;
                max-height: 95vh;
                position: relative;
                overflow: auto;
            }
            .custom-modal-close {
                position: absolute;
                right: 10px;
                top: 10px;
                cursor: pointer;
                background: none;
                border: none;
                font-size: 24px;
                color: #333;
                z-index: 1002;
            }
            .custom-modal-title {
                margin-bottom: 15px;
                padding-right: 30px;
            }
            .photo-details {
                margin-top: 15px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
            }
            .download-btn {
                background-color: #198754;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin-top: 10px;
            }
            .download-btn:hover {
                background-color: #146c43;
                color: white;
            }
            .modal-image-container {
                text-align: center;
                margin-bottom: 15px;
            }
            .modal-image-container img {
                max-width: 100%;
                height: auto;
                cursor: zoom-in;
            }
        `;
        document.head.appendChild(style);
    },


    async _onPhotoClick(ev) {
        const imgElement = ev.currentTarget;
        const photoId = imgElement.dataset.photoId;

        this._removeExistingModal();
        const modal = this._createAndShowModal(photoId);

        try {
            const result = await rpc('/event/photo/details', {
                photo_id: photoId,
            });

            const detailsContainer = modal.querySelector('.photo-details');
            if (detailsContainer && result) {
                detailsContainer.innerHTML = `
                    <a href="/web/image/event.photo/${photoId}/image?download=true" 
                       class="download-btn" 
                       download="${result.name || 'photo'}.jpg">
                        <i class="fa fa-download me-2"></i>Download
                    </a>
                `;
            }
        } catch (error) {
            console.error('Error loading photo details:', error);
            const detailsContainer = modal.querySelector('.photo-details');
            if (detailsContainer) {
                detailsContainer.innerHTML = '<p class="text-danger">Error loading photo details</p>';
            }
        }
    },


    _removeExistingModal() {
        const existingModal = document.querySelector('.custom-modal');
        if (existingModal) {
            existingModal.remove();
        }
    },

    _createAndShowModal(photoId) {
        const modalHtml = `
            <div class="custom-modal">
                <div class="custom-modal-content">
                    <button class="custom-modal-close">&times;</button>
                    <div class="modal-image-container">
                        <div class="spinner-border text-primary position-absolute" 
                             id="imageLoadingSpinner"
                             style="top: 50%; left: 50%; transform: translate(-50%, -50%);">
                            <span class="visually-hidden">Caricamento...</span>
                        </div>
                        <img src="/web/image/event.photo/${photoId}/image?width=2000" 
                             style="max-height: 80vh;"
                             onload="document.getElementById('imageLoadingSpinner').style.display='none'"
                             />
                    </div>
                    <div class="photo-details">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.querySelector('.custom-modal');
        this._setupModalEvents(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        return modal;
    },

    _setupModalEvents(modal) {
        const closeBtn = modal.querySelector('.custom-modal-close');
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Add keyboard event listener for ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    }
});

export default publicWidget.registry.PhotoGalleryWidget;