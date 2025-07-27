document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup opened. Initializing...');
  const runAllButton = document.getElementById('run-all');
  const stopAllButton = document.getElementById('stop-all');

  function findKatagoTabs(callback) {
    const queryOptions = { url: "https://colab.research.google.com/*" };
    chrome.tabs.query(queryOptions, (tabs) => {
      const katagoTabs = tabs.filter(tab => tab.title && tab.title.toLowerCase().includes('katago'));
      console.log(`Found ${katagoTabs.length} tabs with "Katago" in the title.`);
      callback(katagoTabs);
    });
  }

  runAllButton.addEventListener('click', () => {
    console.log('--- "Run All" button clicked ---');
    findKatagoTabs((tabs) => {
      if (tabs.length === 0) {
        alert('No Colab tabs with "Katago" in the title were found.');
        return;
      }
      tabs.forEach(tab => {
        console.log(`Injecting "run all" script into tab ID: ${tab.id}`);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: triggerRunAll,
        });
      });
    });
  });

  stopAllButton.addEventListener('click', () => {
    console.log('--- "Stop All" button clicked ---');
    findKatagoTabs((tabs) => {
      if (tabs.length === 0) {
        alert('No Colab tabs with "Katago" in the title were found.');
        return;
      }
      tabs.forEach(tab => {
        console.log(`Injecting "stop" script into tab ID: ${tab.id}`);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: triggerInterrupt,
        });
      });
    });
  });
});

// This function is injected into the Colab page.
// It simulates the Ctrl+F9 keyboard shortcut to run all cells.
function triggerRunAll() {
  console.log('[Katago Controller] Simulating Ctrl+F9 keyboard shortcut for "Run all".');
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'F9',
    code: 'F9',
    ctrlKey: true, // Use true for Windows/Linux
    metaKey: false, // metaKey is for Cmd on Mac, but ctrlKey often works too
    bubbles: true,
    cancelable: true
  }));
}

// This function is injected into the Colab page.
// It simulates the Ctrl+M followed by I keyboard shortcut to interrupt execution.
function triggerInterrupt() {
  console.log('[Katago Controller] Simulating Ctrl+M, I keyboard shortcut for "Interrupt execution".');
  
  // Dispatch Ctrl+M
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'm',
    code: 'KeyM',
    ctrlKey: true,
    metaKey: false,
    bubbles: true,
    cancelable: true
  }));

  // Dispatch I shortly after
  setTimeout(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'i',
      code: 'KeyI',
      ctrlKey: false, // Important: only the first key has Ctrl
      metaKey: false,
      bubbles: true,
      cancelable: true
    }));
  }, 50); // A small delay is sometimes necessary
}
