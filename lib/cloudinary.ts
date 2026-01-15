export type Certificate = {
  name: string;
  url: string;
  cloudinary_public_id: string;
  uploaded_at: string;
  file_type: string;
  size: number;
};

export type UploadedImage = {
  url: string;
  cloudinary_public_id: string;
};

type FileInput = File | { uri: string; name: string; type: string };

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_FOLDER = "handyman_certificates";
const CLOUDINARY_AVATAR_FOLDER = "avatars";

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  throw new Error(
    "Missing Cloudinary configuration. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment variables."
  );
}

export const uploadCertificateToCloudinary = async (
  file: FileInput
): Promise<Certificate> => {
  const formData = new FormData();

  if ("uri" in file) {
    formData.append("file", {
      uri: file.uri,
      type: file.type || "application/octet-stream",
      name: file.name || "upload",
    } as any);
  } else {
    formData.append("file", file);
  }

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_FOLDER);
  formData.append("resource_type", "auto");



const response = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData as any,
  }
);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Upload failed");
  }

  const data = await response.json();

  return {
    name: "name" in file ? file.name : data.original_filename,
    url: data.secure_url,
    cloudinary_public_id: data.public_id,
    uploaded_at: new Date().toISOString(),
    file_type: data.format || data.resource_type,
    size: data.bytes,
  };
};

export const uploadCertificates = async (
  files: FileInput[],
  onProgress?: (progress: number) => void
): Promise<Certificate[]> => {
  const certificates: Certificate[] = [];
  const totalFiles = files.length;

  for (let i = 0; i < totalFiles; i++) {
    const certificate = await uploadCertificateToCloudinary(files[i]);
    certificates.push(certificate);

    if (onProgress) {
      onProgress(((i + 1) / totalFiles) * 100);
    }
  }

  return certificates;
};

export const uploadAvatarToCloudinary = async (
  file: FileInput
): Promise<UploadedImage> => {
  const formData = new FormData();

  if ("uri" in file) {
    formData.append("file", {
      uri: file.uri,
      type: file.type || "image/jpeg",
      name: file.name || "avatar.jpg",
    } as any);
  } else {
    formData.append("file", file);
  }

  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET!);
  formData.append("folder", CLOUDINARY_AVATAR_FOLDER);
  formData.append("resource_type", "image");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData as any,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Avatar upload failed");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    cloudinary_public_id: data.public_id,
  };
};
