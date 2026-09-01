import type { ChoiceNode } from '../demo/story'

export function RouteChoiceOverlay({
  choice,
  onSelect,
  variant = 'overlay',
}: {
  choice: ChoiceNode
  onSelect: (optionId: string) => void
  variant?: 'overlay' | 'static'
}) {
  return (
    <section className={`route-choice-screen route-choice-screen-${variant}`}>
      <div className="route-choice-heading">
        <span>{choice.eyebrow}</span>
        <h1>{choice.prompt}</h1>
        <p>{choice.context}</p>
      </div>

      <div className={`route-choice-grid route-choice-grid-${choice.options.length}`}>
        {choice.options.map((option) => (
          <button key={option.id} type="button" onClick={() => onSelect(option.id)}>
            <b>{option.id}</b>
            <strong>{option.label}</strong>
            <small>{option.factHint}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
