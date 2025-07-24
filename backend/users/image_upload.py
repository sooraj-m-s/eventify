from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decouple import config
from rest_framework import status
import cloudinary.uploader


cloudinary_upload_preset = config('cloudinary_upload_preset')

@permission_classes([IsAuthenticated])
class ImageUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        supported_formats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
        if file.content_type not in supported_formats:
            return Response({"error": "Unsupported image format. Use JPEG, PNG, GIF, WebP, or BMP"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        if file.size > 5 * 1024 * 1024:
            return Response({"error": "Image size should be less than 5MB"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            upload_result = cloudinary.uploader.upload(
                file,
                upload_preset=cloudinary_upload_preset,
                resource_type="image"
            )
            return Response({"url": upload_result['secure_url']}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to upload image: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

