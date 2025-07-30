import { MotoResult } from '@/services/FirecrawlService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Gauge, MapPin, Euro } from 'lucide-react';

interface SearchResultsProps {
  results: MotoResult[];
  isLoading: boolean;
}

export const SearchResults = ({ results, isLoading }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Ricerca in corso...</p>
          <p className="text-sm text-muted-foreground">Stiamo cercando le migliori offerte per te</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Nessun risultato trovato</h3>
          <p className="text-muted-foreground">
            Prova a modificare i criteri di ricerca per trovare più risultati.
          </p>
        </Card>
      </div>
    );
  }

  const getSourceBadgeColor = (fonte: string) => {
    switch (fonte) {
      case 'AutoScout24': return 'bg-blue-500';
      case 'Subito': return 'bg-red-500';
      case 'eBay Motors': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Risultati della ricerca ({results.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((moto, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header con fonte */}
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  className={`text-white ${getSourceBadgeColor(moto.fonte)}`}
                >
                  {moto.fonte}
                </Badge>
              </div>

              {/* Titolo e marca/modello */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                  {moto.titolo}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{moto.marca}</span>
                  {moto.modello && (
                    <>
                      <span>•</span>
                      <span>{moto.modello}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Prezzo */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {moto.prezzo}
                  </span>
                </div>
              </div>

              {/* Dettagli */}
              <div className="space-y-2 mb-4">
                {moto.anno && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Anno: {moto.anno}</span>
                  </div>
                )}
                
                {moto.chilometraggio && (
                  <div className="flex items-center gap-2 text-sm">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span>Km: {moto.chilometraggio}</span>
                  </div>
                )}
                
                {moto.ubicazione && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{moto.ubicazione}</span>
                  </div>
                )}
              </div>

              {/* Pulsante visualizza */}
              <Button 
                asChild 
                className="w-full"
                variant="default"
              >
                <a 
                  href={moto.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Visualizza annuncio
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {results.length > 0 && (
        <div className="text-center pt-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {results.length} risultati. 
            Affina la ricerca per risultati più specifici.
          </p>
        </div>
      )}
    </div>
  );
};