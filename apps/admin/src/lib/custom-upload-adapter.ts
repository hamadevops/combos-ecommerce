import { apiClient } from "./api-client";
import { getImageUrl } from "./utils";

export class CustomUploadAdapter {
  loader: any;
  uploadUrl: string;
  abortController: AbortController | null = null;

  constructor(loader: any, uploadUrl: string) {
    this.loader = loader;
    this.uploadUrl = uploadUrl;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          const data = new FormData();
          data.append("file", file);

          this.abortController = new AbortController();

          apiClient
            .post(this.uploadUrl, data, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              signal: this.abortController.signal,
              onUploadProgress: (evt) => {
                if (evt.total) {
                  this.loader.uploadTotal = evt.total;
                  this.loader.uploaded = evt.loaded;
                }
              },
            })
            .then((response: any) => {
              // The interceptor returns response.data, so 'response' here
              // is the API payload: { statusCode, message, data }
              // response.data could be a string URL or an object like { url, path, filePath }
              const responseData = response?.data;

              if (responseData) {
                // Extract the URL string from the response data
                let imageUrl: string;
                if (typeof responseData === "string") {
                  imageUrl = responseData;
                } else if (typeof responseData === "object") {
                  imageUrl = responseData.url || responseData.path || responseData.filePath || responseData.filename || "";
                } else {
                  imageUrl = String(responseData);
                }

                if (imageUrl) {
                  resolve({
                    default: getImageUrl(imageUrl),
                  });
                } else {
                  reject("Invalid response: could not extract image URL");
                }
              } else {
                reject("Invalid response from server");
              }
            })
            .catch((error: any) => {
              // Check if it's an abort error
              if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
                return; // Silent fail on abort
              }
              const message = error.message || "Upload failed";
              reject(message);
            });
        }),
    );
  }

  // Aborts the upload process.
  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

export function CustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: any) => {
    // Use relative path so apiClient uses its baseURL
    // However, apiClient baseURL is configured in api-client.ts.
    // Let's look at api-client.ts again.
    // It uses VITE_API_BASE_URL.
    // Backend upload controller is at /upload/file
    // So we just need passing '/upload/file' to apiClient.post
    const UPLOAD_ENDPOINT = "/upload/file";
    return new CustomUploadAdapter(loader, UPLOAD_ENDPOINT);
  };
}
