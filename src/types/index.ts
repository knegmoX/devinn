// Core Types for AI笔记DevInn

export type Platform = 'XIAOHONGSHU' | 'BILIBILI' | 'DOUYIN' | 'MAFENGWO';

export type ActivityType = 'ATTRACTION' | 'RESTAURANT' | 'HOTEL' | 'TRANSPORT' | 'ACTIVITY';

export type AssistantState = 
  | 'COLLAPSED'    // 收起状态，仅显示悬浮按钮
  | 'QUICK_MENU'   // 快捷菜单，显示常用操作
  | 'CHAT_MODE'    // 聊天模式，全屏对话
  | 'PROCESSING'   // 处理中，显示进度
  | 'SUGGESTION';  // 建议模式，显示AI建议

// User Types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  travelStyle: string[];
  dietaryRestrictions: string[];
  accessibility: string[];
}

// Travel Note Types
export interface TravelNote {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  destination: string;
  userId: string;
  contentLinks: ContentLink[];
  requirements?: UserRequirements;
  travelPlan?: TravelPlan;
  status: 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentLink {
  id: string;
  url: string;
  platform: Platform;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extractedData?: ExtractedContent;
  addedAt: Date;
  noteId: string;
}

// Content Extraction Types
export interface ExtractedContent {
  title: string;
  description: string;
  platform: Platform;
  
  locations: Array<{
    name: string;
    address?: string;
    coordinates?: [number, number];
    type: ActivityType;
  }>;
  
  activities: Array<{
    name: string;
    description: string;
    category: string;
    estimatedCost?: number;
    duration?: number;
    tips?: string[];
  }>;
  
  media: Array<{
    type: 'IMAGE' | 'VIDEO';
    url: string;
    caption?: string;
    timestamp?: number;
  }>;
  
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
}

// User Requirements Types
export interface UserRequirements {
  duration: number;
  travelers: number;
  budget?: number;
  travelStyle: string[];
  interests: string[];
  dietaryRestrictions?: string[];
  accessibility?: string[];
  freeText?: string;
}

// Travel Plan Types
export interface TravelPlan {
  id: string;
  title: string;
  destination: string;
  totalDays: number;
  estimatedBudget: {
    min: number;
    max: number;
    breakdown: {
      accommodation: number;
      food: number;
      activities: number;
      transport: number;
    };
  };
  
  days: TravelDay[];
  flights?: FlightOption[];
  hotels?: HotelOption[];
  
  noteId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelDay {
  dayNumber: number;
  date: string;
  title: string;
  theme: string;
  weather?: WeatherInfo;
  
  activities: TravelActivity[];
  
  dailySummary: {
    totalCost: number;
    walkingDistance: number;
    highlights: string[];
  };
}

export interface TravelActivity {
  id: string;
  order: number;
  startTime: string;
  endTime: string;
  type: ActivityType;
  title: string;
  description: string;
  location: LocationInfo;
  estimatedCost: number;
  tips: string[];
  bookingInfo?: BookingInfo;
  
  // User modifications
  userModifications?: {
    originalOrder: number;
    currentOrder: number;
    userNotes?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    bookmarked: boolean;
  };
}

export interface LocationInfo {
  name: string;
  address: string;
  coordinates: [number, number];
  district?: string;
  nearbyLandmarks?: Array<{
    name: string;
    distance: number;
    walkingTime: number;
  }>;
}

export interface WeatherInfo {
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  humidity: number;
  precipitation: number;
  windSpeed: number;
}

export interface BookingInfo {
  url: string;
  provider: string;
  price?: number;
  availability?: string;
}

// Flight Types
export interface FlightOption {
  id: string;
  type: 'OUTBOUND' | 'RETURN';
  
  airline: {
    code: string;
    name: string;
    logo: string;
  };
  
  flightNumber: string;
  aircraft: string;
  
  departure: {
    airport: {
      code: string;
      name: string;
      terminal: string;
    };
    time: string;
    date: string;
  };
  
