// Internationalization system
let translations = {};
let currentLanguage = window.APP_LOCALE || document.documentElement.lang || 'zh-TW';
let EXCHANGE_RATE = 0.22;
let currentProfileId = 'single';
let comparisonCurrency = 'TWD';
let currentTwdIncome = 0;
const latestTaxResults = {
    taiwan: null,
    japan: null
};
let activeBracketTables = [];

const chartInstances = {
    'tw-chart': null,
    'jp-chart': null
};

async function loadTranslations() {
    const response = await fetch('translations.json');
    if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`);
    }
    translations = await response.json();
}

function t(key, replacements = []) {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key;
        }
    }

    if (typeof value === 'string') {
        let index = 0;
        return value.replace(/\{\}/g, () => {
            return index < replacements.length ? replacements[index++] : '{}';
        });
    }

    return key;
}

function getInputUnitScale() {
    return currentLanguage === 'en' ? 1 : 10000;
}

function formatInputValue(amount) {
    const scale = getInputUnitScale();
    if (scale === 1) {
        return String(Math.round(amount));
    }

    return (amount / scale).toFixed(2);
}

function formatMoney(amount, currency) {
    const symbol = currency === 'JPY' ? '¥' : '$';

    if (currentLanguage === 'en') {
        const absoluteAmount = Math.abs(amount);
        if (absoluteAmount >= 1000) {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                notation: 'compact',
                maximumFractionDigits: 2
            });
            return formatter.format(amount);
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0
        }).format(amount);
    }

    const value = (amount / 10000).toFixed(2);
    return `${symbol}${value}萬`;
}

function formatTwdConversion(amountInJpy) {
    return formatMoney(amountInJpy * EXCHANGE_RATE, 'TWD');
}

function convertedAmount(amount, fromCurrency, mode = comparisonCurrency) {
    if (mode === 'native' || fromCurrency === mode) {
        return { amount, currency: fromCurrency };
    }

    if (fromCurrency === 'JPY' && mode === 'TWD') {
        return { amount: amount * EXCHANGE_RATE, currency: 'TWD' };
    }

    if (fromCurrency === 'TWD' && mode === 'JPY') {
        return { amount: amount / EXCHANGE_RATE, currency: 'JPY' };
    }

    return { amount, currency: fromCurrency };
}

function formatRate(numerator, denominator) {
    if (!denominator) return '0.00%';
    return `${(numerator / denominator * 100).toFixed(2)}%`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function updatePageLanguage() {
    document.documentElement.lang = currentLanguage;
    document.title = t('meta.title');

    const description = document.querySelector('meta[name="description"]');
    if (description) {
        description.content = t('meta.description');
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });

    updateExchangeRateDisplay();
    renderProfileOptions();
    renderSources();
}

function updateActiveLanguage() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLanguage);
    });
}

function renderProfileOptions() {
    const profileButtons = document.getElementById('profile-options');
    if (!profileButtons || !window.TaxRules) return;

    profileButtons.innerHTML = window.TaxRules.PROFILE_ORDER.map(profileId => {
        const active = profileId === currentProfileId;
        return `
            <button class="lang-btn profile-btn${active ? ' active' : ''}"
                    type="button"
                    role="radio"
                    aria-checked="${active}"
                    data-profile-option="${profileId}">
                ${t(`profiles.${profileId}`)}
            </button>
        `;
    }).join('');
}

function renderSources() {
    const sourcesList = document.getElementById('sources-list');
    if (!sourcesList || !window.TaxRules) return;

    sourcesList.innerHTML = window.TaxRules.SOURCES.map(source => `
        <li>
            <span>${t(`sources.${source.country}`)}：</span>
            <a href="${source.url}" target="_blank" rel="noopener noreferrer">${t(source.labelKey)}</a>
        </li>
    `).join('');
}

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
        return 0.22;
    }
}

function updateExchangeRateDisplay() {
    const exchangeRateDisplay = document.getElementById('exchange-rate-display');
    if (!exchangeRateDisplay) return;

    exchangeRateDisplay.textContent = t('main.current_rate', [EXCHANGE_RATE.toFixed(4)]);
    if (EXCHANGE_RATE === 0.22) {
        exchangeRateDisplay.textContent += t('main.default_rate');
    }
}

function calculateAndDisplay(twdIncome) {
    currentTwdIncome = Math.max(0, Math.round(twdIncome || 0));
    const jpyIncome = currentTwdIncome / EXCHANGE_RATE;
    const twTax = window.TaxRules.calculateTaiwanTax(currentTwdIncome, currentProfileId);
    const jpTax = window.TaxRules.calculateJapanTax(jpyIncome, currentProfileId);
    latestTaxResults.taiwan = twTax;
    latestTaxResults.japan = jpTax;

    updateCharts(twTax, jpTax, currentTwdIncome, jpyIncome);
    updateDetails('tw-result', twTax, 'TWD');
    updateDetails('jp-result', jpTax, 'JPY');
    updateComparisonTable(twTax, jpTax);
}

function summaryRowsForTaxInfo(taxInfo, currency) {
    if (taxInfo.country === 'taiwan') {
        return [
            { key: 'results.total_income', amount: taxInfo.totalIncome },
            { key: 'results.income_tax', amount: taxInfo.incomeTax },
            { key: 'results.health_insurance', amount: taxInfo.healthInsurance },
            { key: 'results.labor_insurance', amount: taxInfo.laborInsurance },
            { key: 'results.employment_insurance', amount: taxInfo.employmentInsurance },
            { key: 'results.total_deductions', amount: taxInfo.totalDeduction },
            { key: 'results.net_income', amount: taxInfo.netIncome, summary: true }
        ];
    }

    return [
        { key: 'results.total_income', amount: taxInfo.totalIncome },
        { key: 'results.income_tax', amount: taxInfo.incomeTax },
        { key: 'results.resident_tax', amount: taxInfo.residentTax },
        { key: 'results.jp_health_insurance', amount: taxInfo.healthInsurance },
        { key: 'results.pension_insurance', amount: taxInfo.pensionInsurance },
        { key: 'results.employment_insurance', amount: taxInfo.employmentInsurance },
        { key: 'results.total_deductions', amount: taxInfo.totalDeduction },
        { key: 'results.net_income', amount: taxInfo.netIncome, summary: true }
    ];
}

function renderAmountCell(amount, currency, income) {
    const convertedCell = currency === 'JPY'
        ? `<td class="text-right">${formatTwdConversion(amount)}</td>`
        : '';

    return `
        <td class="text-right">${formatMoney(amount, currency)}</td>
        ${convertedCell}
        <td class="text-right">${formatRate(amount, income)}</td>
    `;
}

function updateDetails(elementId, taxInfo, currency) {
    const detailsDiv = document.querySelector(`#${elementId} .details`);
    if (!detailsDiv) return;

    const country = taxInfo.country;
    const toggleButton = document.querySelector(`[data-detail-toggle="${country}"]`);
    if (toggleButton) {
        toggleButton.textContent = t('details.show');
        toggleButton.setAttribute('aria-expanded', 'false');
    }

    const twdHeader = currentLanguage === 'zh-TW' ? '台幣' : currentLanguage === 'ja' ? '台湾ドル' : 'TWD';
    const tableClass = currency === 'JPY' ? 'data-table detail-table detail-table-jp' : 'data-table detail-table';
    const summaryRows = summaryRowsForTaxInfo(taxInfo, currency);

    detailsDiv.innerHTML = `
        <div class="table-scroll">
            <table class="${tableClass}">
                <thead>
                    <tr>
                        <th scope="col" class="text-left">${t('results.category')}</th>
                        <th scope="col" class="text-right">${t('results.amount')}</th>
                        ${currency === 'JPY' ? `<th scope="col" class="text-right">${twdHeader}</th>` : ''}
                        <th scope="col" class="text-right">${t('results.ratio')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${summaryRows.map(row => `
                        <tr class="${row.summary ? 'summary-row' : ''}">
                            <td>${t(row.key)}</td>
                            ${renderAmountCell(row.amount, currency, taxInfo.totalIncome)}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderCalculationSections(taxInfo, currency) {
    const sections = taxInfo.sections || [];
    return sections.map(section => `
        <section class="calculation-section">
            <h3 class="calculation-title">${t(section.titleKey)}</h3>
            <p class="calculation-intro">${t(section.introKey)}</p>
            <div class="table-scroll">
                <table class="data-table calculation-table">
                    <thead>
                        <tr>
                            <th scope="col" class="text-left">${t('details.operation')}</th>
                            <th scope="col" class="text-left">${t('details.item')}</th>
                            <th scope="col" class="text-right">${t('details.amount')}</th>
                            <th scope="col" class="text-left">${t('details.formula')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${section.rows.map(row => {
                            const formula = [row.formula, row.noteKey ? t(row.noteKey) : '']
                                .filter(Boolean)
                                .join(' · ');
                            const bracketButton = row.bracketTable
                                ? `<button class="bracket-link" type="button" data-bracket-index="${registerBracketTable(row.bracketTable)}">${t('details.view_brackets')}</button>`
                                : '';
                            if (row.operation === 'result') {
                                return `
                                    <tr class="calculation-row calculation-row-result">
                                        <td class="calculation-result-cell" colspan="4">
                                            <div class="calculation-result-grid">
                                                <div><span class="operation-pill operation-result">${t('details.operations.result')}</span></div>
                                                <div>${t(row.labelKey)}</div>
                                                <div class="text-right">${formatMoney(row.amount, currency)}</div>
                                                <div class="formula-cell">
                                                    <div>${formula || '-'}</div>
                                                    ${bracketButton}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }
                            return `
                                <tr class="calculation-row calculation-row-${row.operation}">
                                    <td><span class="operation-pill operation-${row.operation}">${t(`details.operations.${row.operation}`)}</span></td>
                                    <td>${t(row.labelKey)}</td>
                                    <td class="text-right">${formatMoney(row.amount, currency)}</td>
                                    <td class="formula-cell">
                                        <div>${formula || '-'}</div>
                                        ${bracketButton}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </section>
    `).join('');
}

