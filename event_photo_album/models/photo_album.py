from odoo import models, fields


class EventPhoto(models.Model):
    _name = 'event.photo'
    _description = 'Photo for Event Album'
    _order = 'id desc'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(
        'File Name',
        tracking=True,
        index=True
    )
    image = fields.Image(
        'Photo',
        required=True,
        max_width=3900,
        max_height=5700,
        verify_resolution=True
    )
    image_thumbnail = fields.Image(
        'Thumbnail',
        related='image',
        max_width=256,
        max_height=256,
        store=True
    )
    event_id = fields.Many2one(
        'event.event',
        string='Event',
        ondelete='cascade',
        index=True,
        tracking=True
    )
    public = fields.Boolean(
        'Visible in Album',
        default=True,
        tracking=True
    )
    photographer_name = fields.Char('Photographer Name')
    create_date = fields.Datetime(
        'Upload Date',
        readonly=True
    )
    description = fields.Text('Description')
    active = fields.Boolean('Active', default=True)

    def unlink(self):
        self.active = False