  arrival: {
    airport: {
      code: string;
      name: string;
      terminal: string;
    };
    time: string;
    date: string;
  };
  
  duration: {
    total: number;
    formatted: string;
  };
  
  stops: Array<{
    airport: string;
    duration: number;
  }>;
  
  price: {
    amount: number;
    currency: string;
    pricePerPerson: number;
    totalPrice: number;
    taxes: number;
  };
  
  cabin: {
    class: 'ECONOMY' | 'BUSINESS' | 'FIRST';
    name: string;
    baggage: {
      checkedBags: string;
      carryOn: string;
    };
  };
  
  booking: {
    url: string;
    provider: string;
    availability: number;
    refundable: boolean;
    changeable: boolean;
  };
  
  rating: {
    score: number;
    punctuality: number;
    comfort: number;
    service: number;
  };
}

// Hotel Types
export interface HotelOption {
  id: string;
  name: string;
  brand?: string;
  category: string;
  starRating: number;
  
  location: {
    address: string;
    district: string;
    coordinates: [number, number];
    nearbyLandmarks: Array<{
      name: string;
      distance: number;
      walkingTime: number;
    }>;
    transportation: Array<{
      type: 'SUBWAY' | 'BUS' | 'TRAIN';
      station: string;
      distance: number;
      lines: string[];
    }>;
  };
  
  rooms: Array<{
    type: string;
    size: number;
    bedType: string;
    maxOccupancy: number;
    amenities: string[];
    
    pricing: {
      basePrice: number;
      totalPrice: number;
      currency: string;
      taxes: number;
      fees: number;
      
      priceHistory: Array<{
        date: string;
        price: number;
      }>;
    };
  }>;
  
  amenities: {
    general: string[];
    dining: string[];
    recreation: string[];
    business: string[];
  };
  
  reviews: {
    overall: number;
    breakdown: {
      cleanliness: number;
      comfort: number;
      location: number;
      service: number;
      value: number;
    };
    totalReviews: number;
    recentReviews: Array<{
      rating: number;
      comment: string;
      date: string;
      travelerType: string;
    }>;
  };
  
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: {
      type: 'FREE' | 'PARTIAL' | 'NON_REFUNDABLE';
      deadline: string;
      fee?: number;
    };
    children: string;
    pets: boolean;
  };
  
  booking: {
    url: string;
    provider: string;
    availability: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
    lastBooked: string;
    urgency?: string;
  };
  
  images: Array<{
    url: string;
    caption: string;
    type: 'EXTERIOR' | 'LOBBY' | 'ROOM' | 'AMENITY' | 'VIEW';
  }>;
}

// AI Assistant Types
export interface ChatMessage {
  id: string;
  type: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: Date;
  relatedContext?: string;
}

export interface AISuggestion {
  id: string;
  type: 'OPTIMIZATION' | 'ALTERNATIVE' | 'WARNING' | 'TIP' | 'WEATHER_ALERT';
  title: string;
  description: string;
  action?: string;
  priority: number;
}

export interface AICommand {
  id: string;
  userInput: string;
  parsedIntent: {
    action: 'MOVE' | 'REPLACE' | 'ADD' | 'REMOVE' | 'OPTIMIZE';
    target: string;
    parameters: any;
    scope: 'SINGLE' | 'DAY' | 'TRIP';
  };
  
  executionPlan: {
    steps: Array<{
      description: string;
      type: 'MODIFY' | 'QUERY' | 'CALCULATE';
      estimatedTime: number;
    }>;
    affectedItems: string[];
    estimatedImpact: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  
  confirmation: {
    required: boolean;
    message: string;
    risks?: string[];
  };
}

// App State Types
export interface AppState {
  user: {
    profile: UserProfile | null;
    preferences: UserPreferences;
    isAuthenticated: boolean;
  };
  
  notes: {
    currentNote: TravelNote | null;
    notesList: TravelNote[];
    isLoading: boolean;
    error: string | null;
  };
  
