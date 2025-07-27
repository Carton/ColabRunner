document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup opened. Initializing...');
  
  const toggleButton = document.getElementById('toggle-button');
  const titleKeywordInput = document.getElementById('title-keyword');
  const statusIndicator = document.getElementById('status-indicator');
  const buttonIcon = document.querySelector('.button-icon');
  const buttonText = document.querySelector('.button-text');
  
  let isRunning = false;
  let currentTabs = [];
  
  // Load saved keyword from storage
  loadSavedKeyword();
  
  // Save keyword when user types
  titleKeywordInput.addEventListener('input', () => {
    const keyword = titleKeywordInput.value;
    chrome.storage.local.set({ savedKeyword: keyword });
  });

  function loadSavedKeyword() {
    chrome.storage.local.get(['savedKeyword'], (result) => {
      if (result.savedKeyword) {
        titleKeywordInput.value = result.savedKeyword;
        console.log('Loaded saved keyword:', result.savedKeyword);
      }
    });
  }

  function showStatus(message, type = 'success') {
    const statusIcon = statusIndicator.querySelector('.status-icon');
    
    // 更新图标类
    statusIcon.className = 'status-icon';
    switch(type) {
      case 'running':
        statusIcon.classList.add('rocket-icon');
        break;
      case 'stopping':
        statusIcon.classList.add('stop-status-icon');
        break;
      case 'error':
        statusIcon.classList.add('cross-icon');
        break;
      default:
        statusIcon.classList.add('check-icon');
    }
    
    statusIndicator.innerHTML = `<span class="${statusIcon.className}">${statusIcon.innerHTML}</span>${message}`;
    statusIndicator.classList.add('show');
    setTimeout(() => {
      statusIndicator.classList.remove('show');
    }, 3000);
  }

  function updateButtonState(running) {
    isRunning = running;
    if (running) {
      toggleButton.classList.remove('run-mode');
      toggleButton.classList.add('stop-mode');
      buttonIcon.className = 'button-icon stop-icon';
      buttonText.textContent = 'Stop All Matching Tabs';
    } else {
      toggleButton.classList.remove('stop-mode');
      toggleButton.classList.add('run-mode');
      buttonIcon.className = 'button-icon play-icon';
      buttonText.textContent = 'Run All Matching Tabs';
    }
  }

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

  function executeRunAll() {
    console.log('--- Executing "Run All" ---');
    const keyword = titleKeywordInput.value;
    
    findMatchingTabs(keyword, (tabs) => {
      if (tabs.length === 0) {
        console.warn('No matching tabs found to run.');
        showStatus(`No Colab tabs with "${keyword}" found`, 'error');
        return;
      }
      
      currentTabs = tabs;
      updateButtonState(true);
      showStatus(`Running ${tabs.length} notebook(s)...`, 'running');
      
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
  }

  function executeStopAll() {
    console.log('--- Executing "Stop All" ---');
    const keyword = titleKeywordInput.value;
    
    findMatchingTabs(keyword, (tabs) => {
      if (tabs.length === 0) {
        console.warn('No matching tabs found to stop.');
        showStatus(`No Colab tabs with "${keyword}" found`, 'error');
        updateButtonState(false);
        return;
      }
      
      showStatus(`Stopping ${tabs.length} notebook(s)...`, 'stopping');
      
      tabs.forEach(tab => {
        console.log(`Injecting "stop" script into tab ID: ${tab.id} (using same run button)`);
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: triggerRunAll, // 使用相同的 triggerRunAll 函数，因为在 Colab 中同一个按钮可以开始/停止
        }, (injectionResults) => {
          if (chrome.runtime.lastError) {
            console.error(`Error injecting script into tab ${tab.id}:`, chrome.runtime.lastError.message);
          } else {
            console.log(`Script injected successfully into tab ${tab.id}. Results:`, injectionResults);
          }
        });
      });
      
      // Reset button state after stopping
      setTimeout(() => {
        updateButtonState(false);
        showStatus('Ready to execute', 'success');
      }, 1000);
    });
  }

  toggleButton.addEventListener('click', () => {
    if (isRunning) {
      executeStopAll();
    } else {
      executeRunAll();
    }
  });
  
  // Initialize status
  showStatus('Ready to execute', 'success');
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

