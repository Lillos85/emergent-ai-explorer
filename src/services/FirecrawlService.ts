import FirecrawlApp from '@mendable/firecrawl-js';

export interface SearchFilters {
  marca?: string;
  modello?: string;
  prezzoMin?: number;
  prezzoMax?: number;
  annoMin?: number;
  annoMax?: number;
  chilometraggioMax?: number;
  regione?: string;
}

export interface MotoResult {
  titolo: string;
  prezzo: string;
  anno?: string;
  chilometraggio?: string;
  marca: string;
  modello: string;
  ubicazione?: string;
  immagine?: string;
  link: string;
  fonte: 'AutoScout24' | 'Subito' | 'eBay Motors';
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Firecrawl API');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      const testResponse = await this.firecrawlApp.scrapeUrl('https://example.com');
      return testResponse.success;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  private static buildSearchUrls(filters: SearchFilters): string[] {
    const urls: string[] = [];
    
    // AutoScout24
    let autoScoutUrl = 'https://www.autoscout24.it/lista/moto';
    const autoScoutParams = new URLSearchParams();
    
    if (filters.marca) autoScoutParams.append('make', filters.marca);
    if (filters.modello) autoScoutParams.append('model', filters.modello);
    if (filters.prezzoMin) autoScoutParams.append('pricefrom', filters.prezzoMin.toString());
    if (filters.prezzoMax) autoScoutParams.append('priceto', filters.prezzoMax.toString());
    if (filters.annoMin) autoScoutParams.append('fregfrom', filters.annoMin.toString());
    if (filters.annoMax) autoScoutParams.append('fregto', filters.annoMax.toString());
    
    if (autoScoutParams.toString()) {
      autoScoutUrl += '?' + autoScoutParams.toString();
    }
    urls.push(autoScoutUrl);

    // Subito.it
    let subitoUrl = 'https://www.subito.it/annunci-italia/vendita/moto-e-scooter/';
    const subitoParams = new URLSearchParams();
    
    if (filters.prezzoMin) subitoParams.append('ps', filters.prezzoMin.toString());
    if (filters.prezzoMax) subitoParams.append('pe', filters.prezzoMax.toString());
    if (filters.marca && filters.modello) {
      subitoParams.append('q', `${filters.marca} ${filters.modello}`);
    } else if (filters.marca) {
      subitoParams.append('q', filters.marca);
    }
    
    if (subitoParams.toString()) {
      subitoUrl += '?' + subitoParams.toString();
    }
    urls.push(subitoUrl);

    return urls;
  }

  static async searchMoto(filters: SearchFilters): Promise<{ success: boolean; error?: string; data?: MotoResult[] }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found. Please set your Firecrawl API key first.' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const searchUrls = this.buildSearchUrls(filters);
      const allResults: MotoResult[] = [];

      for (const url of searchUrls) {
        try {
          console.log('Scraping URL:', url);
          
          const scrapeResponse = await this.firecrawlApp.scrapeUrl(url, {
            formats: ['markdown', 'html'],
            includeTags: ['img', 'a', 'h1', 'h2', 'h3', 'span', 'div'],
            excludeTags: ['nav', 'footer', 'header']
          });

          if (scrapeResponse.success && scrapeResponse.metadata) {
            const results = this.extractMotoData(scrapeResponse, url);
            allResults.push(...results);
            console.log(`Found ${results.length} results from ${url}`);
          }
        } catch (error) {
          console.error(`Error scraping ${url}:`, error);
          // Continua con gli altri URL anche se uno fallisce
        }
      }

      return { 
        success: true,
        data: allResults.slice(0, 50) // Limita a 50 risultati
      };
    } catch (error) {
      console.error('Error during search:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search motorcycles' 
      };
    }
  }

  private static extractMotoData(scrapedData: any, sourceUrl: string): MotoResult[] {
    const results: MotoResult[] = [];
    const content = scrapedData.markdown || scrapedData.html || '';
    
    try {
      // Determina la fonte dal URL
      let fonte: 'AutoScout24' | 'Subito' | 'eBay Motors' = 'AutoScout24';
      if (sourceUrl.includes('subito.it')) {
        fonte = 'Subito';
      } else if (sourceUrl.includes('ebay')) {
        fonte = 'eBay Motors';
      }

      // Pattern generici per estrarre informazioni moto
      const pricePattern = /€\s*[\d.,]+|[\d.,]+\s*€/g;
      const yearPattern = /\b(19|20)\d{2}\b/g;
      const kmPattern = /[\d.,]+\s*km|km\s*[\d.,]+/gi;
      
      // Cerca pattern specifici per fonte
      if (fonte === 'AutoScout24') {
        // Pattern specifici per AutoScout24
        const titlePattern = /([A-Z][a-z]+\s+[A-Za-z0-9\s]+)/g;
        const titles = content.match(titlePattern) || [];
        const prices = content.match(pricePattern) || [];
        
        for (let i = 0; i < Math.min(titles.length, prices.length, 10); i++) {
          const title = titles[i].trim();
          const parts = title.split(' ');
          
          results.push({
            titolo: title,
            prezzo: prices[i],
            marca: parts[0] || '',
            modello: parts.slice(1).join(' ') || '',
            link: sourceUrl,
            fonte: fonte
          });
        }
      } else if (fonte === 'Subito') {
        // Pattern specifici per Subito
        const lines = content.split('\n').filter(line => line.trim());
        
        for (let i = 0; i < lines.length && results.length < 10; i++) {
          const line = lines[i];
          if (line.includes('€') && (line.toLowerCase().includes('moto') || line.toLowerCase().includes('scooter'))) {
            const priceMatch = line.match(pricePattern);
            const yearMatch = line.match(yearPattern);
            const kmMatch = line.match(kmPattern);
            
            if (priceMatch) {
              const words = line.split(' ').filter(w => w.length > 2);
              
              results.push({
                titolo: line.trim(),
                prezzo: priceMatch[0],
                anno: yearMatch ? yearMatch[0] : undefined,
                chilometraggio: kmMatch ? kmMatch[0] : undefined,
                marca: words[0] || '',
                modello: words.slice(1, 3).join(' ') || '',
                link: sourceUrl,
                fonte: fonte
              });
            }
          }
        }
      }

      // Se non troviamo risultati specifici, usa pattern generici
      if (results.length === 0) {
        const lines = content.split('\n').filter(line => 
          line.trim() && 
          (line.includes('€') || line.match(yearPattern)) &&
          line.length > 10 && 
          line.length < 200
        );

        for (let i = 0; i < Math.min(lines.length, 5); i++) {
          const line = lines[i];
          const priceMatch = line.match(pricePattern);
          const yearMatch = line.match(yearPattern);
          const words = line.split(' ').filter(w => w.length > 2);
          
          results.push({
            titolo: line.trim(),
            prezzo: priceMatch ? priceMatch[0] : 'N/A',
            anno: yearMatch ? yearMatch[0] : undefined,
            marca: words[0] || 'N/A',
            modello: words.slice(1, 3).join(' ') || 'N/A',
            link: sourceUrl,
            fonte: fonte
          });
        }
      }

    } catch (error) {
      console.error('Error extracting data:', error);
    }

    return results.filter(r => r.titolo && r.prezzo);
  }
}