// ==========================================
// BACKEND ENUMS
// ==========================================
export enum RoleName { ADMIN = 'ADMIN', LIBRARIAN = 'LIBRARIAN', GUEST = 'GUEST', READER = 'READER' }
export enum UserStatus { ACTIVE = 'ACTIVE', BANNED = 'BANNED', INACTIVE = 'INACTIVE' }
export enum ApprovalStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED' }
export enum BookCondition { GOOD = 'GOOD', DAMAGED = 'DAMAGED', LOST = 'LOST', NEW = 'NEW', FAIR = 'FAIR', POOR = 'POOR' }
export enum BookType { EBOOK = 'EBOOK', PHYSICAL_BOOK = 'PHYSICAL_BOOK', BOTH = 'BOTH' }
export enum BorrowStatus { BORROWING = 'BORROWING', RETURNED = 'RETURNED', AUTO_RETURNED = 'AUTO_RETURNED', REQUESTING = 'REQUESTING' }
export enum CalculationType { FIXED = 'FIXED', PER_DAY = 'PER_DAY', BOOK_PRICE = 'BOOK_PRICE', BOOK_PRICE_PERCENT = 'BOOK_PRICE_PERCENT' }
export enum MembershipPlanName { BASIC = 'BASIC', STANDARD = 'STANDARD', PREMIUM = 'PREMIUM', LIFETIME = 'LIFETIME' }
export enum PaymentItemType { SHIPMENT = 'SHIPMENT', LATE_PENALTY = 'LATE_PENALTY', DAMAGED_BOOK = 'DAMAGED_BOOK', LOST_BOOK = 'LOST_BOOK', MEMBERSHIP = 'MEMBERSHIP' }
export enum PaymentMethod { CASH = 'CASH', BANKING = 'BANKING', MOMO = 'MOMO', VNPAY = 'VNPAY' }
export enum PaymentStatus { UNPAID = 'UNPAID', PAID = 'PAID', REFUNDED = 'REFUNDED', FAILED = 'FAILED', PENDING = 'PENDING' }
export enum PenaltyCostName { LATE = 'LATE', LOST_BOOK = 'LOST_BOOK', DAMAGED = 'DAMAGED' }
export enum ReceiveMethod { LIBRARY_PICKUP = 'LIBRARY_PICKUP', HOME_PICKUP = 'HOME_PICKUP', EBOOK = 'EBOOK' }
export enum ReturnMethod { LIBRARY_RETURN = 'LIBRARY_RETURN', HOME_RETURN = 'HOME_RETURN', EBOOK = 'EBOOK' }
export enum ShipmentStatus { WAITING_CONFIRMATION = 'WAITING_CONFIRMATION', WAITING_FOR_PICKUP = 'WAITING_FOR_PICKUP', ON_DELIVERY = 'ON_DELIVERY', DELIVERED = 'DELIVERED', FAILED = 'FAILED', RETURNED_TO_LIB = 'RETURNED_TO_LIB' }

// ==========================================
// BACKEND MODELS
// ==========================================
export interface Category {
  id: number;
  categoryName: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  category: Category;
  description: string;
  bookType: BookType;
  likes: number;
  condition: BookCondition;
  quantity: number;
  bookUrl: string;
  imageUrl: string;
  avgRating: number;
  replacementPrice: number;
}

export interface User {
  id: number;
  userName: string;
  fullName: string;
  email: string;
  password?: string;
  phoneNum: string;
  avatarUrl: string;
  role: RoleName;
  userStatus: UserStatus;
}

export interface BorrowRecord {
  id: number;
  user: User;
  book: Book;
  borrowDate: string; // ISO String
  dueDate: string;
  bookType: BookType;
  borrowStatus: BorrowStatus;
  approvalStatus: ApprovalStatus;
  renew: number;
  receiveMethod: ReceiveMethod;
}

export interface DamageLevel {
  id: number;
  levelName: string;
  percentValue: number;
  description: string;
}

export interface ReturnRecord {
  id: number;
  borrowRecord: BorrowRecord;
  returnDate: string;
  returnDelayDays: number;
  fineAmount: number;
  approvalStatus: ApprovalStatus;
  damageLevel: DamageLevel;
  isLost: boolean;
  returnMethod: ReturnMethod;
}

export interface Shipment {
  id: number;
  borrowRecordId?: number;
  returnRecordId?: number;
  borrowRecord?: BorrowRecord;
  returnRecord?: ReturnRecord;
  trackingCode: string;
  shippingFee: number;
  shipmentStatus: ShipmentStatus;
  shippedAt: string;
  deliveredAt: string;
}

export interface MembershipPlan {
  id: number;
  planName: string;
  price: number;
  durationDays: number;
  maxBorrowBooks: number;
  description: string;
  isActive: boolean;
}

export interface PaymentTransaction {
  id: number;
  transactionCode: string;
  user: User;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAt: string;
}

export interface PenaltyCost {
  id: number;
  penaltyCostName: PenaltyCostName;
  calculationType: CalculationType;
  price: number;
  description: string;
}

// ==========================================
// FRONTEND SPECIFIC (Legacy)
// ==========================================
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'warning' | 'success' | 'info';
  targetPage?: string;
  targetId?: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  avatar: string;
}

export interface BorrowedBook extends Book {
  type: 'Ebook' | 'Sách giấy';
  recordId?: number;
  returnRecordId?: number;
  expiryDate: string;
  renewCount: string;
  status: string;
  statusColor?: string;
  paymentStatus?: string;
  approvalStatus?: string;
  actions: string[];
}

export interface PaymentCalculationResp {
  lateFee: number;
  damageFee: number;
  lostFee: number;
  totalAmount: number;
}

export interface Cart {
  id: number;
  userId: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  bookId: number;
  bookType: BookType;
  book?: Book;
}
