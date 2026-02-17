import { supabase } from "./supabase";

export const invokeFunction = async <T>(name: string, body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke(name, { body });

  if (error) {
    throw new Error(error.message);
  }

  return data as T;
};
