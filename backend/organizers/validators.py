from datetime import datetime
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status


def validate_event(data):

    # Date validation
    try:
        event_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        today = timezone.now().date()
        if event_date < today:
            return Response({'errors': 'Event date cannot be in the past'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError):
        return Response({'errors': 'Invalid date format'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Price validation
    try:
        price = int(data['pricePerTicket'])
        if price < 0:
            return Response({'errors': 'Price per ticket cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)
        if price > 5000:
            return Response({'errors': 'Price per ticket cannot exceed ₹5,000'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError):
        return Response({'errors': 'Invalid price format'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Ticket limit validation
    try:
        ticket_limit = int(data['ticketLimit'])
        if ticket_limit <= 0:
            return Response({'errors': 'Ticket limit must be at least 1'}, status=status.HTTP_400_BAD_REQUEST)
    except (ValueError, TypeError):
        return Response({'errors': 'Invalid ticket limit format'}, status=status.HTTP_400_BAD_REQUEST)

    return None

