import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <div className="p-4 bg-muted rounded-full">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Meeting Not Found</h1>
              <p className="text-muted-foreground">
                The meeting you&apos;re looking for doesn&apos;t exist or may
                have been deleted.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
