from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from PIL import Image, UnidentifiedImageError
from decouple import config
from rest_framework import status
import cloudinary.uploader, logging


logger = logging.getLogger(__name__)
cloudinary_upload_preset = config('cloudinary_upload_preset')

@permission_classes([IsAuthenticated])
class ImageUploadView(APIView):
    def post(self, request):
        try:
            file = request.FILES.get('image')
            if not file:
                return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
            
            supported_formats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/x-icon', 'image/svg+xml']
            if file.content_type not in supported_formats:
                return Response({"error": "Unsupported image format."}, 
                            status=status.HTTP_400_BAD_REQUEST)
            if file.size > 5 * 1024 * 1024:
                return Response({"error": "Image size should be less than 5MB"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                image = Image.open(file)
                image.verify()
                file.seek(0)
            except (UnidentifiedImageError, IOError):
                logger.error("Invalid image file.")
                return Response({"error": "Invalid image file."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                upload_result = cloudinary.uploader.upload(
                    file,
                    upload_preset=cloudinary_upload_preset,
                    resource_type="image"
                )

                return Response({"url": upload_result['secure_url']}, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Cloudinary upload failed: {e}")
                return Response({"error": "Image upload failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

