# Generated by Django 5.1.4 on 2025-01-21 23:50

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('CI', models.IntegerField()),
                ('age', models.IntegerField()),
                ('name', models.CharField(max_length=100)),
                ('lastname', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Position',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Rol',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('type', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Season',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField()),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('color', models.CharField(max_length=50)),
                ('initials', models.CharField(max_length=10)),
                ('representative_entity', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='BaseballPlayer',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('batting_average', models.FloatField()),
                ('years_of_experience', models.IntegerField()),
                ('P_id', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='baseball_player', to='db_structure.person')),
            ],
        ),
        migrations.CreateModel(
            name='Pitcher',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dominant_hand', models.CharField(choices=[('izquierda', 'Izquierda'), ('derecha', 'Derecha')], max_length=10)),
                ('No_games_won', models.PositiveIntegerField()),
                ('No_games_lost', models.PositiveIntegerField()),
                ('running_average', models.PositiveIntegerField()),
                ('P_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pitcher_ci', to='db_structure.baseballplayer', to_field='P_id')),
            ],
        ),
        migrations.AddField(
            model_name='baseballplayer',
            name='pitcher',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='baseball_pitcher', to='db_structure.pitcher'),
        ),
        migrations.CreateModel(
            name='PlayerInPosition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('effectiveness', models.FloatField()),
                ('BP_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playerinposition_bp', to='db_structure.baseballplayer')),
                ('position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='playerinposition_position', to='db_structure.position')),
            ],
        ),
        migrations.CreateModel(
            name='Series',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=50)),
                ('init_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('season', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='db_structure.season')),
            ],
        ),
        migrations.CreateModel(
            name='StarPlayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('BP_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='starplayer_bp', to='db_structure.baseballplayer')),
                ('position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='starplayer_position', to='db_structure.position')),
                ('series', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='starplayer_series', to='db_structure.series')),
            ],
        ),
        migrations.CreateModel(
            name='Score',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('w_points', models.PositiveIntegerField()),
                ('l_points', models.PositiveIntegerField()),
                ('loser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='loser_score', to='db_structure.team')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='winner_score', to='db_structure.team')),
            ],
        ),
        migrations.CreateModel(
            name='LineUp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('team_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='db_structure.team')),
            ],
        ),
        migrations.CreateModel(
            name='DirectionTeam',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('Team_id', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='db_structure.team')),
            ],
        ),
        migrations.CreateModel(
            name='BPParticipation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('BP_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bp_participations', to='db_structure.baseballplayer', to_field='P_id')),
                ('series', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='series_participations', to='db_structure.series')),
                ('team_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='db_structure.team')),
            ],
        ),
        migrations.CreateModel(
            name='TeamOnTheField',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('lineup_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lineup_on_field', to='db_structure.lineup')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerSwap',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField()),
                ('new_player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='new_player_swap', to='db_structure.baseballplayer')),
                ('old_player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='old_player_swap', to='db_structure.baseballplayer')),
                ('position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='db_structure.position')),
                ('game_team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='db_structure.teamonthefield')),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField()),
                ('score', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='db_structure.score')),
                ('series', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_series', to='db_structure.series')),
                ('local', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='local_game', to='db_structure.teamonthefield')),
                ('rival', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rival_game', to='db_structure.teamonthefield')),
            ],
        ),
        migrations.CreateModel(
            name='TechnicalDirector',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('direction_team', models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='db_structure.directionteam')),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('email', models.CharField(max_length=255, unique=True)),
                ('password', models.CharField(max_length=128)),
                ('TD_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='db_structure.technicaldirector')),
                ('rol_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='db_structure.rol')),
            ],
        ),
        migrations.CreateModel(
            name='Worker',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('DT_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='db_structure.directionteam')),
                ('P_id', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='db_structure.person')),
            ],
        ),
        migrations.AddField(
            model_name='technicaldirector',
            name='W_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='db_structure.worker'),
        ),
        migrations.CreateModel(
            name='PlayerInLineUp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('line_up', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player_in_lineup', to='db_structure.lineup')),
                ('player_in_position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='player_positioned_in_lineup', to='db_structure.playerinposition')),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('line_up', 'player_in_position'), name='primary_key_player_in_lineup')],
            },
        ),
        migrations.AddConstraint(
            model_name='playerinposition',
            constraint=models.UniqueConstraint(fields=('BP_id', 'position'), name='primary_key_player_in_position'),
        ),
        migrations.AddConstraint(
            model_name='series',
            constraint=models.UniqueConstraint(fields=('season', 'id'), name='primary_key_series'),
        ),
        migrations.AddConstraint(
            model_name='series',
            constraint=models.CheckConstraint(condition=models.Q(('init_date__lt', models.F('end_date'))), name='check_init_date_before_end_date'),
        ),
        migrations.AddConstraint(
            model_name='starplayer',
            constraint=models.UniqueConstraint(fields=('series', 'position'), name='primary_key_star_player'),
        ),
        migrations.AddConstraint(
            model_name='score',
            constraint=models.CheckConstraint(condition=models.Q(('winner', models.F('loser')), _negated=True), name='check_winner_not_equal_loser'),
        ),
        migrations.AddConstraint(
            model_name='score',
            constraint=models.CheckConstraint(condition=models.Q(('w_points__gte', models.F('l_points'))), name='check_w_points_gte_l_points'),
        ),
        migrations.AddConstraint(
            model_name='lineup',
            constraint=models.UniqueConstraint(fields=('id', 'team_id'), name='primary_key_lineup'),
        ),
        migrations.AddConstraint(
            model_name='bpparticipation',
            constraint=models.UniqueConstraint(fields=('BP_id', 'series'), name='primary_key_bp_participation'),
        ),
        migrations.AddConstraint(
            model_name='playerswap',
            constraint=models.UniqueConstraint(fields=('old_player', 'date'), name='primary_key_playerswap'),
        ),
        migrations.AddConstraint(
            model_name='game',
            constraint=models.UniqueConstraint(fields=('local', 'date'), name='primary_key_game'),
        ),
        migrations.AddConstraint(
            model_name='game',
            constraint=models.CheckConstraint(condition=models.Q(('local', models.F('rival')), _negated=True), name='check_local_not_equal_rival'),
        ),
        migrations.AddConstraint(
            model_name='user',
            constraint=models.CheckConstraint(condition=models.Q(models.Q(('rol_id', 2), _negated=True), models.Q(('TD_id__isnull', True), _negated=True), _connector='OR'), name='check_td_not_null_when_rol_2'),
        ),
        migrations.AddConstraint(
            model_name='worker',
            constraint=models.UniqueConstraint(fields=('P_id', 'id'), name='primary_key_worker'),
        ),
        migrations.AddConstraint(
            model_name='technicaldirector',
            constraint=models.UniqueConstraint(fields=('W_id', 'id'), name='primary_key_technical_director'),
        ),
    ]