  assistant: {
    isOpen: boolean;
    state: AssistantState;
    chatHistory: ChatMessage[];
    suggestions: AISuggestion[];
    isProcessing: boolean;
  };
  
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    activeDay: number;
    editMode: boolean;
  };
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dynamic Travel Document Types
export interface TravelDocument {
  id: string;
  title: string;
  destination: string;
  coverImage?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  travelers: {
    count: number;
    type: string;
  };
  budget: {
    total: number;
    breakdown: BudgetBreakdown;
  };
  weather: WeatherInfo[];
  itinerary: ItineraryDay[];
  flights: FlightOption[];
  hotels: HotelOption[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    aiGenerated: boolean;
    userModified: boolean;
  };
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  shopping?: number;
  miscellaneous?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  theme: string;
  weather?: WeatherInfo;
  activities: Activity[];
  dailySummary: {
    totalCost: number;
    walkingDistance: number;
    highlights: string[];
  };
}

export interface Activity {
  id: string;
  order: number;
  type: 'FLIGHT' | 'HOTEL' | 'ATTRACTION' | 'RESTAURANT' | 'TRANSPORT' | 'ACTIVITY';
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location: LocationInfo;
  estimatedCost: number;
  duration: number;
  tips: string[];
  media: MediaInfo[];
  bookingInfo?: BookingInfo;
  userModifications: {
    notes?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    bookmarked: boolean;
    customOrder?: number;
  };
  status: {
    confirmed: boolean;
    modified: boolean;
    aiGenerated: boolean;
  };
}

export interface MediaInfo {
  type: 'IMAGE' | 'VIDEO';
  url: string;
  caption?: string;
  thumbnail?: string;
}

// AI Assistant Enhanced Types
export interface AIAssistantState {
  isOpen: boolean;
  mode: 'COLLAPSED' | 'QUICK_MENU' | 'CHAT_MODE' | 'PROCESSING' | 'SUGGESTION';
  position: 'BOTTOM_RIGHT' | 'BOTTOM_CENTER' | 'SIDE_PANEL';
  
  // 聊天系统
  chatHistory: ChatMessage[];
  currentInput: string;
  isProcessing: boolean;
  
  // 建议系统
  suggestions: AISuggestionEnhanced[];
  activeSuggestion?: string;
  
  // 上下文
  currentContext: {
    documentId: string;
    activeDay?: number;
    selectedActivity?: string;
    lastAction?: string;
  };
}

export interface AISuggestionEnhanced {
  id: string;
  type: 'OPTIMIZATION' | 'ALTERNATIVE' | 'WARNING' | 'TIP' | 'WEATHER_ALERT';
  title: string;
  description: string;
  priority: number;
  relatedItems: string[];
  action?: {
    type: 'MODIFY' | 'REPLACE' | 'ADD' | 'REMOVE';
    label: string;
    handler: () => Promise<void>;
  };
  dismissible: boolean;
  autoExpire?: Date;
}

// Document Editing Types
export interface EditAction {
  id: string;
  type: 'MOVE' | 'EDIT' | 'DELETE' | 'ADD';
  timestamp: Date;
  data: any;
  undoData?: any;
}

export interface DragDropResult {
  draggedId: string;
  sourceIndex: number;
  destinationIndex: number;
  sourceDay?: number;
  destinationDay?: number;
}

// Component Props Types
export interface ActivityCardProps {
  activity: Activity;
  isEditing?: boolean;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  onBookmark?: (activityId: string) => void;
  onDragStart?: (activityId: string) => void;
  onDragEnd?: (result: DragDropResult) => void;
}

export interface ItineraryDayProps {
  day: ItineraryDay;
  isActive?: boolean;
  onActivityEdit?: (activity: Activity) => void;
  onActivityDelete?: (activityId: string) => void;
  onDaySelect?: (dayNumber: number) => void;
}

export interface TravelDocumentProps {
  document: TravelDocument;
  onDocumentUpdate?: (document: TravelDocument) => void;
  onActivityEdit?: (activity: Activity) => void;
  readOnly?: boolean;
}

// Store Types
export interface TravelDocumentStore {
  // State
  currentDocument: TravelDocument | null;
  isLoading: boolean;
  error: string | null;
  editHistory: EditAction[];
  currentEditIndex: number;
  
