import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFilters } from '@/services/FirecrawlService';
import { Search, Settings } from 'lucide-react';

const searchSchema = z.object({
  marca: z.string().optional(),
  modello: z.string().optional(),
  prezzoMin: z.number().optional(),
  prezzoMax: z.number().optional(),
  annoMin: z.number().optional(),
  annoMax: z.number().optional(),
  chilometraggioMax: z.number().optional(),
  regione: z.string().optional(),
});

const marche = [
  'Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'BMW', 'KTM', 
  'Aprilia', 'Triumph', 'Harley-Davidson', 'Moto Guzzi', 'Piaggio'
];

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

export const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<SearchFilters>({
    resolver: zodResolver(searchSchema),
  });

  const watchedMarca = watch('marca');

  const onSubmit = (data: SearchFilters) => {
    // Rimuovi campi vuoti
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
    );
    onSearch(cleanData);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6" />
          Cerca la tua moto
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          {showAdvanced ? 'Nascondi filtri' : 'Filtri avanzati'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Ricerca principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Select onValueChange={(value) => setValue('marca', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona marca" />
              </SelectTrigger>
              <SelectContent>
                {marche.map((marca) => (
                  <SelectItem key={marca} value={marca}>
                    {marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modello">Modello</Label>
            <Input
              id="modello"
              placeholder="es. CBR600, R1, Ninja..."
              {...register('modello')}
            />
          </div>
        </div>

        {/* Prezzo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prezzoMin">Prezzo minimo (€)</Label>
            <Input
              id="prezzoMin"
              type="number"
              placeholder="0"
              {...register('prezzoMin', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prezzoMax">Prezzo massimo (€)</Label>
            <Input
              id="prezzoMax"
              type="number"
              placeholder="50000"
              {...register('prezzoMax', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Filtri avanzati */}
        {showAdvanced && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-semibold text-lg">Filtri avanzati</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annoMin">Anno minimo</Label>
                <Input
                  id="annoMin"
                  type="number"
                  placeholder="2000"
                  {...register('annoMin', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annoMax">Anno massimo</Label>
                <Input
                  id="annoMax"
                  type="number"
                  placeholder="2024"
                  {...register('annoMax', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chilometraggioMax">Chilometraggio massimo</Label>
                <Input
                  id="chilometraggioMax"
                  type="number"
                  placeholder="100000"
                  {...register('chilometraggioMax', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regione">Regione</Label>
                <Input
                  id="regione"
                  placeholder="es. Lombardia, Lazio..."
                  {...register('regione')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pulsanti */}
        <div className="flex gap-4 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 h-12 text-lg"
          >
            {isLoading ? 'Ricerca in corso...' : 'Cerca moto'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
            className="px-8"
          >
            Reset
          </Button>
        </div>
      </form>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Cerchiamo su: AutoScout24, Subito.it e altri siti specializzati</p>
      </div>
    </Card>
  );
};