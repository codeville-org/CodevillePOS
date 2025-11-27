import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  updateVendorSchema,
  type UpdateVendorSchema
} from "@/lib/zod/supplier.zod";

import { Textarea } from "@/components/ui/textarea";
import { useGetVendorById } from "../queries/use-get-by-id";
import { useUpdateVendor } from "../queries/use-update";

interface UpdateVendorProps {
  id: string;
  children?: React.ReactNode;
}

export function UpdateVendor({ id, children }: UpdateVendorProps) {
  const { data: currentVendor, isPending: isFetching } = useGetVendorById(id);

  const { mutateAsync, isPending } = useUpdateVendor(id);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const form = useForm<UpdateVendorSchema>({
    resolver: zodResolver(updateVendorSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  useEffect(() => {
    if (currentVendor) {
      form.reset({
        ...currentVendor
      });
    }
  }, [currentVendor]);

  const onSubmit = async (values: UpdateVendorSchema) => {
    try {
      await mutateAsync(values, {
        onSuccess: () => {
          form.reset();
          setIsOpen(false);
        }
      });
    } catch (error) {
      // Error is handled by the mutation itself
      console.error("Update failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Update Vendor</DialogTitle>
              <DialogDescription>
                Fill the form below to update selected vendor.
              </DialogDescription>
            </DialogHeader>
            {isFetching ? (
              <div>Loading vendor data...</div>
            ) : (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={"Enter vendor name here "}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={"Enter description"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" loading={isPending}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
