from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import permission_classes
from django.shortcuts import get_object_or_404
from organizers.permissions import IsOrganizerUser
from .models import Wallet, WalletTransaction, OrganizerWallet, OrganizerWalletTransaction
from .serializers import WalletSerializer, WalletTransactionSerializer, OrganizerWalletSerializer, OrganizerWalletTransactionSerializer


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

