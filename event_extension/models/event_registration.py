# -*- coding: utf-8 -*-
from odoo import models, fields, api


class EventRegistration(models.Model):
    _inherit = 'event.registration'

    position_id = fields.Many2one(
        'event.registration.position',
        string='Position',
        help='The position associated with this registration.',
        copy=False,
        index=True,
        group_expand='_read_group_position_id'

    )

    @api.model
    def _read_group_position_id(self, stages, domain):
        return stages.search([('event_id', 'in', self.env.context.get('active_ids', []))])