
export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string
  role: string
  isErpLoggedIn: boolean
  erpData?: ErpUserData
}

export type AuthState = {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
}
export interface FeedPost {
  id: string

  title?: string
  content?: string

  media?: {
    url: string
    type: "image" | "video"
    aspectRatio?: number
  }

  community?: {
    id: string
    name: string
    avatarUrl?: string
  }

  author: {
    id: string
    username: string
    avatarUrl?: string
  }

  stats: {
    likeCount: number
    commentCount: number
  }

  viewerState: {
    liked: boolean
  }

  createdAt: string
}
export interface Message {
  content: string
  createdAt: string
  channelId: number
  messageId: number
  messageType: string
  senderId: string
  senderAvatar: string
  attachmentResponseDto: any;
  formattedTime?: string;

  formattedDate?: string;

  createdAtMs?: number;
}
export enum ChatRole {
  BUYER = "BUYER",
  SELLER = "SELLER"
}
export interface ChatListItemDto {
  chatId: number;
  productId: number;
  productName: string;
  productImage: string;
  otherUserId: string;
  otherUserName: string;
  productPrice: number;
  otherUserRating: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  role: ChatRole;
  isOnline?: boolean;
}

export interface ChatListItemUpdateDto {
  chatId: number;
  lastMessage: string;
  otherUserId: number;
  lastMessageTime: string;
}
export interface MarketplaceChatItemListResponse {
  chats: ChatListItemDto[];
  cursor: string;
  hasNext: boolean;
}
export interface Communities {
  id: string
  name: string
  description: string
  bgImageUrl: string
}
export interface Community {
  id: string
  communityName: string
  description: string
  owner: {
    id: string,
    name: string,
    email: string,
    avatarUrl: string,
    role: string
  },
  channelCategories: any

}
export interface Category {
  content: any
}
export interface SellerDto {
  id: string;
  userName: string;
  avatarUrl: string;
}
export interface CategoryDto {
  categoryId: string
  categoryName: string
}
export interface ProductCardResponse {
  productId: string;
  sellerDto: SellerDto;
  productName: string;

  price: number;
  coverImage: string;
  discount: number;
  specialPrice: number;
  category: CategoryDto;
  isNegotitable: boolean;
  isUrgentSale: boolean;
  productTags: string[];
  productCondition: string;
  likeCount: string;
  isLiked: boolean;
  seenCount: number;
}
export interface ProductPaginatedResponse {
  products: ProductCardResponse[];
  nextCursor: string;
  hasNext: boolean
}

export interface CreateProductRequest {
  productName: string;
  quantity: number;
  description: string;
  price: number;
  image: string[];
  discount?: number;
  status: ListingStatus;
  isNegotitable: boolean;
  isUrgentSale: boolean;
  tags: string[];
  productConditionId: number;
}
export enum ListingStatus {
  DRAFT = "DRAFT",
  SOLD = "SOLD",
  PUBLISHED = "PUBLISHED",
  DELETED = "DELETED"

}


export interface Subject {
  subjectId: string,
  subjectName: string
}
export interface ProductCondition {
  id: string,
  name: string
}
export interface ProductCurousalResponse {
  description: string;
  productImageUrls: string[] | null;
  chatId: string | null;
}
export interface SellerStats {
  totalViews: string
  activeProducts: string
  totalProducts: string
  pausedProducts: string
  soldProducts: string
}
export interface SellerDashBoardData {
  stats: SellerStats,
  products: any
  hasMore: boolean
  nextCursor: string
}
export interface Course {
  id: string
  courseName: string
}
export interface PostAttachmets {
  url: string
  type: string
}
export interface AuthorDto {
  author?: string,
  id?: string,
  avatarUrl?: string,

}
export interface CommunityPost {
  postId: string
  author: string
  title: string
  content: string
  statsDto: string
  likeCount: string
  commentCount: string
  shareCount: string
  tags: string[]
  attachments: PostAttachmets
  liked: boolean
  createdAt: string
}
export interface CommunityPostsRes {
  communityPosts: CommunityPost[]
  nextCursor: string
  hasNext: boolean
}
export type FeedType = "LATEST" | "TRENDING";
export enum CommentSortType {
  LATEST = "LATEST",

  TOP = "TOP",
}
export interface ChannelCategoryDto {
  id: string
  name: string
}
export interface CommentResponseDto {
  commentId: number;
  content: string;
  likeCount: number;
  liked: boolean;
  disliked: boolean;
  replyCount?: number;
  author?: AuthorDto;
  isSending?: boolean;
}

export interface NestedCommentResponse {
  commentId: number;
  content: string;
  likeCount: number;
  liked: boolean;
  disliked: boolean;
  author?: AuthorDto;
  parentCommentId?: number;
  isSending?: boolean;
}

export interface PostCommentResponse {
  comments: CommentResponseDto[];
  cursor: string;
  hasNext: boolean;
}


export interface CommentDto {
  author?: AuthorDto;
  content?: string;
  parentCommentId?: string;
  postId?: string;
}

export enum CommunitySortType {
  MEMBERCOUNTASC = "MEMBERCOUNTASC",
  MEMBERCOUNTDESC = "MEMBERCOUNTDESC",
  TIMEASC = "TIMEASC",
  TIMEDESC = "TIMEDESC",
  SCORE = "SCORE",
}

export interface CommunityCardDto {
  communityId: number;
  communityName: string;
  avatarUrl: string;
  memberCount: number;
  score: number;
  tags: string[];
  isJoined: boolean;
}

export interface CommunityCardResponse {
  communities: CommunityCardDto[];
  cursor: string;
  hasNext: boolean;
}
export interface ProfilePostsCardDto {
  postId: number;
  thumbUrl: string;
}

export interface ProfilePostsCardResponse {
  postsCards: ProfilePostsCardDto[];
  cursor: string;
  hasNext: boolean;
}

export interface CommunityProfileResponse {
  bannerUrl: string;
  description: string;
  memberCount: number;
  postCount: number;
  posts: CommunityPostsRes;
  tags: string[];
}

export interface ErpUserData {
  name: string;
  studentId: string;
  enrollmentNo: string;
  fatherName: string;
  motherName: string;
  dob: string;
  email: string;
  officialEmail: string;
  mobile: string;
  alternateMobile: string;
  fatherMobile: string;
  college: string;
  course: string;
  branch: string;
  section: string;
  yearSem: number;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  permanentAddress: string;
  classRollNo: number;
  universityRoll: string;
  highSchool: string;
  intermediate: string;
  studentStatus: string;
  batch: number;
  university: string;
  abcAccountNo: string;
  photo: string;
}
export interface CommunityResposneDto {
  id: number,
  name: string,
  avatarUrl: string,
}
export interface CommunityRailResponse {
  communities: CommunityResposneDto[],
  cursor: string,
  hasNext: boolean
}