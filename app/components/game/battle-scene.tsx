import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  manaFormula,
  useCharacter,
  useEnemies,
  useGameActions,
  useHitInfo,
  useTurn,
  type Enemy,
} from "./state"
import { randomBetween } from "@/utils"
import { nanoid } from "nanoid"

function buildEnemy(): Enemy {
  return {
    id: nanoid(8),
    name: "Enemy",
    hp: randomBetween(13, 3),
    reactions: randomBetween(3, 1),
    reactionChance: randomBetween(0.5, 0.3) + Math.random(),
    strength: randomBetween(5, 1),
    agility: randomBetween(5, 1),
  }
}

export function BattleScene() {
  const char = useCharacter()
  const enemies = useEnemies()
  const { setEnemies, attack } = useGameActions()
  const hitInfo = useHitInfo()
  const turn = useTurn()

  useEffect(() => {
    setEnemies([buildEnemy()])
  }, [])

  const handleAttack = (spellIndex: number) => () => attack(spellIndex, 0)

  return (
    <section className="grid gap-4">
      <h1>
        Turno{" "}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
        {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
        {turn} <strong dangerouslySetInnerHTML={{ __html: hitInfo as any }} />
      </h1>

      <div className="flex gap-4">
        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className="grid w-fit gap-2 rounded border border-stone-500 bg-stone-200/5 p-4"
          >
            <p>Name: {enemy.name}</p>
            <p>HP: {enemy.hp}</p>
            <p>Reactions: {enemy.reactions}</p>
            <p>Reaction Chance: {(enemy.reactionChance * 100).toFixed(2)}%</p>
            <p>Strength: {enemy.strength}</p>
            <p>Agility: {enemy.agility}</p>
            <p>
              Power:{" "}
              {enemy.hp + enemy.reactions + enemy.strength + enemy.agility}
            </p>
          </div>
        ))}

        <div className="grid w-fit gap-2 rounded border border-stone-500 bg-stone-200/5 p-4">
          <p>Hollow lv. 10</p>
          <p>
            HP: {char.hp} / {char.strength / 2}
          </p>
          <p>
            Mana: {char.mana} / {manaFormula(char.will)}
          </p>
          <p>Reactions: {char.reactions}</p>
          <p>Strength: {char.strength}</p>
          <p>Agility: {char.agility}</p>
          <p>Will: {char.will}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleAttack(-1)}>Sword Attack</Button>
        {char.spells.map((spell, i) => (
          <Button
            key={spell.name}
            disabled={char.mana < spell.cost}
            onClick={handleAttack(i)}
          >
            {spell.name} - {spell.cost} MP - {spell.damage} Dmg
          </Button>
        ))}
      </div>
    </section>
  )
}
