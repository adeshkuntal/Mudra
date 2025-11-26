const axios = require("axios");
const { GEMINI_API_KEY } = require("../config/env");

// Detect if question is finance-related
const isFinanceRelated = (text) => {
  const q = String(text || '').toLowerCase();
  const financeKeywords = [
    // Money & Savings
    'money', 'saving', 'savings', 'income', 'expense', 'expenses', 'spend', 'spent', 'spending', 'budget',
    'balance', 'cash', 'currency', 'rupee', 'rupees', 'rs', '₹',
    // Financial Terms
    'finance', 'financial', 'fiscal', 'monetary', 'economic', 'economy',
    // Investment & Tax
    'invest', 'investment', 'sip', 'mutual fund', 'equity', 'stock', 'share', 'portfolio', 'return',
    'tax', 'taxation', '80c', 'elss', 'ppf', 'fd', 'fixed deposit', 'gst', 'tds',
    // Categories
    'food', 'grocery', 'rent', 'travel', 'fuel', 'shopping', 'medical', 'education', 'entertainment',
    'bills', 'subscription', 'utility', 'transport', 'shopping', 'dining', 'restaurant',
    // Budget & Planning
    'budget', 'plan', 'planning', 'goal', 'target', 'allocation', 'forecast', 'projection',
    // Debt & Credit
    'debt', 'loan', 'emi', 'credit', 'borrow', 'mortgage', 'repayment',
    // Analysis & Reports
    'analytics', 'report', 'summary', 'trend', 'pattern', 'analysis', 'insight',
    // Emergency & Goals
    'emergency fund', 'rainy day', 'retirement', 'vacation fund', 'down payment',
    // Salary & Employment
    'salary', 'wage', 'pay', 'raise', 'increment', 'bonus',
    // Specific Questions
    'how much', 'what is my', 'tell me about', 'show me', 'analyze', 'compare'
  ];
  
  // Check if question contains finance keywords
  const hasFinanceKeyword = financeKeywords.some(keyword => q.includes(keyword));
  
  // Check for finance-related patterns
  const financePatterns = [
    /how\s+much/i,
    /what.*(spend|save|earn|owe|have)/i,
    /should.*(invest|save|spend)/i,
    /where.*money/i,
    /when.*(pay|buy|save)/i,
    /why.*(expensive|cost|spend)/i,
    /(can|could|would).*(save|invest|spend)/i
  ];
  
  const matchesPattern = financePatterns.some(pattern => pattern.test(q));
  
  return hasFinanceKeyword || matchesPattern;
};

// Analyze user financial data from transactions
const analyzeUserFinancialData = (transactions, budgets) => {
  if (!transactions || transactions.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      savingsRate: 0,
      categoryBreakdown: {},
      monthlyBreakdown: {},
      topCategories: [],
      subscriptionEstimate: 0,
      transactionCount: 0,
      budgetTotal: budgets?.total || 0,
      budgetRemaining: budgets?.total || 0,
      overBudgetCategories: [],
    };
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
  
  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = {};
  transactions.forEach(t => {
    if (t.type === 'Expense') {
      const cat = t.category || 'Uncategorized';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Math.abs(Number(t.amount) || 0);
    }
  });

  // Top categories (sorted by spending)
  const topCategories = Object.entries(categoryBreakdown)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Monthly breakdown (last 6 months)
  const monthlyBreakdown = {};
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyBreakdown[monthKey] = { income: 0, expenses: 0, savings: 0 };
  }

  transactions.forEach(t => {
    if (!t.date) return;
    const tDate = new Date(t.date);
    const monthKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyBreakdown[monthKey]) {
      if (t.type === 'Income') {
        monthlyBreakdown[monthKey].income += Number(t.amount) || 0;
      } else {
        monthlyBreakdown[monthKey].expenses += Math.abs(Number(t.amount) || 0);
      }
      monthlyBreakdown[monthKey].savings = monthlyBreakdown[monthKey].income - monthlyBreakdown[monthKey].expenses;
    }
  });

  // Subscription estimate (keywords in category/description)
  const subRegex = /(sub|subscription|membership|netflix|prime|spotify|youtube|premium|plan)/i;
  const subscriptionEstimate = transactions
    .filter(t => t.type === 'Expense' && (subRegex.test(t.category || '') || subRegex.test(t.description || '')))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  // Average monthly income/expenses (from monthly breakdown)
  const monthlyValues = Object.values(monthlyBreakdown);
  const avgMonthlyIncome = monthlyValues.length > 0 
    ? monthlyValues.reduce((sum, m) => sum + m.income, 0) / monthlyValues.length 
    : 0;
  const avgMonthlyExpenses = monthlyValues.length > 0 
    ? monthlyValues.reduce((sum, m) => sum + m.expenses, 0) / monthlyValues.length 
    : 0;

  // Budget analysis
  const budgetCategories = budgets?.categories || {};
  const overBudgetCategories = Object.entries(budgetCategories)
    .filter(([cat, limit]) => (categoryBreakdown[cat] || 0) > Number(limit))
    .map(([cat]) => cat);

  const budgetRemaining = (budgets?.total || 0) - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    categoryBreakdown,
    monthlyBreakdown,
    topCategories,
    subscriptionEstimate,
    averageMonthlyIncome: avgMonthlyIncome,
    averageMonthlyExpenses: avgMonthlyExpenses,
    transactionCount: transactions.length,
    budgetTotal: budgets?.total || 0,
    budgetRemaining,
    overBudgetCategories,
  };
};

