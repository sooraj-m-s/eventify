from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, ValidCouponsByOrganizerView, ApplyCouponView


router = DefaultRouter()
router.register(r'coupons', CouponViewSet, basename='coupon')

urlpatterns = [
    path('organizer-coupon/', ValidCouponsByOrganizerView.as_view(), name='organizer-valid-coupons'),
    path('coupons/apply/', ApplyCouponView.as_view(), name='apply-coupon'),
    path('', include(router.urls)),
]

