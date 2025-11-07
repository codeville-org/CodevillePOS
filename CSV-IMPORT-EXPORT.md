# CSV Import/Export Feature

This document describes the CSV import and export functionality for products in the CodeVille POS system.

## Features

### Export Products

- Exports all products to a CSV file
- Includes category names (not just IDs)
- Saves file to user-selected location
- Shows loading spinner and success/error notifications

### Import Products

- Imports products from a CSV file
- Auto-creates categories if they don't exist
- Validates required fields
- Shows detailed error messages for invalid rows
- Continues processing valid rows even if some rows have errors

## CSV Format

### Required Columns

- `name` - Product name (required)
- `unitPrice` - Unit price (required, numeric)

### Optional Columns

- `barcode` - Product barcode
- `categoryName` - Category name (will be created if doesn't exist)
- `unitAmount` - Unit amount (default: 1)
- `unit` - Unit type (default: "pcs")
- `discountedPrice` - Discounted price (default: same as unitPrice)
- `stockQuantity` - Stock quantity (default: 0)
- `description` - Product description
- `imageFilename` - Image filename (just the filename, no path validation)
- `isActive` - Active status (true/false, default: true)
- `isFeatured` - Featured status (true/false, default: false)

### Template File

A sample CSV template is available in the project root: `product-import-template.csv`

## Usage

### Exporting Products

1. Click the "Export Products" button in the products listing
2. Choose save location in the file dialog
3. Wait for the export to complete

### Importing Products

1. Click the "Import Products" button in the products listing
2. Select your CSV file in the file dialog
3. Wait for the import to complete
4. Review any error messages for problematic rows

## Technical Implementation

### Backend (Main Process)

- `exportProductsController()` - Exports products to CSV
- `importProductsController()` - Imports products from CSV
- `selectImportFileController()` - Opens file selection dialog

### Frontend (Renderer Process)

- `useExportProducts()` - React Query hook for export
- `useImportProducts()` - React Query hook for import
- `useSelectImportFile()` - React Query hook for file selection

### Key Files

- `src/controllers/products.controller.ts` - Main business logic
- `src/modules/products/queries/use-export.ts` - Export hook
- `src/modules/products/queries/use-import.ts` - Import hooks
- `src/modules/products/components/export-products.tsx` - Export button component
- `src/modules/products/components/import-products.tsx` - Import button component

## Error Handling

### Import Errors

- Missing required columns
- Invalid data types
- Database insertion failures
- File reading errors

### Export Errors

- Database query failures
- File writing errors
- User cancellation

All errors are displayed using toast notifications with appropriate loading states and detailed error messages.
