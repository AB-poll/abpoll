import io
import uuid
import requests
import random

from PIL import Image
from config.settings import CLOUDFLARE_API_KEY, CLOUDFLARE_ACCOUNT_ID

UPLOAD_FOLDER = "static/images/uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
ALLOWED_VIDEO_EXTENSIONS = {"mp4", "mov", "webm"}

profile_pictures = [
    "55e6e00c-5a0c-4eb6-1d61-68a62036b700",
    "80e9be83-00c1-4984-d214-301cec0fda00",
    "7ef13457-b963-4017-10b9-7b98317c9e00",
    "c0d220f2-6dce-4123-6c1a-7b66684f1c00",
    "df5105d7-5e6a-4d2c-05a3-3fb83b9a3000",
    "86752858-9262-4c53-39c1-a607534c6600",
    "b5385fa1-f5cf-4fe8-f817-2b2caa32cd00",
    "14e701d2-c2a2-4bea-d4c6-7207de2b6900",
    "608f2b78-0854-48c9-9190-059a1260d600",
    "d8ad943f-da8d-4103-e6e2-98251ca63d00",
    "18aeb8e5-0ef0-4a10-3f1e-a25045747a00",
    "dd88e011-27c0-4756-6ac4-d74c091dab00",
    "87ac756e-6eb7-4c6d-4b72-e06dfebc6b00",
    "040b3ec3-5188-4f94-f9ad-74ea1ab20700",
    "04344ca1-c026-4c07-d70c-0baa77046200",
    "85de3758-655d-42c1-6967-e9455935b300",
    "a3793e45-00ec-4184-df49-0eed37db5d00",
    "0eb4e01a-fff4-4f74-3656-806042481200",
    "2f16c75f-8a92-46a4-6f5a-f3e33dc0c000",
    "f8d0155d-512d-4a9d-0589-bf261cfb2900",
    "bdb5355a-722a-4e4b-405b-d9c317000200",
    "f857e91c-7ef6-4f07-b8e0-fdd215894e00",
    "32370b4d-eeb9-4bd3-3ce7-49ddfddd7d00",
]

backgrounds = [
    "23d76794-9044-4910-6ced-f4f06c5fdf00",
    "90f26189-606e-48ea-31df-256a560e6c00",
    "90f26189-606e-48ea-31df-256a560e6c00",
    "77eac8d5-8f78-44c3-519a-088c61df0f00",
    "46ccb434-3f40-468c-5f8d-6489700a8e00",
    "d2eed70b-7e39-400c-5ac4-1689fe85bd00",
    "3cde44d0-e9ac-429f-fad1-77f9b2832600",
    "dd05e387-90d8-4a83-3272-9da4134cf200",
    "9c1a0067-532a-4bbd-fcd6-867b3245a700",
    "942fb165-1fb7-48ce-d5b9-fc51cacc4c00",
    "7bd40954-ba89-4384-893c-84e0fb530a00",
    "6967fb16-2e92-4856-d83c-505c2e6a3100",
    "63658a3d-03de-48d5-1482-ce9357713000",
    "dce5e73c-07a1-4e24-9733-2eac53567500",
    "44e54728-d6ba-4783-329d-6247487c8d00",
    "1ff86ccb-d4d0-40f0-9e8e-df6a1c0dfb00",
    "72d59b49-e0cd-4127-359d-006366541e00",
    "62d519a2-fa22-46fa-bbac-3cb6fa1a3e00",
    "b5ac0865-dc29-4137-5d80-41280ce7a300",
    "0a0f54f9-7a46-4ad5-e682-6681258d4f00",
    "0752558a-2d75-4fc5-02bc-c76c917bf600",
    "e16d6f6b-d19b-4893-a7a1-a31cbf39fc00",
    "c68756af-a8fc-46ff-63f5-f20a72393700",
]

custom_backgrounds = [
    "2d446856-d415-48e4-0274-91e1ad65bc00"
]


def modify_image(image, image_format):
    pil_image = Image.open(image)

    in_mem_file = io.BytesIO()

    # format here would be something like "JPEG". See below link for more info.
    pil_image.save(in_mem_file, format=image_format)
    return in_mem_file.getvalue()


def allowed_image_file(filename):
    return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def allowed_video_file(filename):
    return (
            "." in filename
            and filename.rsplit(".", 1)[1].lower() in ALLOWED_VIDEO_EXTENSIONS
    )


def save_image(filename):
    format_ = str(filename).split(".")[-1]
    if format_.lower() == "jpeg":
        format_ = "jpg"
    filename = f"{str(uuid.uuid4())}.{format_.lower()}"
    return filename


def upload_images_to_cloudflare(image_name, image_mem_value):
    CLOUDFLARE_IMAGE_POST_URL = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/images/v1"

    headers = {
        'Authorization': f'Bearer {CLOUDFLARE_API_KEY}',
    }

    files = {
        'file': (image_name, image_mem_value),
    }

    response = requests.post(CLOUDFLARE_IMAGE_POST_URL, headers=headers, files=files)

    return response.json()["result"]["id"]


def delete_image_from_cloudflare(image_id):
    if image_id in backgrounds or image_id in profile_pictures or image_id in custom_backgrounds:
        return 200

    headers = {
        'Authorization': f'Bearer {CLOUDFLARE_API_KEY}',
    }
    CLOUDFLARE_DELETE_URL = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/images/v1/{image_id}"
    response = requests.delete(CLOUDFLARE_DELETE_URL, headers=headers)
    return response.status_code


def random_image_background(number: int) -> list:
    """
    receive the number of images wanted and return the array of images
    """

    output = []
    for x in range(number):
        output.append(random.choice(backgrounds))
    return output


def random_profile_background(number: int) -> list:
    """
    receive the number of images wanted and return the array of images
    """

    output = []
    for x in range(number):
        output.append(random.choice(profile_pictures))
    return output
