export type NutritionLookupResult = {
  barcode: string;
  productName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const lookupBarcode = async (barcode: string): Promise<NutritionLookupResult> => {
  return {
    barcode,
    productName: "Sample Product",
    calories: 120,
    protein: 5,
    carbs: 14,
    fat: 3
  };
};