  // Actions
  setDocument: (document: TravelDocument) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  moveActivity: (result: DragDropResult) => void;
  deleteActivity: (activityId: string) => void;
  addActivity: (dayNumber: number, activity: Omit<Activity, 'id' | 'order'>) => void;
  
  // Edit History
  addEditAction: (action: EditAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Persistence
  saveDocument: () => Promise<void>;
  loadDocument: (documentId: string) => Promise<void>;
}

export interface AIAssistantStore {
  // State
  state: AIAssistantState;
  
  // Actions
  openAssistant: () => void;
  closeAssistant: () => void;
  setMode: (mode: AIAssistantState['mode']) => void;
  setPosition: (position: AIAssistantState['position']) => void;
  
  // Chat
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  
  // Suggestions
  addSuggestion: (suggestion: AISuggestionEnhanced) => void;
  dismissSuggestion: (suggestionId: string) => void;
  applySuggestion: (suggestionId: string) => Promise<void>;
  
  // Context
  setContext: (context: Partial<AIAssistantState['currentContext']>) => void;
  updateContext: (updates: Partial<AIAssistantState['currentContext']>) => void;
}

// Hook Return Types
export interface UseTravelDocumentReturn {
  document: TravelDocument | null;
  isLoading: boolean;
  error: string | null;
  
  // Document operations
  updateDocument: (updates: Partial<TravelDocument>) => void;
  saveDocument: () => Promise<void>;
  
  // Activity operations
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  moveActivity: (result: DragDropResult) => void;
  deleteActivity: (activityId: string) => void;
  addActivity: (dayNumber: number, activity: Omit<Activity, 'id' | 'order'>) => void;
  
