# -*- coding: utf-8 -*-
from collections import Counter

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

    tableau_mariage_name = fields.Char(
        string='Tableau Marriage Name',
        compute="_compute_tableau_mariage_name"
    )

    @api.model
    def _read_group_position_id(self, stages, domain):
        return stages.search([('event_id', 'in', self.env.context.get('active_ids', []))])

    def get_formatted_names_by_event(self):
        """
        Funzione che formatta i nomi dei partecipanti raggruppandoli per evento (event_id).
        - Solo nome per partecipanti unici in un evento.
        - Nome + iniziale del cognome per partecipanti con stesso nome > 2 nello stesso evento.
        """
        result = {}  # Dizionario per raggruppare i nomi per evento.

        # Raggruppa i partecipanti per 'event_id'
        registrations_by_event = self.read_group(
            [('id', 'in', self.ids)],  # Filtra solo i record correnti (utile in contesti dinamici).
            ['event_id', 'name'],  # Raggruppa per evento e considera i nomi.
            ['event_id']  # Soggetto di raggruppamento.
        )

        for group in registrations_by_event:
            event_id = group['event_id'][0]  # Otteniamo l'ID dell'evento dal gruppo.
            group_list = self.search(group['__domain'])
            full_name_list = group_list.mapped('name')  # Lista dei nomi.

            name_list = []
            for name in full_name_list:
                name_split = name.split()  # Dividi in Nome e Cognome (assumendo formato 'Nome Cognome').
                first_name = name_split[0]
                name_list.append(first_name)

            name_counter = Counter(name_list)  # Conta le occorrenze di ciascun nome nell'evento.



            for registration in group_list:
                name = registration.name
                name_split = name.split()  # Dividi in Nome e Cognome (assumendo formato 'Nome Cognome').
                first_name = name_split[0]
                last_name = name_split[1] if len(name_split) > 1 else None  # Gestione del caso senza cognome.

                if name_counter[first_name] > 1 and last_name:
                    # Nome compare più di due volte, aggiungi anche la prima lettera del cognome.
                    formatted_name = f"{first_name} {last_name[0]}."
                else:
                    # Caso per nome unico o meno di 3 ricorrenze.
                    formatted_name = first_name


                # Aggiungi risultati al dizionario per questo evento.
                result[registration.id] = formatted_name

        return result

    def _compute_tableau_mariage_name(self):
        res = self.get_formatted_names_by_event()
        for registration in self:
            registration.tableau_mariage_name = res[registration.id]
