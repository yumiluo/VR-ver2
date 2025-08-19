"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Translations {
  // App
  app: {
    title: string
  }

  // Navigation
  nav: {
    howItWorks: string
    destinations: string
    browseRooms: string
  }

  // Hero Section
  hero: {
    title: string
    subtitle: string
    browseRooms: string
    exploreDestinations: string
  }

  // Destinations
  destinations: {
    title: string
    loading: string
  }

  // CTA
  cta: {
    title: string
    subtitle: string
    button: string
  }

  // Navigation
  home: string
  rooms: string
  myRooms: string
  createRoom: string
  joinRoom: string
  backToHome: string

  // Room Management
  roomName: string
  description: string
  selectVideo: string
  maxParticipants: string
  privateRoom: string
  password: string
  createNewRoom: string
  enterRoomName: string
  describeRoom: string
  chooseDestination: string
  enterPassword: string
  cancel: string

  // Room Status
  watching: string
  waiting: string
  public: string
  private: string
  full: string
  participants: string
  hostedBy: string

  // Video Player
  watchingTogether: string
  liveChat: string
  typeMessage: string
  send: string
  inviteFriends: string
  resetView: string
  syncing: string
  host: string
  online: string
  offline: string

  // Search & Filters
  searchRooms: string
  allRooms: string
  waitingToStart: string
  currentlyWatching: string
  publicRooms: string
  privateRooms: string
  noRoomsFound: string
  adjustSearch: string
  beFirstToCreate: string

  // General
  connected: string
  disconnected: string
  share: string
  likes: string
  totalViews: string
  duration: string
  location: string
  language: string
}

const en: Translations = {
  // App
  app: {
    title: "VR Travel Group",
  },

  // Navigation
  nav: {
    howItWorks: "How it Works",
    destinations: "Destinations",
    browseRooms: "Browse Rooms",
  },

  // Hero Section
  hero: {
    title: "Experience the World Together in VR",
    subtitle:
      "Join friends and travelers from around the globe to explore breathtaking destinations in immersive 360° virtual reality.",
    browseRooms: "Browse Rooms",
    exploreDestinations: "Explore Destinations",
  },

  // Destinations
  destinations: {
    title: "Popular Destinations",
    loading: "Loading destinations...",
  },

  // CTA
  cta: {
    title: "Ready to Start Your Virtual Journey?",
    subtitle: "Join thousands of travelers exploring the world together in VR.",
    button: "Browse Rooms Now",
  },

  // Navigation
  home: "Home",
  rooms: "Rooms",
  myRooms: "My Rooms",
  createRoom: "Create Room",
  joinRoom: "Join Room",
  backToHome: "Back to Home",

  // Room Management
  roomName: "Room Name",
  description: "Description",
  selectVideo: "Select Video",
  maxParticipants: "Max Participants",
  privateRoom: "Private Room",
  password: "Password",
  createNewRoom: "Create New Room",
  enterRoomName: "Enter room name...",
  describeRoom: "Describe your room...",
  chooseDestination: "Choose a destination...",
  enterPassword: "Enter room password...",
  cancel: "Cancel",

  // Room Status
  watching: "Watching",
  waiting: "Waiting",
  public: "Public",
  private: "Private",
  full: "Full",
  participants: "participants",
  hostedBy: "Hosted by",

  // Video Player
  watchingTogether: "Watching Together",
  liveChat: "Live Chat",
  typeMessage: "Type a message...",
  send: "Send",
  inviteFriends: "Invite Friends",
  resetView: "Reset View",
  syncing: "Syncing...",
  host: "Host",
  online: "Online",
  offline: "Offline",

  // Search & Filters
  searchRooms: "Search rooms, destinations, or hosts...",
  allRooms: "All Rooms",
  waitingToStart: "Waiting to Start",
  currentlyWatching: "Currently Watching",
  publicRooms: "Public Rooms",
  privateRooms: "Private Rooms",
  noRoomsFound: "No rooms found",
  adjustSearch: "Try adjusting your search terms",
  beFirstToCreate: "Be the first to create a room!",

  // General
  connected: "Connected",
  disconnected: "Disconnected",
  share: "Share",
  likes: "likes",
  totalViews: "total views",
  duration: "Duration",
  location: "Location",
  language: "Language",
}

const zh: Translations = {
  // App
  app: {
    title: "VR旅行团",
  },

  // Navigation
  nav: {
    howItWorks: "如何使用",
    destinations: "目的地",
    browseRooms: "浏览房间",
  },

  // Hero Section
  hero: {
    title: "与世界一起体验VR旅行",
    subtitle: "与来自全球的朋友和旅行者一起，在沉浸式360°虚拟现实中探索令人惊叹的目的地。",
    browseRooms: "浏览房间",
    exploreDestinations: "探索目的地",
  },

  // Destinations
  destinations: {
    title: "热门目的地",
    loading: "正在加载目的地...",
  },

  // CTA
  cta: {
    title: "准备开始您的虚拟之旅了吗？",
    subtitle: "加入数千名旅行者，一起在VR中探索世界。",
    button: "立即浏览房间",
  },

  // Navigation
  home: "首页",
  rooms: "房间",
  myRooms: "我的房间",
  createRoom: "创建房间",
  joinRoom: "加入房间",
  backToHome: "返回首页",

  // Room Management
  roomName: "房间名称",
  description: "描述",
  selectVideo: "选择视频",
  maxParticipants: "最大参与人数",
  privateRoom: "私人房间",
  password: "密码",
  createNewRoom: "创建新房间",
  enterRoomName: "输入房间名称...",
  describeRoom: "描述您的房间...",
  chooseDestination: "选择目的地...",
  enterPassword: "输入房间密码...",
  cancel: "取消",

  // Room Status
  watching: "观看中",
  waiting: "等待中",
  public: "公开",
  private: "私人",
  full: "已满",
  participants: "参与者",
  hostedBy: "主持人",

  // Video Player
  watchingTogether: "一起观看",
  liveChat: "实时聊天",
  typeMessage: "输入消息...",
  send: "发送",
  inviteFriends: "邀请朋友",
  resetView: "重置视角",
  syncing: "同步中...",
  host: "主持人",
  online: "在线",
  offline: "离线",

  // Search & Filters
  searchRooms: "搜索房间、目的地或主持人...",
  allRooms: "所有房间",
  waitingToStart: "等待开始",
  currentlyWatching: "正在观看",
  publicRooms: "公开房间",
  privateRooms: "私人房间",
  noRoomsFound: "未找到房间",
  adjustSearch: "尝试调整搜索条件",
  beFirstToCreate: "成为第一个创建房间的人！",

  // General
  connected: "已连接",
  disconnected: "已断开",
  share: "分享",
  likes: "点赞",
  totalViews: "总观看次数",
  duration: "时长",
  location: "位置",
  language: "语言",
}

export const translations = { en, zh }
export type Language = keyof typeof translations

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