// Heuristic fallback generator (used if Gemini unavailable)
const buildHeuristicAdvice = (userData) => {
  const income = Number(userData?.income || 0);
  const expenses = Number(userData?.expenses || 0);
  const savings = Number(userData?.savings || (income - expenses));
  const txCount = Number(userData?.transactionCount || 0);
  const categories = (userData?.categories || 'Not set');
  const savingsRate = income > 0 ? ((income - expenses) / income) : 0;

  let lines = [];
  lines.push(`Here's a quick snapshot based on your data:`);
  lines.push(`- Income: ${income.toFixed(0)} | Expenses: ${expenses.toFixed(0)} | Savings: ${(income - expenses).toFixed(0)}`);
  lines.push(`- Savings rate: ${(savingsRate * 100).toFixed(1)}%`);
  if (savingsRate < 0) {
    lines.push(`You're running a monthly deficit. Cut 10–20% from optional categories and pause non‑essential purchases.`);
  } else if (savingsRate < 0.1) {
    lines.push(`Aim for 20–30% savings. Try reducing subscriptions 20% and setting a fixed SIP right after salary credit.`);
  } else {
    lines.push(`Nice savings rate. Consider increasing SIPs by 5–10% and building a 6‑month emergency fund.`);
  }
  lines.push(`Categories: ${categories}`);
  if (txCount < 10) {
    lines.push(`Tip: Add more transactions for better insights and forecasts.`);
  }
  return lines.join("\n");
};

// Intent detection for smarter fallbacks
const detectIntent = (text) => {
  const q = String(text || '').toLowerCase();
  if (/how\s+much.*(spend|spent).*on/.test(q) || /(food|grocery|rent|travel|fuel|shopping|tax|education|medical|entertainment|bills)/.test(q)) return 'category_spend';
  if (/(budget|over budget|remaining budget)/.test(q)) return 'budget_status';
  if (/(save|savings rate|improve savings)/.test(q)) return 'saving_tips';
  if (/(investment|invest|sip|mutual fund|equity|index fund|ppf|elss|80c|tax)/.test(q)) return 'investment_tax';
  if (/(forecast|projection|next month|next 3 month|projections)/.test(q)) return 'forecast';
  if (/(subscription|subscriptions|reduce.*subscription|netflix|prime|spotify)/.test(q)) return 'subscriptions';
  if (/(raise|salary|increment)/.test(q)) return 'raise';
  if (/(emergency fund|rainy day)/.test(q)) return 'emergency_fund';
  if (/(goal|plan.*scooter|vacation|education|retire|down payment)/.test(q)) return 'goals';
  return 'general';
};

