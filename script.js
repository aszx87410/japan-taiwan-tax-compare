const translations = {
  'pageTitle': {
    'zh-TW': '台日稅務比較計算器',
    'ja': '台日税務比較計算機',
    'en': 'Taiwan-Japan Tax Comparison Calculator'
  },
  'headerTitle': {
    'zh-TW': '台日稅務計算機',
    'ja': '台日税務計算機',
    'en': 'Taiwan-Japan Tax Calculator'
  },
  'exchangeRateLoading': {
    'zh-TW': '載入匯率中...',
    'ja': '為替レートを読み込み中...',
    'en': 'Loading exchange rate...'
  },
  'exchangeRateDisplay': {
    'zh-TW': '目前匯率：1日圓 = {rate} $',
    'ja': '現在の為替レート：1円 = {rate} $',
    'en': 'Current exchange rate: 1 JPY = {rate} $'
  },
  'exchangeRateDefault': {
    'zh-TW': ' (使用預設值)',
    'ja': ' (デフォルト値を使用)',
    'en': ' (using default value)'
  },
  'twdIncomeLabel': {
    'zh-TW': '台幣年收入（萬元）：',
    'ja': '台湾ドル年収（万円）：',
    'en': 'TWD Annual Income (10k):'
  },
  'twdIncomePlaceholder': {
    'zh-TW': '請輸入台幣金額',
    'ja': '台湾ドルの金額を入力してください',
    'en': 'Enter TWD amount'
  },
  'jpyIncomeLabel': {
    'zh-TW': '日幣年收入（萬元）：',
    'ja': '日本円年収（万円）：',
    'en': 'JPY Annual Income (10k):'
  },
  'jpyIncomePlaceholder': {
    'zh-TW': '請輸入日幣金額',
    'ja': '日本円の金額を入力してください',
    'en': 'Enter JPY amount'
  },
  'incomeUnit': {
    'zh-TW': '萬',
    'ja': '万',
    'en': '10k'
  },
  'twResultTitle': {
    'zh-TW': '台灣稅務計算結果',
    'ja': '台湾税務計算結果',
    'en': 'Taiwan Tax Calculation Results'
  },
  'jpResultTitle': {
    'zh-TW': '日本稅務計算結果',
    'ja': '日本税務計算結果',
    'en': 'Japan Tax Calculation Results'
  },
  'comparisonTableTitle': {
    'zh-TW': '台日稅務比較',
    'ja': '台日税務比較',
    'en': 'Taiwan-Japan Tax Comparison'
  },
  'tableHeaderItem': {
    'zh-TW': '項目',
    'ja': '項目',
    'en': 'Item'
  },
  'tableHeaderAmount': {
    'zh-TW': '金額',
    'ja': '金額',
    'en': 'Amount'
  },
  'tableHeaderTwAmount': {
    'zh-TW': '台幣換算',
    'ja': '台湾ドル換算',
    'en': 'TWD Equivalent'
  },
  'tableHeaderRate': {
    'zh-TW': '比例',
    'ja': '割合',
    'en': 'Percentage'
  },
  'tableHeaderDifference': {
    'zh-TW': '差額',
    'ja': '差額',
    'en': 'Difference'
  },
  'totalIncome': {
    'zh-TW': '總收入',
    'ja': '総収入',
    'en': 'Total Income'
  },
  'incomeTax': {
    'zh-TW': '所得稅',
    'ja': '所得税',
    'en': 'Income Tax'
  },
  'healthInsurance': {
    'zh-TW': '健保費',
    'ja': '健康保険料',
    'en': 'Health Insurance'
  },
  'laborInsurance': {
    'zh-TW': '勞保費',
    'ja': '労働保険料',
    'en': 'Labor Insurance'
  },
  'residentTax': {
    'zh-TW': '住民稅',
    'ja': '住民税',
    'en': 'Resident Tax'
  },
  'pensionInsurance': {
    'zh-TW': '厚生年金',
    'ja': '厚生年金',
    'en': 'Pension Insurance'
  },
  'employmentInsurance': {
    'zh-TW': '雇用保険料',
    'ja': '雇用保険料',
    'en': 'Employment Insurance'
  },
  'netIncome': {
    'zh-TW': '稅後所得',
    'ja': '税引後所得',
    'en': 'Net Income'
  },
  'totalAmount': {
    'zh-TW': '總計',
    'ja': '総計',
    'en': 'Total'
  },
  'footerGithubLink': {
    'zh-TW': 'GitHub 網址',
    'ja': 'GitHubリンク',
    'en': 'GitHub Link'
  },
  'apiError': {
    'zh-TW': '匯率 API 錯誤:',
    'ja': '為替レートAPIエラー:',
    'en': 'Exchange Rate API Error:'
  },
  'currentLanguage': { // For potential display or debugging
    'zh-TW': '目前語言',
    'ja': '現在の言語',
    'en': 'Current Language'
  },
  'langZhTw': {
    'zh-TW': '繁體中文',
    'ja': '繁体字中国語',
    'en': 'Traditional Chinese'
  },
  'langJa': {
    'zh-TW': '日本語',
    'ja': '日本語',
    'en': 'Japanese'
  },
  'langEn': {
    'zh-TW': 'English',
    'ja': '英語',
    'en': 'English'
  }
};

