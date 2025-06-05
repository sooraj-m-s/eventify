from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from admin.permissions import IsAdminUser
from .models import Category
from .serializers import CategorySerializer


class CategoryListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        elif self.request.method == 'POST':
            return [IsAdminUser()]
        return []

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response({'categories': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, format=None):
        serializer = CategorySerializer(data=request.data)

        if Category.objects.filter(categoryName__iexact=request.data['categoryName']).exists():
            return Response({"success": False, "message": "A category with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True,"message": "Category created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED )
        return Response({"success": False, "message": "Failed to create category", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAdminUser])
class CategoryUpdateView(APIView):
    def patch(self, request, category_id, format=None):
        try:
            category = Category.objects.get(categoryId=category_id)
        except Category.DoesNotExist:
            return Response({"success": False, "message": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if Category.objects.exclude(categoryId=category_id).filter(categoryName__iexact=request.data.get('categoryName', '')).exists():
            return Response({"success": False, "message": "A category with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "message": "Category updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"success": False, "message": "Failed to update category", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

