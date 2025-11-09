import { useMutation } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";

import { useElectronAPI } from "@/hooks/use-electron-api";

export const useSelectImageDirectory = () => {
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async () => {
      const api = useElectronAPI();

      const response = await api.images.selectImageDirectory();

      if (!response.success || response.error) {
        throw new Error(response.error || "Failed to select directory");
      }

      return response;
    },
    onMutate: () => {
      toast.loading("Opening directory dialog...", { id: toastId });
    },
    onSuccess: () => {
      toast.dismiss(toastId);
    },
    onError: (error) => {
      // Only show error if it's not a user cancellation
      if (!error.message.includes("canceled")) {
        toast.error(error.message || "Failed to select directory", {
          id: toastId
        });
      } else {
        toast.dismiss(toastId);
      }
    }
  });

  return mutation;
};

export const useListImagesInDirectory = () => {
  const mutation = useMutation({
    mutationFn: async (directoryPath: string) => {
      const api = useElectronAPI();

      const response = await api.images.listImagesInDirectory(directoryPath);

      if (!response.success || response.error) {
        throw new Error(response.error || "Failed to list images");
      }

      return response;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to list images in directory");
    }
  });

  return mutation;
};

export const useCopyImagesFromDirectory = () => {
  const toastId = useId();

  const mutation = useMutation({
    mutationFn: async (sourceDirectoryPath: string) => {
      const api = useElectronAPI();

      const response =
        await api.images.copyImagesFromDirectory(sourceDirectoryPath);

      if (!response.success || response.error) {
        throw new Error(response.error || "Failed to copy images");
      }

      return response;
    },
    onMutate: () => {
      toast.loading("Copying images to system directory...", { id: toastId });
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully copied ${data.copiedCount || 0} images to system directory!`,
        { id: toastId }
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to copy images", {
        id: toastId
      });
    }
  });

  return mutation;
};
