import { ShieldUser, User2, UserPlus2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
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
import { PasswordInput } from "@/components/ui/password-input";
import { TEXTS } from "@/lib/language";
import { cn } from "@/lib/utils";
import { insertUserSchema, InsertUserSchema } from "@/lib/zod/user.zod";
import { usePersistStore } from "@/lib/zustand/persist-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type Props = {};

export function AddUser({}: Props) {
  const { language } = usePersistStore();
  const [open, setOpen] = useState(false);

  const form = useForm<InsertUserSchema>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      isAdmin: false
    }
  });

  const onSubmit = (data: InsertUserSchema) => {
    console.log("Create User:", data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button icon={<UserPlus2Icon />}>
          {TEXTS.users.addNew.button[language]}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>
                {TEXTS.users.addNew.dialog.title[language]}
              </DialogTitle>
              <DialogDescription>
                {TEXTS.users.addNew.dialog.description[language]}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {TEXTS.users.addNew.form.username.label[language]}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          TEXTS.users.addNew.form.username.placeholder[language]
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {TEXTS.users.addNew.form.username.description[language]}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {TEXTS.users.addNew.form.email.label[language]}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={
                          TEXTS.users.addNew.form.email.placeholder[language]
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {TEXTS.users.addNew.form.password.label[language]}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={
                          TEXTS.users.addNew.form.password.placeholder[language]
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select User Type</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3 w-full">
                        <div
                          onClick={() => field.onChange(true)}
                          onBlur={field.onBlur}
                          className={cn(
                            "w-full flex-1 rounded-lg border cursor-pointer flex flex-col items-center justify-center p-3",
                            {
                              "bg-primary/10 text-primary border-primary hover:bg-primary/20":
                                field.value,
                              "border-secondary bg-secondary/40 text-foreground/80 hover:bg-secondary/60":
                                !field.value
                            }
                          )}
                        >
                          <ShieldUser className="size-8" />

                          <div className="mt-1 text-center">
                            <h2 className="text-sm font-semibold">
                              Admin User
                            </h2>
                            <p className="text-xs opacity-80 line-clamp-1">
                              System Administration
                            </p>
                          </div>
                        </div>

                        <div
                          onClick={() => field.onChange(false)}
                          onBlur={field.onBlur}
                          className={cn(
                            "w-full flex-1 rounded-lg border cursor-pointer flex flex-col items-center justify-center p-3",
                            {
                              "bg-primary/10 text-primary border-primary hover:bg-primary/20":
                                !field.value,
                              "border-secondary bg-secondary/40 text-foreground/80 hover:bg-secondary/60":
                                field.value
                            }
                          )}
                        >
                          <User2 className="size-8" />

                          <div className="mt-1 text-center">
                            <h2 className="text-sm font-semibold">Employee</h2>
                            <p className="text-xs opacity-80 line-clamp-1">
                              Standard User
                            </p>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
