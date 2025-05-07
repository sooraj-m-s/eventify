from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    message = "Access denied. Admin privileges required."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

