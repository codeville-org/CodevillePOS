import {
  MessageResponseT,
  ProductsQueryParamsSchema,
  QueryParamsSchema,
  TransactionsQueryParamsSchema
} from "@/lib/zod/helpers";

// Categories Imports
import {
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetAllCategoriesResponse,
  GetCategoryByIDResponse,
  InsertCategorySchema,
  UpdateCategoryResponse,
  UpdateCategorySchema
} from "@/lib/zod/categories.zod";

// Products Imports
import {
  CreateProductResponse,
  DeleteProductResponse,
  ExportProductsResponse,
  GenerateBarcodeResponse,
  GetAllProductsResponse,
  GetProductByBarcodeResponse,
  GetProductByIDResponse,
  ImportProductsResponse,
  ImportProductsSchema,
  InsertProductSchema,
  SelectImportFileType,
  UpdateProductResponse,
  UpdateProductSchema
} from "@/lib/zod/products.zod";

import type {
  AddNewTransactionItemsResponse,
  CreateTransactionSchema,
  DeleteTransactionResponse,
  GetAllTransactionsResponse,
  GetTransactionResponse,
  InitializeTransactionResponse,
  UninitializedTransactionItem,
  UpdateTransactionResponse,
  UpdateTransactionSchema
} from "@/lib/zod/transactions.zod";

// Customers Imports
import {
  EndShiftControllerResponse,
  GetActiveShiftResponse,
  GetAllShiftsInput,
  GetAllShiftsResponse,
  GetCashDrawerBalanceResponse,
  GetShiftEventsInput,
  GetShiftEventsResponse,
  InitializeCashDrawerBalanceResponse,
  InsertCashDrawerEvent,
  InsertCashDrawerEventResponse,
  StartShiftControllerResponse,
  UpdateCashDrawerBalance,
  UpdateCashDrawerBalanceResponse
} from "@/lib/zod/cashflow.zod";
import {
  CreateCustomerResponseSchema,
  CreateCustomerSchema,
  DeleteCustomerResponseSchema,
  GetAllCustomersResponseSchema,
  GetCustomerByIdResponseSchema,
  UpdateCustomerResponseSchema,
  UpdateCustomerSchema
} from "@/lib/zod/customers.zod";
import {
  CopyImagesFromDirectoryResponse,
  ListImagesInDirectoryResponse,
  SelectImageDirectoryResponse
} from "@/lib/zod/images.zod";
import {
  ListPrintersResponseT,
  VoidDataResponseT
} from "@/lib/zod/printers.zod";
import {
  AnalyticsQueryParamsSchema,
  GetAnalyticsResponse
} from "@/lib/zod/reports.zod";
import { GetSecurityResponseT } from "@/lib/zod/security.zod";
import {
  AppSettingsMapInsertT,
  GetAppSettingsResponseT,
  ResetSystemResponseT
} from "@/lib/zod/settings.zod";
import {
  AddPurchaseItemResponseSchema,
  AddPurchaseItemSchema,
  CreatePurchaseResponseSchema,
  CreatePurchaseSchema,
  GetAllPurchasesQuerySchema,
  GetAllPurchasesResponseSchema,
  GetAllVendorsResponseSchema,
  GetPurchaseByIdResponseSchema,
  GetPurchasePaymentHistoryResponseSchema,
  GetVendorByIdResponseSchema,
  InsertVendorResponseSchema,
  InsertVendorSchema,
  UpdatePurchaseItemResponseSchema,
  UpdatePurchaseItemSchema,
  UpdatePurchaseWithPaymentResponseSchema,
  UpdatePurchaseWithPaymentSchema,
  UpdateVendorResponseSchema,
  UpdateVendorSchema
} from "@/lib/zod/supplier.zod";
import {
  GetAllUsersResponseT,
  GetUserResponseT,
  InsertUserSchema,
  UpdateUserSchema
} from "@/lib/zod/user.zod";
import {
  ALIGNMENT_OPTIONS,
  PrinterConfig,
  ReceiptData
} from "@/modules/printer/services/printer-service";

// Window management types
export interface WindowActions {
  minimize: () => Promise<void>;
  close: () => Promise<void>;
}

