from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import FavoriteTeam, Notification, Score


def get_score_result_messages(score):
    """Devuelve {team_id: {message, link}} para los dos equipos del resultado."""
    winner = score.winner
    loser = score.loser
    return {
        winner.id: {
            'message': (
                f"¡Tu equipo {winner.name} ganó {score.w_points} - {score.l_points} "
                f"contra {loser.name}!"
            ),
            'link': f"/equipo/{winner.id}",
        },
        loser.id: {
            'message': (
                f"Tu equipo {loser.name} perdió {score.l_points} - {score.w_points} "
                f"ante {winner.name}."
            ),
            'link': f"/equipo/{loser.id}",
        },
    }


def create_result_notifications(score):
    """Crea una notificación por cada seguidor de los equipos involucrados."""
    per_team = get_score_result_messages(score)
    favorites = FavoriteTeam.objects.filter(
        team_id__in=[score.winner_id, score.loser_id]
    ).select_related('user')

    created = []
    for fav in favorites:
        info = per_team.get(fav.team_id)
        if not info:
            continue
        created.append(
            Notification.objects.create(
                user=fav.user,
                message=info['message'],
                link=info['link'],
            )
        )
    return created


@receiver(post_save, sender=Score)
def notify_followers_on_score_created(sender, instance, created, **kwargs):
    if created:
        create_result_notifications(instance)