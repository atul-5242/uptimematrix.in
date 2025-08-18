"use client"

import { useState, type FormEvent } from "react"
import { useAppDispatch } from "@/store"
import { createMonitorAction } from "./action"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export default function MonitoringPage() {
  // fake subscription state for now (later from redux)
  const [subscribed] = useState(false)
  const dispatch = useAppDispatch()

  // form state
  const [alertCondition, setAlertCondition] = useState("ping")
  const [url, setUrl] = useState("")
  const [notifications, setNotifications] = useState<string[]>(["email"])
  const [escalation, setEscalation] = useState("immediate")

  // advanced settings
  const [timeout, setTimeout] = useState("30")
  const [retries, setRetries] = useState("3")

  // metadata
  const [tags, setTags] = useState("")
  const [description, setDescription] = useState("")

  // handle notification change
  const handleNotificationChange = (type: string) => {
    if (!subscribed && type !== "email") return // block changes
    setNotifications((prev) =>
      prev.includes(type) ? prev.filter((n) => n !== type) : [...prev, type]
    )
  }

  // submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const body = {
      alertCondition,
      url,
      notifications,
      escalation,
      advanced: {
        timeout,
        retries,
      },
      metadata: {
        tags,
        description,
      },
    }

    try {
      // 🔗 use the action WITH dispatch (same style as your SignIn flow)
      await createMonitorAction(body)
      alert("Monitor created successfully!")
    } catch (err: any) {
      console.error(err)
      alert(err?.message || "Failed to create monitor")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-12">
        {/* Left instructions panel */}
        <div className="flex-1 pt-4">
          <h1 className="text-3xl font-bold mb-8">Create monitor</h1>
          <div className="mb-8">
            <h2 className="text-base font-semibold mb-1">What to monitor</h2>
            <p className="text-muted-foreground text-sm">
              Configure the target website you want to monitor. Advanced configuration is available below.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold mb-1">On-call escalation</h2>
            <p className="text-muted-foreground text-sm">
              Set up rules for who's going to be notified and how when an incident occurs.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Notify the <span className="underline">entire team</span> as a last resort option. 
              Alternatively, set up an <span className="underline">advanced escalation policy</span>.
            </p>
          </div>
        </div>
        
        {/* Right form section */}
        <div className="flex-1 max-w-lg">
          <Card>
            <CardContent className="py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Alert us when */}
                <div>
                  <Label className="mb-1 block">
                    Alert us when 
                    <span className="inline-block ml-2 px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600 align-middle">Billable</span>
                  </Label>
                  <Select value={alertCondition} onValueChange={setAlertCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ping">Host doesn't respond to ping</SelectItem>
                      <SelectItem value="unavailable" disabled={!subscribed} className={!subscribed ? "opacity-50" : ""}>
                        URL becomes unavailable
                      </SelectItem>
                      <SelectItem value="slow" disabled={!subscribed} className={!subscribed ? "opacity-50" : ""}>
                        URL is slow
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {!subscribed && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Only ping monitoring available. <span className="underline">Upgrade your account</span> to unlock more.
                    </div>
                  )}
                </div>

                {/* URL to monitor */}
                <div>
                  <Label htmlFor="monitor-url" className="mb-1 block">URL to monitor</Label>
                  <Input
                    id="monitor-url"
                    placeholder="https://"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    You can import multiple monitors <span className="underline">here</span>.
                  </div>
                </div>

                {/* Notification method */}
                <div>
                  <Label className="mb-2 block">When there’s a new incident</Label>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: "call", label: "Call" },
                      { id: "sms", label: "SMS" },
                      { id: "email", label: "E-mail" },
                      { id: "push", label: "Push notification" },
                      { id: "critical", label: "Critical alert" },
                    ].map(({ id, label }) => (
                      <div
                        key={id}
                        className={`flex items-center space-x-2 ${!subscribed && id !== "email" ? "opacity-50" : ""}`}
                      >
                        <Checkbox
                          id={id}
                          checked={notifications.includes(id)}
                          onCheckedChange={() => handleNotificationChange(id)}
                          disabled={!subscribed && id !== "email"}
                        />
                        <Label htmlFor={id} className="text-sm">{label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    The current on-call person
                  </div>
                </div>

                {/* Escalation dropdown */}
                <div>
                  <Label htmlFor="escalate" className="mb-1 block">
                    If the on-call person doesn't acknowledge the incident
                  </Label>
                  <Select value={escalation} onValueChange={setEscalation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose escalation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediately alert all other team members</SelectItem>
                      <SelectItem value="wait5min">Wait 5 mins, then alert all team members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Accordions */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Advanced settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="timeout">Request timeout (sec)</Label>
                          <Input id="timeout" type="number" value={timeout} onChange={(e) => setTimeout(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="retries">Retry attempts</Label>
                          <Input id="retries" type="number" value={retries} onChange={(e) => setRetries(e.target.value)} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Metadata</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="tags">Tags (comma separated)</Label>
                          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" className="px-8">Create monitor</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
