import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Scale, FileText, Search, ExternalLink, Calendar, Building } from "lucide-react";

// Placeholder data for laws, bills, and constitutional documents
const constitutionChapters = [
  { id: "1", chapter: "Chapter 1", title: "Sovereignty of the People and Supremacy of the Constitution", articles: "1-3" },
  { id: "2", chapter: "Chapter 2", title: "The Republic", articles: "4-11" },
  { id: "3", chapter: "Chapter 3", title: "Citizenship", articles: "12-18" },
  { id: "4", chapter: "Chapter 4", title: "The Bill of Rights", articles: "19-59" },
  { id: "5", chapter: "Chapter 5", title: "Land and Environment", articles: "60-72" },
  { id: "6", chapter: "Chapter 6", title: "Leadership and Integrity", articles: "73-80" },
  { id: "7", chapter: "Chapter 7", title: "Representation of the People", articles: "81-92" },
  { id: "8", chapter: "Chapter 8", title: "The Legislature", articles: "93-128" },
  { id: "9", chapter: "Chapter 9", title: "The Executive", articles: "129-155" },
  { id: "10", chapter: "Chapter 10", title: "Judiciary", articles: "156-173" },
  { id: "11", chapter: "Chapter 11", title: "Devolved Government", articles: "174-200" },
  { id: "12", chapter: "Chapter 12", title: "Public Finance", articles: "201-231" },
  { id: "13", chapter: "Chapter 13", title: "The Public Service", articles: "232-236" },
  { id: "14", chapter: "Chapter 14", title: "National Security", articles: "237-247" },
  { id: "15", chapter: "Chapter 15", title: "Commissions and Independent Offices", articles: "248-254" },
  { id: "16", chapter: "Chapter 16", title: "Amendment of the Constitution", articles: "255-257" },
  { id: "17", chapter: "Chapter 17", title: "General Provisions", articles: "258-262" },
  { id: "18", chapter: "Chapter 18", title: "Transitional and Consequential Provisions", articles: "263-264" },
];

const recentLaws = [
  { id: "1", title: "Finance Act 2024", year: 2024, status: "enacted", description: "An Act of Parliament to amend the law relating to various taxes and duties" },
  { id: "2", title: "Digital Health Act 2023", year: 2023, status: "enacted", description: "An Act to provide for the regulation of digital health services in Kenya" },
  { id: "3", title: "Climate Change (Amendment) Act 2023", year: 2023, status: "enacted", description: "An Act to amend the Climate Change Act for enhanced environmental protection" },
  { id: "4", title: "Data Protection (Amendment) Act 2023", year: 2023, status: "enacted", description: "An Act to strengthen data protection and privacy regulations" },
  { id: "5", title: "Affordable Housing Act 2024", year: 2024, status: "enacted", description: "An Act to provide for affordable housing development and financing" },
  { id: "6", title: "Public Finance Management (Amendment) Act 2024", year: 2024, status: "enacted", description: "An Act to improve public finance management and accountability" },
];

const pendingBills = [
  { id: "1", title: "Social Health Insurance Bill 2024", sponsor: "Ministry of Health", stage: "Second Reading", description: "A Bill to establish a universal health coverage framework" },
  { id: "2", title: "National Youth Service (Amendment) Bill 2024", sponsor: "Ministry of Youth", stage: "Committee Stage", description: "A Bill to enhance youth employment programs" },
  { id: "3", title: "County Revenue Bill 2024", sponsor: "Senate", stage: "First Reading", description: "A Bill to revise county revenue allocation formula" },
  { id: "4", title: "Digital Economy Bill 2024", sponsor: "ICT Committee", stage: "Public Participation", description: "A Bill to regulate digital economy and e-commerce" },
];

const importantDocuments = [
  { id: "1", title: "Constitution of Kenya 2010", type: "constitution", url: "http://www.kenyalaw.org/lex/actview.xql?actid=Const2010" },
  { id: "2", title: "Vision 2030", type: "policy", url: "https://vision2030.go.ke/" },
  { id: "3", title: "Big 4 Agenda", type: "policy", url: "https://big4.delivery.go.ke/" },
  { id: "4", title: "Kenya Gazette", type: "official", url: "http://www.kenyalaw.org/kenya_gazette/" },
  { id: "5", title: "Hansard (Parliament Proceedings)", type: "official", url: "http://www.parliament.go.ke/the-national-assembly/house-business/hansard" },
];

export default function CivicFacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("constitution");

  const filteredChapters = constitutionChapters.filter(
    (c) => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.chapter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLaws = recentLaws.filter(
    (l) => l.title.toLowerCase().includes(searchTerm.toLowerCase()) || l.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBills = pendingBills.filter(
    (b) => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">CivicFacts</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Access Kenya's laws, bills, and constitutional documents. Stay informed about the legal framework that governs our nation.
        </p>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search laws, bills, or constitution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="constitution" className="gap-2">
            <Scale className="h-4 w-4" />
            Constitution
          </TabsTrigger>
          <TabsTrigger value="laws" className="gap-2">
            <FileText className="h-4 w-4" />
            Laws ({filteredLaws.length})
          </TabsTrigger>
          <TabsTrigger value="bills" className="gap-2">
            <Building className="h-4 w-4" />
            Bills ({filteredBills.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        {/* Constitution Tab */}
        <TabsContent value="constitution">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Constitution of Kenya 2010
              </CardTitle>
              <CardDescription>
                The supreme law of the Republic of Kenya, promulgated on August 27, 2010.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="http://www.kenyalaw.org/lex/actview.xql?actid=Const2010"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Constitution on Kenya Law
              </a>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {filteredChapters.map((chapter) => (
              <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{chapter.chapter}</Badge>
                        <span className="text-xs text-muted-foreground">Articles {chapter.articles}</span>
                      </div>
                      <h3 className="font-medium">{chapter.title}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Laws Tab */}
        <TabsContent value="laws">
          <div className="space-y-4">
            {filteredLaws.map((law) => (
              <Card key={law.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{law.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {law.year}
                      </Badge>
                      <Badge variant="default" className="capitalize">
                        {law.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{law.description}</p>
                </CardContent>
              </Card>
            ))}
            {filteredLaws.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No laws found matching "{searchTerm}"
              </div>
            )}
          </div>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills">
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <Card key={bill.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-lg">{bill.title}</CardTitle>
                    <Badge variant="secondary">
                      {bill.stage}
                    </Badge>
                  </div>
                  <CardDescription>Sponsored by: {bill.sponsor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{bill.description}</p>
                </CardContent>
              </Card>
            ))}
            {filteredBills.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No bills found matching "{searchTerm}"
              </div>
            )}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="grid gap-4 md:grid-cols-2">
            {importantDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <Badge variant="secondary" className="text-xs capitalize mt-1">
                          {doc.type}
                        </Badge>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Legal Disclaimer */}
      <div className="mt-12 p-4 rounded-lg bg-muted/50 border">
        <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Legal Disclaimer</h3>
        <div className="text-sm text-muted-foreground text-center space-y-1">
          <p>CivicLens aggregates publicly available civic information for educational and awareness purposes only.</p>
          <p>The platform does not make accusations, endorsements, or legal claims against any individual.</p>
          <p>All users are encouraged to verify information using official government sources.</p>
          <p className="pt-2">
            For official and legally binding documents, please visit{" "}
            <a href="http://www.kenyalaw.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Kenya Law
            </a>{" "}
            or the{" "}
            <a href="http://www.parliament.go.ke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Parliament of Kenya
            </a>.
          </p>
        </div>
      </div>
    </Layout>
  );
}
