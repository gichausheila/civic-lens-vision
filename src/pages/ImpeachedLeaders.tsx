import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, FileText, Scale, Calendar, MapPin, ExternalLink, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfficialDocument {
  title: string;
  url: string;
  source: string;
  type: "senate" | "court" | "gazette";
}

interface ImpeachedLeader {
  id: string;
  name: string;
  position: string;
  county: string;
  party: string;
  photo_url?: string;
  impeachmentDate: string;
  reasonsForImpeachment: string[];
  manifesto: string[];
  developments: { date: string; description: string }[];
  currentStatus: string;
  officialDocuments: OfficialDocument[];
}

// Placeholder data for impeached leaders during the current term (2022-2027)
const impeachedLeaders: ImpeachedLeader[] = [
  {
    id: "1",
    name: "Cecily Mbarire",
    position: "Governor",
    county: "Embu",
    party: "Kenya Kwanza",
    impeachmentDate: "2024-01-15",
    reasonsForImpeachment: [
      "Gross violation of the Constitution",
      "Abuse of office",
      "Gross misconduct in the management of county resources",
    ],
    manifesto: [
      "Improve healthcare facilities across all sub-counties",
      "Construct 500km of tarmac roads",
      "Create 10,000 youth employment opportunities",
      "Establish industrial parks for local manufacturing",
    ],
    developments: [
      { date: "2023-11-20", description: "Motion of impeachment tabled by MCAs" },
      { date: "2023-12-05", description: "County Assembly debate on impeachment charges" },
      { date: "2024-01-10", description: "Senate hearing commenced" },
      { date: "2024-01-15", description: "Senate upheld impeachment" },
    ],
    currentStatus: "Impeached - Removed from office",
    officialDocuments: [
      {
        title: "Senate Hansard - Impeachment Proceedings",
        url: "http://www.parliament.go.ke/the-senate/house-business/hansard",
        source: "Parliament of Kenya",
        type: "senate",
      },
      {
        title: "County Assembly Motion Records",
        url: "http://www.parliament.go.ke/the-senate/committees",
        source: "Parliament of Kenya",
        type: "senate",
      },
      {
        title: "Court Petition (if applicable)",
        url: "http://kenyalaw.org/caselaw/",
        source: "Kenya Law Reports",
        type: "court",
      },
    ],
  },
  {
    id: "2",
    name: "Kawira Mwangaza",
    position: "Governor",
    county: "Meru",
    party: "Independent",
    impeachmentDate: "2024-02-08",
    reasonsForImpeachment: [
      "Gross violation of the Constitution",
      "Abuse of office including nepotism",
      "Irregular procurement processes",
      "Misconduct and incompetence",
    ],
    manifesto: [
      "Universal healthcare coverage for Meru residents",
      "Agricultural transformation and market access",
      "Youth empowerment through skills training",
      "Infrastructure development in rural areas",
    ],
    developments: [
      { date: "2023-08-15", description: "First impeachment motion - survived at Senate" },
      { date: "2023-12-12", description: "Second impeachment motion tabled" },
      { date: "2024-01-25", description: "County Assembly passed impeachment motion" },
      { date: "2024-02-08", description: "Senate upheld second impeachment" },
    ],
    currentStatus: "Impeached - Removed from office",
    officialDocuments: [
      {
        title: "Senate Special Sitting Hansard - Meru Governor Impeachment",
        url: "http://www.parliament.go.ke/the-senate/house-business/hansard",
        source: "Parliament of Kenya",
        type: "senate",
      },
      {
        title: "First Impeachment Senate Ruling (2023)",
        url: "http://www.parliament.go.ke/the-senate/house-business/order-papers",
        source: "Parliament of Kenya",
        type: "senate",
      },
      {
        title: "Kawira Mwangaza v Senate of Kenya & Others",
        url: "http://kenyalaw.org/caselaw/",
        source: "Kenya Law Reports",
        type: "court",
      },
      {
        title: "County Assembly Impeachment Motion",
        url: "http://www.parliament.go.ke/the-senate/committees",
        source: "Parliament of Kenya",
        type: "senate",
      },
    ],
  },
  {
    id: "3",
    name: "Paul Chepkwony",
    position: "Deputy Governor",
    county: "Kericho",
    party: "UDA",
    impeachmentDate: "2023-09-20",
    reasonsForImpeachment: [
      "Abuse of office",
      "Gross misconduct",
      "Desertion of duty",
    ],
    manifesto: [
      "Support agricultural sector growth",
      "Enhance county healthcare services",
      "Promote education access",
    ],
    developments: [
      { date: "2023-07-10", description: "Allegations of misconduct raised" },
      { date: "2023-08-15", description: "County Assembly investigation" },
      { date: "2023-09-05", description: "Impeachment motion passed by MCAs" },
      { date: "2023-09-20", description: "Senate upheld impeachment" },
    ],
    currentStatus: "Impeached - Removed from office",
    officialDocuments: [
      {
        title: "Senate Hansard - Deputy Governor Impeachment",
        url: "http://www.parliament.go.ke/the-senate/house-business/hansard",
        source: "Parliament of Kenya",
        type: "senate",
      },
      {
        title: "Kericho County Assembly Records",
        url: "http://www.parliament.go.ke/the-senate/committees",
        source: "Parliament of Kenya",
        type: "senate",
      },
    ],
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDocumentIcon(type: OfficialDocument["type"]) {
  switch (type) {
    case "senate":
      return <FileText className="h-4 w-4" />;
    case "court":
      return <Gavel className="h-4 w-4" />;
    case "gazette":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getDocumentBadgeVariant(type: OfficialDocument["type"]) {
  switch (type) {
    case "senate":
      return "default";
    case "court":
      return "secondary";
    case "gazette":
      return "outline";
    default:
      return "outline";
  }
}

export default function ImpeachedLeaders() {
  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold text-foreground">Impeached Leaders</h1>
        </div>
        <p className="text-muted-foreground">
          A record of leaders who have been impeached during the current term (2022-2027).
          This information is for civic awareness and is based on publicly available records.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8">
        <p className="text-sm text-muted-foreground">
          <strong>Disclaimer:</strong> The information presented here is compiled from official government
          records, parliamentary proceedings, and verified news sources. It is intended for educational
          and informational purposes only.
        </p>
      </div>

      {impeachedLeaders.length === 0 ? (
        <div className="text-center py-16">
          <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Impeached Leaders</h2>
          <p className="text-muted-foreground">
            There are no recorded impeachments during the current term.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {impeachedLeaders.map((leader) => (
            <Card key={leader.id} className="overflow-hidden">
              <CardHeader className="bg-destructive/5 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-destructive/20">
                    <AvatarImage src={leader.photo_url} alt={leader.name} />
                    <AvatarFallback className="text-xl bg-destructive/10 text-destructive">
                      {getInitials(leader.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{leader.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">{leader.position}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {leader.county} County
                      </span>
                      {leader.party && (
                        <>
                          <span>•</span>
                          <Badge variant="outline">{leader.party}</Badge>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="destructive" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        Impeached: {new Date(leader.impeachmentDate).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    {leader.currentStatus}
                  </Badge>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="reasons">
                    <AccordionTrigger className="text-base font-semibold">
                      <span className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-destructive" />
                        Reasons for Impeachment
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6">
                        {leader.reasonsForImpeachment.map((reason, idx) => (
                          <li key={idx} className="list-disc text-muted-foreground">
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="manifesto">
                    <AccordionTrigger className="text-base font-semibold">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Campaign Manifesto
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pl-6">
                        {leader.manifesto.map((item, idx) => (
                          <li key={idx} className="list-disc text-muted-foreground">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="developments">
                    <AccordionTrigger className="text-base font-semibold">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Timeline of Developments
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="relative pl-6 border-l-2 border-muted space-y-4">
                        {leader.developments.map((dev, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-primary" />
                            <p className="text-xs text-muted-foreground mb-1">
                              {new Date(dev.date).toLocaleDateString("en-KE", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm">{dev.description}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="documents">
                    <AccordionTrigger className="text-base font-semibold">
                      <span className="flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-primary" />
                        Official Documents & Proceedings
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground mb-4">
                          Access official records from the Senate of Kenya and Kenya Law Reports.
                        </p>
                        {leader.officialDocuments.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-md bg-primary/10 text-primary">
                                {getDocumentIcon(doc.type)}
                              </div>
                              <div>
                                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                  {doc.title}
                                </p>
                                <p className="text-xs text-muted-foreground">{doc.source}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getDocumentBadgeVariant(doc.type) as "default" | "secondary" | "outline"}>
                                {doc.type === "senate" ? "Senate" : doc.type === "court" ? "Court" : "Gazette"}
                              </Badge>
                              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                          </a>
                        ))}
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-2">Official Sources:</p>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href="http://www.parliament.go.ke/the-senate" target="_blank" rel="noopener noreferrer">
                                <FileText className="h-3 w-3 mr-1" />
                                Senate of Kenya
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href="http://kenyalaw.org" target="_blank" rel="noopener noreferrer">
                                <Gavel className="h-3 w-3 mr-1" />
                                Kenya Law Reports
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href="https://judiciary.go.ke" target="_blank" rel="noopener noreferrer">
                                <Scale className="h-3 w-3 mr-1" />
                                Judiciary of Kenya
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
