from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
import logging
from admin.permissions import IsAdminUser
from events.models import Event
from .serializers import CouponSerializer
from .models import Coupon, CouponUsage


logger = logging.getLogger(__name__)

class CouponPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@permission_classes([IsAdminUser])
class CouponViewSet(viewsets.ModelViewSet):
    serializer_class = CouponSerializer
    pagination_class = CouponPagination

    def get_queryset(self):
        queryset = Coupon.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        
        if search:
            queryset = queryset.filter(
                Q(code__istartswith=search) |
                Q(organizer__full_name__istartswith=search) |
                Q(organizer__email__istartswith=search)
            )
        
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        coupon = serializer.save()
        return Response(CouponSerializer(coupon).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
        serializer.is_valid(raise_exception=True)
        updated_coupon = serializer.save()
        return Response(
            CouponSerializer(updated_coupon).data,
            status=status.HTTP_200_OK
        )


@permission_classes([IsAuthenticated])
class ValidCouponsByOrganizerView(ListAPIView):
    serializer_class = CouponSerializer

    def get_queryset(self):
        organizer_id = self.request.query_params.get('organizerId')
        today = timezone.now().date()

        return Coupon.objects.filter(
            organizer=organizer_id,
            is_active=True,
            valid_from__lte=today,
            valid_to__gte=today
        ).order_by('-created_at')


@permission_classes([IsAuthenticated])
class ApplyCouponView(APIView):
    
    def post(self, request):
        user = request.user
        event_id = request.data.get('eventId')
        code = request.data.get('code')

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            logger.error(f"Coupon with code {code} does not exist.")
            return Response({'error': 'Invalid coupon code.'}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.now().date()
        if not coupon.is_active:
            return Response({'error': 'This coupon is not available right now'}, status=status.HTTP_400_BAD_REQUEST)
        if not (coupon.valid_from <= today <= coupon.valid_to):
            return Response({'error': 'This coupon is expired or not yet valid.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            event = Event.objects.get(eventId=event_id)
        except Event.DoesNotExist:
            logger.error(f"Event with ID {event_id} does not exist.")
            return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        if str(event.hostedBy.user_id) != str(coupon.organizer.user_id):
            return Response({'error': 'This coupon cannot apply for this event.'}, status=status.HTTP_400_BAD_REQUEST)

        already_used = CouponUsage.objects.filter(user=user, coupon=coupon).exists()
        if already_used:
            return Response({'error': 'You have already used this coupon.'}, status=status.HTTP_400_BAD_REQUEST)
        if event.pricePerTicket < coupon.minimum_purchase_amt:
            return Response({'error': f'Minimum purchase amount to use this coupon is ₹{coupon.minimum_purchase_amt}.'}, status=status.HTTP_400_BAD_REQUEST)
        
        serialized_coupon = CouponSerializer(coupon).data
        return Response({'success': 'Coupon applied successfully.', "coupon": serialized_coupon}, status=status.HTTP_200_OK)

