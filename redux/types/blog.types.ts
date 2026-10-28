export interface BlogAuthor {
  Name?: string;
  Email?: string;
  _id?: string;
  Id?: string;
  Role?: string;
}

export interface IBlog {
  _id?: string;
  Id?: string;
  Title: string;
  Category: string;
  PublishedDate?: string | Date;
  FeaturedImage?: string;
  KeyClinicalHighlights?: string[];
  Content: string;
  ConsultationNote?: string;
  IsPublished: boolean;
  CreatedBy?: BlogAuthor | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  __v?: number;
}

export interface CreateBlogRequest {
  Title: string;
  Category: string;
  Content: string;
  KeyClinicalHighlights?: string[];
  ConsultationNote?: string;
  FeaturedImage?: string; // base64 or URL
  IsPublished?: boolean;
}

export interface UpdateBlogRequest {
  id: string;
  Title?: string;
  Category?: string;
  Content?: string;
  KeyClinicalHighlights?: string[];
  ConsultationNote?: string;
  FeaturedImage?: string;
  IsPublished?: boolean;
}

export interface GetBlogsParams {
  Search?: string;
  Category?: string;
  IsPublished?: boolean | string;
  Page?: number;
  Limit?: number;
}

export interface BlogPagination {
  Total: number;
  Page: number;
  Limit: number;
  Pages: number;
  TotalPages?: number;
}

export interface GetBlogsResponse {
  Success: boolean;
  Message: string;
  Data: IBlog[];
  Pagination?: BlogPagination;
}

