export const parseImageIngredients = async (imageBase64: string): Promise<string[]> => {
  if (!imageBase64) {
    return [];
  }

  return ["tomato", "onion", "garlic"];
};
