from django.urls import path
from .views import WalletTransactionsView, OrganizerWalletTransactionsView


urlpatterns = [
    path('transactions/', WalletTransactionsView.as_view(), name='wallet-transactions'),
    path('organizer/transactions/', OrganizerWalletTransactionsView.as_view(), name='organizer-wallet-transactions'),
]

