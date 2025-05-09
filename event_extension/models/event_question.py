# -*- coding: utf-8 -*-
from odoo import models, fields, api


class EventRegistration(models.Model):
    _inherit = 'event.question'

    print_question = fields.Boolean(string='Print Question')