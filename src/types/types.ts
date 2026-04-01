
export type User = {
  id: string
  username: string
  email: string
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
 content:string
   createdAt:string
  channelId:number
  messageId:number
   messageType:string
   senderId:string
   senderAvatar:string
   attachmentResponseDto:any;
}
export interface Communities{
  id:string
  name:string
  description:string
  bgImageUrl:string
}
export interface Community{
  id:string
  communityName:string
  description:string
  owner:{
    id:string,
    name:string,
    email:string,
    avatarUrl:string,
    role:string
  },
  channelCategories:any

}
export interface Category{
  content:any}
export interface Product{
 productId:string
     sellerDto:any
    productName:string
     quantity:string
    description:string
     price:string
     image:string[]
     discount:string
    specialPrice:string
     category:string
     likes:string
     seen:string
     listingStatus:string
     isNegotiable:boolean
     isUrgentSale:boolean
     productTags:string[]
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
  DRAFT="DRAFT",
  SOLD = "SOLD",
  PUBLISHED = "PUBLISHED",
  DELETED="DELETED"

}
export interface ItemCardProps {
  item:{
    productId:string
     sellerDto:any
    productName:string
     quantity:string
    description:string
     price:string
     image:string
     discount:string
    specialPrice:string
     category:string
  }
}
export interface Subject{
  subjectId:string,
  subjectName:string
}
export interface ProductCondition{
  id:string,
  name:string
}
export interface SellerStats{
      totalViews:string
      activeProducts:string
       totalProducts:string
       pausedProducts:string
      soldProducts:string
}
export interface SellerDashBoardData{
   stats:SellerStats,
   products:any
   hasMore:boolean
   nextCursor:string
}