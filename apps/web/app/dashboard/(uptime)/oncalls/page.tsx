import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function OnCallSchedulePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Set Up On-Call Schedule</h1>
        <Card>
          <CardContent className="py-8 px-8 space-y-8">

            <section>
              <h2 className="text-lg font-semibold mb-2">What is On-Call?</h2>
              <p className="text-muted-foreground text-sm mb-1">
                On-call is the practice of always having a team member on standby, ready to respond in case of an urgent incident—even outside business hours. This minimizes downtime and ensures reliable service.
              </p>
            </section>

            {/* On-Call Rotation Setup */}
            <div>
              <Label htmlFor="rotation-type" className="mb-1 block">Rotation frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue placeholder="Select rotation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (changes every 24h)</SelectItem>
                  <SelectItem value="weekly">Weekly (changes each week)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Team Members */}
            <div>
              <Label htmlFor="team-members" className="mb-1 block">On-call Team Members</Label>
              <Input id="team-members" placeholder="Type name or email and press enter" />
              <p className="text-xs text-muted-foreground mt-1">
                Invite or select all users who will share on-call duties.
              </p>
            </div>

            {/* Schedule Preview/Instructions */}
            <div className="bg-muted/30 p-4 rounded text-sm space-y-2">
              <p>
                When an incident happens and the current on-call person does not acknowledge it, every team member will be notified after a set delay.
              </p>
              <p>
                You can check the current on-call person's details or look up future on-call shifts on your calendar.
              </p>
            </div>

            {/* Notifications Escalation Delay */}
            <div>
              <Label htmlFor="escalation-delay" className="mb-1 block">Escalation Delay (minutes)</Label>
              <Input id="escalation-delay" type="number" placeholder="e.g. 3" className="w-1/2" />
              <p className="text-xs text-muted-foreground mt-1">
                After this delay, alerts are escalated if unacknowledged.
              </p>
            </div>

            {/* Contact Info Checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox id="show-details" />
              <Label htmlFor="show-details" className="text-sm">
                Allow team to view current and upcoming on-call contact details (email, phone)
              </Label>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-8">
              <Button>Save on-call schedule</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