export interface CategoriesActions {
  getAll: (query: QueryParamsSchema) => Promise<GetAllCategoriesResponse>;
  getById: (id: string) => Promise<GetCategoryByIDResponse>;
  create: (payload: InsertCategorySchema) => Promise<CreateCategoryResponse>;
  update: (
    id: string,
    payload: UpdateCategorySchema
  ) => Promise<UpdateCategoryResponse>;
  delete: (id: string) => Promise<DeleteCategoryResponse>;
}

export interface ProductsActions {
  getAll: (query: ProductsQueryParamsSchema) => Promise<GetAllProductsResponse>;
  getById: (id: string) => Promise<GetProductByIDResponse>;
  getByBarcode: (barcode: string) => Promise<GetProductByBarcodeResponse>;
  create: (payload: InsertProductSchema) => Promise<CreateProductResponse>;
  update: (
    id: string,
    payload: UpdateProductSchema
  ) => Promise<UpdateProductResponse>;
  delete: (id: string) => Promise<DeleteProductResponse>;
  import: (payload: ImportProductsSchema) => Promise<ImportProductsResponse>;
  export: () => Promise<ExportProductsResponse>;
  selectImportFile: () => Promise<SelectImportFileType>;
  generateBarcode: () => Promise<GenerateBarcodeResponse>;
}

export interface ImagesActions {
  getImagesDirectory: () => string;
  saveImageFromBase64: (
    base64Data: string,
    billImage?: boolean,
    labelImage?: boolean,
    transactionNumber?: string
  ) => Promise<string>;
  saveImageFromPath: (sourceImagePath: string) => Promise<string>;
  getImageAsBase64: (filename: string) => Promise<string | null>;
  deleteImage: (filename: string) => Promise<boolean>;
  selectImageDirectory: () => Promise<SelectImageDirectoryResponse>;
  listImagesInDirectory: (
    directoryPath: string
  ) => Promise<ListImagesInDirectoryResponse>;
  copyImagesFromDirectory: (
    sourceDirectoryPath: string
  ) => Promise<CopyImagesFromDirectoryResponse>;
}

export interface CustomersActions {
  getAll: (query: QueryParamsSchema) => Promise<GetAllCustomersResponseSchema>;
  getById: (id: string) => Promise<GetCustomerByIdResponseSchema>;
  create: (
    payload: CreateCustomerSchema
  ) => Promise<CreateCustomerResponseSchema>;
  update: (
    id: string,
    payload: UpdateCustomerSchema
  ) => Promise<UpdateCustomerResponseSchema>;
  delete: (id: string) => Promise<DeleteCustomerResponseSchema>;
}

export interface TransactionsActions {
  getAll: (
    query: TransactionsQueryParamsSchema
  ) => Promise<GetAllTransactionsResponse>;
  getByID: (id: string) => Promise<GetTransactionResponse>;
  initialize: (
    body: CreateTransactionSchema
  ) => Promise<InitializeTransactionResponse>;
  update: (
    id: string,
    body: UpdateTransactionSchema
  ) => Promise<UpdateTransactionResponse>;
  addItems: (
    transactionId: string,
    items: UninitializedTransactionItem[]
  ) => Promise<AddNewTransactionItemsResponse>;
  delete: (id: string) => Promise<DeleteTransactionResponse>;
}

export interface SettingsActions {
  get: () => Promise<GetAppSettingsResponseT>;
  upsert: (payload: AppSettingsMapInsertT) => Promise<GetAppSettingsResponseT>;
  reset: () => Promise<ResetSystemResponseT>;
}

export interface SecurityActions {
  login: (username: string, password: string) => Promise<GetSecurityResponseT>;
}

