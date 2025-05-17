from rest_framework.permissions import BasePermission


class IsOrganizerUser(BasePermission):
    message = "Access denied. Organizer privileges required."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'organizer'

