import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Globe,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScrapingResult {
  name: string;
  position: string;
  found: boolean;
  photoUrl?: string;
  sourceUrl?: string;
  source?: string;
  error?: string;
}

interface ScrapingResponse {
  success: boolean;
  dryRun: boolean;
  processed: number;
  found: number;
  notFound: number;
  results: ScrapingResult[];
  message?: string;
  error?: string;
}

export function BatchPhotoScraper() {
  const [isRunning, setIsRunning] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [limit, setLimit] = useState(20);
  const [prioritizeNational, setPrioritizeNational] = useState(true);
  const [migrateExisting, setMigrateExisting] = useState(true);
  const [results, setResults] = useState<ScrapingResult[]>([]);
  const [summary, setSummary] = useState<{ processed: number; found: number; notFound: number } | null>(null);

  const runScraper = async () => {
    setIsRunning(true);
    setResults([]);
    setSummary(null);

    try {
      toast.info("Starting photo scraper...", { description: "This may take a few minutes" });

      const { data, error } = await supabase.functions.invoke('batch-scrape-photos', {
        body: { 
          limit, 
          dryRun, 
          prioritizeNational,
          migrateExisting 
        },
      });

      if (error) {
        throw error;
      }

      const response = data as ScrapingResponse;

      if (response.success) {
        setResults(response.results || []);
        setSummary({
          processed: response.processed,
          found: response.found,
          notFound: response.notFound,
        });

        if (response.processed === 0) {
          toast.success("All leaders already have photos!");
        } else if (dryRun) {
          toast.success(`Dry run complete! Would find ${response.found} photos for ${response.processed} leaders`);
        } else {
          toast.success(`Successfully scraped ${response.found} photos for ${response.processed} leaders`);
        }
      } else {
        throw new Error(response.error || "Unknown error");
      }
    } catch (error) {
      console.error("Scraping error:", error);
      toast.error("Failed to run scraper", { 
        description: error instanceof Error ? error.message : "Check console for details" 
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getSourceBadgeVariant = (source?: string) => {
    if (!source) return "secondary";
    if (source.includes("Streamline")) return "default";
    if (source.includes("Parliament")) return "secondary";
    if (source.includes("Maarifa")) return "outline";
    return "secondary";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Batch Photo Scraper
        </CardTitle>
        <CardDescription>
          Automatically find and download leader photos from multiple sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="limit">Leaders to process</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={isRunning}
            />
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="dry-run"
              checked={dryRun}
              onCheckedChange={setDryRun}
              disabled={isRunning}
            />
            <Label htmlFor="dry-run" className="text-sm">
              Dry run (preview only)
            </Label>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="prioritize-national"
              checked={prioritizeNational}
              onCheckedChange={setPrioritizeNational}
              disabled={isRunning}
            />
            <Label htmlFor="prioritize-national" className="text-sm">
              Prioritize national leaders
            </Label>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="migrate-existing"
              checked={migrateExisting}
              onCheckedChange={setMigrateExisting}
              disabled={isRunning}
            />
            <Label htmlFor="migrate-existing" className="text-sm">
              Migrate external URLs
            </Label>
          </div>
        </div>

        {/* Sources Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Photo Sources (in order of priority)
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Streamline Feed</Badge>
            <Badge variant="secondary">Parliament.go.ke</Badge>
            <Badge variant="outline">Maarifa Centre</Badge>
            <Badge variant="secondary">Nation Africa</Badge>
            <Badge variant="secondary">Tuko Kenya</Badge>
            <Badge variant="secondary">The Standard</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Photos are downloaded and stored in your storage bucket to avoid hotlink blocking.
          </p>
        </div>

        {/* Action Button */}
        <Button 
          onClick={runScraper} 
          disabled={isRunning}
          className="w-full sm:w-auto"
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {dryRun ? "Run Dry Test" : "Start Scraping"}
            </>
          )}
        </Button>

        {/* Summary */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <div className="text-2xl font-bold">{summary.processed}</div>
              <div className="text-sm text-muted-foreground">Processed</div>
            </Card>
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="text-2xl font-bold text-primary">{summary.found}</div>
              <div className="text-sm text-muted-foreground">Photos Found</div>
            </Card>
            <Card className="p-4 border-destructive/20 bg-destructive/5">
              <div className="text-2xl font-bold text-destructive">{summary.notFound}</div>
              <div className="text-sm text-muted-foreground">Not Found</div>
            </Card>
          </div>
        )}

        {/* Progress */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing leaders...</span>
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Results</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResults([])}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4 space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      result.found ? "bg-primary/5" : "bg-destructive/5"
                    }`}
                  >
                    {result.found ? (
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{result.name}</span>
                        {result.source && (
                          <Badge variant={getSourceBadgeVariant(result.source)} className="text-xs">
                            {result.source}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.position}
                      </p>
                      {result.sourceUrl && (
                        <a
                          href={result.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {result.sourceUrl}
                        </a>
                      )}
                      {result.error && (
                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Dry Run Warning */}
        {dryRun && (
          <div className="bg-accent/50 border border-accent rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Dry Run Mode
              </p>
              <p className="text-xs text-muted-foreground">
                Photos will be searched but not downloaded or saved. Turn off "Dry run" to actually update leader photos.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
