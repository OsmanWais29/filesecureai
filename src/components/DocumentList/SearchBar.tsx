
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  type: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('smart-search', {
          body: { query: debouncedSearch }
        });

        if (error) throw error;

        setResults(data.results);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          variant: "destructive",
          title: "Search Error",
          description: "Failed to perform search. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch, toast]);

  const handleResultClick = (result: SearchResult) => {
    onSearchChange(result.title);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen && results.length > 0} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          {results.map((result) => (
            <button
              key={result.id}
              className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              onClick={() => handleResultClick(result)}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <span>{result.title}</span>
              <span className="text-xs text-muted-foreground ml-auto">{result.type}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
