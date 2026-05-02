(function () {
    const PROFILES = {
        single: {
            id: 'single',
            spouse: false,
            childrenUnder6: 0,
            householdMembers: 1
        },
        married_no_child: {
            id: 'married_no_child',
            spouse: true,
            childrenUnder6: 0,
            householdMembers: 2
        },
        married_one_child_age_3: {
            id: 'married_one_child_age_3',
            spouse: true,
            childrenUnder6: 1,
            householdMembers: 3
        }
    };

    const PROFILE_ORDER = [
        'single',
        'married_no_child',
        'married_one_child_age_3'
    ];

    const SOURCES = [
        {
            country: 'taiwan',
            labelKey: 'sources.tw_income_tax',
            url: 'https://www.mof.gov.tw/singlehtml/384fb3077bb349ea973e7fc6f13b6974?cntId=e6bfc90ed42e42ccbcd83be96e331afc'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_basic_living',
            url: 'https://www.dot.gov.tw/singlehtml/ch26?cntId=7e174aba28b34a4b8df93cadadef6ec9'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_nhi_formula',
            url: 'https://www.nhi.gov.tw/ch/cp-3277-6c895-2588-1.html'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_nhi_eligibility',
            url: 'https://www.nhi.gov.tw/ch/cp-7678-9b5bd-3255-1.html'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_nhi_grades',
            url: 'https://www.nhi.gov.tw/ch/cp-19421-f9533-2569-1.html'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_labor_rate',
            url: 'https://www.bli.gov.tw/0005478.htm'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_labor_grades',
            url: 'https://www.bli.gov.tw/0100493.html'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_labor_part_time',
            url: 'https://www.bli.gov.tw/0006920.html'
        },
        {
            country: 'taiwan',
            labelKey: 'sources.tw_employment',
            url: 'https://www.bli.gov.tw/0006443.html'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_income_tax',
            url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm?ts=20220101111633'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_basic_deduction',
            url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_salary_deduction',
            url: 'https://www.nta.go.jp/users/gensen/2025kiso/index.htm?s=09'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_resident_tax',
            url: 'https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ju.html?referral=a8'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_health_rate',
            url: 'https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/rate_prefectures/r08/index.html'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_health_table',
            url: 'https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/premium_prefectures/r08/index.html'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_social_eligibility',
            url: 'https://www.mhlw.go.jp/tekiyoukakudai/qa/'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_social_threshold_2026',
            url: 'https://www.mhlw.go.jp/content/12500000/001633788.pdf'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_pension',
            url: 'https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20150515-01.html'
        },
        {
            country: 'japan',
            labelKey: 'sources.jp_employment',
            url: 'https://www.mhlw.go.jp/content/001692566.pdf'
        }
    ];

    const TW_TAX = {
        exemptionPerPerson: 97000,
        standardDeductionSingle: 131000,
        standardDeductionMarried: 262000,
        salarySpecialDeductionCap: 218000,
        preschoolDeductionFirstChild: 150000,
        basicLivingPerPerson: 213000,
        brackets: [
            { min: 0, max: 590000, rate: 0.05, quickDeduction: 0 },
            { min: 590001, max: 1330000, rate: 0.12, quickDeduction: 41300 },
            { min: 1330001, max: 2660000, rate: 0.20, quickDeduction: 147700 },
            { min: 2660001, max: 4980000, rate: 0.30, quickDeduction: 413700 },
            { min: 4980001, max: Infinity, rate: 0.40, quickDeduction: 911700 }
        ],
        health: {
            rate: 0.0517,
            employeeShare: 0.3
        },
        labor: {
            rate: 0.115,
            employeeShare: 0.2
        },
        employment: {
            rate: 0.01,
            employeeShare: 0.2
        }
    };

    const TW_NHI_GRADES = [
        29500, 30300, 31800, 33300, 34800, 36300, 38200, 40100, 42000, 43900,
        45800, 48200, 50600, 53000, 55400, 57800, 60800, 63800, 66800, 69800,
        72800, 76500, 80200, 83900, 87600, 92100, 96600, 101100, 105600, 110100,
        115500, 120900, 126300, 131700, 137100, 142500, 147900, 150000, 156400,
        162800, 169200, 175600, 182000, 189500, 197000, 204500, 212000, 219500,
        228200, 236900, 245600, 254300, 263000, 273000, 283000, 293000, 303000,
        313000
    ];

    const TW_LABOR_GRADES = [
        11100, 12540, 13500, 15840, 16500, 17280, 17880, 19047, 20008, 21009,
        22000, 23100, 24000,
        29500, 30300, 31800, 33300, 34800, 36300, 38200, 40100, 42000, 43900,
        45800
    ];

    const JP_TAX = {
        incomeBrackets: [
            { min: 1000, max: 1949000, rate: 0.05, quickDeduction: 0 },
            { min: 1950000, max: 3299000, rate: 0.10, quickDeduction: 97500 },
            { min: 3300000, max: 6949000, rate: 0.20, quickDeduction: 427500 },
            { min: 6950000, max: 8999000, rate: 0.23, quickDeduction: 636000 },
            { min: 9000000, max: 17999000, rate: 0.33, quickDeduction: 1536000 },
            { min: 18000000, max: 39999000, rate: 0.40, quickDeduction: 2796000 },
            { min: 40000000, max: Infinity, rate: 0.45, quickDeduction: 4796000 }
        ],
        reconstructionRate: 0.021,
        residentTax: {
            incomeRate: 0.10,
            perCapita: 5000,
            nonTaxableSingleIncome: 450000,
            nonTaxableBaseWithDependents: 310000,
            nonTaxableMultiplier: 350000
        },
        health: {
            tokyoRate: 0.0985,
            employeeShare: 0.5
        },
        pension: {
            rate: 0.183,
            employeeShare: 0.5
        },
        employeeSocialInsurance: {
            shortTimeMonthlyWageThreshold: 88000
        },
        employment: {
            workerRate: 0.005
        }
    };

    const JP_HEALTH_GRADES = [
        58000, 68000, 78000, 88000, 98000, 104000, 110000, 118000, 126000, 134000,
        142000, 150000, 160000, 170000, 180000, 190000, 200000, 220000, 240000,
        260000, 280000, 300000, 320000, 340000, 360000, 380000, 410000, 440000,
        470000, 500000, 530000, 560000, 590000, 620000, 650000, 680000, 710000,
        750000, 790000, 830000, 880000, 930000, 980000, 1030000, 1090000,
        1150000, 1210000, 1270000, 1330000, 1390000
    ];

    const JP_PENSION_GRADES = [
        88000, 98000, 104000, 110000, 118000, 126000, 134000, 142000, 150000,
        160000, 170000, 180000, 190000, 200000, 220000, 240000, 260000, 280000,
        300000, 320000, 340000, 360000, 380000, 410000, 440000, 470000, 500000,
        530000, 560000, 590000, 620000, 650000
    ];

    const JP_SALARY_DEDUCTION_BRACKETS = [
        { min: 0, max: 1900000, formula: '650,000', deduction: 650000 },
        { min: 1900001, max: 3600000, formula: 'income x 30% + 80,000' },
        { min: 3600001, max: 6600000, formula: 'income x 20% + 440,000' },
        { min: 6600001, max: 8500000, formula: 'income x 10% + 1,100,000' },
        { min: 8500001, max: Infinity, formula: '1,950,000', deduction: 1950000 }
    ];

    const JP_BASIC_DEDUCTION_BRACKETS = [
        { min: 0, max: 1320000, deduction: 950000 },
        { min: 1320001, max: 3360000, deduction: 880000 },
        { min: 3360001, max: 4890000, deduction: 680000 },
        { min: 4890001, max: 6550000, deduction: 630000 },
        { min: 6550001, max: 23500000, deduction: 580000 },
        { min: 23500001, max: 24000000, deduction: 480000 },
        { min: 24000001, max: 24500000, deduction: 320000 },
        { min: 24500001, max: 25000000, deduction: 160000 },
        { min: 25000001, max: Infinity, deduction: 0 }
    ];

    const JP_RESIDENT_BASIC_DEDUCTION_BRACKETS = [
        { min: 0, max: 24000000, deduction: 430000 },
        { min: 24000001, max: 24500000, deduction: 290000 },
        { min: 24500001, max: 25000000, deduction: 150000 },
        { min: 25000001, max: Infinity, deduction: 0 }
    ];

    const JP_SPOUSE_DEDUCTION_BRACKETS = [
        { min: 0, max: 9000000, incomeTaxDeduction: 380000, residentTaxDeduction: 330000 },
        { min: 9000001, max: 9500000, incomeTaxDeduction: 260000, residentTaxDeduction: 220000 },
        { min: 9500001, max: 10000000, incomeTaxDeduction: 130000, residentTaxDeduction: 110000 },
        { min: 10000001, max: Infinity, incomeTaxDeduction: 0, residentTaxDeduction: 0 }
    ];

    function getProfile(profileId) {
        return PROFILES[profileId] || PROFILES.single;
    }

    function roundCurrency(value) {
        return Math.max(0, Math.round(value));
    }

    function floorTo(value, unit) {
        return Math.max(0, Math.floor(value / unit) * unit);
    }

    function formatNumber(value) {
        return roundCurrency(value).toLocaleString('en-US');
    }

    function formatPercent(value) {
        return `${(value * 100).toFixed(2)}%`;
    }

    function formatRange(min, max) {
        if (max === Infinity) {
            return `${formatNumber(min)}+`;
        }
        return `${formatNumber(min)} - ${formatNumber(max)}`;
    }

    function resolveUpperGrade(monthlyIncome, grades) {
        for (const grade of grades) {
            if (monthlyIncome <= grade) {
                return grade;
            }
        }
        return grades[grades.length - 1];
    }

    function resolveStandardMonthly(monthlyIncome, grades) {
        for (let index = 0; index < grades.length - 1; index += 1) {
            const upperBoundary = (grades[index] + grades[index + 1]) / 2;
            if (monthlyIncome < upperBoundary) {
                return grades[index];
            }
        }
        return grades[grades.length - 1];
    }

    function calculateQuickTax(taxableIncome, brackets) {
        if (taxableIncome <= 0) {
            return {
                tax: 0,
                rate: 0,
                quickDeduction: 0,
                bracket: brackets[0]
            };
        }

        const bracket = brackets.find(item => taxableIncome <= item.max) || brackets[brackets.length - 1];
        const tax = taxableIncome * bracket.rate - bracket.quickDeduction;
        return {
            tax: roundCurrency(tax),
            rate: bracket.rate,
            quickDeduction: bracket.quickDeduction,
            bracket
        };
    }

    function calculateJapanSalaryDeduction(grossIncome) {
        if (grossIncome <= 1900000) return 650000;
        if (grossIncome <= 3600000) return grossIncome * 0.3 + 80000;
        if (grossIncome <= 6600000) return grossIncome * 0.2 + 440000;
        if (grossIncome <= 8500000) return grossIncome * 0.1 + 1100000;
        return 1950000;
    }

    function calculateJapanBasicDeduction(totalIncome) {
        if (totalIncome <= 1320000) return 950000;
        if (totalIncome <= 3360000) return 880000;
        if (totalIncome <= 4890000) return 680000;
        if (totalIncome <= 6550000) return 630000;
        if (totalIncome <= 23500000) return 580000;
        if (totalIncome <= 24000000) return 480000;
        if (totalIncome <= 24500000) return 320000;
        if (totalIncome <= 25000000) return 160000;
        return 0;
    }

    function calculateJapanResidentBasicDeduction(totalIncome) {
        if (totalIncome <= 24000000) return 430000;
        if (totalIncome <= 24500000) return 290000;
        if (totalIncome <= 25000000) return 150000;
        return 0;
    }

    function calculateJapanSpouseDeduction(totalIncome, profile, residentTax = false) {
        if (!profile.spouse) return 0;
        if (totalIncome <= 9000000) return residentTax ? 330000 : 380000;
        if (totalIncome <= 9500000) return residentTax ? 220000 : 260000;
        if (totalIncome <= 10000000) return residentTax ? 110000 : 130000;
        return 0;
    }

    function calculateResidentAdjustmentDeduction(residentTaxableIncome, deductionDifference) {
        if (residentTaxableIncome <= 0 || deductionDifference <= 0) {
            return 0;
        }

        if (residentTaxableIncome <= 2000000) {
            return roundCurrency(Math.min(deductionDifference, residentTaxableIncome) * 0.05);
        }

        return roundCurrency(Math.max((deductionDifference - (residentTaxableIncome - 2000000)) * 0.05, 2500));
    }

    function makeRow(labelKey, amount, formula) {
        return { labelKey, amount: roundCurrency(amount), formula };
    }

    function makeCalcRow(labelKey, amount, operation, formula, noteKey) {
        return {
            labelKey,
            amount: roundCurrency(amount),
            operation,
            formula,
            noteKey
        };
    }

    function withBracketTable(row, bracketTable) {
        return {
            ...row,
            bracketTable
        };
    }

    function makeSection(titleKey, introKey, rows) {
        return { titleKey, introKey, rows };
    }

    function makeIncomeTaxBracketTable(titleKey, brackets, activeBracket) {
        return {
            titleKey,
            columns: ['brackets.range', 'brackets.rate', 'brackets.quick_deduction'],
            rows: brackets.map(bracket => ({
                active: bracket === activeBracket,
                cells: [
                    formatRange(bracket.min, bracket.max),
                    formatPercent(bracket.rate),
                    formatNumber(bracket.quickDeduction)
                ]
            }))
        };
    }

    function makeSimpleGradeTable(titleKey, grades, activeValue) {
        return {
            titleKey,
            columns: ['brackets.grade', 'brackets.monthly_amount'],
            rows: grades.map((grade, index) => ({
                active: grade === activeValue,
                cells: [String(index + 1), formatNumber(grade)]
            }))
        };
    }

    function makeSalaryDeductionTable(activeIncome) {
        return {
            titleKey: 'brackets.jp_salary_deduction_title',
            columns: ['brackets.range', 'brackets.formula'],
            rows: JP_SALARY_DEDUCTION_BRACKETS.map(bracket => ({
                active: activeIncome >= bracket.min && activeIncome <= bracket.max,
                cells: [formatRange(bracket.min, bracket.max), bracket.formula]
            }))
        };
    }

    function makeDeductionTable(titleKey, brackets, activeIncome, deductionKey = 'deduction') {
        return {
            titleKey,
            columns: ['brackets.range', 'brackets.deduction'],
            rows: brackets.map(bracket => ({
                active: activeIncome >= bracket.min && activeIncome <= bracket.max,
                cells: [formatRange(bracket.min, bracket.max), formatNumber(bracket[deductionKey])]
            }))
        };
    }

    function makeSpouseDeductionTable(activeIncome, residentTax = false) {
        const deductionKey = residentTax ? 'residentTaxDeduction' : 'incomeTaxDeduction';
        return {
            titleKey: residentTax ? 'brackets.jp_resident_spouse_title' : 'brackets.jp_spouse_title',
            columns: ['brackets.range', 'brackets.deduction'],
            rows: JP_SPOUSE_DEDUCTION_BRACKETS.map(bracket => ({
                active: activeIncome >= bracket.min && activeIncome <= bracket.max,
                cells: [formatRange(bracket.min, bracket.max), formatNumber(bracket[deductionKey])]
            }))
        };
    }

    function calculateTaiwanTax(grossIncome, profileId = 'single') {
        const income = roundCurrency(grossIncome);
        const profile = getProfile(profileId);
        const monthlyIncome = income / 12;
        const standardDeduction = profile.spouse ? TW_TAX.standardDeductionMarried : TW_TAX.standardDeductionSingle;
        const exemptions = TW_TAX.exemptionPerPerson * profile.householdMembers;
        const salarySpecialDeduction = Math.min(income, TW_TAX.salarySpecialDeductionCap);
        const preschoolDeduction = profile.childrenUnder6 > 0
            ? TW_TAX.preschoolDeductionFirstChild
            : 0;
        const basicLivingTotal = TW_TAX.basicLivingPerPerson * profile.householdMembers;
        const basicLivingComparison = exemptions + standardDeduction + preschoolDeduction;
        const basicLivingExtraDeduction = Math.max(0, basicLivingTotal - basicLivingComparison);
        const taxableIncome = Math.max(
            0,
            income - exemptions - standardDeduction - salarySpecialDeduction - preschoolDeduction - basicLivingExtraDeduction
        );
        const incomeTaxResult = calculateQuickTax(taxableIncome, TW_TAX.brackets);
        const incomeTax = incomeTaxResult.tax;

        const healthBase = resolveUpperGrade(monthlyIncome, TW_NHI_GRADES);
        const healthMonthly = roundCurrency(
            healthBase * TW_TAX.health.rate * TW_TAX.health.employeeShare
        );
        const healthInsurance = healthMonthly * 12;

        const laborBase = resolveUpperGrade(monthlyIncome, TW_LABOR_GRADES);
        const laborMonthly = roundCurrency(laborBase * TW_TAX.labor.rate * TW_TAX.labor.employeeShare);
        const laborInsurance = laborMonthly * 12;

        const employmentMonthly = roundCurrency(laborBase * TW_TAX.employment.rate * TW_TAX.employment.employeeShare);
        const employmentInsurance = employmentMonthly * 12;

        const totalDeduction = incomeTax + healthInsurance + laborInsurance + employmentInsurance;
        const netIncome = Math.max(0, income - totalDeduction);

        return {
            country: 'taiwan',
            profileId: profile.id,
            totalIncome: income,
            incomeTax,
            totalTax: incomeTax,
            residentTax: 0,
            healthInsurance,
            laborInsurance,
            pensionInsurance: 0,
            employmentInsurance,
            totalDeduction,
            netIncome,
            effectiveRate: income > 0 ? totalDeduction / income : 0,
            sections: [
                makeSection('details.sections.tw_taxable_title', 'details.sections.tw_taxable_intro', [
                    makeCalcRow('details.gross_income', income, 'base', ''),
                    makeCalcRow('details.tw_exemptions', exemptions, 'subtract', `${formatNumber(TW_TAX.exemptionPerPerson)} x ${profile.householdMembers}`),
                    makeCalcRow('details.tw_standard_deduction', standardDeduction, 'subtract', profile.spouse ? `${formatNumber(TW_TAX.standardDeductionMarried)}` : `${formatNumber(TW_TAX.standardDeductionSingle)}`),
                    makeCalcRow('details.tw_salary_special_deduction', salarySpecialDeduction, 'subtract', `min(${formatNumber(income)}, ${formatNumber(TW_TAX.salarySpecialDeductionCap)})`),
                    makeCalcRow('details.tw_preschool_deduction', preschoolDeduction, 'subtract', profile.childrenUnder6 ? `${formatNumber(TW_TAX.preschoolDeductionFirstChild)} x ${profile.childrenUnder6}` : '0'),
                    makeCalcRow('details.tw_basic_living_extra', basicLivingExtraDeduction, 'subtract', `max(0, ${formatNumber(basicLivingTotal)} - ${formatNumber(basicLivingComparison)})`),
                    makeCalcRow('details.taxable_income', taxableIncome, 'result', `${formatNumber(income)} - ${formatNumber(exemptions)} - ${formatNumber(standardDeduction)} - ${formatNumber(salarySpecialDeduction)} - ${formatNumber(preschoolDeduction)} - ${formatNumber(basicLivingExtraDeduction)}`)
                ]),
                makeSection('details.sections.tw_income_tax_title', 'details.sections.tw_income_tax_intro', [
                    makeCalcRow('details.taxable_income', taxableIncome, 'base', ''),
                    withBracketTable(
                        makeCalcRow('details.income_tax', incomeTax, 'result', `${formatNumber(taxableIncome)} x ${formatPercent(incomeTaxResult.rate)} - ${formatNumber(incomeTaxResult.quickDeduction)}`),
                        makeIncomeTaxBracketTable('brackets.tw_income_tax_title', TW_TAX.brackets, incomeTaxResult.bracket)
                    )
                ]),
                makeSection('details.sections.tw_insurance_title', 'details.sections.tw_insurance_intro', [
                    withBracketTable(
                        makeCalcRow('details.tw_health_base', healthBase, 'base', '', 'details.notes.tw_health_base'),
                        makeSimpleGradeTable('brackets.tw_nhi_title', TW_NHI_GRADES, healthBase)
                    ),
                    makeCalcRow('details.tw_health_insurance', healthInsurance, 'result', `${formatNumber(healthBase)} x ${formatPercent(TW_TAX.health.rate)} x ${formatPercent(TW_TAX.health.employeeShare)} = ${formatNumber(healthMonthly)} / month; x 12`),
                    withBracketTable(
                        makeCalcRow('details.tw_labor_base', laborBase, 'base', '', 'details.notes.tw_labor_base'),
                        makeSimpleGradeTable('brackets.tw_labor_title', TW_LABOR_GRADES, laborBase)
                    ),
                    makeCalcRow('details.tw_labor_insurance', laborInsurance, 'result', `${formatNumber(laborBase)} x ${formatPercent(TW_TAX.labor.rate)} x ${formatPercent(TW_TAX.labor.employeeShare)} = ${formatNumber(laborMonthly)} / month; x 12`),
                    makeCalcRow('details.tw_employment_insurance', employmentInsurance, 'result', `${formatNumber(laborBase)} x ${formatPercent(TW_TAX.employment.rate)} x ${formatPercent(TW_TAX.employment.employeeShare)} = ${formatNumber(employmentMonthly)} / month; x 12`)
                ]),
                makeSection('details.sections.tw_net_title', 'details.sections.tw_net_intro', [
                    makeCalcRow('details.gross_income', income, 'base', ''),
                    makeCalcRow('details.income_tax', incomeTax, 'subtract', ''),
                    makeCalcRow('details.tw_health_insurance', healthInsurance, 'subtract', ''),
                    makeCalcRow('details.tw_labor_insurance', laborInsurance, 'subtract', ''),
                    makeCalcRow('details.tw_employment_insurance', employmentInsurance, 'subtract', ''),
                    makeCalcRow('details.total_deductions', totalDeduction, 'result', `${formatNumber(incomeTax)} + ${formatNumber(healthInsurance)} + ${formatNumber(laborInsurance)} + ${formatNumber(employmentInsurance)}`),
                    makeCalcRow('details.net_income', netIncome, 'result', `${formatNumber(income)} - ${formatNumber(totalDeduction)}`)
                ])
            ],
            details: [
                makeRow('details.gross_income', income, ''),
                makeRow('details.tw_exemptions', exemptions, `${formatNumber(TW_TAX.exemptionPerPerson)} x ${profile.householdMembers}`),
                makeRow('details.tw_standard_deduction', standardDeduction, profile.spouse ? 'married filing household' : 'single household'),
                makeRow('details.tw_salary_special_deduction', salarySpecialDeduction, `min(${formatNumber(income)}, ${formatNumber(TW_TAX.salarySpecialDeductionCap)})`),
                makeRow('details.tw_preschool_deduction', preschoolDeduction, profile.childrenUnder6 ? `${formatNumber(TW_TAX.preschoolDeductionFirstChild)} x ${profile.childrenUnder6}` : '0'),
                makeRow('details.tw_basic_living_extra', basicLivingExtraDeduction, `max(0, ${formatNumber(basicLivingTotal)} - ${formatNumber(basicLivingComparison)})`),
                makeRow('details.taxable_income', taxableIncome, `${formatNumber(income)} - deductions`),
                makeRow('details.income_tax', incomeTax, `${formatNumber(taxableIncome)} x ${formatPercent(incomeTaxResult.rate)} - ${formatNumber(incomeTaxResult.quickDeduction)}`),
                makeRow('details.tw_health_insurance', healthInsurance, `${formatNumber(healthBase)} x ${formatPercent(TW_TAX.health.rate)} x ${formatPercent(TW_TAX.health.employeeShare)} = ${formatNumber(healthMonthly)} / month; x 12`),
                makeRow('details.tw_labor_insurance', laborInsurance, `${formatNumber(laborBase)} x ${formatPercent(TW_TAX.labor.rate)} x ${formatPercent(TW_TAX.labor.employeeShare)} = ${formatNumber(laborMonthly)} / month; x 12`),
                makeRow('details.tw_employment_insurance', employmentInsurance, `${formatNumber(laborBase)} x ${formatPercent(TW_TAX.employment.rate)} x ${formatPercent(TW_TAX.employment.employeeShare)} = ${formatNumber(employmentMonthly)} / month; x 12`),
                makeRow('details.total_deductions', totalDeduction, `${formatNumber(incomeTax)} + ${formatNumber(healthInsurance)} + ${formatNumber(laborInsurance)} + ${formatNumber(employmentInsurance)}`),
                makeRow('details.net_income', netIncome, `${formatNumber(income)} - ${formatNumber(totalDeduction)}`)
            ],
            meta: {
                taxableIncome,
                healthBase,
                laborBase,
                basicLivingExtraDeduction
            }
        };
    }

    function calculateJapanTax(grossIncome, profileId = 'single') {
        const income = roundCurrency(grossIncome);
        const profile = getProfile(profileId);
        const monthlyIncome = income / 12;
        const healthPensionThreshold = JP_TAX.employeeSocialInsurance.shortTimeMonthlyWageThreshold;
        const healthPensionCovered = monthlyIncome >= healthPensionThreshold;
        const healthStandardMonthly = healthPensionCovered
            ? resolveStandardMonthly(monthlyIncome, JP_HEALTH_GRADES)
            : 0;
        const pensionStandardMonthly = healthPensionCovered
            ? resolveStandardMonthly(monthlyIncome, JP_PENSION_GRADES)
            : 0;
        const healthMonthly = healthPensionCovered
            ? roundCurrency(healthStandardMonthly * JP_TAX.health.tokyoRate * JP_TAX.health.employeeShare)
            : 0;
        const pensionMonthly = healthPensionCovered
            ? roundCurrency(pensionStandardMonthly * JP_TAX.pension.rate * JP_TAX.pension.employeeShare)
            : 0;
        const healthInsurance = healthMonthly * 12;
        const pensionInsurance = pensionMonthly * 12;
        const employmentInsurance = roundCurrency(income * JP_TAX.employment.workerRate);
        const socialInsurance = healthInsurance + pensionInsurance + employmentInsurance;

        const salaryDeduction = roundCurrency(calculateJapanSalaryDeduction(income));
        const salaryIncome = Math.max(0, income - salaryDeduction);
        const basicDeduction = calculateJapanBasicDeduction(salaryIncome);
        const spouseDeduction = calculateJapanSpouseDeduction(salaryIncome, profile);
        const taxableIncome = floorTo(
            salaryIncome - socialInsurance - basicDeduction - spouseDeduction,
            1000
        );
        const baseIncomeTaxResult = calculateQuickTax(taxableIncome, JP_TAX.incomeBrackets);
        const baseIncomeTax = baseIncomeTaxResult.tax;
        const reconstructionTax = Math.floor(baseIncomeTax * JP_TAX.reconstructionRate);
        const incomeTax = baseIncomeTax + reconstructionTax;

        const residentBasicDeduction = calculateJapanResidentBasicDeduction(salaryIncome);
        const residentSpouseDeduction = calculateJapanSpouseDeduction(salaryIncome, profile, true);
        const residentTaxableIncome = floorTo(
            salaryIncome - socialInsurance - residentBasicDeduction - residentSpouseDeduction,
            1000
        );
        const residentNonTaxableThreshold = profile.householdMembers === 1
            ? JP_TAX.residentTax.nonTaxableSingleIncome
            : JP_TAX.residentTax.nonTaxableMultiplier * profile.householdMembers + JP_TAX.residentTax.nonTaxableBaseWithDependents;
        const isResidentTaxExempt = salaryIncome <= residentNonTaxableThreshold;
        const residentIncomeLevy = isResidentTaxExempt
            ? 0
            : roundCurrency(residentTaxableIncome * JP_TAX.residentTax.incomeRate);
        const personalDeductionDifference = (basicDeduction - residentBasicDeduction) + (spouseDeduction - residentSpouseDeduction);
        const adjustmentDeduction = isResidentTaxExempt
            ? 0
            : calculateResidentAdjustmentDeduction(residentTaxableIncome, personalDeductionDifference);
        const residentPerCapita = isResidentTaxExempt ? 0 : JP_TAX.residentTax.perCapita;
        const residentTax = Math.max(0, residentIncomeLevy - adjustmentDeduction) + residentPerCapita;
        const totalDeduction = incomeTax + residentTax + healthInsurance + pensionInsurance + employmentInsurance;
        const netIncome = Math.max(0, income - totalDeduction);

        return {
            country: 'japan',
            profileId: profile.id,
            totalIncome: income,
            incomeTax,
            totalTax: incomeTax,
            baseIncomeTax,
            reconstructionTax,
            residentTax,
            healthInsurance,
            laborInsurance: 0,
            pensionInsurance,
            employmentInsurance,
            totalDeduction,
            netIncome,
            effectiveRate: income > 0 ? totalDeduction / income : 0,
            sections: [
                makeSection('details.sections.jp_salary_title', 'details.sections.jp_salary_intro', [
                    makeCalcRow('details.gross_income', income, 'base', ''),
                    withBracketTable(
                        makeCalcRow('details.jp_salary_deduction', salaryDeduction, 'subtract', '', 'details.notes.jp_salary_deduction'),
                        makeSalaryDeductionTable(income)
                    ),
                    makeCalcRow('details.jp_salary_income', salaryIncome, 'result', `${formatNumber(income)} - ${formatNumber(salaryDeduction)}`)
                ]),
                makeSection('details.sections.jp_social_title', 'details.sections.jp_social_intro', [
                    healthPensionCovered
                        ? withBracketTable(
                            makeCalcRow('details.jp_health_base', healthStandardMonthly, 'base', '', 'details.notes.jp_health_base'),
                            makeSimpleGradeTable('brackets.jp_health_title', JP_HEALTH_GRADES, healthStandardMonthly)
                        )
                        : makeCalcRow('details.jp_health_base', 0, 'base', `${formatNumber(monthlyIncome)} < ${formatNumber(healthPensionThreshold)}`, 'details.notes.jp_health_pension_not_covered'),
                    makeCalcRow(
                        'details.jp_health_insurance',
                        healthInsurance,
                        'result',
                        healthPensionCovered
                            ? `${formatNumber(healthStandardMonthly)} x ${formatPercent(JP_TAX.health.tokyoRate)} x ${formatPercent(JP_TAX.health.employeeShare)} = ${formatNumber(healthMonthly)} / month; x 12`
                            : '0'
                    ),
                    healthPensionCovered
                        ? withBracketTable(
                            makeCalcRow('details.jp_pension_base', pensionStandardMonthly, 'base', '', 'details.notes.jp_pension_base'),
                            makeSimpleGradeTable('brackets.jp_pension_title', JP_PENSION_GRADES, pensionStandardMonthly)
                        )
                        : makeCalcRow('details.jp_pension_base', 0, 'base', `${formatNumber(monthlyIncome)} < ${formatNumber(healthPensionThreshold)}`, 'details.notes.jp_health_pension_not_covered'),
                    makeCalcRow(
                        'details.jp_pension_insurance',
                        pensionInsurance,
                        'result',
                        healthPensionCovered
                            ? `${formatNumber(pensionStandardMonthly)} x ${formatPercent(JP_TAX.pension.rate)} x ${formatPercent(JP_TAX.pension.employeeShare)} = ${formatNumber(pensionMonthly)} / month; x 12`
                            : '0'
                    ),
                    makeCalcRow('details.jp_employment_insurance', employmentInsurance, 'result', `${formatNumber(income)} x 5/1000`),
                    makeCalcRow('details.jp_social_insurance', socialInsurance, 'result', `${formatNumber(healthInsurance)} + ${formatNumber(pensionInsurance)} + ${formatNumber(employmentInsurance)}`)
                ]),
                makeSection('details.sections.jp_income_taxable_title', 'details.sections.jp_income_taxable_intro', [
                    makeCalcRow('details.jp_salary_income', salaryIncome, 'base', ''),
                    makeCalcRow('details.jp_social_insurance', socialInsurance, 'subtract', ''),
                    withBracketTable(
                        makeCalcRow('details.jp_basic_deduction', basicDeduction, 'subtract', '', 'details.notes.jp_basic_deduction'),
                        makeDeductionTable('brackets.jp_basic_title', JP_BASIC_DEDUCTION_BRACKETS, salaryIncome)
                    ),
                    profile.spouse
                        ? withBracketTable(
                            makeCalcRow('details.jp_spouse_deduction', spouseDeduction, 'subtract', '', 'details.notes.spouse_no_income'),
                            makeSpouseDeductionTable(salaryIncome, false)
                        )
                        : makeCalcRow('details.jp_spouse_deduction', spouseDeduction, 'subtract', '0'),
                    makeCalcRow('details.taxable_income', taxableIncome, 'result', `floor(${formatNumber(salaryIncome)} - ${formatNumber(socialInsurance)} - ${formatNumber(basicDeduction)} - ${formatNumber(spouseDeduction)}, 1,000)`)
                ]),
                makeSection('details.sections.jp_income_tax_title', 'details.sections.jp_income_tax_intro', [
                    makeCalcRow('details.taxable_income', taxableIncome, 'base', ''),
                    withBracketTable(
                        makeCalcRow('details.jp_base_income_tax', baseIncomeTax, 'result', `${formatNumber(taxableIncome)} x ${formatPercent(baseIncomeTaxResult.rate)} - ${formatNumber(baseIncomeTaxResult.quickDeduction)}`),
                        makeIncomeTaxBracketTable('brackets.jp_income_tax_title', JP_TAX.incomeBrackets, baseIncomeTaxResult.bracket)
                    ),
                    makeCalcRow('details.jp_reconstruction_tax', reconstructionTax, 'add', `${formatNumber(baseIncomeTax)} x ${formatPercent(JP_TAX.reconstructionRate)}`),
                    makeCalcRow('details.income_tax', incomeTax, 'result', `${formatNumber(baseIncomeTax)} + ${formatNumber(reconstructionTax)}`)
                ]),
                makeSection('details.sections.jp_resident_title', 'details.sections.jp_resident_intro', [
                    makeCalcRow('details.jp_salary_income', salaryIncome, 'base', ''),
                    makeCalcRow('details.jp_social_insurance', socialInsurance, 'subtract', ''),
                    withBracketTable(
                        makeCalcRow('details.jp_resident_basic_deduction', residentBasicDeduction, 'subtract', '', 'details.notes.jp_resident_basic_deduction'),
                        makeDeductionTable('brackets.jp_resident_basic_title', JP_RESIDENT_BASIC_DEDUCTION_BRACKETS, salaryIncome)
                    ),
                    profile.spouse
                        ? withBracketTable(
                            makeCalcRow('details.jp_resident_spouse_deduction', residentSpouseDeduction, 'subtract', '', 'details.notes.spouse_no_income'),
                            makeSpouseDeductionTable(salaryIncome, true)
                        )
                        : makeCalcRow('details.jp_resident_spouse_deduction', residentSpouseDeduction, 'subtract', '0'),
                    makeCalcRow('details.jp_resident_taxable_income', residentTaxableIncome, 'result', `floor(${formatNumber(salaryIncome)} - ${formatNumber(socialInsurance)} - ${formatNumber(residentBasicDeduction)} - ${formatNumber(residentSpouseDeduction)}, 1,000)`),
                    makeCalcRow('details.jp_resident_income_levy', residentIncomeLevy, 'base', isResidentTaxExempt ? '' : `${formatNumber(residentTaxableIncome)} x ${formatPercent(JP_TAX.residentTax.incomeRate)}`, isResidentTaxExempt ? 'details.notes.jp_resident_exempt' : undefined),
                    makeCalcRow('details.jp_resident_adjustment', adjustmentDeduction, 'subtract', `personal deduction difference ${formatNumber(personalDeductionDifference)}`),
                    makeCalcRow('details.jp_resident_per_capita', residentPerCapita, 'add', '', isResidentTaxExempt ? 'details.notes.jp_resident_exempt' : 'details.notes.jp_resident_per_capita'),
                    makeCalcRow('details.resident_tax', residentTax, 'result', `${formatNumber(residentIncomeLevy)} - ${formatNumber(adjustmentDeduction)} + ${formatNumber(residentPerCapita)}`)
                ]),
                makeSection('details.sections.jp_net_title', 'details.sections.jp_net_intro', [
                    makeCalcRow('details.gross_income', income, 'base', ''),
                    makeCalcRow('details.income_tax', incomeTax, 'subtract', ''),
                    makeCalcRow('details.resident_tax', residentTax, 'subtract', ''),
                    makeCalcRow('details.jp_health_insurance', healthInsurance, 'subtract', ''),
                    makeCalcRow('details.jp_pension_insurance', pensionInsurance, 'subtract', ''),
                    makeCalcRow('details.jp_employment_insurance', employmentInsurance, 'subtract', ''),
                    makeCalcRow('details.total_deductions', totalDeduction, 'result', `${formatNumber(incomeTax)} + ${formatNumber(residentTax)} + ${formatNumber(healthInsurance)} + ${formatNumber(pensionInsurance)} + ${formatNumber(employmentInsurance)}`),
                    makeCalcRow('details.net_income', netIncome, 'result', `${formatNumber(income)} - ${formatNumber(totalDeduction)}`)
                ])
            ],
            details: [
                makeRow('details.gross_income', income, ''),
                makeRow('details.jp_salary_deduction', salaryDeduction, 'official salary income deduction table'),
                makeRow('details.jp_salary_income', salaryIncome, `${formatNumber(income)} - ${formatNumber(salaryDeduction)}`),
                makeRow(
                    'details.jp_health_insurance',
                    healthInsurance,
                    healthPensionCovered
                        ? `${formatNumber(healthStandardMonthly)} x ${formatPercent(JP_TAX.health.tokyoRate)} x ${formatPercent(JP_TAX.health.employeeShare)} = ${formatNumber(healthMonthly)} / month; x 12`
                        : `${formatNumber(monthlyIncome)} < ${formatNumber(healthPensionThreshold)}`
                ),
                makeRow(
                    'details.jp_pension_insurance',
                    pensionInsurance,
                    healthPensionCovered
                        ? `${formatNumber(pensionStandardMonthly)} x ${formatPercent(JP_TAX.pension.rate)} x ${formatPercent(JP_TAX.pension.employeeShare)} = ${formatNumber(pensionMonthly)} / month; x 12`
                        : `${formatNumber(monthlyIncome)} < ${formatNumber(healthPensionThreshold)}`
                ),
                makeRow('details.jp_employment_insurance', employmentInsurance, `${formatNumber(income)} x 5/1000`),
                makeRow('details.jp_basic_deduction', basicDeduction, 'income tax basic deduction table'),
                makeRow('details.jp_spouse_deduction', spouseDeduction, profile.spouse ? 'spouse income assumed 0' : '0'),
                makeRow('details.taxable_income', taxableIncome, `floor(${formatNumber(salaryIncome)} - ${formatNumber(socialInsurance)} - ${formatNumber(basicDeduction)} - ${formatNumber(spouseDeduction)}, 1,000)`),
                makeRow('details.jp_base_income_tax', baseIncomeTax, `${formatNumber(taxableIncome)} x ${formatPercent(baseIncomeTaxResult.rate)} - ${formatNumber(baseIncomeTaxResult.quickDeduction)}`),
                makeRow('details.jp_reconstruction_tax', reconstructionTax, `${formatNumber(baseIncomeTax)} x ${formatPercent(JP_TAX.reconstructionRate)}`),
                makeRow('details.income_tax', incomeTax, `${formatNumber(baseIncomeTax)} + ${formatNumber(reconstructionTax)}`),
                makeRow('details.jp_resident_basic_deduction', residentBasicDeduction, 'Tokyo resident tax basic deduction'),
                makeRow('details.jp_resident_spouse_deduction', residentSpouseDeduction, profile.spouse ? 'spouse income assumed 0' : '0'),
                makeRow('details.jp_resident_taxable_income', residentTaxableIncome, `floor(${formatNumber(salaryIncome)} - ${formatNumber(socialInsurance)} - ${formatNumber(residentBasicDeduction)} - ${formatNumber(residentSpouseDeduction)}, 1,000)`),
                makeRow('details.jp_resident_income_levy', residentIncomeLevy, isResidentTaxExempt ? 'non-taxable threshold' : `${formatNumber(residentTaxableIncome)} x ${formatPercent(JP_TAX.residentTax.incomeRate)}`),
                makeRow('details.jp_resident_adjustment', adjustmentDeduction, `personal deduction difference ${formatNumber(personalDeductionDifference)}`),
                makeRow('details.jp_resident_per_capita', residentPerCapita, isResidentTaxExempt ? 'non-taxable threshold' : '4,000 resident tax + 1,000 forest environment tax'),
                makeRow('details.resident_tax', residentTax, `${formatNumber(residentIncomeLevy)} - ${formatNumber(adjustmentDeduction)} + ${formatNumber(residentPerCapita)}`),
                makeRow('details.total_deductions', totalDeduction, `${formatNumber(incomeTax)} + ${formatNumber(residentTax)} + ${formatNumber(healthInsurance)} + ${formatNumber(pensionInsurance)} + ${formatNumber(employmentInsurance)}`),
                makeRow('details.net_income', netIncome, `${formatNumber(income)} - ${formatNumber(totalDeduction)}`)
            ],
            meta: {
                salaryIncome,
                taxableIncome,
                residentTaxableIncome,
                healthStandardMonthly,
                pensionStandardMonthly,
                healthPensionCovered,
                healthPensionThreshold,
                residentNonTaxableThreshold,
                isResidentTaxExempt
            }
        };
    }

    window.TaxRules = {
        PROFILES,
        PROFILE_ORDER,
        SOURCES,
        calculateTaiwanTax,
        calculateJapanTax
    };
})();
