from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class User(models.Model):
    id = models.AutoField(primary_key=True)              
    email = models.EmailField(max_length=255, unique=True) 
    rol_id = models.ForeignKey(                           
        'Rol',                                            
        on_delete=models.CASCADE,      
        null=False                                       
    )
    
    TD_id = models.ForeignKey(                            
        'TechnicalDirector',                                
        on_delete=models.CASCADE,                       
        null=True,                                        
        blank=True                                        
    )
    password = models.CharField(max_length=128)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    ~models.Q(rol_id=2) | ~models.Q(TD_id__isnull=True)
                ),
                name='El rol no puede ser Director Técnico si el campo está vacío'
            )
        ]

    def clean(self):
        if self.rol_id and self.rol_id.type == "Director Técnico" and self.TD_id is None:
            raise ValidationError("TD_id cannot be NULL when rol_id is 'Director Técnico'.")        
    
    def __str__(self):
        return self.email 
    
class Rol(models.Model):
    TYPE_DIRECTOR = "Director Técnico"
    TYPE_ADMIN = "Admin"
    TYPE_USER="Usuario General"

    ROLE_TYPES = [
        (TYPE_DIRECTOR, "Director Técnico"),
        (TYPE_ADMIN, "Admin"),
        (TYPE_USER, "Usuario  General")
    ]

    id = models.AutoField(primary_key=True)                
    type = models.CharField(max_length=50, choices=ROLE_TYPES)                 

    def __str__(self):
        return self.type  
    
class TechnicalDirector(models.Model):                
    direction_team = models.OneToOneField(                 
        'DirectionTeam',                                   
        on_delete=models.SET_NULL,       
        null=True                                         
    )
    W_id = models.ForeignKey(                              
        'Worker',                                      
        on_delete=models.CASCADE,
        to_field='id',                 
        null=False                                         
    )
    
    class Meta:
        constraints = [
            models.UniqueConstraint(                      
                fields=['W_id', 'id'],
                name='primary_key_technical_director'
            )
        ]                
    

    def __str__(self):
        return f"Director Técnico {self.id}"  
    
class Worker(models.Model):                
    P_id = models.OneToOneField(                             
        'Person',                                         
        on_delete=models.CASCADE,  
        null=False                                         
    )
    DT_id = models.ForeignKey(                             
        'DirectionTeam',                                  
        on_delete=models.SET_NULL,    
        null=True                                         
    )
    
    class Meta:
        constraints = [
            models.UniqueConstraint(                      
                fields=['P_id', 'id'],
                name='primary_key_worker'
            )
        ]      

    def __str__(self):
        return f"Trabajador {self.id}" 
    
class DirectionTeam(models.Model):
    id = models.AutoField(primary_key=True)                
    Team_id = models.OneToOneField(                        
        'Team',                                          
        on_delete=models.CASCADE,                     
        null=False                                         
    )

    def __str__(self):
        return f"Equipo de Dirección de {self.Team_id}"
    
class Team(models.Model):
    id = models.AutoField(primary_key=True)                
    name = models.CharField(max_length=100)               
    color = models.CharField(max_length=50)               
    initials = models.CharField(max_length=10)            
    representative_entity = models.CharField(max_length=100)  

    def __str__(self):
        return f"Equipo {self.name} ({self.initials})"
    
class Person(models.Model):
    id = models.AutoField(primary_key=True)
    CI = models.IntegerField(unique=True)            
    age = models.IntegerField()                           
    name = models.CharField(max_length=100)               
    lastname = models.CharField(max_length=100)           

    def __str__(self):
        return f"{self.name} {self.lastname} (CI: {self.CI})"
    
class Position(models.Model):
    id = models.AutoField(primary_key=True)                
    name = models.CharField(max_length=100)               

    def __str__(self):
        return self.name
    
class BaseballPlayer(models.Model):
    id = models.AutoField(primary_key=True)                
    P_id = models.OneToOneField(                             
        'Person',
        on_delete=models.CASCADE,
        null=False,
        related_name='baseball_player'                                   
    )
    batting_average = models.FloatField()                  
    years_of_experience = models.IntegerField()            
    pitcher = models.OneToOneField(                        
        'Pitcher',                                        
        on_delete=models.SET_NULL,
        null=True,                                         
        blank=True,
        related_name='baseball_pitcher'                                       
    )

    def __str__(self):
        return f"Pelotero {self.P_id.name} {self.P_id.lastname}" 
    
