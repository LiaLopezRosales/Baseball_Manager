# api/management/commands/rehash_passwords.py

from django.core.management.base import BaseCommand
from api.models import CustomUser


class Command(BaseCommand):
    help = "Re-cifra con PBKDF2 las contraseñas que aún estén en texto plano."

    def handle(self, *args, **options):
        updated = 0
        unchanged = 0
        for user in CustomUser.objects.all().iterator():
            if user.password and '$' not in user.password:
                user.save(update_fields=['password'])
                updated += 1
            else:
                unchanged += 1
        self.stdout.write(self.style.SUCCESS(
            f"Listo: {updated} contraseñas cifradas, {unchanged} ya seguras."
        ))