let currentLang = 'zh-TW'; // Default language

function getTranslation(key, lang = currentLang) {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  console.warn(`Translation not found for key: ${key}, lang: ${lang}`);
  return translations[key] ? (translations[key]['en'] || key) : key; // Fallback to English or key
}

function updateLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.title = getTranslation('pageTitle');

  // Update static elements
  document.querySelector('h1').textContent = getTranslation('headerTitle');
  document.getElementById('exchange-rate-display').textContent = getTranslation('exchangeRateLoading'); // Initial text
  
  const twdIncomeLabel = document.querySelector('label[for="twd-income"]');
  if (twdIncomeLabel) twdIncomeLabel.textContent = getTranslation('twdIncomeLabel');
  const twdIncomeInput = document.getElementById('twd-income');
  if (twdIncomeInput) {
    twdIncomeInput.placeholder = getTranslation('twdIncomePlaceholder');
    const unitSpan = twdIncomeInput.nextElementSibling;
    if (unitSpan && unitSpan.classList.contains('text-gray-500')) {
        unitSpan.textContent = getTranslation('incomeUnit');
    }
  }
  
  const jpyIncomeLabel = document.querySelector('label[for="jpy-income"]');
  if (jpyIncomeLabel) jpyIncomeLabel.textContent = getTranslation('jpyIncomeLabel');
  const jpyIncomeInput = document.getElementById('jpy-income');
  if (jpyIncomeInput) {
    jpyIncomeInput.placeholder = getTranslation('jpyIncomePlaceholder');
    const unitSpan = jpyIncomeInput.nextElementSibling;
    if (unitSpan && unitSpan.classList.contains('text-gray-500')) {
        unitSpan.textContent = getTranslation('incomeUnit');
    }
  }

  const twResultTitle = document.querySelector('#tw-result h2');
  if (twResultTitle) twResultTitle.textContent = getTranslation('twResultTitle');
  
  const jpResultTitle = document.querySelector('#jp-result h2');
  if (jpResultTitle) jpResultTitle.textContent = getTranslation('jpResultTitle');

  const comparisonTableTitle = document.querySelector('#comparison-table h2');
  if (comparisonTableTitle) comparisonTableTitle.textContent = getTranslation('comparisonTableTitle');
  
  const footerLink = document.querySelector('footer a');
  if (footerLink) footerLink.textContent = getTranslation('footerGithubLink');

  // For dynamically generated content, the respective functions will need to be updated
  // to use getTranslation. This function primarily handles static text.
  // Call updateExchangeRateDisplay here to reflect language change immediately if rate is already known.
  updateExchangeRateDisplay();

  // Update button texts
  const btnZhTw = document.getElementById('lang-zh-TW');
  if (btnZhTw) btnZhTw.textContent = getTranslation('langZhTw'); // Pass currentLang implicitly
  const btnJa = document.getElementById('lang-ja');
  if (btnJa) btnJa.textContent = getTranslation('langJa');
  const btnEn = document.getElementById('lang-en');
  if (btnEn) btnEn.textContent = getTranslation('langEn');

  // Update active button styling
  const buttons = ['lang-zh-TW', 'lang-ja', 'lang-en'];
  buttons.forEach(btnId => {
    const button = document.getElementById(btnId);
    if (button) {
      if (btnId === `lang-${lang}`) {
        button.classList.add('bg-blue-500', 'text-white');
        button.classList.remove('hover:bg-blue-100', 'bg-gray-200'); // Ensure hover/inactive styles are removed
      } else {
        button.classList.remove('bg-blue-500', 'text-white');
        button.classList.add('hover:bg-blue-100', 'bg-gray-200'); // Add inactive/hover styles
      }
    }
  });
}