const extractCategoryFromMessage = (message, context) => {
  const m = String(message || '').toLowerCase();
  const candidates = Object.keys((context && context.categoryTotals) || {});
  if (!candidates || candidates.length === 0) return null;
  
  // direct includes
  let best = null; let bestAmt = 0;
  candidates.forEach((name) => {
    const n = String(name || '').toLowerCase();
    if (!n) return;
    if (m.includes(n)) {
      const amt = Number(context.categoryTotals[name] || 0);
      if (amt > bestAmt) { bestAmt = amt; best = name; }
    }
  });
  if (best) return { name: best, amount: bestAmt };
  
  // synonyms map
  const synonyms = {
    food: ['food','dining','restaurant','grocer','grocery','swiggy','zomato'],
    travel: ['travel','flight','train','bus','uber','ola','fuel','petrol','diesel'],
    bills: ['bill','bills','electricity','water','internet','phone','mobile'],
    rent: ['rent','house rent','pg','hostel'],
    shopping: ['shopping','amazon','flipkart','myntra'],
    medical: ['medical','medicine','doctor','hospital','pharmacy'],
    education: ['education','school','tuition','college','course'],
    entertainment: ['entertainment','movie','netflix','prime','spotify','gaming'],
    tax: ['tax','tds','income tax','gst']
  };
  
  for (const [cat, words] of Object.entries(synonyms)) {
    if (words.some(w => m.includes(w))) {
      const match = candidates.find(c => c.toLowerCase().includes(cat));
      if (match) return { name: match, amount: Number(context.categoryTotals[match] || 0) };
    }
  }
  
  // fallback to top category
  if (context && context.topCategories && context.topCategories[0]) {
    return { name: context.topCategories[0].name, amount: Number(context.topCategories[0].amount || 0) };
  }
  return null;
};