  // Edit history
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface UseAIAssistantReturn {
  // State
  isOpen: boolean;
  mode: AIAssistantState['mode'];
  isProcessing: boolean;
  chatHistory: ChatMessage[];
  suggestions: AISuggestionEnhanced[];
  
  // Actions
  openAssistant: () => void;
  closeAssistant: () => void;
  sendMessage: (content: string) => Promise<void>;
  applySuggestion: (suggestionId: string) => Promise<void>;
  dismissSuggestion: (suggestionId: string) => void;
  
  // Context
  setContext: (context: Partial<AIAssistantState['currentContext']>) => void;
}

// Flight & Hotel Search Types
export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  tripType: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  starRating?: number[];
  priceRange?: {
    min: number;
    max: number;
  };
  amenities?: string[];
}

export interface FlightSearchResult {
  flights: FlightOption[];
  searchId: string;
  totalResults: number;
  searchParams: FlightSearchParams;
  providers: string[];
  lastUpdated: Date;
}

export interface HotelSearchResult {
  hotels: HotelOption[];
  searchId: string;
  totalResults: number;
  searchParams: HotelSearchParams;
  providers: string[];
  lastUpdated: Date;
}

// Price Monitoring Types
export interface PriceAlert {
  id: string;
  type: 'FLIGHT' | 'HOTEL';
  itemId: string;
  userId: string;
  targetPrice: number;
  currentPrice: number;
  threshold: number; // percentage decrease to trigger alert
  isActive: boolean;
  createdAt: Date;
  lastChecked: Date;
  notifications: PriceNotification[];
}

export interface PriceNotification {
  id: string;
  alertId: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  percentageChange: number;
  notifiedAt: Date;
  method: 'EMAIL' | 'PUSH' | 'SMS';
  status: 'SENT' | 'PENDING' | 'FAILED';
}

export interface PriceHistory {
  itemId: string;
  itemType: 'FLIGHT' | 'HOTEL';
  pricePoints: Array<{
    date: string;
    price: number;
    provider: string;
  }>;
  trend: 'RISING' | 'FALLING' | 'STABLE';
  recommendation: 'BUY_NOW' | 'WAIT' | 'MONITOR';
  confidence: number;
}

// Booking Integration Types
export interface BookingProvider {
  id: string;
  name: string;
  logo: string;
  type: 'FLIGHT' | 'HOTEL' | 'BOTH';
  baseUrl: string;
  apiEndpoint?: string;
  deepLinkTemplate: string;
  commission?: number;
  rating: number;
  trustScore: number;
}

export interface DeepLink {
  provider: string;
  url: string;
  parameters: Record<string, string>;
  trackingId?: string;
  expiresAt?: Date;
}

// Service Layer Types
export interface FlightSearchService {
  searchFlights(params: FlightSearchParams): Promise<FlightSearchResult>;
  getFlightDetails(flightId: string): Promise<FlightOption>;
  getPriceHistory(route: FlightRoute): Promise<PriceHistory>;
  createPriceAlert(flightId: string, targetPrice: number): Promise<PriceAlert>;
  generateDeepLink(flightId: string, provider: string): Promise<DeepLink>;
}

export interface HotelSearchService {
  searchHotels(params: HotelSearchParams): Promise<HotelSearchResult>;
  getHotelDetails(hotelId: string): Promise<HotelOption>;
  checkAvailability(hotelId: string, dates: DateRange): Promise<Availability>;
  createPriceAlert(hotelId: string, targetPrice: number): Promise<PriceAlert>;
  generateDeepLink(hotelId: string, provider: string): Promise<DeepLink>;
}

export interface FlightRoute {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Availability {
  available: boolean;
  rooms?: number;
  lastRoom?: boolean;
  priceChange?: number;
  urgencyMessage?: string;
}

// Component Props for Flight & Hotel
export interface FlightCardProps {
  flight: FlightOption;
  onSelect?: (flight: FlightOption) => void;
  onCompare?: (flight: FlightOption) => void;
  onPriceAlert?: (flight: FlightOption) => void;
  showComparison?: boolean;
  isSelected?: boolean;
}

export interface HotelCardProps {
  hotel: HotelOption;
  onSelect?: (hotel: HotelOption) => void;
  onCompare?: (hotel: HotelOption) => void;
  onPriceAlert?: (hotel: HotelOption) => void;
  showMap?: boolean;
  isSelected?: boolean;
}

export interface FlightSearchFormProps {
  onSearch: (params: FlightSearchParams) => void;
  initialParams?: Partial<FlightSearchParams>;
  isLoading?: boolean;
}

export interface HotelSearchFormProps {
  onSearch: (params: HotelSearchParams) => void;
  initialParams?: Partial<HotelSearchParams>;
  isLoading?: boolean;
}

// Store Types for Flight & Hotel
export interface FlightHotelStore {
  // Flight State
  flightSearchParams: FlightSearchParams | null;
  flightResults: FlightSearchResult | null;
  selectedFlights: FlightOption[];
  flightLoading: boolean;
  flightError: string | null;
  
  // Hotel State
  hotelSearchParams: HotelSearchParams | null;
  hotelResults: HotelSearchResult | null;
  selectedHotels: HotelOption[];
  hotelLoading: boolean;
  hotelError: string | null;
  
  // Price Monitoring
  priceAlerts: PriceAlert[];
  priceHistory: Record<string, PriceHistory>;
  
  // Actions
  searchFlights: (params: FlightSearchParams) => Promise<void>;
  searchHotels: (params: HotelSearchParams) => Promise<void>;
  selectFlight: (flight: FlightOption) => void;
  selectHotel: (hotel: HotelOption) => void;
  createPriceAlert: (type: 'FLIGHT' | 'HOTEL', itemId: string, targetPrice: number) => Promise<void>;
  generateBookingLink: (type: 'FLIGHT' | 'HOTEL', itemId: string, provider: string) => Promise<string>;
  
  // Utility
  clearResults: () => void;
  resetSearch: () => void;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
