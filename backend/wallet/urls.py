from django.urls import path
from .views import WalletTransactionsView, OrganizerWalletTransactionsView, WithdrawAllMoneyView


urlpatterns = [
    path('transactions/', WalletTransactionsView.as_view(), name='wallet-transactions'),
    path('organizer/transactions/', OrganizerWalletTransactionsView.as_view(), name='organizer-wallet-transactions'),
    path('withdraw_money/', WithdrawAllMoneyView.as_view(), name='withdraw-all-money'),
]

