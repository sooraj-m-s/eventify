from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.utils import timezone
from events.models import Event
from .models import Booking
from .serializers import UserBookingSerializer


# Create your views here.


@permission_classes([IsAuthenticated])
class BookEventView(APIView):
    def post(self, request):
        event_id = request.data.get('event_id')
        notes = request.data.get('notes')
        
        try:
            event = Event.objects.get(eventId=event_id)
            
            if event.on_hold:
                return Response({"error": "Sorry, this event is currently not available."}, status=status.HTTP_403_FORBIDDEN)
            if event.date < timezone.now().date():
                return Response({"error": "Sorry, this event has already taken place."}, status=status.HTTP_400_BAD_REQUEST)
            if event.ticketsSold >= event.ticketLimit:
                return Response({"error": "Sorry, this event is sold out"}, status=status.HTTP_400_BAD_REQUEST)
            
            booking = Booking.objects.create(
                event=event,
                user=request.user,
                booking_name=request.user.full_name,
                total_price=event.pricePerTicket,
                payment_status='pending',
                notes=notes
            )
            
            event.ticketsSold += 1
            event.save()
            
            serializer = UserBookingSerializer(booking)
            return Response({"message": "Booking successful", "booking": serializer.data}, status=status.HTTP_201_CREATED)
            
        except Event.DoesNotExist:
            return Response({"error": "Event not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAuthenticated])
class BookingDetailView(APIView):
    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(booking_id=booking_id, user=request.user)
            serializer = UserBookingSerializer(booking)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


@permission_classes([IsAuthenticated])
class UserBookingsView(APIView):
    def get(self, request):
        try:
            bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
            serializer = UserBookingSerializer(bookings, many=True)
            
            return Response({"success": True, "bookings": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAuthenticated])
class CancelBookingView(APIView):
    def patch(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
            
            if booking.event.date < timezone.now().date():
                return Response({"success": False, "error": "Cannot cancel bookings for past events"}, status=status.HTTP_400_BAD_REQUEST)
            
            booking.payment_status = 'cancelled'
            booking.is_booking_cancelled = True
            booking.save()
            
            event = booking.event
            event.ticketsSold = max(0, event.ticketsSold - 1)
            event.save()
            
            serializer = UserBookingSerializer(booking)
            
            return Response({"success": True, "message": "Booking cancelled successfully", "booking": serializer.data}, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({"success": False, "error": "Booking not found or does not belong to you"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

