from odoo import models, fields, api, _


class EventRegistrationPosition(models.Model):
    _name = 'event.registration.position'
    _description = 'Event Registration Position'

    _order = 'sequence'

    name = fields.Char(
        string='Position',
        required=True
    )
    description = fields.Html(string='Description')
    sequence = fields.Integer(string='Sequence')
    event_id = fields.Many2one(
        'event.event',
        string='Event',
    )
    registration_count = fields.Integer(
        string='# Registrations',
        compute='_compute_registration_count'
    )
    max_registration_count = fields.Integer()

    @api.depends('event_id')
    def _compute_registration_count(self):
        registration_data = self.env['event.registration']._read_group(
            [('position_id', 'in', self.ids)],
            ['position_id'], ['__count'],
        )
        mapped_data = {event.id: count for event, count in registration_data}
        for event in self:
            event.registration_count = mapped_data.get(event.id, 0)

    _sql_constraints = [
        ('name_unique_event_id', 'UNIQUE(name, event_id)',
         _('The name of the position must be unique for event'))
    ]
