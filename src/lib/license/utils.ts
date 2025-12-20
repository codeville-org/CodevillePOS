export interface LicenseErrorMessages {
  title: string;
  description?: string;
}

export function getLicenseErrorMessage(error: string): LicenseErrorMessages {
  const messages: Record<string, LicenseErrorMessages> = {
    HARDWARE_CHANGED: {
      title: "Your hardware has changed.",
      description: "Please reactivate your license."
    },
    ALREADY_ACTIVATED: {
      title: "This license is already activated.",
      description: "Please use a different license key."
    },
    LICENSE_EXPIRED: {
      title: "Your license has expired."
    },
    VALIDATION_REQUIRED: {
      title: "Validation Required",
      description: "Please connect to the internet to validate your license."
    },
    LICENSE_REVOKED: {
      title: "Your license has been revoked."
    },
    LICENSE_SAVE_FAILED: {
      title: "Failed to save license data.",
      description: "Please try again."
    },
    NETWORK_ERROR: {
      title: "Network connection failed.",
      description: "Please check your internet connection and try again."
    },
    NO_LICENSE: {
      title: "No license found.",
      description: "Please activate your license."
    },
    INVALID_KEY: {
      title: "Invalid Serial Key",
      description: "Please check your serial key and try again."
    },
    HARDWARE_MISMATCH: {
      title: "Your hardware has changed.",
      description: "Please reactivate your license."
    },
    GRACE_PERIOD_EXCEEDED: {
      title: "License validation period expired.",
      description: "Please connect to the internet to revalidate."
    }
  };

  return (
    messages[error] || {
      title: "An unknown error occurred.",
      description: "Please try again later."
    }
  );
}
