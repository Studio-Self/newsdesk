export interface Asset {
  id: string;
  newsroomId: string;
  storyId: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  altText: string | null;
  caption: string | null;
  uploadedBy: string | null;
  createdAt: string;
}
