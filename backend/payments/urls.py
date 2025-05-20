from django.urls import path
from rest_framework.decorators import authentication_classes, permission_classes
from .views import CreatePaymentIntentView, PaymentStatusView, stripe_webhook


urlpatterns = [
    path('create_payment_intent/', CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('payment_status/<uuid:booking_id>/', PaymentStatusView.as_view(), name='payment-status'),
    path('webhook/', authentication_classes([])(permission_classes([])(stripe_webhook)), name='stripe-webhook'),
]

