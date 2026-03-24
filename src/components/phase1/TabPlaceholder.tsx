import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabPlaceholderProps = {
  title: string;
  description: string;
};

export function TabPlaceholder({ title, description }: TabPlaceholderProps) {
  return (
    <Card className="border-[#2d3a4d] bg-[#121a26]/50">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        <CardDescription className="text-[#8da2b2]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-[#8da2b2]">
        <p>
          Phase 2 delivers filters, data tables, charts, and insight cards per the Intelligents project brief.
          Static JSON from the consolidated Excel dataset will power this view.
        </p>
        <Link
          href="/legacy"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex rounded-xl border-[#2d3a4d]")}
        >
          View legacy sample charts (CSV)
        </Link>
      </CardContent>
    </Card>
  );
}
