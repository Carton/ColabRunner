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
  console.log('[Katago Controller] 尝试找到并执行第一个代码单元...');

  // 方法1: 使用已验证的 colab-run-button（测试中证明有效）
  try {
    const runButtons = document.querySelectorAll('colab-run-button');
    console.log(`[Katago Controller] 找到 ${runButtons.length} 个 colab-run-button`);

    if (runButtons.length > 0) {
      const firstButton = runButtons[0];
      console.log('[Katago Controller] 找到第一个 colab-run-button，尝试点击:', firstButton);
      firstButton.click();
      console.log('[Katago Controller] ✅ 成功点击第一个 colab-run-button！');
      return true;
    }
  } catch (e) {
    console.error('[Katago Controller] colab-run-button 方法失败:', e);
  }

  // 方法2: 查找 .cell.code 代码单元（测试中也找到了）
  try {
    const codeCells = document.querySelectorAll('.cell.code');
    console.log(`[Katago Controller] 找到 ${codeCells.length} 个 .cell.code 元素`);

    if (codeCells.length > 0) {
      const firstCell = codeCells[0];
      console.log('[Katago Controller] 找到第一个代码单元，尝试在其中查找运行按钮');

      // 在代码单元内查找运行按钮
      const cellRunButton = firstCell.querySelector('colab-run-button, button[aria-label*="Run"], [role="button"]');
      if (cellRunButton) {
        console.log('[Katago Controller] 在代码单元内找到运行按钮，点击:', cellRunButton);
        cellRunButton.click();
        console.log('[Katago Controller] ✅ 成功点击代码单元内的运行按钮！');
        return true;
      }

      // 如果没找到按钮，尝试聚焦并发送快捷键
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
        console.log('[Katago Controller] ✅ 向第一个代码单元发送了 Shift+Enter');
      }, 100);

      return true;
    }
  } catch (e) {
    console.error('[Katago Controller] 代码单元方法失败:', e);
  }

  // 方法3: 备用方案 - 查找其他可能的运行按钮
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
        console.log(`[Katago Controller] 备用方案：使用选择器 "${selector}" 找到 ${buttons.length} 个按钮`);
        buttons[0].click();
        console.log('[Katago Controller] ✅ 备用方案成功点击！');
        return true;
      }
    }
  } catch (e) {
    console.error('[Katago Controller] 备用方案失败:', e);
  }

  console.warn('[Katago Controller] ❌ 所有方法都失败了，无法找到可执行的代码单元');
  return false;
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