function setLanguage(lang) {
  updateLanguage(lang);
  localStorage.setItem('language', lang);

  // Re-trigger calculations and UI updates to reflect the new language in dynamic content
  const twdIncomeInput = document.getElementById('twd-income');
  const jpyIncomeInput = document.getElementById('jpy-income');
  let currentTwdIncome = parseFloat(twdIncomeInput.value) * 10000;

  if (!isNaN(currentTwdIncome) && currentTwdIncome > 0) {
      calculateAndDisplay(currentTwdIncome);
  } else {
      let currentJpyIncome = parseFloat(jpyIncomeInput.value) * 10000;
      if (!isNaN(currentJpyIncome) && currentJpyIncome > 0) {
          calculateAndDisplay(currentJpyIncome * EXCHANGE_RATE); 
      } else {
          // Fallback: Re-run with a default value if both are empty or invalid
          const defaultJpyAmount = 1000 * 10000; // Default JPY income
          // Update input fields to reflect this default if they were empty
          jpyIncomeInput.value = (defaultJpyAmount / 10000).toFixed(2);
          twdIncomeInput.value = (defaultJpyAmount * EXCHANGE_RATE / 10000).toFixed(2);
          calculateAndDisplay(defaultJpyAmount * EXCHANGE_RATE);
      }
  }
}

// 匯率設定（這個值應該要定期更新）
let EXCHANGE_RATE = 0.22; // 預設值

// 稅率設定
const TW_TAX_BRACKETS = [
    { min: 0, max: 560000, rate: 0.05 },
    { min: 560001, max: 1260000, rate: 0.12 },
    { min: 1260001, max: 2520000, rate: 0.20 },
    { min: 2520001, max: 4720000, rate: 0.30 },
    { min: 4720001, max: Infinity, rate: 0.40 }
];

const JP_TAX_BRACKETS = [
    { min: 0, max: 1950000, rate: 0.05 },
    { min: 1950001, max: 3300000, rate: 0.10 },
    { min: 3300001, max: 6950000, rate: 0.20 },
    { min: 6950001, max: 9000000, rate: 0.23 },
    { min: 9000001, max: 18000000, rate: 0.33 },
    { min: 18000001, max: 40000000, rate: 0.40 },
    { min: 40000001, max: Infinity, rate: 0.45 }
];

// 在稅率設定後添加健保和勞保的設定
const TW_HEALTH_INSURANCE = {
    rate: 0.0558,  // 健保費率 5.58% (2024年1月起調整)
    personRatio: 0.3,  // 個人負擔比例 30%
    baseLimit: {
        min: 26400,    // 最低投保金額 (2024年1月起調整)
        max: 188000    // 最高投保金額 (2024年1月起調整)
    }
};

const TW_LABOR_INSURANCE = {
    rate: 0.12,    // 勞保費率 12% (2024年1月起調整，含就業保險1%)
    personRatio: 0.2,  // 個人負擔比例 20%
    baseLimit: {
        min: 26400,    // 最低投保金額 (2024年1月起調整)
        max: 47600     // 最高投保金額 (2024年1月起調整)
    }
};

// 在稅率設定後添加扣除額設定
const TW_DEDUCTIONS = {
    basic: 92000,        // 基本扣除額
    standard: 124000,    // 標準扣除額（單身）
    special: 200000,     // 特別扣除額（薪資所得特別扣除額）
    total: 416000        // 合計 (92000 + 124000 + 200000)
};

const JP_DEDUCTIONS = {
    basic: 480000,       // 給与所得控除額（基礎）
    // 給与所得控除額的計算方式
    calculateBasic: function(income) {
        if (income <= 1625000) return 550000;
        if (income <= 1800000) return income * 0.4 - 100000;
        if (income <= 3600000) return income * 0.3 + 80000;
        if (income <= 6600000) return income * 0.2 + 440000;
        if (income <= 8500000) return income * 0.1 + 1100000;
        return 1950000;  // 最高限額
    },
    basic_reduction: 480000  // 基礎控除額
};

// 在文件開頭添加圖表實例的存儲
const chartInstances = {
    'tw-chart': null,
    'jp-chart': null
};

// 修改日本的稅費設定
const JP_ADDITIONAL_TAX = {
    // 住民稅（道���民税4% + 市町村民税6%）
    resident: {
        rate: 0.10,
        basicDeduction: 430000  // 基礎控除額 43萬日圓
    },
    // 健康保険料（包含介護保険料）
    health: {
        rate: 0.0982,          // 健康保険料 9.82%
        personRatio: 0.5,      // 個人負擔一半
        maxMonthlyIncome: 1390000, // 標準報酬月額上限139萬日圓
        minMonthlyIncome: 58000 // 最低標準報酬月額
    },
    // 厚生年金
    pension: {
        rate: 0.1831,          // 18.31%
        personRatio: 0.5,      // 個人負擔一半
        maxMonthlyIncome: 650000,  // 標準報酬月額上限65萬日圓
        minMonthlyIncome: 88000    // 最低標準報酬月額
    },
    // 雇用保険
    employment: {
        rate: 0.01,           
        personRatio: 0.5,      // 個人負擔一半
    }
};

