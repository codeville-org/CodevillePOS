import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AppSettingsMapT } from "@/lib/zod/settings.zod";
import { useGetSettings } from "../query/use-get";
import { useUpsertSettings } from "../query/use-upsert";

type Props = {};

type SettingConfig = {
  key: keyof AppSettingsMapT;
  label: string;
  description?: string;
  type: "boolean";
  defaultValue: boolean;
};

const additionalSettingsConfig: SettingConfig[] = [
  {
    key: "imagesEnabled",
    label: "Enable Images",
    description: "Allow image uploads and display throughout the application",
    type: "boolean",
    defaultValue: true
  }
];

export function AdditionalSettings({}: Props) {
  const [settingsData, setSettingsData] = useState<Record<string, any>>({});

  const { data: settings, isPending } = useGetSettings();
  const { mutate, isPending: isUpserting } = useUpsertSettings();

  useEffect(() => {
    if (settings) {
      const initialData: Record<string, any> = {};
      additionalSettingsConfig.forEach((config) => {
        initialData[config.key] = settings[config.key] ?? config.defaultValue;
      });
      setSettingsData(initialData);
    }
  }, [settings]);

  const handleUpsertSettings = async () => {
    console.log("[ADDITIONAL-SETTINGS] Upserting:", settingsData);
    mutate(settingsData as Partial<AppSettingsMapT>);
  };

  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle>Additional Settings</CardTitle>
        <CardDescription>
          Manage additional application settings.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isPending
          ? Array(additionalSettingsConfig.length)
              .fill(0)
              .map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full rounded-md" />
              ))
          : additionalSettingsConfig.map((config) => (
              <Card
                key={config.key}
                className="px-4 py-3 flex flex-row items-center justify-between shadow-none rounded-md"
              >
                <div className="flex flex-col">
                  <div className="font-medium">{config.label}</div>
                  {config.description && (
                    <div className="text-sm text-muted-foreground">
                      {config.description}
                    </div>
                  )}
                </div>

                <div className="h-full w-fit flex items-center justify-center">
                  {config.type === "boolean" && (
                    <Switch
                      checked={
                        (settingsData[config.key] as boolean) ??
                        config.defaultValue
                      }
                      onCheckedChange={(checked) =>
                        setSettingsData((prev) => ({
                          ...prev,
                          [config.key]: checked
                        }))
                      }
                    />
                  )}
                </div>
              </Card>
            ))}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleUpsertSettings}
          loading={isUpserting}
          disabled={isUpserting}
        >
          Update Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
