import { execSync } from "child_process";
import { createHash } from "crypto";
import { arch, cpus, networkInterfaces, platform } from "os";
import { HardwareInfo } from "../zod/license.zod";

/**
 * Get the machine-specific ID based on the operating system
 * This is more reliable than other identifiers
 */
export function getMachineId(): string {
  try {
    switch (platform()) {
      case "win32": {
        // Windows: Use MachineGuid from registry
        const output = execSync(
          "REG QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid",
          { encoding: "utf-8" }
        );

        const match = output.match(/MachineGuid\s+REG_SZ\s+(.+)/);
        return match ? match[1].trim() : "";
      }
      default:
        return "";
    }
  } catch (error) {
    console.error("Failed to get machine ID:", error);
    return "";
  }
}

/**
 * Get all non-internal MAC addresses
 */
function getMacAddresses(): string[] {
  const interfaces = networkInterfaces();
  const macs: string[] = [];

  for (const name in interfaces) {
    const nets = interfaces[name];
    if (!nets) continue;

    for (const net of nets) {
      // Skip internal and zero MAC addresses
      if (!net.internal && net.mac && net.mac !== "00:00:00:00:00:00") {
        if (!macs.includes(net.mac)) {
          macs.push(net.mac);
        }
      }
    }
  }

  return macs.sort(); // Sort for consistency
}

/**
 * Collect hardware information from the system
 */
function collectHardwareInfo(): HardwareInfo {
  const cpuInfo = cpus();

  return {
    cpuModel: cpuInfo[0]?.model || "unknown",
    cpuCores: cpuInfo.length,
    platform: platform(),
    arch: arch(),
    macAddresses: getMacAddresses(),
    machineId: getMachineId()
  };
}

/**
 * Generate a stable hardware fingerprint hash
 *
 * @param options - Configuration options
 * @param options.includeMAC - Include MAC addresses (may change if hardware changes)
 * @param options.salt - Optional salt for additional uniqueness per application
 */
export function generateFingerprint(
  options: {
    includeMAC?: boolean;
    salt?: string;
  } = {}
): string {
  const { includeMAC = false, salt = "" } = options;
  const info = collectHardwareInfo();

  // Build fingerprint components
  // Use stable identifiers that won't change across reboots
  const components: string[] = [
    info.machineId, // Most stable identifier
    info.platform,
    info.arch,
    info.cpuModel,
    info.cpuCores.toString()
  ];

  // MAC addresses can change (VMs, new hardware), so it's optional
  if (includeMAC && info.macAddresses.length > 0) {
    components.push(info.macAddresses.join(","));
  }

  // Add salt if provided (makes fingerprint unique to your app)
  if (salt) {
    components.push(salt);
  }

  // Create hash
  const fingerprintData = components.join("|");
  const hash = createHash("sha256").update(fingerprintData).digest("hex");

  return hash;
}

/**
 * Generate a shorter fingerprint (first 16 chars)
 * Useful for display purposes
 */
export function generateShortFingerprint(
  options: {
    includeMAC?: boolean;
    salt?: string;
  } = {}
): string {
  return generateFingerprint(options).substring(0, 16).toUpperCase();
}

/**
 * Get detailed hardware info for debugging/display
 */
export function getHardwareInfo(): HardwareInfo {
  return collectHardwareInfo();
}