// 添加匯率 API 相關函數
async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/JPY');
        const data = await response.json();
        if (data && data.rates && data.rates.TWD) {
            EXCHANGE_RATE = data.rates.TWD;
            updateExchangeRateDisplay(); // This will now use translations
            return data.rates.TWD;
        }
        // Use getTranslation for the error message part
        throw new Error(getTranslation('apiError') + ' Invalid API response');
    } catch (error) {
        // The console error can remain in one language (e.g., English for developers)
        // or also be translated if desired, but typically console errors are for devs.
        console.error(getTranslation('apiError'), error.message);
        // Ensure EXCHANGE_RATE is set before calling updateExchangeRateDisplay if an error occurs
        EXCHANGE_RATE = 0.22; // Fallback to default if API fails
        updateExchangeRateDisplay(); // This will now use translations
        return 0.22; // 使用預設值
    }
}

// 添加匯率顯示更新函數
function updateExchangeRateDisplay() {
    const exchangeRateDisplay = document.getElementById('exchange-rate-display');
    if (exchangeRateDisplay) {
        let text = getTranslation('exchangeRateDisplay').replace('{rate}', EXCHANGE_RATE.toFixed(4));
        if (EXCHANGE_RATE === 0.22) { // Check if it's the default rate
            text += getTranslation('exchangeRateDefault');
        }
        exchangeRateDisplay.textContent = text;
    }
}

// 監聽輸入事件
document.getElementById('twd-income').addEventListener('input', function(e) {
    const twdAmount = (parseFloat(e.target.value) || 0) * 10000; // 轉換萬元為元
    document.getElementById('jpy-income').value = (twdAmount / EXCHANGE_RATE / 10000).toFixed(2); // 轉換為日幣萬元
    calculateAndDisplay(twdAmount, 'TWD');
});

document.getElementById('jpy-income').addEventListener('input', function(e) {
    const jpyAmount = (parseFloat(e.target.value) || 0) * 10000; // 轉換萬元為元
    document.getElementById('twd-income').value = (jpyAmount * EXCHANGE_RATE / 10000).toFixed(2); // 轉換為台幣萬元
    calculateAndDisplay(jpyAmount * EXCHANGE_RATE, 'TWD');
});

