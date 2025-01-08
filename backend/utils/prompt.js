export function generatePrompt(companyInfo, processedFileText) {
  const analysisPrompt = `Please help me analyze the following excerpts from the company ${companyInfo.name} in the ${companyInfo.industry} industry, to evaluate the bull vs bear case for the stock. For each category below, please:
1. Rate it on a scale of 1-5 (1 being very bearish, 5 being very bullish)
2. Provide key supporting evidence from the provided document text (include page numbers from the text)
3. Flag any significant risks or concerns

Key areas to analyze:

Financial Health & Growth:
- Revenue growth trends and quality
- Margin evolution and profitability
- Cash flow generation
- Balance sheet strength
- Capital allocation strategy

Market Position:
- Market share trends
- Competitive advantages
- Brand strength
- Industry position
- Geographic expansion opportunities

Business Model:
- Revenue diversification
- Customer concentration
- Pricing power
- Operating leverage
- Recurring revenue %

Management & Governance:
- Executive compensation alignment
- Capital allocation track record
- Corporate governance practices
- Insider ownership
- Management credibility

Risk Factors:
- Regulatory environment
- Technology disruption risk
- Customer/supplier concentration
- Geographic/political exposure
- Industry-specific risks

Growth Investments:
- R&D spending trends
- Capital expenditure plans
- M&A strategy
- New product pipeline
- Market expansion initiatives

After analyzing these categories, please:
1. Provide an overall bull/bear rating (1-5)
2. List the top 3 bull and bear considerations
3. Identify key metrics to monitor going forward
4. Flag any potential catalysts (both positive and negative)
5. Note areas where additional research beyond the 10-K would be valuable`;

  return `${analysisPrompt}\n\n${processedFileText}`;
}
