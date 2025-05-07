{
    'name': 'Event Photo Album',
    'summary': 'Public photo gallery for events',
    'description': """
        Share and manage photos for your events:
        * Public photo gallery for each event
        * Photo upload capabilities
        * Image optimization and thumbnails
        * Secure access control
    """,
    'version': '18.0.1.0.0',
    'category': 'Website/Website',
    'author': 'Your Company',
    'website': 'https://www.consulenzaodoo.it',
    'license': 'LGPL-3',

    'depends': [
        'base',
        'web',
        'website',
        'event',
        'mail',
        'portal',
    ],

    'data': [
        'security/event_photo_security.xml',
        'security/ir.model.access.csv',
        'views/photo_album_templates.xml',
        'views/event_photo_views.xml',
    ],

    'assets': {
        'web.assets_frontend': [
            'event_photo_album/static/src/scss/photo_album.scss',
            'event_photo_album/static/src/js/photo_gallery_widget.js',
            'event_photo_album/static/src/js/photo_upload.js',
        ],
        'web.assets_backend': [
            'event_photo_album/static/src/css/event_photo.css',
        ],

    },

    'installable': True,
    'application': False,
    'auto_install': False,

    'maintainer': 'Your Company',
    'development_status': 'Production/Stable',

    'external_dependencies': {
        'python': [],
        'bin': [],
    },
}