/**
 * GIG Logistics API Types
 * Complete type definitions for all GIG endpoints
 */

// ============================================================
// AUTHENTICATION TYPES
// ============================================================

export interface GIGLoginRequest {
  email: string;
  password: string;
}

export interface GIGLoginResponse {
  message: string;
  apiId: string;
  status: number;
  data: {
    _id: string;
    Id: string;
    FirstName: string;
    LastName: string;
    Gender?: number;
    Designation?: string;
    Department?: string;
    PictureUrl?: string | null;
    IsActive: boolean;
    Organisation?: string;
    Status?: number;
    UserType?: number;
    IsDeleted?: boolean;
    SystemUserId: string;
    SystemUserRole: string;
    Email: string;
    EmailConfirmed?: boolean;
    PhoneNumber: string;
    PhoneNumberConfirmed?: boolean;
    UserName: string;
    UserChannelCode: string;
    UserChannelType?: number;
    UserActiveCountryId?: number;
    AppType?: string | null;
    IsMagaya?: boolean;
    IsInternational?: boolean;
    CountryType?: string | null;
    DateCreated?: string;
    DateModified?: string;
    Claim?: string;
    CustomerType?: number;
    CompanyType?: number;
    "access-token": string;
  };
}

// ============================================================
// STATION & LOCATION TYPES
// ============================================================

export interface GIGStation {
  _id: string;
  StationId: number;
  StationName: string;
  StationCode: string;
  StateId: number;
  IsDeleted: boolean;
  SuperServiceCentreId: number;
  StationPickupPrice: number;
  IsPublic: boolean;
  DateCreated: string;
  DateModified: string;
  StateName: string;
  CountryName: string;
  CountryId: number;
  CountryCode: string;
  CurrencyCode: string;
  CurrencySymbol: string;
  GiggoActive: boolean;
}

export interface GIGStationsResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGStation[];
}

export interface GIGPickupLocation {
  StationId: number;
  StationName: string;
  StationCode: string;
  StateId: number;
  ServiceCentreId: number;
  ServiceCentreName: string;
  ServiceCentreCode: string;
  Latitude: number;
  Longitude: number;
  Address: string;
}

export interface GIGPickupLocationsResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGPickupLocation[];
}

export interface GIGHomeDeliveryArea {
  StationId?: number;
  StationName?: string;
  StateId?: number;
  StateName?: string;
  ServiceCentreId?: number;
  ServiceCentreName?: string;
  Latitude?: number;
  Longitude?: number;
  Address?: string;
  [key: string]: any;
}

export interface GIGHomeDeliveryResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGHomeDeliveryArea[];
}

// ============================================================
// SHIPMENT TYPES
// ============================================================

export enum GIGShipmentType {
  Special = 0,
  Regular = 1,
  Ecommerce = 2,
  Store = 3,
  Haulage = 4,
}

export enum GIGVehicleType {
  Car = 0,
  Bike = 1,
  Van = 2,
  Truck = 3,
}

export enum GIGPickupOption {
  HomeDelivery = 0,
  ServiceCentre = 1,
}

export interface GIGLocation {
  Latitude?: number;
  Longitude?: number;
  latitude?: number;
  longitude?: number;
  Address?: string;
  address?: string;
  [key: string]: any;
}

export interface GIGShipmentItem {
  Quantity: number; // Required
  ShipmentType: GIGShipmentType; // Required: Use ShipmentType enum (0-4), not VehicleType
  ItemName: string; // Required
  IsVolumetric: boolean; // Required
  Value: number; // Required for pricing
  ProductId?: string;
  ProductName?: string;
  Description?: string;
  Weight?: number;
  SpecialPackageId?: number;
  Length?: number;
  width?: number;
  Height?: number;
  HaulageId?: number;
  [key: string]: any;
}

export interface GIGPriceRequest {
  SenderStationId?: number;
  ReceiverStationId?: number;
  IsPriorityShipment: boolean;
  VehicleType: GIGVehicleType;
  PickUpOptions: GIGPickupOption;
  ReceiverLocation?: GIGLocation;
  SenderLocation?: GIGLocation;
  ShipmentItems: GIGShipmentItem[];
}

export interface GIGPriceData {
  Amount: number;
  Currency: string;
  VehicleType: string;
  DeliveryTime: string;
  DeliveryPrice?: number;
  [key: string]: any;
}

export interface GIGPriceResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGPriceData | GIGPriceData[];
}

export interface GIGBulkLocation {
  Latitude: string;
  Longitude: string;
}