export interface PrinterActions {
  printReceipt: (data: ReceiptData) => Promise<VoidDataResponseT>;
  testPrinter: (config: PrinterConfig) => Promise<boolean>;
  openCashDrawer: () => Promise<VoidDataResponseT>;
  getAvailablePrinters: () => Promise<ListPrintersResponseT>;
  getPlatform: () => Promise<string>;
  savePrinterSettings: (settings: PrinterConfig) => Promise<VoidDataResponseT>;
  printImage: (
    imagePath: string,
    align?: ALIGNMENT_OPTIONS,
    useDithering?: boolean
  ) => Promise<VoidDataResponseT>;
  printImageBill: (
    imagePath: string,
    useDithering?: boolean
  ) => Promise<VoidDataResponseT>;
  printImageLabel: (
    imagePath: string,
    useDithering?: boolean
  ) => Promise<VoidDataResponseT>;
  selectImageFile: () => Promise<string | null>;
}

export interface ReportsActions {
  getAnalytics: (
    params?: AnalyticsQueryParamsSchema
  ) => Promise<GetAnalyticsResponse>;
}

export interface UserActions {
  getAll: (query: QueryParamsSchema) => Promise<GetAllUsersResponseT>;
  get: (id: string) => Promise<GetUserResponseT>;
  create: (body: InsertUserSchema) => Promise<GetUserResponseT>;
  update: (id: string, body: UpdateUserSchema) => Promise<GetUserResponseT>;
  delete: (id: string) => Promise<MessageResponseT>;
}

export interface CashflowActions {
  // Balance
  initializeBalance: () => Promise<InitializeCashDrawerBalanceResponse>;
  getBalance: () => Promise<GetCashDrawerBalanceResponse>;
  updateBalance: (
    data: UpdateCashDrawerBalance
  ) => Promise<UpdateCashDrawerBalanceResponse>;

  // Events
  startShift: (userId: string) => Promise<StartShiftControllerResponse>;
  getActiveShift: () => Promise<GetActiveShiftResponse>;
  endShift: () => Promise<EndShiftControllerResponse>;
  createEvent: (
    values: InsertCashDrawerEvent
  ) => Promise<InsertCashDrawerEventResponse>;
  getAllShifts: (input: GetAllShiftsInput) => Promise<GetAllShiftsResponse>;
  getShiftEvents: (
    input: GetShiftEventsInput
  ) => Promise<GetShiftEventsResponse>;
}

export interface VendorActions {
  getAll: (query: QueryParamsSchema) => Promise<GetAllVendorsResponseSchema>;
  getById: (id: string) => Promise<GetVendorByIdResponseSchema>;
  create: (input: InsertVendorSchema) => Promise<InsertVendorResponseSchema>;
  update: (
    id: string,
    input: UpdateVendorSchema
  ) => Promise<UpdateVendorResponseSchema>;
  delete: (id: string) => Promise<MessageResponseT>;
}

export interface PurchasesActions {
  getAll: (
    query: GetAllPurchasesQuerySchema
  ) => Promise<GetAllPurchasesResponseSchema>;
  create: (
    values: CreatePurchaseSchema
  ) => Promise<CreatePurchaseResponseSchema>;
  getById: (id: string) => Promise<GetPurchaseByIdResponseSchema>;
  update: (
    id: string,
    input: UpdatePurchaseWithPaymentSchema
  ) => Promise<UpdatePurchaseWithPaymentResponseSchema>;
  delete: (id: string) => Promise<MessageResponseT>;
  addItem: (
    input: AddPurchaseItemSchema
  ) => Promise<AddPurchaseItemResponseSchema>;
  updateItem: (
    id: string,
    input: UpdatePurchaseItemSchema
  ) => Promise<UpdatePurchaseItemResponseSchema>;
  deleteItem: (id: string) => Promise<MessageResponseT>;
  updateStock: (purchaseId: string) => Promise<MessageResponseT>;
  history: (
    purchaseId: string
  ) => Promise<GetPurchasePaymentHistoryResponseSchema>;
}

// Main IPC API interface
export interface ElectronAPI {
  window: WindowActions;
  categories: CategoriesActions;
  products: ProductsActions;
  images: ImagesActions;
  customers: CustomersActions;
  transactions: TransactionsActions;
  settings: SettingsActions;
  security: SecurityActions;
  print: PrinterActions;
  reports: ReportsActions;
  user: UserActions;
  cashflow: CashflowActions;
  vendor: VendorActions;
  purchase: PurchasesActions;
}
