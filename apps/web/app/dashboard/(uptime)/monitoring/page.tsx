import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link";

export default function MonitorsPage() {
  return (
    <div className="min-h-screen bg-background px-8 py-10">
      <h1 className="text-4xl font-bold mb-6">Monitors</h1>
      <div className="flex items-center justify-between mb-6">
        <Input className="w-[400px]" placeholder="Search" />
        <Link href="/dashboard/monitoring/new">
          <Button>Create monitor</Button>
        </Link>
      </div>
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="space-y-4">
            {/* Monitor List Item Example */}
            <div className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center space-x-3">
                {/* Status Indicator */}
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <div className="font-medium">ping bookstore.atulmaurya.in</div>
                  <div className="text-xs text-muted-foreground">Up · 14d 57m</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">3m</span>
                {/* Replace with a menu/icon for options */}
                
                  <Button variant="ghost" size="icon">
                    <svg className="h-5 w-5" /* menu icon svg */ />
                  </Button>

              </div>
            </div>
            {/* Repeat the above block for each monitor */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
