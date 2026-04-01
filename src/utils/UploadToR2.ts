export const uploadToR2 = async (presignedUrl: string, uri: string, mimeType: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: blob,
  });
  console.log(uploadResponse)
  console.log(uploadResponse.status)
  if (!uploadResponse.ok) {

    console.log("uplaod failed didnt get upploaded")
    throw new Error("Upload failed");
  }
};