import { Button } from '../ui/button'

const PLANS = [
  { name: 'Free', price: '$0', subtitle: 'for early teams', cta: 'Start free', featured: false },
  { name: 'Pro', price: '$49/user', subtitle: 'for scaling agencies', cta: 'Choose Pro', featured: true },
  { name: 'Enterprise', price: 'Custom', subtitle: 'for multi-team ops', cta: 'Contact Sales', featured: false },
]

export function Pricing() {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Pricing</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-xl border p-4 ${plan.featured ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
          >
            <h3 className="text-sm font-semibold">{plan.name}</h3>
            <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
            <p className="mb-4 text-sm text-muted-foreground">{plan.subtitle}</p>
            <Button variant={plan.featured ? 'default' : 'outline'}>{plan.cta}</Button>
          </article>
        ))}
      </div>
    </section>
  )
}

