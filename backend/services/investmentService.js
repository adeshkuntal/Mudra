const allocationProfiles = {
  conservative: [
    { asset: "Debt & Fixed Income", weight: 0.5, expectedReturn: 0.07, instruments: ["Short-term Debt Funds", "Recurring Deposit", "Corporate Bond Funds"] },
    { asset: "Gold", weight: 0.2, expectedReturn: 0.06, instruments: ["Sovereign Gold Bonds", "Gold ETF"] },
    { asset: "Equity/SIP", weight: 0.2, expectedReturn: 0.12, instruments: ["Large-cap Index Funds", "Flexi-cap Funds"] },
    { asset: "Cash & Emergency", weight: 0.1, expectedReturn: 0.04, instruments: ["Liquid Funds", "High-yield Savings"] },
  ],
  balanced: [
    { asset: "Equity/SIP", weight: 0.45, expectedReturn: 0.12, instruments: ["Nifty 50 Index Fund", "Multi-cap Fund", "International ETF"] },
    { asset: "Debt & Fixed Income", weight: 0.3, expectedReturn: 0.07, instruments: ["Short Duration Debt Funds", "PPF", "Target Maturity Funds"] },
    { asset: "Gold", weight: 0.15, expectedReturn: 0.06, instruments: ["SGB", "Gold Fund of Funds"] },
    { asset: "Cash & Emergency", weight: 0.1, expectedReturn: 0.04, instruments: ["Liquid Funds", "Sweep-in FD"] },
  ],
  aggressive: [
    { asset: "Equity/SIP", weight: 0.6, expectedReturn: 0.13, instruments: ["Nifty Next 50", "Mid-cap Index", "Thematic SIP (EV/Tech)"] },
    { asset: "Debt & Fixed Income", weight: 0.2, expectedReturn: 0.07, instruments: ["Short-term Debt", "Dynamic Bond Funds"] },
    { asset: "Gold", weight: 0.1, expectedReturn: 0.06, instruments: ["SGB", "Gold ETF"] },
    { asset: "Cash & Emergency", weight: 0.1, expectedReturn: 0.04, instruments: ["Liquid Funds", "Ultra Short Duration"] },
  ],
};

const riskSummaries = {
  conservative: "Low volatility focus. Capital preservation with steady growth via debt-heavy allocation.",
  balanced: "Blend of growth and stability with diversified SIPs, debt, and gold exposure.",
  aggressive: "Maximizes long-term growth via higher equity allocation; expect higher volatility.",
};

const monthlyForecast = (monthlyContribution, allocations) => {
  const months = 12;
  const forecast = [];
  let totalValue = 0;

  for (let i = 1; i <= months; i++) {
    let monthValue = 0;
    allocations.forEach((alloc) => {
      const sip = monthlyContribution * alloc.weight;
      // monthly compound approx: (1 + annualReturn)^(1/12) - 1
      const monthlyReturn = Math.pow(1 + alloc.expectedReturn, 1 / 12) - 1;
      const projected = (sip * i) * (1 + monthlyReturn * i * 0.5);
      monthValue += projected;
    });
    totalValue = monthValue;
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    forecast.push({
      label: date.toLocaleString("default", { month: "short" }),
      value: Number(totalValue.toFixed(0)),
    });
  }

  return forecast;
};

const generateRebalancingTips = (riskProfile, allocations) => {
  const tips = [
    "Review SIP performance monthly; rebalance when any asset drifts 5% away from target weight.",
    "Automate SIP dates within 2-3 days post salary credit to avoid cash drag.",
    "Redirect bonuses or windfalls towards underweight asset classes.",
  ];

  if (riskProfile === "aggressive") {
    tips.push("Book equity gains yearly and rotate into debt/gold to protect profits.");
  } else if (riskProfile === "conservative") {
    tips.push("Keep at least 8-10 months of expenses in cash/liquid assets before increasing equity.");
  }

  return tips;
};

const generateInvestmentPlan = ({ riskProfile = "balanced", monthlyContribution = 10000, income = 0, savingsRate = 0 }) => {
  const profileKey = riskProfile.toLowerCase();
  const allocations = allocationProfiles[profileKey] || allocationProfiles.balanced;
  const summary = riskSummaries[profileKey] || riskSummaries.balanced;
  const recommendedContribution = monthlyContribution || Math.max(5000, Math.round(income * (savingsRate > 0 ? Math.min(savingsRate / 100, 0.3) : 0.2)));

  const enrichedAllocations = allocations.map((alloc) => ({
    ...alloc,
    monthlySip: Number((recommendedContribution * alloc.weight).toFixed(0)),
  }));

  const forecast = monthlyForecast(recommendedContribution, allocations);

  return {
    summary,
    monthlyContribution: recommendedContribution,
    allocations: enrichedAllocations,
    forecast,
    expectedAnnualReturn: allocations.reduce((sum, alloc) => sum + (alloc.weight * alloc.expectedReturn * 100), 0).toFixed(1),
    rebalancing: {
      frequency: "Monthly review, quarterly rebalance",
      tips: generateRebalancingTips(profileKey, allocations),
    },
  };
};

module.exports = {
  generateInvestmentPlan,
};