function registerBracketTable(table) {
    const index = activeBracketTables.length;
    activeBracketTables.push(table);
    return index;
}

function openCalculationModal(country) {
    const taxInfo = latestTaxResults[country];
    if (!taxInfo) return;

    activeBracketTables = [];
    const currency = country === 'japan' ? 'JPY' : 'TWD';
    const titleKey = country === 'japan' ? 'results.japan_title' : 'results.taiwan_title';
    openModal('calculation-modal', t('details.modal_title', [t(titleKey)]), renderCalculationSections(taxInfo, currency));
}

function openBracketModal(index) {
    const table = activeBracketTables[index];
    if (!table) return;

    const html = `
        <div class="table-scroll">
            <table class="data-table bracket-table">
                <thead>
                    <tr>
                        ${table.columns.map(columnKey => `<th scope="col" class="text-left">${t(columnKey)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${table.rows.map(row => `
                        <tr class="${row.active ? 'active-bracket-row' : ''}">
                            ${row.cells.map(cell => `<td>${cell}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <p class="bracket-note">${t('brackets.highlight_note')}</p>
    `;
    openModal('bracket-modal', t(table.titleKey), html);
}

function openModal(rootId, title, html) {
    const root = document.getElementById(rootId);
    if (!root) return;

    root.querySelector('.modal-title').textContent = title;
    root.querySelector('.modal-body').innerHTML = html;
    root.hidden = false;
    document.body.classList.add('modal-open');
}

function closeModal(rootId) {
    const root = document.getElementById(rootId);
    if (!root) return;

    root.hidden = true;
    root.querySelector('.modal-body').innerHTML = '';

    if (rootId === 'calculation-modal') {
        activeBracketTables = [];
        closeModal('bracket-modal');
    }

    const calculationOpen = !document.getElementById('calculation-modal')?.hidden;
    const bracketOpen = !document.getElementById('bracket-modal')?.hidden;
    if (!calculationOpen && !bracketOpen) {
        document.body.classList.remove('modal-open');
    }
}

function updateCharts(twTax, jpTax, twdIncome, jpyIncome) {
    updatePieChart('tw-chart', twTax, twdIncome, 'TWD');
    updatePieChart('jp-chart', jpTax, jpyIncome, 'JPY');
}

function updatePieChart(canvasId, taxInfo, income, currency) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const netIncome = Math.max(0, income - taxInfo.totalDeduction);
    const netRate = income ? (100 - (taxInfo.totalDeduction / income * 100)).toFixed(2) : '0.00';

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    const rows = currency === 'TWD'
        ? [
            { key: 'results.net_income', amount: netIncome },
            { key: 'results.income_tax', amount: taxInfo.incomeTax },
            { key: 'results.health_insurance', amount: taxInfo.healthInsurance },
            { key: 'results.labor_insurance', amount: taxInfo.laborInsurance },
            { key: 'results.employment_insurance', amount: taxInfo.employmentInsurance }
        ]
        : [
            { key: 'results.net_income', amount: netIncome },
            { key: 'results.income_tax', amount: taxInfo.incomeTax },
            { key: 'results.resident_tax', amount: taxInfo.residentTax },
            { key: 'results.jp_health_insurance', amount: taxInfo.healthInsurance },
            { key: 'results.pension_insurance', amount: taxInfo.pensionInsurance },
            { key: 'results.employment_insurance', amount: taxInfo.employmentInsurance }
        ];

    const labels = rows.map(row => {
        const ratio = row.key === 'results.net_income' ? netRate : (income ? (row.amount / income * 100).toFixed(2) : '0.00');
        return `${t(row.key)} (${ratio}%)`;
    });

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: rows.map(row => row.amount),
                backgroundColor: ['#2563eb', '#e11d48', '#f59e0b', '#10b981', '#7c3aed', '#f97316']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            return `${context.label}: ${formatMoney(context.raw, currency)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateComparisonTable(twTax, jpTax) {
    const comparisonDiv = document.getElementById('comparison-table');
    if (!comparisonDiv) return;

    const ratioLabel = t('results.ratio');
    const differenceLabel = t('results.difference');
    const taiwanLabel = t('results.taiwan');
    const japanLabel = t('results.japan');
    const twIncome = twTax.totalIncome;
    const currencyOptions = ['TWD', 'JPY', 'native'];
    const convertedJpIncomeTwd = jpTax.totalIncome * EXCHANGE_RATE;
    const convertedTwIncomeJpy = twTax.totalIncome / EXCHANGE_RATE;

    function displayComparisonAmount(amount, sourceCurrency) {
        const converted = convertedAmount(amount, sourceCurrency);
        return formatMoney(converted.amount, converted.currency);
    }

    function comparisonDifference(twAmount, jpAmount) {
        if (comparisonCurrency === 'native') {
            return {
                value: null,
                text: t('results.not_applicable'),
                className: 'amount-neutral'
            };
        }

        const tw = convertedAmount(twAmount, 'TWD').amount;
        const jp = convertedAmount(jpAmount, 'JPY').amount;
        const diff = jp - tw;
        return {
            value: diff,
            text: formatMoney(diff, comparisonCurrency),
            className: diff > 0 ? 'amount-positive' : 'amount-negative'
        };
    }

    const comparisons = [
        {
            name: t('results.income_tax'),
            tw: twTax.incomeTax,
            jp: jpTax.incomeTax,
            twRate: formatRate(twTax.incomeTax, twIncome),
            jpRate: formatRate(jpTax.incomeTax, jpTax.totalIncome)
        },
        {
            name: t('results.resident_tax'),
            tw: 0,
            jp: jpTax.residentTax,
            twRate: '0.00%',
            jpRate: formatRate(jpTax.residentTax, jpTax.totalIncome)
        },
        {
            name: t('results.health_insurance'),
            tw: twTax.healthInsurance,
            jp: jpTax.healthInsurance,
            twRate: formatRate(twTax.healthInsurance, twIncome),
            jpRate: formatRate(jpTax.healthInsurance, jpTax.totalIncome)
        },
        {
            name: t('results.pension_labor_insurance'),
            tw: twTax.laborInsurance,
            jp: jpTax.pensionInsurance,
            twRate: formatRate(twTax.laborInsurance, twIncome),
            jpRate: formatRate(jpTax.pensionInsurance, jpTax.totalIncome)
        },
        {
            name: t('results.employment_insurance'),
            tw: twTax.employmentInsurance,
            jp: jpTax.employmentInsurance,
            twRate: formatRate(twTax.employmentInsurance, twIncome),
            jpRate: formatRate(jpTax.employmentInsurance, jpTax.totalIncome)
        },
        {
            name: t('results.total_deductions'),
            tw: twTax.totalDeduction,
            jp: jpTax.totalDeduction,
            twRate: formatRate(twTax.totalDeduction, twIncome),
            jpRate: formatRate(jpTax.totalDeduction, jpTax.totalIncome),
            summary: true
        },
        {
            name: t('results.net_income'),
            tw: twTax.netIncome,
            jp: jpTax.netIncome,
            twRate: formatRate(twTax.netIncome, twIncome),
            jpRate: formatRate(jpTax.netIncome, jpTax.totalIncome),
            summary: true
        }
    ];

    const comparisonNoteKey = comparisonCurrency === 'TWD'
        ? 'results.comparison_note_twd'
        : comparisonCurrency === 'JPY'
            ? 'results.comparison_note_jpy'
            : 'results.comparison_note_native';
    const comparisonNoteValue = comparisonCurrency === 'TWD'
        ? currentLanguage === 'en' ? formatMoney(convertedJpIncomeTwd, 'TWD') : (convertedJpIncomeTwd / 10000).toFixed(2)
        : comparisonCurrency === 'JPY'
            ? currentLanguage === 'en' ? formatMoney(convertedTwIncomeJpy, 'JPY') : (convertedTwIncomeJpy / 10000).toFixed(2)
            : '';
    const comparisonHeaders = comparisonCurrency === 'native'
        ? {
            taiwan: `${taiwanLabel} (${t('results.currency_twd')})`,
            japan: `${japanLabel} (${t('results.currency_jpy')})`
        }
        : {
            taiwan: `${taiwanLabel} (${t(`results.currency_${comparisonCurrency.toLowerCase()}`)})`,
            japan: `${japanLabel} (${t(`results.currency_${comparisonCurrency.toLowerCase()}`)})`
        };

    comparisonDiv.innerHTML = `
        <div class="comparison-header">
            <div>
                <div class="title-with-action">
                    <h2 class="comparison-title">${t('results.comparison_title')}</h2>
                    <button class="share-toggle" type="button" data-share-target="comparison">${t('share.button')}</button>
                </div>
                <div class="comparison-subtitle">${t('profiles.current', [t(`profiles.${currentProfileId}`)])}</div>
            </div>
            <div class="comparison-currency-control" role="radiogroup" aria-label="${t('results.currency_mode')}">
                ${currencyOptions.map(option => {
                    const active = comparisonCurrency === option;
                    return `
                        <button class="lang-btn currency-btn${active ? ' active' : ''}"
                                type="button"
                                role="radio"
                                aria-checked="${active}"
                                data-comparison-currency="${option}">
                            ${t(`results.currency_${option.toLowerCase()}`)}
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
        <div class="table-scroll">
            <table class="data-table comparison-table">
                <thead>
                    <tr>
                        <th scope="col" class="text-left">${t('results.category')}</th>
                        <th scope="col" class="text-right">${comparisonHeaders.taiwan}</th>
                        <th scope="col" class="text-right">${ratioLabel}</th>
                        <th scope="col" class="text-right">${comparisonHeaders.japan}</th>
                        <th scope="col" class="text-right">${ratioLabel}</th>
                        <th scope="col" class="text-right">${differenceLabel}</th>
                    </tr>
                </thead>
                <tbody>
                    ${comparisons.map(item => {
                        const difference = comparisonDifference(item.tw, item.jp);
                        return `
                            <tr class="${item.summary ? 'summary-row' : ''}">
                                <td data-label="${t('results.category')}">${item.name}</td>
                                <td data-label="${comparisonHeaders.taiwan}" class="text-right">${displayComparisonAmount(item.tw, 'TWD')}</td>
                                <td data-label="${comparisonHeaders.taiwan} ${ratioLabel}" class="text-right">${item.twRate}</td>
                                <td data-label="${comparisonHeaders.japan}" class="text-right">${displayComparisonAmount(item.jp, 'JPY')}</td>
                                <td data-label="${comparisonHeaders.japan} ${ratioLabel}" class="text-right">${item.jpRate}</td>
                                <td data-label="${differenceLabel}" class="${difference.className} text-right">${difference.text}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="comparison-note">${t(comparisonNoteKey, comparisonNoteValue ? [comparisonNoteValue] : [])}</div>
    `;
}

function drawShareCard(payload) {
    const width = 1200;
    const rowHeight = 58;
    const height = 240 + payload.rows.length * rowHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(40, 40, width - 80, height - 80, 28);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.font = '700 42px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(payload.title, 78, 105, width - 156);

    ctx.fillStyle = '#4b5563';
    ctx.font = '500 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(payload.subtitle, 80, 150, width - 160);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 190);
    ctx.lineTo(width - 80, 190);
    ctx.stroke();

    ctx.font = '700 22px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#6b7280';
    payload.columns.forEach(column => {
        ctx.textAlign = column.align || 'left';
        ctx.fillText(column.label, column.x, 225, column.maxWidth);
    });

    payload.rows.forEach((row, rowIndex) => {
        const y = 270 + rowIndex * rowHeight;
        if (row.summary) {
            ctx.fillStyle = '#f9fafb';
            ctx.fillRect(70, y - 34, width - 140, rowHeight);
        }

        ctx.fillStyle = row.summary ? '#111827' : '#374151';
        ctx.font = `${row.summary ? '800' : '600'} 24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        row.cells.forEach((cell, cellIndex) => {
            const column = payload.columns[cellIndex];
            ctx.textAlign = column.align || 'left';
            ctx.fillText(cell, column.x, y, column.maxWidth);
        });

        ctx.strokeStyle = '#eef2f7';
        ctx.beginPath();
        ctx.moveTo(80, y + 20);
        ctx.lineTo(width - 80, y + 20);
        ctx.stroke();
    });

    return canvas.toDataURL('image/png');
}

function shareSubtitle() {
    return t('share.subtitle', [
        t(`profiles.${currentProfileId}`),
        EXCHANGE_RATE.toFixed(4)
    ]);
}

function buildSummarySharePayload(country) {
    const taxInfo = latestTaxResults[country];
    if (!taxInfo) return null;

    const currency = country === 'japan' ? 'JPY' : 'TWD';
    const titleKey = country === 'japan' ? 'results.japan_title' : 'results.taiwan_title';
    const rows = summaryRowsForTaxInfo(taxInfo, currency).map(row => {
        const amount = formatMoney(row.amount, currency);
        return {
            summary: row.summary || row.key === 'results.total_deductions',
            cells: [
                t(row.key),
                amount,
                formatRate(row.amount, taxInfo.totalIncome)
            ]
        };
    });

    return {
        title: t(titleKey),
        subtitle: shareSubtitle(),
        columns: [
            { label: t('results.category'), x: 80, maxWidth: 420 },
            { label: t('results.amount'), x: 760, align: 'right', maxWidth: 360 },
            { label: t('results.ratio'), x: 1080, align: 'right', maxWidth: 140 }
        ],
        rows
    };
}

function buildComparisonSharePayload() {
    const twTax = latestTaxResults.taiwan;
    const jpTax = latestTaxResults.japan;
    if (!twTax || !jpTax) return null;

    const comparisonRows = [
        [t('results.income_tax'), twTax.incomeTax, jpTax.incomeTax],
        [t('results.resident_tax'), 0, jpTax.residentTax],
        [t('results.health_insurance'), twTax.healthInsurance, jpTax.healthInsurance],
        [t('results.pension_labor_insurance'), twTax.laborInsurance, jpTax.pensionInsurance],
        [t('results.employment_insurance'), twTax.employmentInsurance, jpTax.employmentInsurance],
        [t('results.total_deductions'), twTax.totalDeduction, jpTax.totalDeduction, true],
        [t('results.net_income'), twTax.netIncome, jpTax.netIncome, true]
    ];

    return {
        title: t('results.comparison_title'),
        subtitle: shareSubtitle(),
        columns: [
            { label: t('results.category'), x: 80, maxWidth: 300 },
            { label: t('results.taiwan'), x: 520, align: 'right', maxWidth: 210 },
            { label: t('results.japan'), x: 790, align: 'right', maxWidth: 210 },
            { label: t('results.difference'), x: 1080, align: 'right', maxWidth: 240 }
        ],
        rows: comparisonRows.map(([label, twAmount, jpAmount, summary]) => {
            const convertedJp = jpAmount * EXCHANGE_RATE;
            return {
                summary: Boolean(summary),
                cells: [
                    label,
                    formatMoney(twAmount, 'TWD'),
                    formatMoney(convertedJp, 'TWD'),
                    formatMoney(convertedJp - twAmount, 'TWD')
                ]
            };
        })
    };
}

function openShareModal(target) {
    const payload = target === 'comparison'
        ? buildComparisonSharePayload()
        : buildSummarySharePayload(target);
    if (!payload) return;

    const dataUrl = drawShareCard(payload);
    const fileName = `tax-${target}-${currentProfileId}.png`;
    const html = `
        <div class="share-preview">
            <img src="${dataUrl}" alt="${escapeHtml(t('share.generated_alt'))}">
            <a class="share-download" href="${dataUrl}" download="${escapeHtml(fileName)}">${t('share.download')}</a>
        </div>
    `;
    openModal('share-modal', t('share.modal_title', [payload.title]), html);
}

function recalculateFromJpyInput() {
    const currentJpyValue = parseFloat(document.getElementById('jpy-income').value) || 0;
    const jpyAmount = currentJpyValue * getInputUnitScale();
    document.getElementById('twd-income').value = formatInputValue(jpyAmount * EXCHANGE_RATE);
    calculateAndDisplay(jpyAmount * EXCHANGE_RATE);
}

function bindEvents() {
    document.getElementById('twd-income').addEventListener('input', event => {
        const twdAmount = (parseFloat(event.target.value) || 0) * getInputUnitScale();
        document.getElementById('jpy-income').value = formatInputValue(twdAmount / EXCHANGE_RATE);
        calculateAndDisplay(twdAmount);
    });

    document.getElementById('jpy-income').addEventListener('input', event => {
        const jpyAmount = (parseFloat(event.target.value) || 0) * getInputUnitScale();
        document.getElementById('twd-income').value = formatInputValue(jpyAmount * EXCHANGE_RATE);
        calculateAndDisplay(jpyAmount * EXCHANGE_RATE);
    });

    document.addEventListener('click', event => {
        const bracketButton = event.target.closest('[data-bracket-index]');
        if (bracketButton) {
            openBracketModal(Number(bracketButton.getAttribute('data-bracket-index')));
            return;
        }

        const closeButton = event.target.closest('[data-modal-close]');
        if (closeButton) {
            const modal = closeButton.closest('.modal-root');
            if (modal) {
                closeModal(modal.id);
            }
            return;
        }

        const profileButton = event.target.closest('[data-profile-option]');
        if (profileButton) {
            currentProfileId = profileButton.getAttribute('data-profile-option');
            renderProfileOptions();
            calculateAndDisplay(currentTwdIncome);
            return;
        }

        const currencyButton = event.target.closest('[data-comparison-currency]');
        if (currencyButton) {
            comparisonCurrency = currencyButton.getAttribute('data-comparison-currency');
            calculateAndDisplay(currentTwdIncome);
            return;
        }

        const shareButton = event.target.closest('[data-share-target]');
        if (shareButton) {
            openShareModal(shareButton.getAttribute('data-share-target'));
            return;
        }

        const button = event.target.closest('[data-detail-toggle]');
        if (!button) return;

        const country = button.getAttribute('data-detail-toggle');
        openCalculationModal(country);
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;

        if (!document.getElementById('bracket-modal')?.hidden) {
            closeModal('bracket-modal');
            return;
        }

        if (!document.getElementById('calculation-modal')?.hidden) {
            closeModal('calculation-modal');
            return;
        }

        if (!document.getElementById('share-modal')?.hidden) {
            closeModal('share-modal');
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadTranslations();
    } catch (error) {
        console.error('翻譯檔載入失敗:', error);
    }

    updateActiveLanguage();
    updatePageLanguage();
    bindEvents();

    EXCHANGE_RATE = await fetchExchangeRate();

    const jpyInput = document.getElementById('jpy-income');
    jpyInput.value = formatInputValue(10000000);
    recalculateFromJpyInput();

    setInterval(async () => {
        EXCHANGE_RATE = await fetchExchangeRate();
        recalculateFromJpyInput();
    }, 3600000);
});
