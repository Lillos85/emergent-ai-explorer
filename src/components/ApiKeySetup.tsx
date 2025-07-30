import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FirecrawlService } from '@/services/FirecrawlService';
import { useToast } from '@/components/ui/use-toast';
import { Key, ExternalLink, Check } from 'lucide-react';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const { toast } = useToast();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci una API key valida",
        variant: "destructive",
      });
      return;
    }

    setIsTestingKey(true);
    
    try {
      const isValid = await FirecrawlService.testApiKey(apiKey);
      
      if (isValid) {
        FirecrawlService.saveApiKey(apiKey);
        toast({
          title: "Successo",
          description: "API key configurata correttamente!",
        });
        onApiKeySet();
      } else {
        toast({
          title: "Errore",
          description: "API key non valida. Controlla che sia corretta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante la verifica dell'API key",
        variant: "destructive",
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Configurazione API</h1>
          <p className="text-muted-foreground">
            Inserisci la tua API key di Firecrawl per iniziare a cercare moto
          </p>
        </div>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <p className="mb-2">
                Per utilizzare l'app di ricerca moto, hai bisogno di una API key di Firecrawl.
              </p>
              <Button 
                variant="link" 
                asChild 
                className="p-0 h-auto font-normal"
              >
                <a 
                  href="https://firecrawl.dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  Ottieni la tua API key qui
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key Firecrawl</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="fc-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
            />
          </div>

          <Button 
            onClick={handleSaveApiKey} 
            disabled={isTestingKey || !apiKey.trim()}
            className="w-full"
          >
            {isTestingKey ? (
              'Verifica in corso...'
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Salva e continua
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 text-xs text-muted-foreground text-center">
          <p>
            La tua API key viene salvata localmente nel browser e non viene condivisa.
          </p>
        </div>
      </Card>
    </div>
  );
};