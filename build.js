const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootDir = __dirname;
const siteUrl = 'https://aszx87410.github.io/japan-taiwan-tax-compare/';
const locales = [
    { code: 'zh-TW', hreflang: 'zh-TW', ogLocale: 'zh_TW', file: 'index.html', markdownFile: 'zh-TW.md' },
    { code: 'en', hreflang: 'en', ogLocale: 'en_US', file: 'en.html', markdownFile: 'en.md' },
    { code: 'ja', hreflang: 'ja', ogLocale: 'ja_JP', file: 'ja.html', markdownFile: 'ja.md' }
];

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
    return escapeHtml(value);
}

function escapeXml(value) {
    return escapeHtml(value);
}

function getValue(source, key) {
    return key.split('.').reduce((value, part) => {
        if (value && Object.prototype.hasOwnProperty.call(value, part)) {
            return value[part];
        }
        throw new Error(`Missing translation key: ${key}`);
    }, source);
}

function pageUrl(locale) {
    return locale.file === 'index.html' ? siteUrl : `${siteUrl}${locale.file}`;
}

function markdownUrl(locale) {
    return `${siteUrl}${locale.markdownFile}`;
}

function renderHreflangLinks() {
    const links = locales.map(locale => {
        return `<link rel="alternate" hreflang="${locale.hreflang}" href="${pageUrl(locale)}">`;
    });
    links.push(`<link rel="alternate" hreflang="x-default" href="${pageUrl(locales[0])}">`);
    return links.join('\n    ');
}

function renderOgLocaleAlternateLinks(locale) {
    return locales
        .filter(item => item.code !== locale.code)
        .map(item => `<meta property="og:locale:alternate" content="${item.ogLocale}">`)
        .join('\n    ');
}

function getTaxSources() {
    const context = { window: {} };
    vm.createContext(context);
    vm.runInContext(fs.readFileSync(path.join(rootDir, 'tax-rules.js'), 'utf8'), context);
    return context.window.TaxRules.SOURCES;
}

function buildJsonLd(dictionary, locale) {
    const faq = getValue(dictionary, 'seo.faq');
    const canonicalUrl = pageUrl(locale);
    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebApplication',
                '@id': `${canonicalUrl}#app`,
                name: getValue(dictionary, 'meta.title'),
                description: getValue(dictionary, 'meta.description'),
                url: canonicalUrl,
                inLanguage: locale.hreflang,
                applicationCategory: 'FinanceApplication',
                operatingSystem: 'Any',
                isAccessibleForFree: true,
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD'
                },
                sameAs: 'https://github.com/aszx87410/japan-taiwan-tax-compare'
            },
            {
                '@type': 'FAQPage',
                '@id': `${canonicalUrl}#faq`,
                inLanguage: locale.hreflang,
                mainEntity: faq.map(item => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer
                    }
                }))
            }
        ]
    };
}

function renderPage(template, translations, locale) {
    const dictionary = translations[locale.code];
    if (!dictionary) {
        throw new Error(`Missing locale: ${locale.code}`);
    }

    const replacements = {
        locale: locale.code,
        inputDefaultTwd: locale.code === 'en' ? '2020000' : '202.00',
        inputDefaultJpy: locale.code === 'en' ? '10000000' : '1000',
        canonicalUrl: pageUrl(locale),
        markdownUrl: markdownUrl(locale),
        hreflangLinks: renderHreflangLinks(),
        ogLocale: locale.ogLocale,
        ogLocaleAlternateLinks: renderOgLocaleAlternateLinks(locale),
        jsonLd: JSON.stringify(buildJsonLd(dictionary, locale), null, 2)
            .split('\n')
            .map(line => `        ${line}`)
            .join('\n')
    };

    return template
        .replace(/\{\{t:([^}]+)\}\}/g, (_, key) => escapeHtml(getValue(dictionary, key)))
        .replace(/\{\{attr:([^}]+)\}\}/g, (_, key) => escapeAttr(getValue(dictionary, key)))
        .replace(/\{\{active:([^}]+)\}\}/g, (_, code) => code === locale.code ? ' active' : '')
        .replace(/\{\{url:([^}]+)\}\}/g, (_, code) => {
            const targetLocale = locales.find(item => item.code === code);
            if (!targetLocale) {
                throw new Error(`Missing page URL for locale: ${code}`);
            }
            return targetLocale.file;
        })
        .replace(/\{\{([^}]+)\}\}/g, (_, key) => {
            if (!Object.prototype.hasOwnProperty.call(replacements, key)) {
                throw new Error(`Missing template replacement: ${key}`);
            }
            return replacements[key];
        });
}

