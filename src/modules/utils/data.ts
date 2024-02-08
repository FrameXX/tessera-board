import type Toaster from "../toaster/toaster";

type Entries = [string, string][];
function isEntries(object: any): object is Entries {
  if (!Array.isArray(object)) return false;
  for (const entry of object) {
    if (!Array.isArray(entry)) {
      return false;
    }
    if (entry.length !== 2) {
      return false;
    }
    if (typeof entry[0] !== "string" || typeof entry[1] !== "string") {
      return false;
    }
  }
  return true;
}

function downloadBlob(blob: Blob) {
  const downloadUrl = URL.createObjectURL(blob);
  const date = new Date();
  const fileName = `tessera_board_data_${date.getFullYear()}_${
    date.getMonth() + 1
  }_${date.getDate()}_${date.getHours()}_${date.getMinutes()}`;
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;
  document.body.prepend(link);
  link.click();
  link.remove();
}

function requestFile(): Promise<null | File> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.multiple = false;
  document.body.prepend(input);
  input.click();
  return new Promise((resolve: (file: null | File) => void) => {
    input.addEventListener("cancel", () => {
      resolve(null);
      input.remove();
    });
    input.addEventListener("change", () => {
      if (!input.files) {
        resolve(null);
      } else {
        resolve(input.files[0]);
      }
      input.remove();
    });
  });
}

function readFile(file: File): Promise<any | null> {
  const reader = new FileReader();
  reader.readAsText(file);
  return new Promise((resolve: (data: any | null) => void) => {
    reader.addEventListener("load", (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") {
        resolve(null);
      } else {
        let data: any;
        try {
          data = JSON.parse(result);
          resolve(data);
        } catch (error) {
          resolve(null);
        }
      }
    });
    reader.addEventListener("error", () => {
      resolve(null);
    });
  });
}

export async function importData(toaster: Toaster) {
  const file = await requestFile();
  if (!file) {
    toaster.bake("File import was canceled", "file-cancel-outline");
    return;
  }
  const entries = await readFile(file);
  if (entries === null) {
    toaster.bake(
      "Reading data from file failed. File may be corrupted or in wrong format.",
      "file-alert-outline",
      "error"
    );
    return;
  }
  if (!isEntries(entries)) {
    toaster.bake(
      "Provided file has incorrectly formated data. The file may be corrupted or in wrong format.",
      "file-alert-outline",
      "error"
    );
    return;
  }
  for (const entry of entries) {
    const key = entry[0];
    const value = entry[1];
    localStorage.setItem(key, value);
  }
  location.reload();
}

export function exportData() {
  const entries = Object.entries(localStorage);
  const entriesStr = JSON.stringify(entries);
  const blob = new Blob([entriesStr], { type: "application/json" });
  downloadBlob(blob);
}
