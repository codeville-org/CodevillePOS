import { create } from "zustand";

import { createJSONStorage, persist } from "zustand/middleware";
import { electronStorage } from "../local-storage";
import { loginHandler } from "./actions";
import type { SecurityStoreInterface } from "./types";

export const useSecurityStore = create<SecurityStoreInterface>()(
  persist(
    (set, get) => ({
      user: null as SecurityStoreInterface["user"],
      isAuthenticated: false,
      latestLoginFootprint:
        null as SecurityStoreInterface["latestLoginFootprint"],

      validateAuth: () => {
        // If not authenticated
        if (!get().user || !get().isAuthenticated) {
          return {
            success: false,
            message: "Not Authenticated"
          };
        }

        // If Authenticated & latestLoginFootprint is null or exceeding 24 hours, logout
        const latestLoginFootprint = get().latestLoginFootprint;

        if (
          !latestLoginFootprint ||
          new Date().getTime() - latestLoginFootprint.getTime() >
            24 * 60 * 60 * 1000
        ) {
          set({ isAuthenticated: false, latestLoginFootprint: null });
        }

        return { success: true, message: "Authenticated" };
      },

      login: async (username, password) => {
        const handlerResponse = await loginHandler(username, password);

        if (handlerResponse.data !== null) {
          set({
            isAuthenticated: true,
            latestLoginFootprint: new Date(),
            user: handlerResponse.data.user
          });

          return {
            success: true,
            message: handlerResponse.data.message
          };
        }

        return {
          success: false,
          message: handlerResponse.error
        };
      },

      logout: () => {
        set({ isAuthenticated: false, user: null, latestLoginFootprint: null });

        return {
          success: true,
          message: "Logout Successful"
        };
      },

      lock: () => {
        set({ isAuthenticated: false });

        return {
          success: true,
          message: "System Locked"
        };
      }
    }),
    {
      name: "security-store",
      storage: createJSONStorage(() => electronStorage)
    }
  )
);
