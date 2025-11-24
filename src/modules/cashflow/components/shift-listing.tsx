import { Button } from "@/components/ui/button";
import { useElectronAPI } from "@/hooks/use-electron-api";

type Props = {};

export function ShiftListing({}: Props) {
  const api = useElectronAPI();

  const handleFetchShifts = async () => {
    const res = await api.cashflow.getAllShifts({
      page: "1",
      limit: "10"
    });

    console.log("Shifts:", res);
  };

  return (
    <div>
      ShiftListing
      <Button onClick={handleFetchShifts}>Get Shifts</Button>
    </div>
  );
}
