import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function StatusPageSetup() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Create a Status Page</h1>
        <Card>
          <CardContent className="py-8 px-8 space-y-8">

            {/* What is a status page */}
            <section>
              <h2 className="text-lg font-semibold mb-2">What is a Status Page?</h2>
              <p className="text-muted-foreground text-sm mb-1">
                A status page keeps your users informed about uptime, outages, and scheduled maintenance. 
                It’s best practice to use a dedicated subdomain, like <span className="bg-muted px-1 py-0.5 rounded text-xs">status.yourdomain.com</span>. 
                For example: <span className="underline">status.stripe.com</span> or <span className="underline">status.slack.com</span>.
              </p>
            </section>

            {/* Page subdomain/URL */}
            <div>
              <Label htmlFor="subdomain" className="mb-1 block">Status Page Subdomain/URL</Label>
              <Input 
                id="subdomain" 
                placeholder="e.g. status.yourdomain.com or custom domain"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Most companies use a subdomain. Larger companies may use a separate dedicated domain.
              </p>
            </div>

            {/* Company Name */}
            <div>
              <Label htmlFor="company-name" className="mb-1 block">Company Name</Label>
              <Input id="company-name" placeholder="Your company" />
            </div>

            {/* Add Monitors */}
            <div>
              <Label htmlFor="add-monitors" className="mb-1 block">Add Monitors to Status Page</Label>
              <Input 
                id="add-monitors"
                placeholder="Search and add monitors"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Set up and select monitors before creating your status page.
              </p>
            </div>

            {/* Theme */}
            <div>
              <Label htmlFor="theme" className="mb-1 block">Theme</Label>
              <Select defaultValue="system">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Allow Subscriptions */}
            <div className="flex items-center space-x-3">
              <Checkbox id="subscriptions" />
              <Label htmlFor="subscriptions" className="text-sm">
                Allow users to subscribe to email status updates
              </Label>
            </div>

            {/* Hide from Search Engines */}
            <div className="flex items-center space-x-3">
              <Checkbox id="hide-seo" />
              <Label htmlFor="hide-seo" className="text-sm">
                Hide this status page from search engines (SEO)
              </Label>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <Button>Create Status Page</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
