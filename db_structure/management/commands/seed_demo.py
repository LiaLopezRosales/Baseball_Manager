"""seed_demo: siembra la demo de forma idempotente y auto-reparable.

Usado por el entrypoint de producción (Dockerfile.backend). Decisiones:

  - BD vacía                     -> siembra completa (simulate_full_championship).
  - Equipos SIN scores           -> seed parcial (p. ej. un deploy anterior
    interrumpido): hace flush y re-siembra la demo entera.
  - Equipos CON scores           -> ya está sembrada: no hace nada (arranque
    rápido en redeploys).

También programa el "Calendario Futuro LNB" (schedule_upcoming_games) para que
el panel de Director Técnico tenga juegos pendientes.
"""

from django.core.management import call_command
from django.core.management.base import BaseCommand

from db_structure.models import Score, Team
from populate_db import schedule_upcoming_games, simulate_full_championship


class Command(BaseCommand):
    help = "Siembra la demo (idempotente y auto-reparable) para producción."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-siembra aunque la demo ya exista (requiere BD vacía o flush).",
        )
        parser.add_argument(
            "--check-only",
            action="store_true",
            help="Solo imprime 'seed-needed' o 'skipped' sin sembrar.",
        )

    def _needs_seed(self):
        has_teams = Team.objects.exists()
        has_scores = Score.objects.exists()
        partial = has_teams and not has_scores
        needs = (not has_teams) or partial
        return needs, partial

    def handle(self, *args, **options):
        needs, partial = self._needs_seed()

        if options["check_only"]:
            self.stdout.write("seed-needed" if needs else "skipped")
            return

        if not needs and not options["force"]:
            self.stdout.write(self.style.SUCCESS("Demo ya sembrada: seed omitido."))
            return

        if partial:
            self.stdout.write(
                self.style.WARNING(
                    "Seed parcial detectado (equipos sin scores): vaciando BD y re-sembrando..."
                )
            )
            call_command("flush", interactive=False, verbosity=0)
        else:
            self.stdout.write("BD vacía: sembrando demo completa...")

        simulate_full_championship()
        schedule_upcoming_games()

        self.stdout.write(self.style.SUCCESS("Demo lista."))