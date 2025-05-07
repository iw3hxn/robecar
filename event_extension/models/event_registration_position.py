from odoo import models, fields, _


class EventRegistrationPosition(models.Model):
    _name = 'event.registration.position'
    _description = 'Event Registration Position'

    _order = 'sequence'

    name = fields.Char(
        string='Position',
        required=True
    )
    description = fields.Text(string='Description')
    sequence = fields.Integer(string='Sequence')

    _sql_constraints = [
        ('name_unique', 'UNIQUE(name)',
         _('The name of the position must be unique.'))
    ]
