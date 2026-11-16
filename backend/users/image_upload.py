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

CLOUDINARY_ROOT_FOLDER = config('CLOUDINARY_ROOT_FOLDER', default='Eventify')
ASSET_FOLDERS = {
    'categories': 'categories',
    'events': 'events',
    'profiles': 'profiles',
    'id_proofs': 'id-proofs',
    'chat': 'chat',
    'site': 'site',
}


def get_asset_folder(key):
    """Full Cloudinary asset folder path for a folder key, e.g. 'categories' -> 'Eventify/categories'."""
    if key not in ASSET_FOLDERS:
        raise ValueError(f"Unknown asset folder key: {key}")
    return f"{CLOUDINARY_ROOT_FOLDER}/{ASSET_FOLDERS[key]}"

SUPPORTED_IMAGE_FORMATS = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/x-icon', 'image/svg+xml'
]
MAX_IMAGE_SIZE = 5 * 1024 * 1024


class ImageUploadError(Exception):
    """Raised when an image fails validation or the Cloudinary upload fails.

    `status_code` is the HTTP status a view should respond with.
    """
    def __init__(self, message, status_code=status.HTTP_400_BAD_REQUEST):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def upload_image_to_cloudinary(file, folder):
    """Validate an uploaded image file and upload it to Cloudinary. Returns the secure URL.

    `folder` is a key of ASSET_FOLDERS (e.g. 'categories'); the asset is stored in that subfolder.
    """
    asset_folder = get_asset_folder(folder)

    if file.content_type not in SUPPORTED_IMAGE_FORMATS:
        raise ImageUploadError("Unsupported image format.")
    if file.size > MAX_IMAGE_SIZE:
        raise ImageUploadError("Image size should be less than 5MB")

    try:
        image = Image.open(file)
        image.verify()
        file.seek(0)
    except (UnidentifiedImageError, IOError):
        logger.error("Invalid image file.")
        raise ImageUploadError("Invalid image file.")

    try:
        upload_result = cloudinary.uploader.upload(
            file,
            upload_preset=cloudinary_upload_preset,
            asset_folder=asset_folder,
            resource_type="image"
        )
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise ImageUploadError("Image upload failed.", status.HTTP_500_INTERNAL_SERVER_ERROR)

    return upload_result['secure_url']


@permission_classes([IsAuthenticated])
class ImageUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('image')
        if not file:
            return Response({"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)

        folder = request.data.get('folder')
        if folder not in ASSET_FOLDERS:
            return Response(
                {"error": f"Invalid folder. Must be one of: {', '.join(ASSET_FOLDERS)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            url = upload_image_to_cloudinary(file, folder)
            return Response({"url": url}, status=status.HTTP_200_OK)
        except ImageUploadError as e:
            return Response({"error": e.message}, status=e.status_code)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

