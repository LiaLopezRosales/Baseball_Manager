import unittest
from unittest.mock import MagicMock, patch

from db_structure.signals import create_result_notifications, get_score_result_messages
from db_structure.models import User, Score


class TestScoreResultSignals(unittest.TestCase):
    def setUp(self):
        self.winner = MagicMock()
        self.winner.id = 1
        self.winner.name = "Team A"

        self.loser = MagicMock()
        self.loser.id = 2
        self.loser.name = "Team B"

        self.score = MagicMock(spec=Score)
        self.score.winner = self.winner
        self.score.loser = self.loser
        self.score.winner_id = 1
        self.score.loser_id = 2
        self.score.w_points = 5
        self.score.l_points = 3

    def test_get_score_result_messages_builds_per_team_info(self):
        messages = get_score_result_messages(self.score)

        self.assertIn(1, messages)
        self.assertIn(2, messages)
        self.assertIn("Team A", messages[1]["message"])
        self.assertIn("5 - 3", messages[1]["message"])
        self.assertEqual(messages[1]["link"], "/equipo/1")
        self.assertIn("Team B", messages[2]["message"])
        self.assertIn("3 - 5", messages[2]["message"])
        self.assertEqual(messages[2]["link"], "/equipo/2")

    @patch('db_structure.signals.Notification')
    @patch('db_structure.signals.FavoriteTeam')
    def test_create_result_notifications_creates_one_per_follower(self, mock_fav, mock_notif):
        fan_winner = MagicMock()
        fan_winner.team_id = 1
        fan_winner.user = MagicMock(spec=User)

        fan_loser = MagicMock()
        fan_loser.team_id = 2
        fan_loser.user = MagicMock(spec=User)

        mock_fav.objects.filter.return_value.select_related.return_value = [fan_winner, fan_loser]

        created = create_result_notifications(self.score)

        self.assertEqual(len(created), 2)
        self.assertEqual(mock_notif.objects.create.call_count, 2)
        messages = [call.kwargs["message"] for call in mock_notif.objects.create.call_args_list]
        self.assertTrue(any("¡Tu equipo Team A ganó" in m for m in messages))
        self.assertTrue(any("Tu equipo Team B perdió" in m for m in messages))

    @patch('db_structure.signals.Notification')
    @patch('db_structure.signals.FavoriteTeam')
    def test_create_result_notifications_ignores_favorites_of_other_teams(self, mock_fav, mock_notif):
        other_fan = MagicMock()
        other_fan.team_id = 99
        other_fan.user = MagicMock(spec=User)

        mock_fav.objects.filter.return_value.select_related.return_value = [other_fan]

        created = create_result_notifications(self.score)

        self.assertEqual(created, [])
        mock_notif.objects.create.assert_not_called()


if __name__ == "__main__":
    unittest.main()