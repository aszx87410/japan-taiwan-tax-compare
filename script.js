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
            updateExchangeRateDisplay();
            return data.rates.TWD;
        }
        throw new Error('Invalid API response');
    } catch (error) {
        console.error('匯率 API 錯誤:', error);
        updateExchangeRateDisplay();
        return 0.22; // 使用預設值
    }
}

// 添加匯率顯示更新函數
function updateExchangeRateDisplay() {
    const exchangeRateDisplay = document.getElementById('exchange-rate-display');
    if (exchangeRateDisplay) {
        exchangeRateDisplay.textContent = `目前匯率：1日圓 = ${EXCHANGE_RATE.toFixed(4)} $`;
        if (EXCHANGE_RATE === 0.22) {
            exchangeRateDisplay.textContent += ' (使用預設值)';
        }
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
    
    const html = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                        ${currency === 'JPY' ? '<th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">台幣換算</th>' : ''}
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">比例</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">總收入</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${totalIncomeInWan}萬</td>
                        ${currency === 'JPY' ? `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${twdConversion.totalIncome}萬</td>` : ''}
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">100%</td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">所得稅</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${totalTaxInWan}萬</td>
                        ${currency === 'JPY' ? `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${twdConversion.totalTax}萬</td>` : ''}
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.totalTax / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                    </tr>
                    ${currency === 'TWD' ? `
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">健保費</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.healthInsurance / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.healthInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">勞保費</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.laborInsurance / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.laborInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                    ` : `
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">住民稅</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.residentTax / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.residentTax * EXCHANGE_RATE / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.residentTax / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">健康保険料</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.healthInsurance / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.healthInsurance * EXCHANGE_RATE / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.healthInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">厚生年金</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.pensionInsurance / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.pensionInsurance * EXCHANGE_RATE / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.pensionInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">雇用保険料</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${(taxInfo.employmentInsurance / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(taxInfo.employmentInsurance * EXCHANGE_RATE / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${((taxInfo.employmentInsurance / taxInfo.totalIncome) * 100).toFixed(2)}%</td>
                        </tr>
                    `}
                    <tr class="bg-gray-50 font-medium">
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">稅後所得</td>
                        <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${currencySymbol}${netIncomeInWan}萬</td>
                        ${currency === 'JPY' ? `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${twdConversion.netIncome}萬</td>` : ''}
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
    
    const data = currency === 'TWD' ? 
        [
            netIncome,
            taxInfo.totalTax,
            taxInfo.healthInsurance,
            taxInfo.laborInsurance
        ] :
        [
            netIncome,
            taxInfo.totalTax,
            taxInfo.residentTax,
            taxInfo.healthInsurance,
            taxInfo.pensionInsurance,
            taxInfo.employmentInsurance
        ];

    const labels = currency === 'TWD' ?
        [
            `稅後所得 (${netRate}%)`,
            `所得稅 (${((taxInfo.totalTax / income) * 100).toFixed(2)}%)`,
            `健保費 (${((taxInfo.healthInsurance / income) * 100).toFixed(2)}%)`,
            `勞保費 (${((taxInfo.laborInsurance / income) * 100).toFixed(2)}%)`
        ] :
        [
            `稅後所得 (${netRate}%)`,
            `所得稅 (${((taxInfo.totalTax / income) * 100).toFixed(2)}%)`,
            `住民稅 (${((taxInfo.residentTax / income) * 100).toFixed(2)}%)`,
            `健康保険料 (${((taxInfo.healthInsurance / income) * 100).toFixed(2)}%)`,
            `厚生年金 (${((taxInfo.pensionInsurance / income) * 100).toFixed(2)}%)`,
            `雇用保険料 (${((taxInfo.employmentInsurance / income) * 100).toFixed(2)}%)`
        ];

    const colors = currency === 'TWD' ?
        ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0'] :
        ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'];
    
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
                            return `${context.label}: ${currencySymbol}${value.toFixed(2)}萬`;
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
    
    // 計算日本的勞保總額（厚生年金 + 雇用保險）
    const jpLaborTotal = jpTax.pensionInsurance + jpTax.employmentInsurance;
    
    // 準備比較數據
    const comparisons = [
        {
            name: '所得稅',
            tw: twTax.totalTax,
            jp: jpTax.totalTax * EXCHANGE_RATE,
            twRate: (twTax.totalTax / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpTax.totalTax / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: '健保費',
            tw: twTax.healthInsurance,
            jp: jpTax.healthInsurance * EXCHANGE_RATE,
            twRate: (twTax.healthInsurance / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpTax.healthInsurance / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: '勞保費',
            tw: twTax.laborInsurance,
            jp: jpLaborTotal * EXCHANGE_RATE,
            twRate: (twTax.laborInsurance / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpLaborTotal / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: '住民稅',
            tw: 0,
            jp: jpTax.residentTax * EXCHANGE_RATE,
            twRate: '0.00',
            jpRate: (jpTax.residentTax / jpTax.totalIncome * 100).toFixed(2)
        },
        {
            name: '總計',
            tw: twTax.totalDeduction,
            jp: jpTax.totalDeduction * EXCHANGE_RATE,
            twRate: (twTax.totalDeduction / twTax.totalIncome * 100).toFixed(2),
            jpRate: (jpTax.totalDeduction / jpTax.totalIncome * 100).toFixed(2)
        }
    ];

    const html = `
        <div class="overflow-x-auto">
            <h2 class="text-xl font-semibold mb-4 text-gray-800">台日稅務比較</h2>
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">台灣金額</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">比例</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">日本金額</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">比例</th>
                        <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">差額</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${comparisons.map((item, index) => `
                        <tr class="${index === comparisons.length - 1 ? 'bg-gray-50 font-medium' : ''}">
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900">${item.name}</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(item.tw / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${item.twRate}%</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">$${(item.jp / 10000).toFixed(2)}萬</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">${item.jpRate}%</td>
                            <td class="px-4 py-2 whitespace-nowrap text-sm ${(item.jp - item.tw) > 0 ? 'text-red-600' : 'text-green-600'} text-right">
                                $${((item.jp - item.tw) / 10000).toFixed(2)}萬
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    comparisonDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', async function() {
    // 先獲取最新匯率
    EXCHANGE_RATE = await fetchExchangeRate();
    
    // 設定預設值並進行計算
    const jpyInput = document.getElementById('jpy-income');
    jpyInput.value = "1000";  // 預設 1000 萬日圓
    const jpyAmount = 1000 * 10000; // 轉換為日圓
    document.getElementById('twd-income').value = (jpyAmount * EXCHANGE_RATE / 10000).toFixed(2);
    calculateAndDisplay(jpyAmount * EXCHANGE_RATE, 'TWD');

    // 每小時更新一次匯率
    setInterval(async () => {
        EXCHANGE_RATE = await fetchExchangeRate();
        // 使用當前輸入值重新計算
        const currentJpyValue = parseFloat(document.getElementById('jpy-income').value) || 0;
        const jpyAmount = currentJpyValue * 10000;
        document.getElementById('twd-income').value = (jpyAmount * EXCHANGE_RATE / 10000).toFixed(2);
        calculateAndDisplay(jpyAmount * EXCHANGE_RATE, 'TWD');
    }, 3600000); // 3600000 毫秒 = 1 小時
}); 