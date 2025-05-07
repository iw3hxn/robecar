# -*- coding: utf-8 -*-
{
    'name': 'Event Registration Extension',
    'version': '18.0.0.1.0',
    'author': 'Carlo Vettore',
    'category': 'Events',
    'depends': ['event'],
    'website': 'https://www.consulenzaodoo.it',
    'license': 'LGPL-3',
    'data': [
        'security/ir.model.access.csv',
        'views/event_registration_position.xml',
        'views/event_registration_views.xml',
        'data/menu_views.xml',
    ],
    'installable': True,
    'application': False,
}