export interface GIGBulkPriceShipment {
  Merchant: {
    CustomerCode: string;
    CustomerType: number;
    SenderStationId: number;
    SenderLocation: GIGBulkLocation;
  };
  ShipmentDetails: {
    VehicleType: GIGVehicleType;
    PickUpOptions: GIGPickupOption;
  };
  ShipmentItems: GIGShipmentItem[];
}

export interface GIGBulkPriceRequest {
  ReceiverDetails: {
    ReceiverStationId?: number;
    ReceiverLocation: GIGBulkLocation;
  };
  Shipments: GIGBulkPriceShipment[];
}

export interface GIGBulkPriceData {
  isWithinProcessingTime: boolean;
  MainCharge: number;
  DeliverPrice: number;
  PickupCharge: number;
  InsuranceValue: number;
  GrandTotal: number;
  DeclaredValue: number;
  Discount: number;
  ShipmentItems: GIGShipmentItem[];
  [key: string]: any;
}

export interface GIGBulkPriceResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGBulkPriceData[];
}

// ============================================================
// SHIPMENT CREATION TYPES
// ============================================================

export interface GIGShipmentLocation {
  Latitude: string;
  Longitude: string;
  FormattedAddress?: string;
  Name?: string;
  LGA?: string;
}

export interface GIGSenderDetails {
  SenderName: string;
  SenderPhoneNumber: string;
  SenderStationId: number;
  SenderAddress?: string;
  InputtedSenderAddress?: string;
  SenderLocality: string;
  SenderLocation?: GIGShipmentLocation;
}

export interface GIGReceiverDetails {
  ReceiverStationId?: number;
  ReceiverName: string;
  ReceiverPhoneNumber: string;
  ReceiverAddress?: string;
  InputtedReceiverAddress?: string;
  ReceiverLocation?: GIGShipmentLocation;
}

export interface GIGShipmentDetails {
  VehicleType: number;
  IsBatchPickUp?: number;
  IsFromAgility?: number;
}

export interface GIGCreateShipmentRequest {
  SenderDetails: GIGSenderDetails;
  ReceiverDetails: GIGReceiverDetails;
  ShipmentDetails: GIGShipmentDetails;
  ShipmentItems: GIGShipmentItem[];
}

export interface GIGShipmentData {
  ShipmentId: string;
  Waybill: string;
  Reference?: string;
  Status: string;
  StatusCode: string;
  CreatedAt: string;
  EstimatedDeliveryDate?: string;
  [key: string]: any;
}

export interface GIGShipmentTrackingRequest {
  shipmentId: string;
  waybill?: string;
}

export interface GIGShipmentResponse {
  message: string;
  apiId: string;
  status: number;
  data: {
    shipmentId?: string;
    waybill?: string;
    status: string;
    currentLocation?: string;
    estimatedDeliveryDate?: string;
    trackingHistory?: Array<{
      status: string;
      timestamp: string;
      location?: string;
      message?: string;
    }>;
    sender?: {
      name: string;
      address: string;
      phone: string;
    };
    recipient?: {
      name: string;
      address: string;
      phone: string;
    };
    [key: string]: any;
  };
}

// ============================================================
// TRACKING TYPES
// ============================================================

export enum GIGTrackingStatusCode {
  // Creation & Pickup
  MCRT = "MCRT", // Shipment Created by Customer
  MAPT = "MAPT", // Shipment Assigned for Pickup
  MPIK = "MPIK", // Shipment Picked Up
  DLP = "DLP", // Delayed Pickup
  MENP = "MENP", // Shipment Enroute Pickup

  // In Transit
  MSHC = "MSHC", // Shipment Enroute Delivery
  APT = "APT", // Shipment Arrived Processing Center (Hub) In Transit
  ARP = "ARP", // Shipment Arrived Processing Center (Hub)
  MSVC = "MSVC", // Shipment Arrived Service Centre for Onward Processing

  // Final Destination
  MAFD = "MAFD", // Shipment Arrived Final Destination
  ADF = "ADF", // Arrived Delivery Facility
  PICKED = "PICKED", // Shipment Picked Up for Delivery
  WC = "WC", // Shipment With Delivery Courier for Delivery

  // Delivery Status
  SHD = "SHD", // Shipment Delivered
  MAHD = "MAHD", // Shipment Delivered
  OKC = "OKC", // Delivered
  DFA = "DFA", // Delivery Unsuccessful
  ATD = "ATD", // Delivery Attempted
  DLD = "DLD", // Shipment Delivery Delayed

