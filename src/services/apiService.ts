import { APIConfig, APIResponse, SearchResult } from "../types";

export class APIService {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  private getAPIEndpoint(): string {
    switch (this.config.provider) {
      case "openrouter":
        return "https://openrouter.ai/api/v1/chat/completions";
      case "openai":
        return "https://api.openai.com/v1/chat/completions";
      default:
        throw new Error(`Unsupported API provider: ${this.config.provider}`);
    }
  }

  private getHeaders(): Record<string, string> {
    const baseHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
    };

    if (this.config.provider === "openrouter") {
      return {
        ...baseHeaders,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Search Engine",
      };
    }

    return baseHeaders;
  }

  async performSearch(query: string, page: number): Promise<SearchResult[]> {
    const endpoint = this.getAPIEndpoint();
    const headers = this.getHeaders();

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: `Generate exactly 10 search results for "${query}" (page ${page}). Return ONLY valid JSON array with no extra text. Make sure results are different from previous pages:
[
{"title":"Title 1","description":"Description 1","url":"https://example1.com"},
{"title":"Title 2","description":"Description 2","url":"https://example2.com"},
{"title":"Title 3","description":"Description 3","url":"https://example3.com"},
{"title":"Title 4","description":"Description 4","url":"https://example4.com"},
{"title":"Title 5","description":"Description 5","url":"https://example5.com"},
{"title":"Title 6","description":"Description 6","url":"https://example6.com"},
{"title":"Title 7","description":"Description 7","url":"https://example7.com"},
{"title":"Title 8","description":"Description 8","url":"https://example8.com"},
{"title":"Title 9","description":"Description 9","url":"https://example9.com"},
{"title":"Title 10","description":"Description 10","url":"https://example10.com"}
]`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data: APIResponse = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;

      try {
        const cleanedContent = content
          .replace(/&#x[\da-f]+;/gi, "")
          .replace(/[^\x20-\x7E\n\r\t]/g, "");

        const jsonObjects: SearchResult[] = [];
        const regex =
          /\{"title":\s*"([^"]+)",\s*"description":\s*"([^"]+)",\s*"url":\s*"([^"]+)"\}/g;
        let match;

        while ((match = regex.exec(cleanedContent)) !== null) {
          jsonObjects.push({
            title: match[1],
            description: match[2],
            url: match[3],
          });
        }

        if (jsonObjects.length > 0) {
          return jsonObjects;
        } else {
          const jsonMatch = cleanedContent.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            const searchResults: SearchResult[] = JSON.parse(jsonMatch[0]);
            if (Array.isArray(searchResults)) {
              return searchResults;
            }
          }
          throw new Error("No valid results found");
        }
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return [
          {
            title: `Results for "${query}" - Page ${page}`,
            description: "Error parsing LLM response. Sample result.",
            url: `https://example.com/page/${page}`,
          },
        ];
      }
    } else {
      throw new Error("Invalid API response");
    }
  }

  async generatePage(request: {
    result: SearchResult;
    originalQuery: string;
  }): Promise<any> {
    const endpoint = this.getAPIEndpoint();
    const headers = this.getHeaders();

    // Use a different model for page generation if it's OpenRouter
    const model =
      this.config.provider === "openrouter"
        ? "google/gemini-2.5-flash"
        : this.config.model;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: `Create a realistic webpage that provides GENUINE, VALUABLE INFORMATION about the specific topic. This must be content that would actually be useful to someone searching for this information.

SEARCH CONTEXT:
- Query: "${request.originalQuery}"
- Title: "${request.result.title}" 
- Description: "${request.result.description}"
- URL: "${request.result.url}"

CRITICAL: The page must contain REAL, USEFUL INFORMATION about the topic in the title. Analyze what someone searching for "${request.originalQuery}" would actually want to learn about "${request.result.title}".

CONTENT REQUIREMENTS:
1. SUBSTANTIAL INFORMATION (800-1200 words) directly related to the title topic
2. Include SPECIFIC, PRACTICAL details like:
   - Step-by-step instructions or guides
   - Technical specifications or requirements  
   - Pricing, costs, or budget information
   - Pros and cons, comparisons
   - Real examples, case studies, or scenarios
   - Historical context or background
   - Tips, best practices, common mistakes
   - Relevant statistics or data

3. Make it GENUINELY HELPFUL - someone should learn something valuable
4. Include realistic details: dates, locations, names, prices, measurements
5. Write in a knowledgeable, authoritative tone
6. Structure with clear, topic-specific headings

DESIGN VARIETY (choose randomly):
- Technical documentation style (clean, organized)
- Blog article with author bio
- Review/comparison site
- Educational resource page
- News/magazine article
- Product showcase page
- Tutorial/how-to guide
- Industry analysis report

VISUAL THEMES (vary each time):
- Professional blue/gray scheme
- Warm earthy tones (browns/oranges)
- Modern dark theme
- Clean minimal white/gray
- Vibrant color accents
- Corporate navy/white
- Creative colorful design
- Tech-focused purple/cyan

NEVER:
- Use generic business content ("Our Services", "Contact Us")
- Make it about a fake company selling services
- Include placeholder text or vague descriptions
- Mention it's AI-generated or fake

FOCUS: Create content someone would genuinely bookmark or share because it's useful for understanding "${request.result.title}".

CRITICAL JSON FORMATTING RULES:
1. Return ONLY valid JSON - no explanations, no markdown, no extra text
2. Use only double quotes (") for JSON strings
3. Escape all quotes inside content with \"
4. No line breaks inside JSON string values - use \\n instead
5. No unescaped special characters
6. Always end properties with commas except the last one

YOU MUST INCLUDE ALL 4 PROPERTIES: html, css, title, url

EXACT FORMAT (ALL 4 PROPERTIES REQUIRED):
{
  "html": "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>${request.result.title}</title></head><body>[HTML_CONTENT_HERE]</body></html>",
  "css": "[CSS_CONTENT_HERE]", 
  "title": "${request.result.title}",
  "url": "${request.result.url}"
}

CRITICAL: Your response must end with the url property. Do not forget title and url!`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data: APIResponse = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;

      try {
        let jsonString = content.trim();

        jsonString = jsonString
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
        jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");

        const startIndex = jsonString.indexOf("{");
        if (startIndex !== -1) {
          let braceCount = 0;
          let endIndex = -1;

          for (let i = startIndex; i < jsonString.length; i++) {
            if (jsonString[i] === "{") {
              braceCount++;
            } else if (jsonString[i] === "}") {
              braceCount--;
              if (braceCount === 0) {
                endIndex = i;
                break;
              }
            }
          }

          if (endIndex !== -1) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
          }
        }

        let generatedPage;
        try {
          generatedPage = JSON.parse(jsonString);
        } catch (parseError: any) {
          if (parseError.message && parseError.message.includes("column")) {
            const match = parseError.message.match(/line (\d+) column (\d+)/);
            if (match) {
              const line = parseInt(match[1]);
              const col = parseInt(match[2]);
              const lines = jsonString.split("\n");
              const errorLine = lines[line - 1] || "";
              const errorContext = errorLine.substring(
                Math.max(0, col - 50),
                col + 50,
              );
              console.log(`JSON Error at line ${line}, column ${col}:`);
              console.log(`Context: "${errorContext}"`);
              console.log(`Character at error: "${errorLine[col - 1]}"`);
            }
          }
          throw parseError;
        }

        if (
          generatedPage.html &&
          generatedPage.css &&
          generatedPage.title &&
          generatedPage.url
        ) {
          return generatedPage;
        } else {
          throw new Error(
            `Invalid page structure - missing: ${[
              !generatedPage.html ? "html" : "",
              !generatedPage.css ? "css" : "",
              !generatedPage.title ? "title" : "",
              !generatedPage.url ? "url" : "",
            ]
              .filter(Boolean)
              .join(", ")}`,
          );
        }
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.log("Content received:", content);
        throw new Error("Error parsing JSON from LLM response");
      }
    } else {
      throw new Error("Invalid API response");
    }
  }
}