function calculateTax(income, brackets, isJP = false) {
    let totalTax = 0;
    let remainingIncome = income;
    const details = [];
    let healthInsurance = 0;
    let laborInsurance = 0;
    let residentTax = 0;
    let pensionInsurance = 0;
    let jpHealthInsurance = 0;
    let employmentInsurance = 0;
    let deductions = 0;

    if (isJP) {
        // 1. 先計算社會保險費
        // 計算健康保険料
        const monthlyIncomeForHealth = Math.min(
            Math.max(income / 12, JP_ADDITIONAL_TAX.health.minMonthlyIncome),
            JP_ADDITIONAL_TAX.health.maxMonthlyIncome
        );
        const healthInsuranceBase = monthlyIncomeForHealth * 12;
        jpHealthInsurance = healthInsuranceBase * 
            JP_ADDITIONAL_TAX.health.rate * 
            JP_ADDITIONAL_TAX.health.personRatio;

        // 計算厚生年金
        const monthlyIncomeForPension = Math.min(
            Math.max(income / 12, JP_ADDITIONAL_TAX.pension.minMonthlyIncome),
            JP_ADDITIONAL_TAX.pension.maxMonthlyIncome
        );
        pensionInsurance = monthlyIncomeForPension * 12 * 
            JP_ADDITIONAL_TAX.pension.rate * 
            JP_ADDITIONAL_TAX.pension.personRatio;

        // 計算雇用保険
        employmentInsurance = income * JP_ADDITIONAL_TAX.employment.rate * 
            JP_ADDITIONAL_TAX.employment.personRatio;

        // 2. 計算給与所得控除額
        const salaryDeduction = JP_DEDUCTIONS.calculateBasic(income);

        // 3. 計算課稅所得
        // 收入 - 社會保險費 - 給与所得控除額 - 基礎控除額
        const socialInsurance = jpHealthInsurance + pensionInsurance + employmentInsurance;
        const taxableIncome = Math.max(0, income - socialInsurance - salaryDeduction - JP_DEDUCTIONS.basic_reduction);
        
        // 4. 計算所得稅
        remainingIncome = taxableIncome;
        for (let i = 0; i < brackets.length; i++) {
            const bracket = brackets[i];
            const prevMin = i === 0 ? 0 : brackets[i-1].max;
            const taxableInThisBracket = Math.min(
                Math.max(0, remainingIncome),
                bracket.max - prevMin
            );
            
            const taxInBracket = taxableInThisBracket * bracket.rate;
            if (taxableInThisBracket > 0) {
                details.push({
                    bracket: `${prevMin.toLocaleString()} - ${bracket.max.toLocaleString()}`,
                    rate: bracket.rate * 100,
                    tax: taxInBracket
                });
            }
            
            totalTax += taxInBracket;
            remainingIncome -= taxableInThisBracket;
            
            if (remainingIncome <= 0) break;
        }

        // 5. 計算住民稅（使用相的稅所得）
        residentTax = taxableIncome * JP_ADDITIONAL_TAX.resident.rate;

    } else {
        // 台灣的計算保持不變...
        deductions = TW_DEDUCTIONS.total;
        remainingIncome = Math.max(0, income - deductions);

        const healthBase = Math.max(
            Math.min(income / 12, TW_HEALTH_INSURANCE.baseLimit.max),
            TW_HEALTH_INSURANCE.baseLimit.min
        );
        healthInsurance = healthBase * TW_HEALTH_INSURANCE.rate * TW_HEALTH_INSURANCE.personRatio * 12;

        const laborBase = Math.max(
            Math.min(income / 12, TW_LABOR_INSURANCE.baseLimit.max),
            TW_LABOR_INSURANCE.baseLimit.min
        );
        laborInsurance = laborBase * TW_LABOR_INSURANCE.rate * TW_LABOR_INSURANCE.personRatio * 12;

        // 計算所得稅
        for (let i = 0; i < brackets.length; i++) {
            const bracket = brackets[i];
            const prevMin = i === 0 ? 0 : brackets[i-1].max;
            const taxableInThisBracket = Math.min(
                Math.max(0, remainingIncome),
                bracket.max - prevMin
            );
            
            const taxInBracket = taxableInThisBracket * bracket.rate;
            if (taxableInThisBracket > 0) {
                details.push({
                    bracket: `${prevMin.toLocaleString()} - ${bracket.max.toLocaleString()}`,
                    rate: bracket.rate * 100,
                    tax: taxInBracket
                });
            }
            
            totalTax += taxInBracket;
            remainingIncome -= taxableInThisBracket;
            
            if (remainingIncome <= 0) break;
        }
    }

    return {
        totalTax,
        totalIncome: income,
        healthInsurance: isJP ? jpHealthInsurance : healthInsurance,
        laborInsurance,
        residentTax,
        pensionInsurance,
        employmentInsurance,
        deductions,
        totalDeduction: isJP ? 
            (totalTax + jpHealthInsurance + residentTax + pensionInsurance + employmentInsurance) :
            (totalTax + healthInsurance + laborInsurance),
        details
    };
}

function calculateAndDisplay(twdIncome) {
    const jpyIncome = twdIncome / EXCHANGE_RATE;
    
    // 計算台灣稅
    const twTax = calculateTax(twdIncome, TW_TAX_BRACKETS, false);
    // 計算日本稅
    const jpTax = calculateTax(jpyIncome, JP_TAX_BRACKETS, true);

    // 更新圖表
    updateCharts(twTax, jpTax, twdIncome, jpyIncome);
    
    // 更新詳細資訊
    updateDetails('tw-result', twTax, 'TWD');
    updateDetails('jp-result', jpTax, 'JPY');

    // 更新比較表
    updateComparisonTable(twTax, jpTax);
}

