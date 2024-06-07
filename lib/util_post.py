import io
import uuid
import json
import base64
import cv2
import numpy as np
from PIL import Image
from werkzeug.utils import secure_filename

from abpoll.extensions import db
from abpoll.blueprints.post.models import Post


def random_post_id():
    while 1 > 0:
        uuid_obj = (
            base64.urlsafe_b64encode(uuid.uuid4().bytes)
                .decode("utf-8")
                .replace("=", "")
                .replace("-", "")
                .replace("_", "")
        )
        string_obj = str(uuid_obj)[:13]
        is_id_available = (
            db.session.query(Post).filter(Post.id == string_obj).first()
        )
        if is_id_available is None:
            return string_obj


def return_cv2_image(image_to_convert):
    # Insert a werkzeug file storage item i.e request.files[file]
    in_memory_file = io.BytesIO()
    image_to_convert.save(in_memory_file)
    data = np.fromstring(in_memory_file.getvalue(), dtype=np.uint8)
    # return cv2 image
    imageBGR = cv2.imdecode(data, cv2.IMREAD_COLOR)
    return cv2.cvtColor(imageBGR, cv2.COLOR_BGR2RGB)


def create_array_from_argument(array_argument):
    # This will turn a tagify input into an array that the database will consume
    output = []
    if array_argument is not None and array_argument != "":
        new_tag = json.loads(array_argument)
        for key in new_tag:
            for value in key.values():
                output.append(value)
    return output


def save_image_to_server(file):
    with Image.open(file) as im:
        from lib.upload_files import save_image, upload_images_to_cloudflare

        filename = secure_filename(save_image(file.filename))
        ext = str(str(filename).split(".")[1]).upper()
        image_format = "JPEG" if ext.lower() == "jpg" else ext.upper()

        in_mem_file = io.BytesIO()
        im.save(
            in_mem_file, quality=70, optimize=True, format=image_format
        )
        in_mem_file.seek(0)

        return upload_images_to_cloudflare(filename, in_mem_file)


def vertical_attach_images(img_list, interpolation=cv2.INTER_CUBIC):
    # This will attach image vertically and upload it
    # take minimum width
    w_min = min(img.shape[1] for img in img_list)

    # resizing images
    im_list_resize = [cv2.resize(img, (w_min, int(img.shape[0] * w_min / img.shape[1])), interpolation=interpolation)
                      for img in img_list]

    # return final image
    img_v_resize = cv2.vconcat(im_list_resize)

    im_pil = Image.fromarray(img_v_resize)

    from lib.upload_files import save_image, upload_images_to_cloudflare

    filename = secure_filename(save_image('vertical_attach.jpg'))
    ext = str(str(filename).split(".")[1]).upper()
    image_format = "JPEG" if ext.lower() == "jpg" else ext.upper()

    in_mem_file = io.BytesIO()
    im_pil.save(
        in_mem_file, quality=70, optimize=True, format=image_format
    )
    in_mem_file.seek(0)

    return upload_images_to_cloudflare(filename, in_mem_file)
