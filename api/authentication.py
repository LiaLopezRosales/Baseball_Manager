# api/authentication.py
# Autenticación por token que NO exige is_active.
# El modelo CustomUser define is_active = None (el campo no existe en la tabla
# db_structure_user), por lo que TokenAuthentication rechaza a todos los
# usuarios con "Usuario inactivo o borrado". Esta clase salta esa comprobación.

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class FlexibleTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        try:
            token = self.get_model().objects.select_related('user').get(key=key)
        except self.get_model().DoesNotExist:
            raise AuthenticationFailed('Token inválido.')

        if not token.user:
            raise AuthenticationFailed('Usuario no encontrado.')

        return (token.user, token)