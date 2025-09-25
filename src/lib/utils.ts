import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function replaceUrlParams(data: Record<string, string | undefined>) {
  const params = new URLSearchParams(window.location.search);

  const keysWithUndefinedValues: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      params.delete(key);
      if (value === undefined) {
        keysWithUndefinedValues.push(key);
      }
    } else {
      params.set(key, value);
    }
  });

  let queryString = params.toString();
  if (keysWithUndefinedValues.length > 0) {
    queryString +=
      (queryString.length > 0 ? "&" : "") + keysWithUndefinedValues.join("&");
  }

  window.history.replaceState({}, "", `?${queryString}`);
}
