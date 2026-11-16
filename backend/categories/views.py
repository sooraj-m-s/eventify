from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
import logging
from admin.permissions import IsAdminUser
from users.image_upload import upload_image_to_cloudinary, ImageUploadError
from .models import Category
from .serializers import CategorySerializer


logger = logging.getLogger(__name__)

CATEGORY_FORM_FIELDS = ('categoryName', 'is_listed')

def _category_form_data(request):
    return {field: request.data.get(field) for field in CATEGORY_FORM_FIELDS if field in request.data}


class CategoryPagination(PageNumberPagination):
    page_size = 10


class CategoryListView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        elif self.request.method == 'POST':
            return [IsAdminUser()]
        return []

    def get(self, request):
        categories = Category.objects.all().order_by('-created_at')
        if 'page' not in request.query_params:
            serializer = CategorySerializer(categories, many=True)
            return Response({'categories': serializer.data}, status=status.HTTP_200_OK)

        search = request.query_params.get('search', '').strip()
        if search:
            categories = categories.filter(categoryName__icontains=search)

        paginator = CategoryPagination()
        page = paginator.paginate_queryset(categories, request, view=self)
        serializer = CategorySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, format=None):
        data = _category_form_data(request)
        category_name = (data.get('categoryName') or '').strip()

        if not category_name:
            return Response({"success": False, "message": "Category name is required."}, status=status.HTTP_400_BAD_REQUEST)
        if Category.objects.filter(categoryName__iexact=category_name).exists():
            return Response({"success": False, "message": "A category with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)

        data['categoryName'] = category_name
        serializer = CategorySerializer(data=data)
        if not serializer.is_valid():
            return Response({"success": False, "message": "Failed to create category", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        image_url = None
        image_file = request.FILES.get('image')
        if image_file:
            try:
                image_url = upload_image_to_cloudinary(image_file, 'categories')
            except ImageUploadError as e:
                return Response({"success": False, "message": e.message}, status=e.status_code)

        serializer.save(image=image_url)
        return Response({"success": True, "message": "Category created successfully", "data": serializer.data}, status=status.HTTP_201_CREATED)


@permission_classes([IsAdminUser])
class CategoryUpdateView(APIView):
    def patch(self, request, category_id, format=None):
        try:
            category = Category.objects.get(categoryId=category_id)
        except Category.DoesNotExist:
            logger.error(f"Category with ID {category_id} not found")
            return Response({"success": False, "message": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

        data = _category_form_data(request)
        if 'categoryName' in data:
            category_name = (data['categoryName'] or '').strip()
            if not category_name:
                return Response({"success": False, "message": "Category name is required."}, status=status.HTTP_400_BAD_REQUEST)
            if Category.objects.exclude(categoryId=category_id).filter(categoryName__iexact=category_name).exists():
                return Response({"success": False, "message": "A category with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)
            data['categoryName'] = category_name

        serializer = CategorySerializer(category, data=data, partial=True)
        if not serializer.is_valid():
            return Response({"success": False, "message": "Failed to update category", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        save_kwargs = {}
        image_file = request.FILES.get('image')
        if image_file:
            try:
                save_kwargs['image'] = upload_image_to_cloudinary(image_file, 'categories')
            except ImageUploadError as e:
                return Response({"success": False, "message": e.message}, status=e.status_code)
        elif str(request.data.get('remove_image', '')).lower() == 'true':
            save_kwargs['image'] = None

        serializer.save(**save_kwargs)
        return Response({"success": True, "message": "Category updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)