function renderSitemap() {
    const urlBlocks = locales.map(locale => {
        const alternates = [
            ...locales.map(item => {
                return `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${escapeXml(pageUrl(item))}" />`;
            }),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(pageUrl(locales[0]))}" />`
        ].join('\n');

        return [
            '  <url>',
            `    <loc>${escapeXml(pageUrl(locale))}</loc>`,
            alternates,
            '  </url>'
        ].join('\n');
    }).join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        urlBlocks,
        '</urlset>',
        ''
    ].join('\n');
}

function renderRobotsTxt() {
    return [
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${siteUrl}sitemap.xml`,
        ''
    ].join('\n');
}

function renderMarkdown(locale, dictionary, sources) {
    const sourceItems = sources.map(source => {
        return `- ${getValue(dictionary, source.labelKey)}: ${source.url}`;
    }).join('\n');

    return [
        `# ${getValue(dictionary, 'meta.title')}`,
        '',
        getValue(dictionary, 'meta.summary'),
        '',
        '## Canonical page',
        '',
        pageUrl(locale),
        '',
        '## Supported scenarios',
        '',
        `- ${getValue(dictionary, 'profiles.single')}`,
        `- ${getValue(dictionary, 'profiles.married_no_child')}`,
        `- ${getValue(dictionary, 'profiles.married_one_child_age_3')}`,
        '',
        '## Calculations covered',
        '',
        `- ${getValue(dictionary, 'details.income_tax')}`,
        `- ${getValue(dictionary, 'details.resident_tax')}`,
        `- ${getValue(dictionary, 'details.tw_health_insurance')}`,
        `- ${getValue(dictionary, 'details.tw_labor_insurance')}`,
        `- ${getValue(dictionary, 'details.tw_employment_insurance')}`,
        `- ${getValue(dictionary, 'details.jp_health_insurance')}`,
        `- ${getValue(dictionary, 'details.jp_pension_insurance')}`,
        `- ${getValue(dictionary, 'details.jp_employment_insurance')}`,
        '',
        '## Assumptions',
        '',
        `- ${getValue(dictionary, 'sources.note')}`,
        `- ${getValue(dictionary, 'details.notes.spouse_no_income')}`,
        `- ${getValue(dictionary, 'details.notes.jp_health_pension_not_covered')}`,
        '',
        '## Official sources',
        '',
        sourceItems,
        ''
    ].join('\n');
}

function renderLlmsTxt(translations) {
    return [
        '# Taiwan-Japan Tax Comparison Calculator',
        '',
        '> A free multilingual calculator for estimating 2026 salary income deductions in Taiwan and Japan, including income tax, resident tax, health insurance, labor insurance, pension, and employment insurance.',
        '',
        '## Canonical pages',
        '',
        ...locales.map(locale => `- [${getValue(translations[locale.code], 'meta.title')}](${pageUrl(locale)})`),
        '',
        '## LLM-readable summaries',
        '',
        ...locales.map(locale => `- [${locale.hreflang} Markdown summary](${markdownUrl(locale)})`),
        '',
        '## Scope',
        '',
        '- The primary version is Traditional Chinese at /index.html.',
        '- The calculator has English and Japanese localized pages.',
        '- Figures are estimates based on official data available for 2026.',
        '- The app is not tax, legal, financial, or immigration advice.',
        '',
        '## Source code',
        '',
        '- [GitHub repository](https://github.com/aszx87410/japan-taiwan-tax-compare)',
        ''
    ].join('\n');
}

function build() {
    const templatePath = path.join(rootDir, 'src', 'template.html');
    const translationsPath = path.join(rootDir, 'translations.json');
    const template = fs.readFileSync(templatePath, 'utf8');
    const translations = readJson(translationsPath);
    const sources = getTaxSources();

    for (const locale of locales) {
        const dictionary = translations[locale.code];
        const html = renderPage(template, translations, locale);
        fs.writeFileSync(path.join(rootDir, locale.file), html);
        fs.writeFileSync(path.join(rootDir, locale.markdownFile), renderMarkdown(locale, dictionary, sources));
    }

    fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), renderSitemap());
    fs.writeFileSync(path.join(rootDir, 'robots.txt'), renderRobotsTxt());
    fs.writeFileSync(path.join(rootDir, 'llms.txt'), renderLlmsTxt(translations));

    return [
        ...locales.map(locale => locale.file),
        ...locales.map(locale => locale.markdownFile),
        'sitemap.xml',
        'robots.txt',
        'llms.txt'
    ];
}

if (require.main === module) {
    const files = build();
    console.log(`Built ${files.join(', ')}`);
}

module.exports = { build };
