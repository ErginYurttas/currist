import {
  isCurristProjectDocument,
  type CurristProjectDocument,
} from "./project-document";

const PROJECT_STORAGE_KEY = "currist.current-project";

export function saveProjectToLocalStorage(
  document: CurristProjectDocument
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    PROJECT_STORAGE_KEY,
    JSON.stringify(document)
  );
}

export function loadProjectFromLocalStorage():
  | CurristProjectDocument
  | null {
  if (typeof window === "undefined") return null;

  const storedValue = localStorage.getItem(PROJECT_STORAGE_KEY);

  if (!storedValue) return null;

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isCurristProjectDocument(parsedValue)) {
      console.warn(
        "Stored Currist project document is invalid."
      );

      return null;
    }

    return parsedValue;
  } catch (error) {
    console.error(
      "Stored Currist project could not be read.",
      error
    );

    return null;
  }
}

export function removeProjectFromLocalStorage(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(PROJECT_STORAGE_KEY);
}