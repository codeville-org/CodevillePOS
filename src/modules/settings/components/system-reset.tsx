import { TrashIcon } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useSystemReset } from "../query/use-reset";

export function SystemReset() {
  const [reloadAlertShow, setReloadAlertShow] = useState(false);
  const { mutate: resetSystem, isPending: resettingSystem } = useSystemReset();

  const handleResetSystem = () => {
    resetSystem(undefined, {
      onSuccess: () => setReloadAlertShow(true)
    });
  };

  return (
    <>
      <AlertDialog open={reloadAlertShow}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Please reload the application</AlertDialogTitle>
            <AlertDialogDescription>
              After resetting the system, please restart the application to
              complete the process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                window.location.reload();
              }}
            >
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="bg-destructive/10 border-destructive">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-red-500">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-500/70">
            {`Please be cautious when using the system reset feature. This action is irreversible and will erase all your data.`}
          </CardDescription>
        </CardHeader>

        <CardContent></CardContent>

        <CardFooter className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                icon={<TrashIcon />}
                variant="destructive"
                disabled={resettingSystem}
                onClick={() => {}}
                loading={resettingSystem}
              >
                Reset System
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently reset your
                  system
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetSystem}>
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  );
}
