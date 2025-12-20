import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, PlusCircleIcon, PrinterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { BarcodeInput } from "@/components/ui/barcode-input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TEXTS } from "@/lib/language";
import {
  insertProductSchema,
  InsertProductSchema,
  SelectProductSchema
} from "@/lib/zod/products.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { CategoryDropdown } from "@/modules/categories/components/category-dropdown";
import { ImageUploader } from "@/modules/image-manager/components/image-uploader";
import { useCreateProduct } from "../queries/use-create";
import { useGetProductByIdMutated } from "../queries/use-mutated-get-by-id";
import { useUpdateProduct } from "../queries/use-update";
// import { GenerateLabelDialog } from "./generate-label";
import DeleteProductButton from "./delete-product-button";
import { GenerateLabelDialog } from "./generate-label";
import { UnitsDropdown } from "./units-dropdown";

type FormMode = "create" | "edit";

type Props = {
  className?: string;
  mode: FormMode;
  productId?: string;
};

export function ProductForm({ className, mode, productId }: Props) {
  const { language } = usePersistStore();
  const [formMode, setFormMode] = useState<FormMode>(mode);
  const [currentProduct, setCurrentProduct] =
    useState<SelectProductSchema | null>(null);

  const { mutateAsync: createProduct, isPending: creatingProduct } =
    useCreateProduct();
  const { mutateAsync: updateProduct, isPending: updatingProduct } =
    useUpdateProduct(productId || currentProduct?.id || "");
  const { mutateAsync: getProductById, isPending: fetchingProduct } =
    useGetProductByIdMutated();

  const form = useForm<InsertProductSchema>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      barcode: "",
      description: "",
      unitPrice: 0,
      unitAmount: 0,
      unit: "",
      discountedPrice: 0,
      stockQuantity: 0,
      imageFilename: "",
      isActive: true,
      isFeatured: false
    }
  });

  useEffect(() => {
    if (formMode === "edit") {
      if (productId) {
        handleFetchProduct(productId);
      }
    }
  }, [formMode, productId]);

  useEffect(() => {
    if (formMode === "edit" && currentProduct) {
      form.reset({
        ...currentProduct,
        isFeatured: currentProduct.isFeatured || false,
        categoryId: currentProduct.category.id
      });
    }
  }, [formMode, currentProduct, form]);

  // Listen to form -> price value and update discounted price value simultanously
  const priceValue = form.watch("unitPrice");

  useEffect(() => {
    // const discountedPrice = priceValue ? priceValue * 0.8 : 0;
    const discountedPrice = priceValue;
    form.setValue("discountedPrice", discountedPrice);
  }, [priceValue, form]);

  const handleFetchProduct = async (id: string) => {
    const product = await getProductById(id);
    setCurrentProduct(product);
  };

  const handleCreateProduct = async (data: InsertProductSchema) => {
    await createProduct(data, {
      onSuccess: ({ id }) => {
        handleFetchProduct(id);
        setFormMode("edit");
      }
    });
  };

  const handleUpdateProduct = async (data: InsertProductSchema) => {
    await updateProduct(data);
  };

  const handleResetProductForm = () => {
    form.reset();
    setFormMode("create");
    setCurrentProduct(null);
  };

  // Prevent accidental form submission from barcode scanner Enter key
  const handleFormSubmit = (e: React.FormEvent) => {
    // Check if the active element is a form input/control
    const activeElement = document.activeElement as HTMLElement;
    const isFormFieldFocused =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT" ||
        activeElement.tagName === "BUTTON" ||
        activeElement.closest('[role="combobox"]') ||
        activeElement.closest("[data-radix-collection-item]"));

    // If no form field is focused, prevent submission (likely from barcode scanner)
    if (!isFormFieldFocused) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Proceed with normal form submission
    form.handleSubmit(
      formMode === "create" ? handleCreateProduct : handleUpdateProduct
    )(e);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleFormSubmit}>
          <div
            className={cn(
              "flex-1 flex flex-col h-full rounded-md bg-secondary/40 dark:bg-secondary/20 border border-foreground/5",
              className
            )}
          >
            <div className="flex-1 h-full">
              <ScrollArea className="h-[calc(100dvh-260px)]">
                <div className="px-6 py-8 flex flex-col gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {TEXTS.products.addNew.form.name.label[language]}
                        </FormLabel>
                        <FormControl className="flex-1 h-full">
                          <div>
                            {fetchingProduct ? (
                              <Skeleton className="w-full h-12" />
                            ) : (
                              <Input
                                className="w-full h-12 bg-white shadow-none"
                                placeholder={
                                  TEXTS.products.addNew.form.name.placeholder[
                                    language
                                  ]
                                }
                                {...field}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {
                              TEXTS.products.addNew.form.category.label[
                                language
                              ]
                            }
                          </FormLabel>
                          <FormControl className="flex-1 h-full">
                            <div>
                              {fetchingProduct ? (
                                <Skeleton className="w-full h-12" />
                              ) : (
                                <CategoryDropdown
                                  defaultSelected={
                                    formMode === "edit"
                                      ? currentProduct?.category || null
                                      : null
                                  }
                                  onSelect={(category) => {
                                    field.onChange(category.id);
                                  }}
                                  maxItems={6}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {TEXTS.products.addNew.form.barcode.label[language]}
                          </FormLabel>
                          <FormControl className="flex-1 h-full">
                            <div>
                              {fetchingProduct ? (
                                <Skeleton className="w-full h-12" />
                              ) : (
                                <BarcodeInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  onGenerate={(barcode) => {
                                    console.log("Generated barcode:", barcode);
                                  }}
                                  placeholder={
                                    TEXTS.products.addNew.form.barcode
                                      .placeholder[language]
                                  }
                                  className="w-full"
                                  enableScanning={true}
                                  enableSimulation={true}
                                  simulationShortcut={{
                                    ctrl: true,
                                    shift: true,
                                    key: "B"
                                  }}
                                  showGenerateButton={true}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {
                            TEXTS.products.addNew.form.description.label[
                              language
                            ]
                          }
                        </FormLabel>
                        <FormControl className="flex-1 h-full">
                          <div>
                            {fetchingProduct ? (
                              <Skeleton className="w-full h-18" />
                            ) : (
                              <Textarea
                                className="w-full h-18 bg-white shadow-none"
                                placeholder={
                                  TEXTS.products.addNew.form.description
                                    .placeholder[language]
                                }
                                {...field}
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {
                              TEXTS.products.addNew.form.unitPrice.label[
                                language
                              ]
                            }
                          </FormLabel>
                          <FormControl className="flex-1 h-full">
                            <div>
                              {fetchingProduct ? (
                                <Skeleton className="w-full h-12" />
                              ) : (
                                <Input
                                  className="w-full h-12 bg-white shadow-none"
                                  type="number"
                                  placeholder={
                                    TEXTS.products.addNew.form.unitPrice
                                      .placeholder[language]
                                  }
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unitAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {
                              TEXTS.products.addNew.form.unitAmount.label[
                                language
                              ]
                            }
                          </FormLabel>
                          <FormControl className="flex-1 h-full">
                            <div>
                              {fetchingProduct ? (
                                <Skeleton className="w-full h-12" />
                              ) : (
                                <Input
                                  className="w-full h-12 bg-white shadow-none"
                                  type="number"
                                  placeholder={
                                    TEXTS.products.addNew.form.unitAmount
                                      .placeholder[language]
                                  }
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {
                              TEXTS.products.addNew.form.productUnit.label[
                                language
                              ]
                            }
                          </FormLabel>
                          <FormControl className="flex-1 h-full">
                            <div>
                              {fetchingProduct ? (
                                <Skeleton className="w-full h-12" />
                              ) : (
                                <UnitsDropdown
                                  defaultValue={field.value}
                                  onSelect={(value) => {
                                    field.onChange(value);
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {
                              TEXTS.products.addNew.form.discountedPrice.label[
                                language
                              ]
                            }
                          </FormLabel>
                          <FormControl className="flex-1 h-full">
                            <div>
                              {fetchingProduct ? (
                                <Skeleton className="w-full h-12" />
                              ) : (
                                <Input
                                  className="w-full h-12 bg-white shadow-none"
                                  type="number"
                                  placeholder={
                                    TEXTS.products.addNew.form.discountedPrice
                                      .placeholder[language]
                                  }
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value));
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stockQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {
                              TEXTS.products.addNew.form.stockQuantity.label[
                                language
                              ]
                            }
                          </FormLabel>
                          <FormControl className="flex-1 h-full">
                            <div>
                              {fetchingProduct ? (
                                <Skeleton className="w-full h-12" />
                              ) : (
                                <Input
                                  className="w-full h-12 bg-white shadow-none"
                                  type="number"
                                  placeholder={
                                    TEXTS.products.addNew.form.stockQuantity
                                      .placeholder[language]
                                  }
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseInt(e.target.value));
                                  }}
                                />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white dark:bg-secondary/50">
                        <div className="space-y-1">
                          <FormLabel className="text-base">
                            {
                              TEXTS.products.addNew.form.isFeatured.label[
                                language
                              ]
                            }
                          </FormLabel>
                          <FormDescription>
                            {
                              TEXTS.products.addNew.form.isFeatured.placeholder[
                                language
                              ]
                            }
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            defaultChecked={
                              currentProduct?.isFeatured ? true : false
                            }
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageFilename"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {
                            TEXTS.products.addNew.form.productImage.label[
                              language
                            ]
                          }
                        </FormLabel>
                        <FormControl className="flex-1 h-full">
                          <div>
                            {fetchingProduct ? (
                              <Skeleton className="w-full h-12" />
                            ) : formMode === "edit" && field.value !== "" ? (
                              <ImageUploader
                                initialFilename={field.value}
                                onUploaded={(filename) =>
                                  field.onChange(filename)
                                }
                              />
                            ) : (
                              <ImageUploader
                                onUploaded={(filename) =>
                                  field.onChange(filename)
                                }
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-foreground/5 flex-shrink-0">
              {formMode === "create" ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleResetProductForm}
                >
                  {TEXTS.products.addNew.form.reset[language]}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <DeleteProductButton product={currentProduct} />

                  <GenerateLabelDialog formValues={form.getValues()}>
                    <Button
                      type="button"
                      variant="outline"
                      icon={<PrinterIcon />}
                    >
                      {TEXTS.products.addNew.form.printLabel[language]}
                    </Button>
                  </GenerateLabelDialog>
                </div>
              )}

              <Button
                loading={creatingProduct || updatingProduct}
                type="submit"
                icon={formMode === "create" ? <PlusCircleIcon /> : <EditIcon />}
              >
                {formMode === "create"
                  ? TEXTS.products.addNew.form.create[language]
                  : TEXTS.products.addNew.form.edit[language]}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