function updateDetails(elementId, taxInfo, currency) {
    const detailsDiv = document.querySelector(`#${elementId} .details`);
    const currencySymbol = currency === 'TWD' ? '$' : '¥';
    // Ensure titles for these sections are also updated if they are static and part of the details template
    const resultTitleEl = document.querySelector(`#${elementId} h2`);
    if (resultTitleEl) {
        resultTitleEl.textContent = currency === 'TWD' ? getTranslation('twResultTitle') : getTranslation('jpResultTitle');
    }
    
    const totalTaxInWan = (taxInfo.totalTax / 10000).toFixed(2);
    const totalIncomeInWan = (taxInfo.totalIncome / 10000).toFixed(2);
    const netIncomeInWan = ((taxInfo.totalIncome - taxInfo.totalDeduction) / 10000).toFixed(2);
    const taxRate = ((taxInfo.totalDeduction / taxInfo.totalIncome) * 100).toFixed(2);
    
    // 如果是日幣，計算台幣換算值
    const twdConversion = currency === 'JPY' ? {
        totalIncome: (totalIncomeInWan * EXCHANGE_RATE).toFixed(2),
        totalTax: (totalTaxInWan * EXCHANGE_RATE).toFixed(2),
        netIncome: (netIncomeInWan * EXCHANGE_RATE).toFixed(2)
    } : null;
    
    const incomeUnit = getTranslation('incomeUnit');
    const html = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderItem')}</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderAmount')}</th>
                        ${currency === 'JPY' ? `<th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderTwAmount')}</th>` : ''}
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderRate')}</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('totalIncome')}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${totalIncomeInWan}${incomeUnit}</td>
                        ${currency === 'JPY' ? `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${twdConversion.totalIncome}${incomeUnit}</td>` : ''}
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">100%</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('incomeTax')}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${totalTaxInWan}${incomeUnit}</td>
                        ${currency === 'JPY' ? `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${twdConversion.totalTax}${incomeUnit}</td>` : ''}
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.totalTax / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                    </tr>
                    ${currency === 'TWD' ? `
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('healthInsurance')}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.healthInsurance / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.healthInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('laborInsurance')}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.laborInsurance / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.laborInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                    ` : `
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('residentTax')}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.residentTax / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.residentTax * EXCHANGE_RATE / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.residentTax / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('healthInsurance')}</td> 
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.healthInsurance / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.healthInsurance * EXCHANGE_RATE / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.healthInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('pensionInsurance')}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.pensionInsurance / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.pensionInsurance * EXCHANGE_RATE / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.pensionInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('employmentInsurance')}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.employmentInsurance / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.employmentInsurance * EXCHANGE_RATE / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.employmentInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                    `}
                    <tr class="bg-gray-50 font-medium">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${getTranslation('netIncome')}</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${netIncomeInWan}${incomeUnit}</td>
                        ${currency === 'JPY' ? `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${twdConversion.netIncome}${incomeUnit}</td>` : ''}
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${(100 - taxRate).toFixed(2)}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    detailsDiv.innerHTML = html;
}

function updateCharts(twTax, jpTax, twdIncome, jpyIncome) {
    // 更新台灣圖表
    updatePieChart('tw-chart', twTax, twdIncome, 'TWD');
    // 更新日本圖表
    updatePieChart('jp-chart', jpTax, jpyIncome, 'JPY');
}

function updatePieChart(canvasId, taxInfo, income, currency) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const netIncome = income - taxInfo.totalDeduction;
    const taxRate = ((taxInfo.totalDeduction / income) * 100).toFixed(2);
    const netRate = (100 - taxRate).toFixed(2);
    
    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }
    
    const incomeUnit = getTranslation('incomeUnit');
    let data, labels, colors;

    if (currency === 'TWD') {
        data = [
            netIncome,
            taxInfo.totalTax,
            taxInfo.healthInsurance,
            taxInfo.laborInsurance
        ];
        labels = [
            `${getTranslation('netIncome')} (${netRate}%)`,
            `${getTranslation('incomeTax')} (${((taxInfo.totalTax / income) * 100).toFixed(2)}%)`,
            `${getTranslation('healthInsurance')} (${((taxInfo.healthInsurance / income) * 100).toFixed(2)}%)`,
            `${getTranslation('laborInsurance')} (${((taxInfo.laborInsurance / income) * 100).toFixed(2)}%)`
        ];
        colors = ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0'];
    } else { // JPY
        data = [
            netIncome,
            taxInfo.totalTax,
            taxInfo.residentTax,
            taxInfo.healthInsurance,
            taxInfo.pensionInsurance,
            taxInfo.employmentInsurance
        ];
        labels = [
            `${getTranslation('netIncome')} (${netRate}%)`,
            `${getTranslation('incomeTax')} (${((taxInfo.totalTax / income) * 100).toFixed(2)}%)`,
            `${getTranslation('residentTax')} (${((taxInfo.residentTax / income) * 100).toFixed(2)}%)`,
            `${getTranslation('healthInsurance')} (${((taxInfo.healthInsurance / income) * 100).toFixed(2)}%)`, // Japanese health insurance
            `${getTranslation('pensionInsurance')} (${((taxInfo.pensionInsurance / income) * 100).toFixed(2)}%)`,
            `${getTranslation('employmentInsurance')} (${((taxInfo.employmentInsurance / income) * 100).toFixed(2)}%)`
        ];
        colors = ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'];
    }
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw / 10000;
                            const currencySymbol = currency === 'TWD' ? '$' : '¥';
                            // Extract the base label (e.g., "Net Income") from the full label ("Net Income (50.00%)")
                            const baseLabel = context.label.substring(0, context.label.lastIndexOf('(')).trim();
                            return `${baseLabel}: ${currencySymbol}${value.toFixed(2)}${incomeUnit}`;
                        }
                    }
                }
            }
        }
    });
}

