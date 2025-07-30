import { useState, useEffect } from 'react';
import { SearchForm } from '@/components/SearchForm';
import { SearchResults } from '@/components/SearchResults';
import { ApiKeySetup } from '@/components/ApiKeySetup';
import { FirecrawlService, SearchFilters, MotoResult } from '@/services/FirecrawlService';
import { useToast } from '@/components/ui/use-toast';
import { Bike } from 'lucide-react';

const Index = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MotoResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const apiKey = FirecrawlService.getApiKey();
    setHasApiKey(!!apiKey);
  }, []);

  const handleApiKeySet = () => {
    setHasApiKey(true);
  };

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const result = await FirecrawlService.searchMoto(filters);
      
      if (result.success) {
        setSearchResults(result.data || []);
        toast({
          title: "Ricerca completata",
          description: `Trovati ${result.data?.length || 0} risultati`,
        });
      } else {
        toast({
          title: "Errore nella ricerca",
          description: result.error || "Errore durante la ricerca",
          variant: "destructive",
        });
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Errore",
        description: "Errore durante la ricerca delle moto",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasApiKey) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      {/* Header */}
      <div className="text-center py-8 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Bike className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Ricerca Moto</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Trova la moto perfetta per te! Cerca tra migliaia di annunci da AutoScout24, Subito e altri siti specializzati.
        </p>
      </div>

      {/* Form di ricerca */}
      <div className="mb-8">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* Risultati */}
      {hasSearched && (
        <SearchResults results={searchResults} isLoading={isLoading} />
      )}
    </div>
  );
};

export default Index;
