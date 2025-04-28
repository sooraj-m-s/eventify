from models import Category
from serializers import CategorySerializer
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.


class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response({'categories': serializer.data})