class Season(models.Model):
    id = models.AutoField(primary_key=True) 
    name=models.CharField()               
    def __str__(self):
        return f"Temporada {self.id}"
    
class Series(models.Model):
    season = models.ForeignKey(    ##Eliminar season del resto de lugares                        
        'Season',
        on_delete=models.CASCADE,                         
        null=False
        ##unique=True                              
    )                             
    name = models.CharField(max_length=100)                
    type = models.CharField(max_length=50)                 
    init_date = models.DateTimeField()                     
    end_date = models.DateTimeField()                      

    class Meta:                
        constraints = [
            models.UniqueConstraint(                      
                fields=['season', 'id'],
                name='primary_key_series'
            ),                              
            models.CheckConstraint(
                check=models.Q(init_date__lt=models.F('end_date')),
                name='La fecha de inicio debe ser antes de la fecha de finalización'
            )
        ]
        
    def clean(self):
        # Validación: init_date debe ser anterior a end_date
        if self.init_date >= self.end_date:
            raise ValidationError({
                'init_date':  ("The initial date must be before the end date."),
                'end_date': _("The end date must be after the initial date."),
            })

    def __str__(self):
        return f"Serie {self.name} ({self.type}) en Temporada {self.season.id}"
    
class Pitcher(models.Model):
    P_id = models.ForeignKey(                                
        'BaseballPlayer',
        on_delete=models.CASCADE,                         
        to_field='P_id',
        related_name='pitcher_ci'                             
    )
    dominant_hand = models.CharField(                      
        max_length=10,
        choices=[
            ('izquierda', 'Izquierda'),
            ('derecha', 'Derecha'),
            ('ambas','Ambas')
        ]
    )
    No_games_won = models.PositiveIntegerField()                   
    No_games_lost = models.PositiveIntegerField()                  
    running_average = models.PositiveIntegerField()               

    def __str__(self):
        return f"Lanzador {self.id} (Mano Dominante: {self.dominant_hand})"
    
    def save(self, *args, **kwargs):
        from api.reports.queries import get_pitcher_wins, get_pitcher_losses
        self.No_games_won += get_pitcher_wins(player_id=self.P_id_id)
        self.No_games_lost += get_pitcher_losses(player_id=self.P_id_id)
        super().save(*args, **kwargs)

    def refresh_from_db(self, using=None, fields=None, **kwargs):
        super().refresh_from_db(using, fields, **kwargs)
        from api.reports.queries import get_pitcher_wins, get_pitcher_losses
        self.No_games_won += get_pitcher_wins(player_id=self.P_id_id)
        self.No_games_lost += get_pitcher_losses(player_id=self.P_id_id)
    
class BPParticipation(models.Model):
    BP_id = models.ForeignKey(                             
        'BaseballPlayer',
        on_delete=models.CASCADE,                        
        to_field='P_id',
        related_name='bp_participations'                                
    )

    series = models.ForeignKey(                            
        'Series',
        on_delete=models.CASCADE,
        to_field='id',
        related_name='series_participations'                                 
    )
    team_id = models.ForeignKey(                       
        'Team',
        on_delete=models.CASCADE,                         
        null=False                                        
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(                      # Define la clave primaria compuesta
                fields=['BP_id', 'series'],   #'season', 
                name='primary_key_bp_participation'
            )
        ]

    def __str__(self):
        return f"Participación: BP {self.BP_id},  Serie {self.series}"
    
class LineUp(models.Model):                             
    team_id = models.ForeignKey(                           
        'Team',
        on_delete=models.CASCADE,                         
        null=False
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['id', 'team_id'],                  # Clave primaria compuesta
                name='primary_key_lineup'
            )
        ]

    def __str__(self):
        return f"Alineación {self.id} (Equipo ID: {self.team_id})"
    
class TeamOnTheField(models.Model):
    id = models.AutoField(primary_key=True)                
    lineup_id = models.ForeignKey(                         
        'LineUp',
        on_delete=models.CASCADE,
        to_field='id',
        related_name='lineup_on_field'                              
    )

    def __str__(self):
        return f"Equipo en el Campo {self.id} (Alineación ID: {self.lineup_id})"
    
