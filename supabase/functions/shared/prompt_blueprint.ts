export const analysisBlueprint = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Idea Analysis</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: #33475b; max-width: 800px; margin: 20px auto; border: 1px solid #cbd6e2; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

    <h1 style="font-size: 24px; color: #33475b; border-bottom: 2px solid #FF7A59; padding-bottom: 10px; margin-bottom: 20px;">AI Content Idea Analysis</h1>
    <h2 style="font-size: 20px; color: #425B76;">{{IDEA_TITLE}}</h2>

    <!-- 1. Executive Summary -->
    <div style="background-color: #F5F8FA; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #eaf0f6;">
        <h3 style="margin-top: 0; color: #FF7A59; font-size: 18px;">1. Executive Summary & Recommendation</h3>
        <p><strong>One-Sentence Summary:</strong> [Provide a concise, single-sentence summary of the core content idea and its primary goal.]</p>
        <p><strong>Overall Recommendation:</strong> <span style="font-weight: bold; padding: 3px 8px; border-radius: 3px; color: white; background-color: #00a4bd;">[Based on the entire analysis, provide a clear "Go", "Refine", or "Pass" recommendation.]</span></p>
    </div>

    <!-- 2. Predictive Analysis -->
    <h3 style="color: #FF7A59; font-size: 18px;">2. Predictive Analysis & Impact Forecast</h3>
    <ul>
        <li><strong>Audience Reach Forecast:</strong> [Choose Niche, Targeted, or Broad. Provide a detailed, multi-sentence justification explaining why, referencing the target audience and the topic's general appeal.]</li>
        <li><strong>Virality Potential:</strong> [Choose Low, Medium, or High. Provide a detailed justification based on emotional triggers, shareability, and existing trends. What elements could make this go viral?]</li>
        <li><strong>Predicted Audience Sentiment:</strong> [Choose Positive, Neutral, or Mixed. Provide a detailed justification explaining the likely audience reaction based on the topic's nature and the provided search context.]</li>
        <li><strong>Potential Share of Voice (SOV):</strong> [Choose Low, Medium, or High. Justify your choice by analyzing the competitive landscape from the search context. How hard will it be to rank and get noticed?]</li>
    </ul>

    <!-- 3. Creative Deep Dive -->
    <h3 style="color: #FF7A59; font-size: 18px;">3. Creative & Content Deep Dive</h3>
    <p><strong>Target Audience Profile:</strong> [Provide a detailed, multi-paragraph description of the ideal target audience. Include demographics, psychographics, pain points, and motivations.]</p>
    <p><strong>Optimal Format(s):</strong> [List at least 2-3 optimal formats (e.g., Blog Post, Podcast, YouTube Video, Twitter Thread) and explain why each is a good fit.]</p>
    <p><strong>Proposed Angles & Titles:</strong></p>
    <ul style="list-style-type: none; padding-left: 0;">
        <li><strong>Angle 1:</strong> [Describe a unique, compelling angle for this idea in detail.]<ul><li>Title Idea: [Provide a catchy, SEO-friendly title for this angle.]</li><li>Title Idea: [Provide another distinct title option.]</li></ul></li>
        <li><strong>Angle 2:</strong> [Describe a second, different angle for this idea in detail.]<ul><li>Title Idea: [Provide a catchy, SEO-friendly title for this angle.]</li><li>Title Idea: [Provide another distinct title option.]</li></ul></li>
    </ul>
    <p><strong>High-Level Outline:</strong></p>
    <ol><li>[Create a detailed, multi-point outline for the content. This should have at least 5-7 key points with sub-bullets if necessary.]</li></ol>

    <!-- 4. Market Analysis -->
    <h3 style="color: #FF7A59; font-size: 18px;">4. Market & Ecosystem Analysis</h3>
    <p><strong>Topic Trend & Relevance:</strong> [Analyze the topic's trend (Trending, Evergreen, or Fading) and its current relevance in detail. Use the search context to support your analysis. Why is this important right now?]</p>
    <p><strong>Competitive Landscape:</strong> [Provide a detailed, multi-paragraph summary of the competitive landscape based on the search context. Mention specific competitors, their angles, and identify gaps.]</p>
    <p><strong>The HubSpot Angle (Unique Differentiator):</strong> [Describe in detail how HubSpot can create a uniquely valuable and differentiated piece of content on this topic. What's the specific take or value-add that only HubSpot can provide?]</p>
    <p><strong>Creator/Show & Brand Fit:</strong> [Provide a detailed analysis of how this idea fits with HubSpot's brand and which specific creators or shows in the HubSpot network would be a perfect fit.]</p>

    <!-- 5. Execution Strategy -->
    <h3 style="color: #FF7A59; font-size: 18px;">5. Execution & Distribution Strategy</h3>
    <p><strong>Estimated Production Effort:</strong> [Choose Low, Medium, or High. Provide a detailed justification explaining the resources, time, and complexity involved.]</p>
    <p><strong>Key Amplifier Identification:</strong> [List at least 3-5 specific influencers, publications, or communities that would be ideal for amplifying this content. Explain why each is a good fit.]</p>

    <!-- 6. Scoring Rationale -->
    <div style="background-color: #F5F8FA; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #eaf0f6;">
      <h3 style="margin-top: 0; color: #FF7A59; font-size: 18px;">6. Scoring Rationale & Breakdown</h3>
      <p><strong>Rationale:</strong> [Provide a detailed, multi-sentence paragraph explaining your thought process for the final score. Reference specific strengths and weaknesses to justify the quantitative assessment. This is your "chain of thought."]</p>
      <table style="width: 100%; border-collapse: collapse;">
          <thead>
              <tr>
                  <th style="border: 1px solid #cbd6e2; padding: 8px; text-align: left; background-color: #eaf0f6;">Criterion</th>
                  <th style="border: 1px solid #cbd6e2; padding: 8px; text-align: left; background-color: #eaf0f6;">Weight</th>
                  <th style="border: 1px solid #cbd6e2; padding: 8px; text-align: left; background-color: #eaf0f6;">Score (1-10)</th>
                  <th style="border: 1px solid #cbd6e2; padding: 8px; text-align: left; background-color: #eaf0f6;">Justification</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">Audience Fit</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">30%</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Score 1-10]</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Briefly justify score]</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">Business Alignment & SEO</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">30%</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Score 1-10]</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Briefly justify score]</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">Originality & Uniqueness</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">20%</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Score 1-10]</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Briefly justify score]</td>
              </tr>
              <tr>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">Virality & Shareability</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">20%</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Score 1-10]</td>
                  <td style="border: 1px solid #cbd6e2; padding: 8px;">[Briefly justify score]</td>
              </tr>
          </tbody>
      </table>
    </div>
    <!-- 7. Final Assessment & Score -->
    <div style="border: 2px solid #33475b; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #33475b; font-size: 18px;">7. Final Assessment & Score</h3>
        <p><strong>Overall Score:</strong> <strong style="font-size: 1.2em; color: #FF7A59;">[Calculate the weighted average from the table above and present the final score.]/100</strong></p>
        <p><strong>Strengths:</strong></p>
        <ul><li>[List at least 3-4 specific, detailed strengths of this idea. Be specific.]</li></ul>
        <p><strong>Risks & Weaknesses:</strong></p>
        <ul><li>[List at least 3-4 specific, detailed risks or weaknesses. What could go wrong? What are the challenges?]</li></ul>
        <p><strong>Actionable Feedback:</strong> [Provide a detailed, multi-sentence paragraph with concrete, actionable steps to improve the idea or mitigate its risks.]</p>
    </div>

</body>
</html>
` 