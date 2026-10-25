import SparkMD5 from "spark-md5";

const AVATAR_SIZE = 256;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export function isValidAvatarImage(image: Blob) {
  return (
    ALLOWED_IMAGE_TYPES.includes(image.type) &&
    image.size > 0 &&
    image.size < MAX_IMAGE_SIZE
  );
}

export async function resizeAvatarImage(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = (image.naturalWidth - side) / 2;
    const sy = (image.naturalHeight - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvasを使えません。");

    context.imageSmoothingQuality = "high";
    context.drawImage(
      image,
      sx,
      sy,
      side,
      side,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );

    const resized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type),
    );

    if (
      !resized ||
      resized.type !== file.type ||
      !isValidAvatarImage(resized)
    ) {
      throw new Error("画像を加工できませんでした。");
    }

    return resized;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function calculateChecksum(image: Blob) {
  const binaryDigest = SparkMD5.ArrayBuffer.hash(
    await image.arrayBuffer(),
    true,
  );

  return btoa(binaryDigest);
}
