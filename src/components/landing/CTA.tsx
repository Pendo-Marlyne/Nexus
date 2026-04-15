import { Button } from '../ui/button'

export function CTA() {
  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center">
      <h2 className="text-2xl font-semibold">Ready to run your agency on one platform?</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Start free, invite your team, and launch your first unified workflow today.
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <Button>Start free trial</Button>
        <Button variant="outline">Book a demo</Button>
      </div>
    </section>
  )
}

