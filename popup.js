document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup opened. Initializing...');
  const runAllButton = document.getElementById('run-all');
  const stopAllButton = document.getElementById('stop-all');

  function findKatagoTabs(callback) {
    const queryOptions = { url: "https://colab.research.google.com/*" };
    console.log('Querying for tabs with:', queryOptions);

    chrome.tabs.query(queryOptions, (tabs) => {
      console.log(`Found ${tabs.length} total Colab tabs.`);
      
      // Filter tabs to find those with "Katago" in the title (case-insensitive)
      const katagoTabs = tabs.filter(tab => tab.title && tab.title.toLowerCase().includes('katago'));
      console.log(`Found ${katagoTabs.length} tabs with "Katago" in the title:`, katagoTabs.map(t => ({id: t.id, title: t.title})));
      
      callback(katagoTabs);
    });
  }

  runAllButton.addEventListener('click', () => {
    console.log('--- "Run All" button clicked ---');
    findKatagoTabs((tabs) => {
      if (tabs.length === 0) {
        console.warn('No Katago tabs found to run.');
        alert('No Colab tabs with "Katago" in the title were found.');
        return;
      }
      tabs.forEach(tab => {
        console.log(`Injecting "run all" script into tab ID: ${tab.id}`);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: triggerRunAll,
        }, (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error(`Error injecting script into tab ${tab.id}:`, chrome.runtime.lastError.message);
          } else {
            console.log(`Script injected successfully into tab ${tab.id}. Results:`, injectionResults);
          }
        });
      });
    });
  });

  stopAllButton.addEventListener('click', () => {
    console.log('--- "Stop All" button clicked ---');
    findKatagoTabs((tabs) => {
      if (tabs.length === 0) {
        console.warn('No Katago tabs found to stop.');
        alert('No Colab tabs with "Katago" in the title were found.');
        return;
      }
      tabs.forEach(tab => {
        console.log(`Injecting "stop" script into tab ID: ${tab.id}`);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: triggerInterrupt,
        }, (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error(`Error injecting script into tab ${tab.id}:`, chrome.runtime.lastError.message);
          } else {
            console.log(`Script injected successfully into tab ${tab.id}. Results:`, injectionResults);
          }
        });
      });
    });
  });
});

// This function is injected into the Colab page.
function triggerRunAll() {
  console.log('[Katago Controller] Attempting to trigger "Run all" using command...');
  // colab.global.notebook.kernel.executeAllCells() is a more direct way.
  // However, a more robust and officially-supported-like way is to use the command palette.
  const
 
runAllCommand = 'runtime.run-all';
  try {
    const
 
colabApp = document.querySelector('colab-app');
    if (colabApp && colabApp.shadowRoot) {
      const
 
commandService = colabApp.shadowRoot.querySelector('colab-command-service');
      if (commandService) {
        commandService.executeCommand(runAllCommand);
        console.log(`[Katago Controller] Successfully executed command: "${runAllCommand}"`);
      } else {
        console.error('[Katago Controller] Could not find "colab-command-service".');
      }
    } else {
      console.error('[Katago Controller] Could not find "colab-app" or its shadowRoot.');
    }
  } catch (e) {
    console.error('[Katago Controller] Error executing "Run all" command:', e);
  }
}

// This function is injected into the Colab page.
function triggerInterrupt() {
  console.log('[Katago Controller] Attempting to trigger "Interrupt execution" using command...');
  const
 
interruptCommand = 'runtime.interrupt';
  try {
    const
 
colabApp = document.querySelector('colab-app');
    if (colabApp && colabApp.shadowRoot) {
      const
 
commandService = colabApp.shadowRoot.querySelector('colab-command-service');
      if (commandService) {
        commandService.executeCommand(interruptCommand);
        console.log(`[Katago Controller] Successfully executed command: "${interruptCommand}"`);
      } else {
        console.error('[Katago Controller] Could not find "colab-command-service".');
      }
    } else {
      console.error('[Katago Controller] Could not find "colab-app" or its shadowRoot.');
    }
  } catch (e) {
    console.error('[Katago Controller] Error executing "Interrupt" command:', e);
  }
}
