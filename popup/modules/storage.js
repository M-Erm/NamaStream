export function syncCheckboxesToStorage() {
  document.querySelectorAll('#view-default .check-row input').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      chrome.storage.local.set({ [checkbox.id]: checkbox.checked });
    });

    chrome.storage.local.get(checkbox.id, (result) => {
      if (result[checkbox.id] !== undefined) {
        checkbox.checked = result[checkbox.id];
      }
    });
  });
}