  // Cancellation & Return
  MSCP = "MSCP", // Shipment Cancelled by Delivery Partner
  MSCC = "MSCC", // Shipment Cancelled by Customer
  SSC = "SSC", // Scan Shipment for Cancelled
  MRTE = "MRTE", // Shipment Enroute Return
  SRR = "SRR", // Shipment Scan for Returns

  // Other
  CLS = "CLS", // Shipment goes to claims
  MRR = "MRR", // Shipment was misrouted
}

export interface GIGTrackingEvent {
  Code: string;
  Reason: string;
  Comment: string;
  Timestamp?: string;
  Location?: string;
  [key: string]: any;
}

export interface GIGTrackingData {
  ShipmentId: string;
  Waybill: string;
  CurrentStatus: string;
  CurrentStatusCode: string;
  LastUpdated: string;
  Events: GIGTrackingEvent[];
  SenderName?: string;
  SenderPhone?: string;
  ReceiverName?: string;
  ReceiverPhone?: string;
  ReceiverAddress?: string;
  EstimatedDeliveryDate?: string;
  [key: string]: any;
}

export interface GIGTrackingResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGTrackingData | GIGTrackingData[];
}

// ============================================================
// MULTI-TRACK TYPES (POST /track/multipleMobileShipment)
// ============================================================

export interface GIGMultiTrackRequest {
  Waybill: string[];
}

export interface GIGMobileShipmentTracking {
  PickupOptions?: string;
  DepartureServiceCentreId?: number;
  DepartureServiceCentre?: { Name: string };
  GrandTotal?: number;
  DeliveryOption?: string;
  MobileShipmentTrackingId: number;
  DateTime: string;
  Status: string; // e.g. "MCRT", "MAPT", etc.
  TrackingType: number;
  ServiceCentreId: number;
  ScanStatusIncident: string;
  ScanStatusReason: string;
  ScanStatusComment: string;
  DateTimeUtc: string;
}

export interface GIGMultiTrackShipment {
  Waybill: string;
  WaybillLabel: string;
  Amount: number;
  MobileShipmentTrackings: GIGMobileShipmentTracking[];
}

export interface GIGMultiTrackResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGMultiTrackShipment[];
}

// ============================================================
// COMPANY / WALLET / INVOICE TYPES
// ============================================================

export interface GIGCompanyInfo {
  _id: string;
  CompanyId: number;
  Name: string;
  RcNumber: string | null;
  Email: string;
  City: string | null;
  State: string | null;
  Address: string | null;
  PhoneNumber: string | null;
  Industry: string | null;
  CompanyType: number;
  CompanyStatus: number;
  CustomerCode: string | null;
  Discount: number;
  SettlementPeriod: number | null;
  IsDeleted: boolean;
  ReturnServiceCentre: number | null;
  ReturnAddress: string | null;
  FirstName: string | null;
  LastName: string | null;
  UserActiveCountryId: number | null;
  WalletAmount: number | null;
  IsEligible: boolean;
  AccountName: string | null;
  AccountNumber: string | null;
  BankName: string | null;
  Rank: number | null;
  BVN: string | null;
  IdentificationNumber: string | null;
  IdentificationImageUrl: string | null;
  IdentificationType: number;
  IsInternational: boolean;
  RankModificationDate: string | null;
  TransactionType: number | null;
  DateCreated: string;
  DateModified: string;
  [key: string]: any;
}

export interface GIGCompanyInfoResponse {
  message: string;
  apiId: string;
  status: number;
  data: GIGCompanyInfo[];
}

export interface GIGWalletChargeRequest {
  UserId: string;
  Amount: number;
  BillType: number;
  ReferenceNo: string;
  Description: string;
}

export interface GIGWalletChargeResponse {
  message: string;
  apiId: string;
  status: number;
  data: Record<string, never> | Record<string, any>;
}

export interface GIGInvoiceGenerateRequest {
  Waybill: string;
}

export interface GIGInvoiceGenerateResponse {
  message: string;
  apiId: string;
  status: number;
  data: {
    WaybillLabel: string;
  };
}

// ============================================================
// ERROR TYPES
// ============================================================

export interface GIGAPIError {
  message: string;
  apiId: string;
  status: number;
  errors?: string[];
}

// ============================================================
// HELPER TYPES
// ============================================================

export interface GIGStateIdMapping {
  stateName: string;
  stateId: number;
  stationId: number;
}
