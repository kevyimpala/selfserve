import { useMemo, useState } from "react";

export const useBarcodeScanner = () => {
  const [isActive, setIsActive] = useState(false);

  const start = () => setIsActive(true);
  const stop = () => setIsActive(false);

  const scan = async () => {
    return null as string | null;
  };

  return useMemo(
    () => ({
      isActive,
      start,
      stop,
      scan
    }),
    [isActive]
  );
};
