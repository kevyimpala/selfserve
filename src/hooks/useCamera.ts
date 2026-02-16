import { useMemo, useState } from "react";

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = async () => {
    setHasPermission(true);
    return true;
  };

  const takePhoto = async () => {
    return null as string | null;
  };

  return useMemo(
    () => ({
      hasPermission,
      requestPermission,
      takePhoto
    }),
    [hasPermission]
  );
};
