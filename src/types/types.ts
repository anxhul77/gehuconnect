
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
     image:string
     discount:string
    specialPrice:string
     category:string
} 