const respondByIntent = (message, analyzedData) => {
  const income = analyzedData.totalIncome || 0;
  const expenses = analyzedData.totalExpenses || 0;
  const savings = analyzedData.totalSavings || 0;
  const ratePct = analyzedData.savingsRate || 0;
  const topCategories = analyzedData.topCategories || [];
  const categoryBreakdown = analyzedData.categoryBreakdown || {};
  const monthlyBreakdown = analyzedData.monthlyBreakdown || {};
  const subscriptionEstimate = analyzedData.subscriptionEstimate || 0;
  const budgetRemaining = analyzedData.budgetRemaining || 0;
  const overBudgetCategories = analyzedData.overBudgetCategories || [];
  const avgMonthlyIncome = analyzedData.averageMonthlyIncome || 0;
  const avgMonthlyExpenses = analyzedData.averageMonthlyExpenses || 0;

  const intent = detectIntent(message);

  // Build context object for category extraction
  const context = {
    categoryTotals: categoryBreakdown,
    topCategories: topCategories,
    remaining: budgetRemaining,
    overBudget: overBudgetCategories,
    subscription: subscriptionEstimate,
    monthly: Object.entries(monthlyBreakdown).map(([label, data]) => ({
      label,
      income: data.income,
      expenses: data.expenses,
      savings: data.savings
    }))
  };

  if (intent === 'category_spend') {
    const cat = extractCategoryFromMessage(message, context);
    if (cat) {
      const monthlyAvg = categoryBreakdown[cat.name] || 0;
      const budgetLimit = 0; // Could be enhanced to check budget limits
      return `Your total spending on ${cat.name}: ₹${Math.round(cat.amount).toLocaleString()}.
${topCategories.length > 0 ? `This represents ${((cat.amount / expenses) * 100).toFixed(1)}% of your total expenses. ` : ''}Tip: Cap this at 80–90% of its monthly budget and set an alert.`;
    }
    if (topCategories.length > 0) {
      return `I couldn't match a specific category. Your top spending categories: ${topCategories.slice(0, 5).map(x => `${x.name} (₹${Math.round(x.amount).toLocaleString()})`).join(', ')}.`;
    }
    return `I couldn't find spending data for that category. Add more transactions to track your spending better.`;
  }

  if (intent === 'budget_status') {
    const budgetTotal = analyzedData.budgetTotal || 0;
    const remaining = budgetRemaining;
    const over = overBudgetCategories.join(', ');
    const budgetUsage = budgetTotal > 0 ? ((expenses / budgetTotal) * 100).toFixed(1) : 0;
    return `Budget Status:
- Total Budget: ₹${Math.round(budgetTotal).toLocaleString()}
- Total Spent: ₹${Math.round(expenses).toLocaleString()} (${budgetUsage}% used)
- Remaining: ₹${Math.round(remaining).toLocaleString()}
${over ? `⚠️ Over budget categories: ${over}. ` : ''}${budgetTotal > 0 ? `Tip: Shift 5–10% from low-priority categories and set alerts at 80% utilization.` : 'Tip: Set a monthly budget to better track your spending.'}`;
  }

  if (intent === 'saving_tips') {
    const idea = ratePct < 10 ? 'Start a fixed SIP at 15–20% of income and trim subscriptions by 15–25%.' : ratePct < 20 ? 'Aim to increase your savings rate to 25–30% by automating monthly SIPs.' : 'Great savings rate! Consider increasing SIPs by 5–10% and building a 6-month emergency fund.';
    const subscriptionSave = subscriptionEstimate > 0 ? `Cutting subscriptions by 20% could save ~₹${Math.round(subscriptionEstimate * 0.2).toLocaleString()} per month.` : '';
    return `Your Financial Summary:
- Total Income: ₹${Math.round(income).toLocaleString()}
- Total Expenses: ₹${Math.round(expenses).toLocaleString()}
- Total Savings: ₹${Math.round(savings).toLocaleString()}
- Savings Rate: ${ratePct.toFixed(1)}%

${idea} ${subscriptionSave}`;
  }

  if (intent === 'investment_tax') {
    return `India-specific overview:
- Long-term (≥5y): SIPs in diversified equity index funds (Nifty 50/500) for growth.
- Tax-saving: ELSS under 80C; PPF for guaranteed, tax-free corpus (15y lock-in).
- Short-term (≤2y): debt funds or FDs; keep 6-month emergency fund in liquid/low-duration funds.
Align risk with goal horizon and review annually.`;
  }

  if (intent === 'forecast') {
    const monthlyData = Object.entries(monthlyBreakdown)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 3)
      .map(([label, data]) => ({ label, ...data }));
    
    if (monthlyData.length >= 2) {
      const latest = monthlyData[0];
      const prev = monthlyData[1];
      const delta = latest.savings - prev.savings;
      const trend = delta >= 0 ? 'up' : 'down';
      const projectedNextMonth = avgMonthlyIncome - avgMonthlyExpenses;
      return `Recent Monthly Trends:
- ${latest.label}: Income ₹${Math.round(latest.income).toLocaleString()}, Expenses ₹${Math.round(latest.expenses).toLocaleString()}, Savings ₹${Math.round(latest.savings).toLocaleString()}
- Trend: ${trend} by ₹${Math.round(Math.abs(delta)).toLocaleString()} vs previous month
- Projected next month savings: ~₹${Math.round(projectedNextMonth).toLocaleString()}

Use the Forecast page for detailed 3–12 month projections with scenario planning.`;
    }
    return `Average Monthly Performance:
- Income: ₹${Math.round(avgMonthlyIncome).toLocaleString()}
- Expenses: ₹${Math.round(avgMonthlyExpenses).toLocaleString()}
- Projected Savings: ₹${Math.round(avgMonthlyIncome - avgMonthlyExpenses).toLocaleString()}

Add more transactions and use the Forecast page for detailed projections.`;
  }

  if (intent === 'subscriptions') {
    const sub = subscriptionEstimate;
    if (sub > 0) {
      return `Subscription Spending Analysis:
- Estimated monthly subscriptions: ₹${Math.round(sub).toLocaleString()}
- This is ${((sub / expenses) * 100).toFixed(1)}% of your total expenses
- Cutting 20% saves ~₹${Math.round(sub * 0.2).toLocaleString()} per month
- Cutting 30% saves ~₹${Math.round(sub * 0.3).toLocaleString()} per month

Tip: Audit streaming services, cloud storage, and app memberships. Cancel unused subscriptions.`;
    }
    return `I couldn't detect significant subscription spending in your transactions. If you have subscriptions, make sure to categorize them properly (e.g., "Netflix Subscription", "Spotify Premium") for better tracking.`;
  }

  if (intent === 'raise') {
    const suggestedIncrease = avgMonthlyIncome * 0.1; // 10% raise example
    return `Salary Raise Planning (using 50/30/20 rule):
- Current monthly income: ₹${Math.round(avgMonthlyIncome).toLocaleString()}
- Example with ₹${Math.round(suggestedIncrease).toLocaleString()} raise:
  • 50% Needs: ₹${Math.round((avgMonthlyIncome + suggestedIncrease) * 0.5).toLocaleString()}
  • 30% Wants: ₹${Math.round((avgMonthlyIncome + suggestedIncrease) * 0.3).toLocaleString()}
  • 20% Savings: ₹${Math.round((avgMonthlyIncome + suggestedIncrease) * 0.2).toLocaleString()}

Tip: Auto-increase SIPs by 5–10% with your raise to avoid lifestyle creep.`;
  }

  if (intent === 'emergency_fund') {
    const monthlyBurn = avgMonthlyExpenses || expenses / 6;
    const targetEmergency = monthlyBurn * 6;
    const currentSavings = savings > 0 ? savings : 0;
    const shortfall = Math.max(0, targetEmergency - currentSavings);
    return `Emergency Fund Analysis:
- Average monthly expenses: ₹${Math.round(monthlyBurn).toLocaleString()}
- Target emergency fund (6 months): ₹${Math.round(targetEmergency).toLocaleString()}
${currentSavings > 0 ? `- Current savings: ₹${Math.round(currentSavings).toLocaleString()}` : ''}
${shortfall > 0 ? `- Shortfall: ₹${Math.round(shortfall).toLocaleString()}` : ''}
${shortfall > 0 ? `- Monthly contribution needed: ₹${Math.round(shortfall / 6).toLocaleString()}/month for 6 months` : '✅ You have enough for a 6-month emergency fund!'}

Tip: Build via monthly SIP to liquid/low-duration funds; keep it separate from investments.`;
  }

  if (intent === 'goals') {
    const monthlySurplus = avgMonthlyIncome - avgMonthlyExpenses;
    return `Goal-Based Planning:
- Average monthly surplus: ₹${Math.round(monthlySurplus).toLocaleString()}
- Current savings: ₹${Math.round(savings).toLocaleString()}

Strategy: Set each goal with target amount and timeline. Allocate monthly surplus proportionally by urgency (target amount / months remaining). Higher priority for shorter timelines.

Example Goals:
- Emergency Fund (6 months): ₹${Math.round(avgMonthlyExpenses * 6).toLocaleString()} - High Priority
- Vacation Fund: Set your target amount and timeline
- Major Purchase: Allocate based on target date

Use the Goals planner on the Forecast page to visualize and track allocations.`;
  }

  // General fallback with comprehensive data
  return buildComprehensiveAnalysis(analyzedData);
};

