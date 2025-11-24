// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge } from "electron";
import type { ElectronAPI } from "./shared/types/ipc";
import { createInvoker } from "./shared/utils/ipc-invoker";

const windowInvoker = createInvoker("window");
const categoriesInvoker = createInvoker("categories");
const productsInvoker = createInvoker("products");
const imagesInvoker = createInvoker("images");
const customersInvoker = createInvoker("customers");
const transactionsInvoker = createInvoker("transactions");
const settingsInvoker = createInvoker("settings");
const securityInvoker = createInvoker("security");
const printInvoker = createInvoker("print");
const reportsInvoker = createInvoker("reports");
const userInvoker = createInvoker("user");
const cashflowInvoker = createInvoker("cashflow");

const electronAPI: ElectronAPI = {
  window: {
    close: windowInvoker("close"),
    minimize: windowInvoker("minimize")
  },
  categories: {
    getAll: categoriesInvoker("getAll"),
    getById: categoriesInvoker("getById"),
    create: categoriesInvoker("create"),
    update: categoriesInvoker("update"),
    delete: categoriesInvoker("delete")
  },
  products: {
    getAll: productsInvoker("getAll"),
    getById: productsInvoker("getById"),
    getByBarcode: productsInvoker("getByBarcode"),
    create: productsInvoker("create"),
    update: productsInvoker("update"),
    delete: productsInvoker("delete"),
    import: productsInvoker("import"),
    export: productsInvoker("export"),
    selectImportFile: productsInvoker("selectImportFile")
  },
  images: {
    getImagesDirectory: imagesInvoker("getImagesDirectory"),
    getImageAsBase64: imagesInvoker("getImageAsBase64"),
    saveImageFromBase64: imagesInvoker("saveImageFromBase64"),
    saveImageFromPath: imagesInvoker("saveImageFromPath"),
    deleteImage: imagesInvoker("deleteImage"),
    selectImageDirectory: imagesInvoker("selectImageDirectory"),
    listImagesInDirectory: imagesInvoker("listImagesInDirectory"),
    copyImagesFromDirectory: imagesInvoker("copyImagesFromDirectory")
  },
  customers: {
    getAll: customersInvoker("getAll"),
    getById: customersInvoker("getById"),
    create: customersInvoker("create"),
    update: customersInvoker("update"),
    delete: customersInvoker("delete")
  },
  transactions: {
    getAll: transactionsInvoker("getAll"),
    getByID: transactionsInvoker("getByID"),
    initialize: transactionsInvoker("initialize"),
    addItems: transactionsInvoker("addItems"),
    delete: transactionsInvoker("delete"),
    update: transactionsInvoker("update")
  },
  settings: {
    get: settingsInvoker("get"),
    upsert: settingsInvoker("upsert"),
    reset: settingsInvoker("reset")
  },
  security: {
    login: securityInvoker("login")
  },
  print: {
    printReceipt: printInvoker("printReceipt"),
    testPrinter: printInvoker("testPrinter"),
    openCashDrawer: printInvoker("openCashDrawer"),
    getAvailablePrinters: printInvoker("getAvailablePrinters"),
    getPlatform: printInvoker("getPlatform"),
    savePrinterSettings: printInvoker("savePrinterSettings"),
    printImage: printInvoker("printImage"),
    printImageBill: printInvoker("printImageBill"),
    selectImageFile: printInvoker("selectImageFile")
  },
  reports: {
    getAnalytics: reportsInvoker("getAnalytics")
  },
  user: {
    getAll: userInvoker("getAll"),
    get: userInvoker("get"),
    create: userInvoker("create"),
    update: userInvoker("update"),
    delete: userInvoker("delete")
  },
  cashflow: {
    initializeBalance: cashflowInvoker("initializeBalance"),
    getBalance: cashflowInvoker("getBalance"),
    updateBalance: cashflowInvoker("updateBalance"),
    startShift: cashflowInvoker("startShift"),
    getActiveShift: cashflowInvoker("getActiveShift"),
    endShift: cashflowInvoker("endShift"),
    createEvent: cashflowInvoker("createEvent"),
    getAllShifts: cashflowInvoker("getAllShifts")
  }
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
