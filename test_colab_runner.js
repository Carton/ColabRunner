// 简单的 Colab 代码执行测试脚本
// 直接在 Colab 页面的控制台中粘贴运行

(function() {
  console.log('=== Colab 代码执行测试开始 ===');

  // 测试方法1: 查找运行按钮
  function testRunButtons() {
    console.log('\n--- 测试方法1: 查找运行按钮 ---');
    const selectors = [
      'button[aria-label*="Run cell"]',
      'button[aria-label*="Run"]',
      'button[title*="Run"]',
      'colab-run-button',
      'paper-icon-button[icon="av:play-arrow"]',
      'button[data-tooltip*="Run"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`选择器 "${selector}": 找到 ${elements.length} 个元素`);
      if (elements.length > 0) {
        console.log('第一个元素:', elements[0]);
      }
    }
  }

  // 测试方法2: 查找代码单元
  function testCodeCells() {
    console.log('\n--- 测试方法2: 查找代码单元 ---');
    const selectors = [
      '.code-cell',
      '[data-type="code"]',
      '.cell.code',
      'div[class*="cell"]',
      '.notebook-cell'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      console.log(`选择器 "${selector}": 找到 ${elements.length} 个元素`);
      if (elements.length > 0) {
        console.log('第一个元素:', elements[0]);
      }
    }
  }

  // 测试方法3: 查找所有可能的执行相关元素
  function testAllExecutionElements() {
    console.log('\n--- 测试方法3: 查找所有执行相关元素 ---');
    const allButtons = document.querySelectorAll('button, paper-icon-button, iron-icon, [role="button"]');
    let found = 0;

    allButtons.forEach((button, index) => {
      const text = (button.textContent || '').toLowerCase();
      const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
      const title = (button.getAttribute('title') || '').toLowerCase();
      const icon = button.getAttribute('icon') || '';

      if (text.includes('run') || ariaLabel.includes('run') || title.includes('run') ||
          text.includes('执行') || ariaLabel.includes('执行') || title.includes('执行') ||
          icon.includes('play')) {
        console.log(`找到执行相关按钮 ${found++}:`, {
          element: button,
          text: text,
          ariaLabel: ariaLabel,
          title: title,
          icon: icon
        });
      }
    });

    console.log(`总共找到 ${found} 个可能的执行按钮`);
  }

  // 实际执行第一个代码单元
  function executeFirstCell() {
    console.log('\n--- 尝试执行第一个代码单元 ---');

    // 方法1: 查找并点击第一个运行按钮
    const runSelectors = [
      'button[aria-label*="Run"]',
      'colab-run-button',
      'paper-icon-button[icon="av:play-arrow"]'
    ];

    for (const selector of runSelectors) {
      const buttons = document.querySelectorAll(selector);
      if (buttons.length > 0) {
        console.log(`使用选择器 "${selector}" 找到运行按钮，尝试点击...`);
        buttons[0].click();
        console.log('✅ 点击成功！');
        return true;
      }
    }

    // 方法2: 查找代码单元并发送快捷键
    const cellSelectors = ['.code-cell', '[data-type="code"]', '.cell'];
    for (const selector of cellSelectors) {
      const cells = document.querySelectorAll(selector);
      if (cells.length > 0) {
        console.log(`使用选择器 "${selector}" 找到代码单元，尝试发送 Shift+Enter...`);
        const firstCell = cells[0];
        firstCell.focus();
        firstCell.click();

        setTimeout(() => {
          const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            shiftKey: true,
            bubbles: true,
            cancelable: true
          });
          firstCell.dispatchEvent(event);
          document.dispatchEvent(event);
          console.log('✅ 快捷键发送成功！');
        }, 100);
        return true;
      }
    }

    console.log('❌ 所有方法都失败了');
    return false;
  }

  // 运行所有测试
  testRunButtons();
  testCodeCells();
  testAllExecutionElements();

  console.log('\n=== 测试完成，现在尝试执行 ===');
  executeFirstCell();

  console.log('\n=== 如果想手动执行第一个代码单元，请运行: ===');
  console.log('executeFirstCell()');

  // 将函数暴露到全局作用域
  window.executeFirstCell = executeFirstCell;
  window.testRunButtons = testRunButtons;
  window.testCodeCells = testCodeCells;
  window.testAllExecutionElements = testAllExecutionElements;
})();