const buildComprehensiveAnalysis = (analyzedData) => {
  const {
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    topCategories,
    subscriptionEstimate,
    averageMonthlyIncome,
    averageMonthlyExpenses,
    transactionCount,
    budgetTotal,
    budgetRemaining,
    overBudgetCategories
  } = analyzedData;

  let analysis = `📊 Your Financial Overview:\n\n`;

  analysis += `💰 Totals:\n`;
  analysis += `- Total Income: ₹${Math.round(totalIncome).toLocaleString()}\n`;
  analysis += `- Total Expenses: ₹${Math.round(totalExpenses).toLocaleString()}\n`;
  analysis += `- Total Savings: ₹${Math.round(totalSavings).toLocaleString()}\n`;
  analysis += `- Savings Rate: ${savingsRate.toFixed(1)}%\n\n`;

  if (topCategories.length > 0) {
    analysis += `📈 Top Spending Categories:\n`;
    topCategories.slice(0, 5).forEach((cat, idx) => {
      const percentage = ((cat.amount / totalExpenses) * 100).toFixed(1);
      analysis += `${idx + 1}. ${cat.name}: ₹${Math.round(cat.amount).toLocaleString()} (${percentage}%)\n`;
    });
    analysis += `\n`;
  }

  if (averageMonthlyIncome > 0) {
    analysis += `📅 Monthly Averages:\n`;
    analysis += `- Income: ₹${Math.round(averageMonthlyIncome).toLocaleString()}/month\n`;
    analysis += `- Expenses: ₹${Math.round(averageMonthlyExpenses).toLocaleString()}/month\n`;
    analysis += `- Savings: ₹${Math.round(averageMonthlyIncome - averageMonthlyExpenses).toLocaleString()}/month\n\n`;
  }

  if (budgetTotal > 0) {
    const budgetUsage = ((totalExpenses / budgetTotal) * 100).toFixed(1);
    analysis += `🎯 Budget Status:\n`;
    analysis += `- Budget: ₹${Math.round(budgetTotal).toLocaleString()}\n`;
    analysis += `- Used: ${budgetUsage}%\n`;
    analysis += `- Remaining: ₹${Math.round(budgetRemaining).toLocaleString()}\n`;
    if (overBudgetCategories.length > 0) {
      analysis += `- ⚠️ Over budget: ${overBudgetCategories.join(', ')}\n`;
    }
    analysis += `\n`;
  }

  if (subscriptionEstimate > 0) {
    analysis += `💳 Subscriptions: ₹${Math.round(subscriptionEstimate).toLocaleString()}/month\n\n`;
  }

  analysis += `💡 Recommendations:\n`;
  if (savingsRate < 0) {
    analysis += `- You're running a deficit. Cut 15–25% from optional categories.\n`;
  } else if (savingsRate < 10) {
    analysis += `- Aim for 20–30% savings rate. Start a fixed SIP at 15–20% of income.\n`;
  } else if (savingsRate < 20) {
    analysis += `- Good progress! Increase SIPs to reach 25–30% savings rate.\n`;
  } else {
    analysis += `- Excellent savings rate! Consider increasing SIPs by 5–10% and building a 6-month emergency fund.\n`;
  }

  if (transactionCount < 20) {
    analysis += `- Add more transactions for better insights and forecasts.\n`;
  }

  return analysis;
};

