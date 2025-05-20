from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.decorators import permission_classes
import stripe
from django.utils import timezone
from booking.models import Booking


# Create your views here.


stripe.api_key = settings.STRIPE_SECRET_KEY

@permission_classes([IsAuthenticated])
class CreatePaymentIntentView(APIView):
    def post(self, request):
        try:
            data = request.data
            booking_id = data.get('booking_id')
            
            try:
                booking = Booking.objects.get(booking_id=booking_id, user=request.user)
            except Booking.DoesNotExist:
                return Response(
                    {'error': 'Booking not found or does not belong to this user'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if booking.payment_id:
                if booking.payment_status == 'pending':
                    payment_intent = stripe.PaymentIntent.retrieve(booking.payment_id)
                    return Response({
                        'clientSecret': payment_intent.client_secret,
                        'publishableKey': settings.STRIPE_PUBLISHABLE_KEY,
                        'amount': booking.total_price,
                        'currency': 'INR',
                    })
                else:
                    return Response({'error': 'Payment already processed for this booking'}, status=status.HTTP_400_BAD_REQUEST)
            
            amount = int(booking.total_price * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='inr',
                metadata={
                    'booking_id': str(booking.booking_id),
                    'user_id': request.user.user_id,
                    'event_id': booking.event.eventId,
                },
                receipt_email=request.user.email,
                automatic_payment_methods={'enabled': True},
            )
            
            booking.payment_id = payment_intent.id
            booking.save()
            
            return Response({
                'bookingId': booking.booking_id,
                'clientSecret': payment_intent.client_secret,
                'publishableKey': settings.STRIPE_PUBLISHABLE_KEY,
                'amount': booking.total_price,
                'currency': 'INR',
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class PaymentStatusView(APIView):
    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(booking_id=booking_id, user=request.user)
            
            if not booking.payment_id:
                return Response({'status': 'no_payment'})
            
            return Response({
                'status': booking.payment_status,
                'amount': booking.total_price,
                'currency': 'INR',
                'created_at': booking.booking_date,
            })
            
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)
    
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_payment_intent_succeeded(payment_intent)
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        handle_payment_intent_failed(payment_intent)
    
    return HttpResponse(status=200)


def handle_payment_intent_succeeded(payment_intent):
    try:
        booking = Booking.objects.get(payment_id=payment_intent['id'])
        booking.payment_status = 'confirmed'
        booking.payment_date = timezone.now()
        booking.save()
        
        booking.confirm()
    except Booking.DoesNotExist:
        print(f"Error: No booking found with payment_id {payment_intent['id']}")
        pass

def handle_payment_intent_failed(payment_intent):
    try:
        booking = Booking.objects.get(payment_id=payment_intent['id'])
        booking.payment_status = 'failed'
        booking.save()
    except Booking.DoesNotExist:
        print(f"Error: No booking found with payment_id {payment_intent['id']}")
        pass

