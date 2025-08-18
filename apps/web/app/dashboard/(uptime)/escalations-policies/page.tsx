import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export default function EscalationPolicyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Create Escalation Policy</h1>
        <Card>
          <CardContent className="py-8 px-8 space-y-8">

            {/* Policy Name */}
            <div>
              <Label htmlFor="policy-name" className="mb-1 block">Policy name</Label>
              <Input id="policy-name" placeholder="Name your escalation policy" />
            </div>

            {/* Alerting */}
            <div>
              <Label className="mb-1 block">Alert those members/services</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Checkbox id="team-members" defaultChecked />
                <Label htmlFor="team-members" className="text-sm">Specific team members</Label>
                <Checkbox id="on-call" />
                <Label htmlFor="on-call" className="text-sm">Current on-call team</Label>
                <Checkbox id="slack" />
                <Label htmlFor="slack" className="text-sm">Slack/Microsoft Teams</Label>
                <Checkbox id="zapier" />
                <Label htmlFor="zapier" className="text-sm">Zapier/Webhooks</Label>
              </div>
            </div>

            {/* Severities */}
            <div>
              <Label htmlFor="severity" className="mb-1 block">Severity (optional)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Severities allow preset alerting methods across policies.
              </p>
            </div>

            {/* Multi-step Policy with Delay/Time-based */}
            <Accordion type="multiple" collapsible>
              <AccordionItem value="step1">
                <AccordionTrigger>Step 1: Who to alert</AccordionTrigger>
                <AccordionContent>
                  <Label htmlFor="step1-who" className="block mb-2">Alert (choose)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-call">Current on-call team</SelectItem>
                      <SelectItem value="members">Specific members</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="delay1" className="block mt-4 mb-2">Delay before escalating</Label>
                  <Input id="delay1" type="number" placeholder="Minutes (e.g., 5)" className="w-1/2" />
                  <p className="text-xs text-muted-foreground mt-1">Wait for x minutes before next escalation.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="step2">
                <AccordionTrigger>Step 2: Escalate if not acknowledged</AccordionTrigger>
                <AccordionContent>
                  <Label htmlFor="step2-who" className="block mb-2">Next alert recipient</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select next recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entire-team">Entire team</SelectItem>
                      <SelectItem value="other-policy">Another policy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="delay2" className="block mt-4 mb-2">Delay</Label>
                  <Input id="delay2" type="number" placeholder="Minutes (e.g., 10)" className="w-1/2" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Metadata-based rules */}
            <div>
              <Label htmlFor="metadata" className="mb-1 block">Metadata-based routing (optional)</Label>
              <Input id="metadata" placeholder="e.g. severity: critical, owner: backend" />
              <p className="text-xs text-muted-foreground mt-1">
                Use metadata like severity or ownership to customize the notification flow.
              </p>
            </div>

            {/* Repeat Settings */}
            <div>
              <Label htmlFor="repeats" className="mb-1 block">Repeats</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Number of repetitions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1">Once</SelectItem>
                  <SelectItem value="2">Twice</SelectItem>
                  <SelectItem value="until-ack">Until acknowledged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button>Create escalation policy</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
