from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import permission_classes
from django.shortcuts import get_object_or_404
from django.db import transaction
from organizers.permissions import IsOrganizerUser
from .models import Wallet, WalletTransaction, OrganizerWallet, OrganizerWalletTransaction
from .serializers import (
    WalletSerializer, WalletTransactionSerializer, OrganizerWalletSerializer,
    OrganizerWalletTransactionSerializer, WithdrawAllMoneySerializer
)


# Create your views here.


class TransactionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@permission_classes([IsAuthenticated])
class WalletTransactionsView(APIView):
    pagination_class = TransactionPagination
    
    def get(self, request):
        try:
            wallet = get_object_or_404(Wallet, user=request.user)
            wallet_data = WalletSerializer(wallet).data
            
            paginator = self.pagination_class()
            transactions = WalletTransaction.objects.filter(wallet=wallet).order_by('-created_at')
            result_page = paginator.paginate_queryset(transactions, request)
            
            transaction_serializer = WalletTransactionSerializer(result_page, many=True)
            response_data = {'wallet': wallet_data, 'transactions': transaction_serializer.data}
            
            return paginator.get_paginated_response(response_data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsOrganizerUser])
class OrganizerWalletTransactionsView(APIView):
    pagination_class = TransactionPagination
    
    def get(self, request):
        try:
            wallet = get_object_or_404(OrganizerWallet, user=request.user)
            wallet_data = OrganizerWalletSerializer(wallet).data
            
            paginator = self.pagination_class()
            transactions = OrganizerWalletTransaction.objects.filter(wallet=wallet).order_by('-created_at')
            result_page = paginator.paginate_queryset(transactions, request)
            
            transaction_serializer = OrganizerWalletTransactionSerializer(result_page, many=True)
            response_data = {'wallet': wallet_data, 'transactions': transaction_serializer.data}
            
            return paginator.get_paginated_response(response_data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@permission_classes([IsAuthenticated])
class WithdrawAllMoneyView(APIView):
    def post(self, request):
        try:
            wallet = get_object_or_404(OrganizerWallet, user=request.user)
            serializer = WithdrawAllMoneySerializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    {'error': 'Invalid request data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if wallet.balance <= 0:
                return Response({'error': 'You have no money to withdraw'}, status=status.HTTP_400_BAD_REQUEST)
            
            withdrawal_amount = wallet.balance
            with transaction.atomic():
                withdrawal_transaction = OrganizerWalletTransaction.objects.create(
                    wallet=wallet,
                    amount=withdrawal_amount,
                    transaction_type='WITHDRAWAL',
                    event=None,
                )
                wallet.balance = 0
                wallet.save()
            
            wallet_data = OrganizerWalletSerializer(wallet).data
            transaction_data = OrganizerWalletTransactionSerializer(withdrawal_transaction).data
            
            return Response({
                'message': 'All money withdrawn successfully',
                'withdrawal_amount': withdrawal_amount,
                'wallet': wallet_data,
                'transaction': transaction_data
            }, status=status.HTTP_200_OK)
            
        except OrganizerWallet.DoesNotExist:
            return Response({'error': 'Organizer wallet not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An error occurred during withdrawal: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get(self, request):
        try:
            wallet = get_object_or_404(OrganizerWallet, user=request.user)
            
            return Response({
                'current_balance': wallet.balance,
                'can_withdraw': wallet.balance > 0,
                'withdrawal_amount': wallet.balance if wallet.balance > 0 else 0
            }, status=status.HTTP_200_OK)
            
        except OrganizerWallet.DoesNotExist:
            return Response({'error': 'Organizer wallet not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([IsAuthenticated])
class WalletBalanceView(APIView):
    def get(self, request):
        try:
            wallet = get_object_or_404(Wallet, user=request.user)

            return Response({"success": True, "balance": wallet.balance}, status=status.HTTP_200_OK)
        except OrganizerWallet.DoesNotExist:
                return Response({'error': 'Organizer wallet not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