const callGeminiAPI = async (message, analyzedData) => {
  const systemContext = `You are a helpful financial assistant for a personal finance app called Mudra. Analyze the user's financial data and provide personalized, actionable advice. Keep responses under 200 words, concise, and data-driven.`;
  
  const financialSummary = `User's Financial Data:
- Total Income: ₹${Math.round(analyzedData.totalIncome).toLocaleString()}
- Total Expenses: ₹${Math.round(analyzedData.totalExpenses).toLocaleString()}
- Total Savings: ₹${Math.round(analyzedData.totalSavings).toLocaleString()}
- Savings Rate: ${analyzedData.savingsRate.toFixed(1)}%
- Average Monthly Income: ₹${Math.round(analyzedData.averageMonthlyIncome).toLocaleString()}
- Average Monthly Expenses: ₹${Math.round(analyzedData.averageMonthlyExpenses).toLocaleString()}
- Total Transactions: ${analyzedData.transactionCount}
- Budget Total: ₹${Math.round(analyzedData.budgetTotal).toLocaleString()}
- Budget Remaining: ₹${Math.round(analyzedData.budgetRemaining).toLocaleString()}
${analyzedData.overBudgetCategories.length > 0 ? `- Over Budget Categories: ${analyzedData.overBudgetCategories.join(', ')}` : ''}

Top Spending Categories:
${analyzedData.topCategories.slice(0, 5).map((cat, idx) => `${idx + 1}. ${cat.name}: ₹${Math.round(cat.amount).toLocaleString()} (${((cat.amount / analyzedData.totalExpenses) * 100).toFixed(1)}%)`).join('\n')}

Monthly Trends (Last 3 months):
${Object.entries(analyzedData.monthlyBreakdown).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 3).map(([label, data]) => `${label}: Income ₹${Math.round(data.income).toLocaleString()}, Expenses ₹${Math.round(data.expenses).toLocaleString()}, Savings ₹${Math.round(data.savings).toLocaleString()}`).join('\n')}

${analyzedData.subscriptionEstimate > 0 ? `Subscription Spending: ₹${Math.round(analyzedData.subscriptionEstimate).toLocaleString()}/month` : ''}`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(
    geminiUrl,
    {
      contents: [
        {
          parts: [
            { text: `${systemContext}\n\n${financialSummary}\n\nUser Question: ${message}\n\nProvide personalized financial advice based on the user's actual data. Be specific with numbers and actionable recommendations.` },
          ],
        },
      ],
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
  );

  return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
};

module.exports = {
  isFinanceRelated,
  analyzeUserFinancialData,
  buildHeuristicAdvice,
  buildComprehensiveAnalysis,
  detectIntent,
  extractCategoryFromMessage,
  respondByIntent,
  callGeminiAPI,
};