// 添加比較表更新函數
function updateComparisonTable(twTax, jpTax) {
    const comparisonDiv = document.getElementById('comparison-table');
    const comparisonTableTitleEl = comparisonDiv.querySelector('h2');
    if (comparisonTableTitleEl) {
        comparisonTableTitleEl.textContent = getTranslation('comparisonTableTitle');
    } else { // If title doesn't exist, create it (first time call)
        const titleEl = document.createElement('h2');
        titleEl.className = "text-xl font-semibold mb-4 text-gray-800";
        titleEl.textContent = getTranslation('comparisonTableTitle');
        // Prepend title to comparisonDiv if it's empty or structure is known
        if (comparisonDiv.firstChild) {
            comparisonDiv.insertBefore(titleEl, comparisonDiv.firstChild);
        } else {
            comparisonDiv.appendChild(titleEl);
        }
    }
    
    // 計算日本的勞保總額（厚生年金 + 雇用保險）
    const jpLaborTotal = jpTax.pensionInsurance + jpTax.employmentInsurance;
    
    // 準備比較數據
    const incomeUnit = getTranslation('incomeUnit');
    const comparisons = [
        {
            name: getTranslation('incomeTax'),
            tw: twTax.totalTax,
            jp: jpTax.totalTax * EXCHANGE_RATE,
            twRate: (twTax.totalTax / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpTax.totalTax / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: getTranslation('healthInsurance'), // This will be "Health Insurance" for both, specific names if needed are in details
            tw: twTax.healthInsurance,
            jp: jpTax.healthInsurance * EXCHANGE_RATE,
            twRate: (twTax.healthInsurance / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpTax.healthInsurance / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: getTranslation('laborInsurance'), // This will be "Labor Insurance" for TW, and a sum for JP
            tw: twTax.laborInsurance,
            jp: jpLaborTotal * EXCHANGE_RATE, // jpLaborTotal is sum of pension and employment
            twRate: (twTax.laborInsurance / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpLaborTotal / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: getTranslation('residentTax'),
            tw: 0, // Taiwan doesn't have a direct equivalent itemized this way at national level comparison
            jp: jpTax.residentTax * EXCHANGE_RATE,
            twRate: '0.00',
            jpRate: (jpTax.residentTax / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: getTranslation('totalAmount'),
            tw: twTax.totalDeduction,
            jp: jpTax.totalDeduction * EXCHANGE_RATE,
            twRate: (twTax.totalDeduction / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpTax.totalDeduction / jpTax.totalIncome * 100).toFixed(2)
        }
    ];
    
    // Ensure the h2 title for the comparison table is also translated
    const tableTitleElement = comparisonDiv.querySelector('h2.text-xl.font-semibold');
    if (tableTitleElement) {
        tableTitleElement.textContent = getTranslation('comparisonTableTitle');
    }


    // Check if the table already exists. If so, just update content. Otherwise, create.
    let tableContainer = comparisonDiv.querySelector('.overflow-x-auto');
    if (!tableContainer) {
        // Clear previous content (e.g., if it was just a title) and build new
        comparisonDiv.innerHTML = ''; // Clear if we are rebuilding structure
        const titleEl = document.createElement('h2');
        titleEl.className = "text-xl font-semibold mb-4 text-gray-800";
        titleEl.textContent = getTranslation('comparisonTableTitle');
        comparisonDiv.appendChild(titleEl);

        tableContainer = document.createElement('div');
        tableContainer.className = 'overflow-x-auto';
        comparisonDiv.appendChild(tableContainer);
    }


    const html = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderItem')}</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TW ${getTranslation('tableHeaderAmount')}</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderRate')}</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">JP ${getTranslation('tableHeaderAmount')} (TWD)</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderRate')}</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">${getTranslation('tableHeaderDifference')} (TWD)</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${comparisons.map((item, index) => `
                        <tr class="${index === comparisons.length - 1 ? 'bg-gray-50 font-medium' : ''}">
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${item.name}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(item.tw / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${item.twRate}%</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(item.jp / 10000).toFixed(2)}${incomeUnit}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${item.jpRate}%</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm ${(item.jp - item.tw) > 0 ? 'text-red-600' : 'text-green-600'} text-right">
                                $${((item.jp - item.tw) / 10000).toFixed(2)}${incomeUnit}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
    `;
    // comparisonDiv.innerHTML = html; // This was overwriting the title if title was outside overflow-x-auto
    tableContainer.innerHTML = html; // Place the table inside its container
}

document.addEventListener('DOMContentLoaded', async function() {
    // Language persistence
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        setLanguage(savedLang); // This will call updateLanguage and re-calculate
    } else {
        setLanguage('zh-TW'); // Default language, also calls updateLanguage and re-calculate
    }
    // Note: setLanguage now handles the initial calculation, so the original fetchExchangeRate and calculateAndDisplay calls
    // here might be redundant or need to be carefully placed.
    // Let's ensure fetchExchangeRate is called if not already handled by setLanguage's calculateAndDisplay chain.
    // The current setLanguage calls calculateAndDisplay, which uses EXCHANGE_RATE.
    // So, fetchExchangeRate should ideally complete before setLanguage's calculateAndDisplay is hit.

    // Initial fetch of exchange rate, then set language (which will trigger calculation)
    // This is a bit tricky because setLanguage itself triggers calculateAndDisplay.
    // We need the rate first.
    
    // The logic in setLanguage will call calculateAndDisplay.
    // calculateAndDisplay uses EXCHANGE_RATE.
    // So, EXCHANGE_RATE must be known.
    // The original code:
    // 1. fetchExchangeRate() -> sets global EXCHANGE_RATE, calls updateExchangeRateDisplay()
    // 2. set default input values
    // 3. calculateAndDisplay()
    // With language loading:
    // 1. Load lang from localStorage (or default) -> currentLang is set
    // 2. updateLanguage(currentLang) -> updates static text.
    // 3. fetchExchangeRate() -> sets global EXCHANGE_RATE, calls updateExchangeRateDisplay() (which now uses currentLang)
    // 4. Set input values (either default or from localStorage if we were saving them)
    // 5. calculateAndDisplay() (which now uses currentLang for its sub-component updates)

    // Revised sequence:
    // 1. Determine language (from localStorage or default to 'zh-TW'). This sets `currentLang`.
    //    `updateLanguage(currentLang)` is called to apply static translations *immediately*.
    const languageToLoad = localStorage.getItem('language') || 'zh-TW';
    currentLang = languageToLoad; // Set global currentLang first
    updateLanguage(currentLang); // Apply static translations

    // 2. Fetch exchange rate. This will update the display using the `currentLang`.
    await fetchExchangeRate(); // Sets global EXCHANGE_RATE and calls updateExchangeRateDisplay

    // 3. Set default input values or restore them if they were saved (not implemented here)
    //    Then call setLanguage which will re-calculate and update dynamic UI with the chosen language.
    //    If setLanguage was already called to load from localStorage, this might be redundant.
    //    Let's refine: setLanguage should be the primary function to set a language and trigger all updates.

    if (savedLang) {
        setLanguage(savedLang); // This will call updateLanguage, save to LS (again, but fine), and re-calculate
    } else {
        setLanguage('zh-TW'); // Default language
    }
    // The setLanguage function now handles setting input values if they are blank, then calls calculateAndDisplay.
    // This ensures that the first calculation happens *after* language is set and *after* exchange rate is fetched (implicitly, as calculateAndDisplay uses it).

    // The interval should also ensure that when it recalculates, the current language is respected.
    // Since calculateAndDisplay and its sub-functions are now language-aware, this should be fine.
    setInterval(async () => {
        await fetchExchangeRate(); // Update rate
        // Re-trigger calculation using existing values; it will use currentLang
        const twdIncomeInput = document.getElementById('twd-income');
        const jpyIncomeInput = document.getElementById('jpy-income');
        let currentTwdIncome = parseFloat(twdIncomeInput.value) * 10000;

        if (!isNaN(currentTwdIncome) && currentTwdIncome > 0) {
            calculateAndDisplay(currentTwdIncome);
        } else {
            let currentJpyIncome = parseFloat(jpyIncomeInput.value) * 10000;
            if (!isNaN(currentJpyIncome) && currentJpyIncome > 0) {
                calculateAndDisplay(currentJpyIncome * EXCHANGE_RATE);
            } else {
                // Fallback if inputs somehow got cleared
                const defaultJpyAmount = 1000 * 10000;
                jpyIncomeInput.value = (defaultJpyAmount / 10000).toFixed(2);
                twdIncomeInput.value = (defaultJpyAmount * EXCHANGE_RATE / 10000).toFixed(2);
                calculateAndDisplay(defaultJpyAmount * EXCHANGE_RATE);
            }
        }
    }, 3600000); // 3600000 毫秒 = 1 小時
});