class StarPlayer(models.Model):
    series = models.ForeignKey(                            
        'Series',
        on_delete=models.CASCADE,
        to_field='id',
        related_name='starplayer_series'                        
    )
    position = models.ForeignKey(                          
        'Position',
        on_delete=models.CASCADE,
        null=False,
        related_name='starplayer_position'
    )
    BP_id = models.ForeignKey(                          
        'BaseballPlayer',
        on_delete=models.CASCADE,
        null=False,
        related_name='starplayer_bp'                                 
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['series', 'position'],    # Clave primaria compuesta'season',
                name='primary_key_star_player'
            )
        ]

    def __str__(self):
        return f"Jugador Estrella en Serie {self.series}, Posición {self.position}: {self.BP_id}"
    
class PlayerInPosition(models.Model):
    BP_id = models.ForeignKey(                             
        'BaseballPlayer',
        on_delete=models.CASCADE,
        null=False,
        related_name='playerinposition_bp'
    )
    position = models.ForeignKey(                          
        'Position',
        on_delete=models.CASCADE,
        null=False, 
        related_name='playerinposition_position'
    )
    effectiveness = models.FloatField()                    

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['BP_id','position'],              
                name='primary_key_player_in_position'
            )
        ]
        
    

    def __str__(self):
        return f"{self.BP_id} en Posición {self.position} con Efectividad {self.effectiveness}"
    
class Score(models.Model):
    id = models.AutoField(primary_key=True)
    winner = models.ForeignKey(
        'Team',
        on_delete=models.CASCADE,
        related_name='winner_score'
    )
    loser = models.ForeignKey(
        'Team',
        on_delete=models.CASCADE,
        related_name='loser_score'
    )
    w_points = models.PositiveIntegerField()
    l_points = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=~models.Q(winner=models.F('loser')),
                name='Ganador y Perdedor deben ser diferente'
            ),
            models.CheckConstraint(
                check=models.Q(w_points__gte=models.F('l_points')),
                name='Los puntos del ganador deben ser mayores o iguales a los del perdedor'
            )
        ]
        
    def clean(self):
        # Validación: winner y loser no pueden ser el mismo equipo
        if self.winner == self.loser:
            raise ValidationError("Winner and loser cannot be the same team.")
        # Validación: w_points debe ser mayor o igual a l_points
        if self.w_points < self.l_points:
            raise ValidationError("Winner points (w_points) must be greater than or equal to loser points (l_points).")


    def __str__(self):
        return f"Marcador: {self.winner} {self.w_points} - {self.l_points} {self.loser}"

class Game(models.Model):
    local = models.ForeignKey(
        'TeamOnTheField',
        on_delete=models.CASCADE,
        related_name='local_game'
    )
    date = models.DateTimeField()
    rival = models.ForeignKey(
        'TeamOnTheField',
        on_delete=models.CASCADE,
        related_name='rival_game'
    )
    series = models.ForeignKey(
        'Series',
        on_delete=models.CASCADE,
        to_field='id',
        related_name='game_series'
    )
    score = models.ForeignKey(
        'Score',
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['local', 'date'],
                name='primary_key_game'
            ),
            models.CheckConstraint(
                check=~models.Q(local=models.F('rival')),
                name='check_local_not_equal_rival'
            )
        ]

    def __str__(self):
        return f"Juego: {self.local} vs {self.rival} el {self.date}"

class PlayerSwap(models.Model):
    old_player = models.ForeignKey(
        'BaseballPlayer',
        on_delete=models.DO_NOTHING,
        related_name='old_player_swap'
    )
    date = models.DateTimeField()
    new_player = models.ForeignKey(
        'BaseballPlayer',
        on_delete=models.DO_NOTHING,
        related_name='new_player_swap'
    )
    position = models.ForeignKey(
        'Position',
        on_delete=models.CASCADE
    )
    game_team = models.ForeignKey(
        'TeamOnTheField',
        on_delete=models.CASCADE
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['old_player', 'date'],
                name='primary_key_playerswap'
            )
        ]

    def __str__(self):
        return f"Cambio: {self.old_player} -> {self.new_player} on {self.date}"

class PlayerInLineUp(models.Model):
    line_up = models.ForeignKey(  # Cambiado de OneToOneField a ForeignKey para permitir múltiples jugadores en una alineación
        'LineUp',
        on_delete=models.CASCADE,
        to_field='id',
        related_name='player_in_lineup'
    )

    player_in_position = models.ForeignKey(
        'PlayerInPosition',
        on_delete=models.CASCADE,
        related_name='player_positioned_in_lineup'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['line_up', 'player_in_position'],
                name='primary_key_player_in_lineup'
            )
        ]

    def __str__(self):
        return f"{self.player_in_position} en {self.line_up}"

