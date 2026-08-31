import { PullRequestDto } from "../features/acadmecis.api";
import { uploadToR2 } from "./UploadToR2";

export interface AcademicUploadParams {
  title: string;

  note: string
  subsectionId: string;
  type: "PDF" | "VIDEO" | "DOCUMENT" | "PPT" | "IMAGE" | "OTHER";
  repoId: string;
  fileUri: string;
  mimeType: string;
  fileSize: number;
}

export interface AcademicUploadResult {
  success: boolean;
  fileKey?: string;
  error?: string;
}


export async function uploadAcademicMaterial(
  params: AcademicUploadParams,
  getPresigned: (args: { mimeType: string; fileSize: number }) => Promise<any>,
  addMaterial: (args: { acadRepoId: number | string; pullRequestDto: PullRequestDto }) => Promise<any>,
): Promise<AcademicUploadResult> {
  try {

    const presignResult = await getPresigned({
      mimeType: params.mimeType,
      fileSize: params.fileSize,
    });

    if (!presignResult?.presignedUrl || !presignResult?.key) {
      throw new Error("Failed to get presigned URL");
    }

    const { presignedUrl, key } = presignResult;


    await uploadToR2(presignedUrl, params.fileUri, params.mimeType);

    await addMaterial({
      acadRepoId: params.repoId,
      pullRequestDto: {
        note: params.note,
        subsectionDto: {
          id: params.subsectionId
        },
        materialDto: {
          title: params.title,

          type: params.type,
          fileUrl: key,
        },
      }

    });

    return { success: true, fileKey: key };
  } catch (error: any) {
    console.error("[AcademicUpload] Failed:", error);
    return { success: false, error: error?.message || "Upload failed" };
  }
}
