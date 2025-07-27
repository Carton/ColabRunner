document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup opened. Initializing...');
  const runAllButton = document.getElementById('run-all');
  const stopAllButton = document.getElementById('stop-all');
  const titleKeywordInput = document.getElementById('title-keyword');

  function findMatchingTabs(keyword, callback) {
    const queryOptions = { url: "https://colab.research.google.com/*" };
    console.log('Querying for tabs with:', queryOptions);

    chrome.tabs.query(queryOptions, (tabs) => {
      console.log(`Found ${tabs.length} total Colab tabs.`);

      const lowerCaseKeyword = keyword.toLowerCase();
      const matchingTabs = tabs.filter(tab => tab.title && tab.title.toLowerCase().includes(lowerCaseKeyword));
      console.log(`Found ${matchingTabs.length} tabs with "${keyword}" in the title:`, matchingTabs.map(t => ({id: t.id, title: t.title})));

      callback(matchingTabs);
    });
  }

  runAllButton.addEventListener('click', () => {
    console.log('--- "Run All" button clicked ---');
    const keyword = titleKeywordInput.value;
    findMatchingTabs(keyword, (tabs) => {
      if (tabs.length === 0) {
        console.warn('No matching tabs found to run.');
        alert(`No Colab tabs with "${keyword}" in the title were found.`);
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
    const keyword = titleKeywordInput.value;
    findMatchingTabs(keyword, (tabs) => {
      if (tabs.length === 0) {
        console.warn('No matching tabs found to stop.');
        alert(`No Colab tabs with "${keyword}" in the title were found.`);
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
  console.log('[Colab Controller] Trying to find and execute the first code cell...');

  // Method 1: Use the verified colab-run-button
  try {
    const runButtons = document.querySelectorAll('colab-run-button');
    console.log(`[Colab Controller] Found ${runButtons.length} colab-run-buttons`);

    if (runButtons.length > 0) {
      const firstButton = runButtons[0];
      console.log('[Colab Controller] Found the first colab-run-button, attempting to click:', firstButton);
      firstButton.click();
      console.log('[Colab Controller] ✅ Successfully clicked the first colab-run-button!');
      return true;
    }
  } catch (e) {
    console.error('[Colab Controller] colab-run-button method failed:', e);
  }

  // Method 2: Find .cell.code elements
  try {
    const codeCells = document.querySelectorAll('.cell.code');
    console.log(`[Colab Controller] Found ${codeCells.length} .cell.code elements`);

    if (codeCells.length > 0) {
      const firstCell = codeCells[0];
      console.log('[Colab Controller] Found the first code cell, attempting to find the run button inside it');

      const cellRunButton = firstCell.querySelector('colab-run-button, button[aria-label*="Run"], [role="button"]');
      if (cellRunButton) {
        console.log('[Colab Controller] Found the run button inside the code cell, clicking:', cellRunButton);
        cellRunButton.click();
        console.log('[Colab Controller] ✅ Successfully clicked the run button inside the code cell!');
        return true;
      }

      firstCell.focus();
      firstCell.click();

      setTimeout(() => {
        const shiftEnterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          shiftKey: true,
          bubbles: true,
          cancelable: true
        });

        firstCell.dispatchEvent(shiftEnterEvent);
        document.dispatchEvent(shiftEnterEvent);
        console.log('[Colab Controller] ✅ Sent Shift+Enter to the first code cell');
      }, 100);

      return true;
    }
  } catch (e) {
    console.error('[Colab Controller] Code cell method failed:', e);
  }

  // Method 3: Fallback to other possible run buttons
  try {
    const backupSelectors = [
      'button[aria-label*="Run"]',
      'button[title*="Run"]',
      'paper-icon-button[icon="av:play-arrow"]',
      '[role="button"][aria-label*="Run"]'
    ];

    for (const selector of backupSelectors) {
      const buttons = document.querySelectorAll(selector);
      if (buttons.length > 0) {
        console.log(`[Colab Controller] Fallback: Using selector "${selector}" found ${buttons.length} buttons`);
        buttons[0].click();
        console.log('[Colab Controller] ✅ Fallback method successfully clicked!');
        return true;
      }
    }
  } catch (e) {
    console.error('[Colab Controller] Fallback method failed:', e);
  }

  console.warn('[Colab Controller] ❌ All methods failed, unable to find an executable code cell');
  return false;
}

// This function is injected into the Colab page.
function triggerInterrupt() {
  console.log('[Colab Controller] Attempting to trigger "Interrupt execution" using command...');
  const interruptCommand = 'runtime.interrupt';
  try {
    const colabApp = document.querySelector('colab-app');
    if (colabApp && colabApp.shadowRoot) {
      const commandService = colabApp.shadowRoot.querySelector('colab-command-service');
      if (commandService) {
        commandService.executeCommand(interruptCommand);
        console.log(`[Colab Controller] Successfully executed command: "${interruptCommand}"`);
      } else {
        console.error('[Colab Controller] Could not find "colab-command-service".');
      }
    } else {
      console.error('[Colab Controller] Could not find "colab-app" or its shadowRoot.');
    }
  } catch (e) {
    console.error('[Colab Controller] Error executing "Interrupt" command:', e);
  }
}