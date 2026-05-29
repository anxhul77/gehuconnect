import { uploadToR2 } from "./UploadToR2";

export interface AcademicUploadParams {
  title: string;
  description: string;
  type: "PDF" | "VIDEO" | "DOCUMENT" | "PPT" | "IMAGE" | "OTHER";
  subjectId: number;
  fileUri: string;
  mimeType: string;
  fileSize: number;
}

export interface AcademicUploadResult {
  success: boolean;
  fileKey?: string;
  error?: string;
}

/**
 * Full academic upload flow:
 * 1. Get presigned URL from backend
 * 2. Upload file to R2 via presigned URL
 * 3. Call addStudyMaterial API with the file key
 */
export async function uploadAcademicMaterial(
  params: AcademicUploadParams,
  getPresigned: (args: { mimeType: string; fileSize: number }) => Promise<any>,
  addMaterial: (args: { subjectId: number; material: any }) => Promise<any>,
): Promise<AcademicUploadResult> {
  try {
    // Step 1: Get presigned URL
    const presignResult = await getPresigned({
      mimeType: params.mimeType,
      fileSize: params.fileSize,
    });

    if (!presignResult?.presignedUrl || !presignResult?.key) {
      throw new Error("Failed to get presigned URL");
    }

    const { presignedUrl, key } = presignResult;

    // Step 2: Upload to R2
    await uploadToR2(presignedUrl, params.fileUri, params.mimeType);

    // Step 3: Save study material metadata
    await addMaterial({
      subjectId: params.subjectId,
      material: {
        title: params.title,
        description: params.description,
        type: params.type,
        fileUrl: key,
      },
    });

    return { success: true, fileKey: key };
  } catch (error: any) {
    console.error("[AcademicUpload] Failed:", error);
    return { success: false, error: error?.message || "Upload failed" };
  }
}
