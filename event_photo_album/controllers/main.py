import base64
import logging
from odoo import http
from odoo.http import request

_logger = logging.getLogger(__name__)


class PhotoAlbumController(http.Controller):

    @http.route('/event/photo/album', type='http', auth='public', website=True)
    def photo_album(self, **kw):
        photos = request.env['event.photo'].sudo().search([('active', '=', True)])
        values = {
            'photos': photos,
        }
        return request.render('event_photo_album.album_page', values)

    @http.route('/event/photo/upload', type='http', auth='public', methods=['POST'], website=True)
    def upload_photo(self, **post):
        files = request.httprequest.files.getlist('photos[]')
        _logger.info('upload_photo request received - Number of files: %s', len(files))

        if not files:
            _logger.warning('upload_photo No files received in the upload request')
            return request.redirect('/event/photo/album?error=no_file')

        successful_uploads = 0
        failed_uploads = 0

        for file in files:
            try:
                file_content = file.read()
                _logger.info('upload_photo file: %s', file.filename)
                if file_content:
                    values = {
                        'name': file.filename,
                        'image': base64.b64encode(file_content),
                        'photographer_name': post.get('photographer_name', '')
                    }
                    _logger.info('upload_photo Creating event.photo record for: %s', file.filename)

                    request.env['event.photo'].sudo().create(values)
                    successful_uploads += 1
                    _logger.info('upload_photo Successfully uploaded: %s', file.filename)
                else:
                    _logger.warning('upload_photo Empty file content for: %s', file.filename)
                    failed_uploads += 1

            except Exception as e:
                failed_uploads += 1
                _logger.error('upload_photo Error uploading file %s: %s', file.filename, str(e), exc_info=True)

        _logger.info('upload_photo Upload session completed - Successful: %s, Failed: %s', successful_uploads, failed_uploads)

        if failed_uploads > 0 and successful_uploads == 0:
            return request.redirect('/event/photo/album?error=upload_failed')
        elif failed_uploads > 0:
            return request.redirect('/event/photo/album?partial_success=true')

        return request.redirect('/event/photo/album?success=true')

    @http.route('/event/photo/details', type='json', auth='public')
    def get_photo_details(self, photo_id):
        if not photo_id:
            return {}
        if isinstance(photo_id, str):
            photo_id = int(photo_id)
        photo = request.env['event.photo'].sudo().browse(photo_id)
        return {
            'name': photo.name or photo.image_name or 'Untitled',
            'photographer_name': photo.photographer_name or '',
            'creation_date': photo.create_date.strftime('%d/%m/%Y %H:%M') if photo.create_date else '',
        }

