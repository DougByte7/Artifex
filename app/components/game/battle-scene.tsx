import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  hpFormula,
  manaFormula,
  reactionFormula,
  useGameStore,
  useIsPlayerTurn,
  type Enemy,
  type ReactionType,
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
  const { startCombat, attack, enemyAttack, nextTurn } =
    useGameStore.use.actions()
  const char = useGameStore.use.character()
  const enemies = useGameStore.use.enemies()
  const hitInfo = useGameStore.use.hitInfo()
  const turn = useGameStore.use.turn()
  const isPlayerTurn = useIsPlayerTurn()

  useEffect(() => {
    startCombat([
      {
        id: nanoid(8),
        name: "Garrik",
        hp: 15,
        reactions: 3,
        reactionChance: 0.75,
        strength: 3,
        agility: 1,
      },
    ])
  }, [])

  const handleAttack = (spellIndex: number) => () => {
    attack(spellIndex, 0)
    nextTurn()
  }

  const handleEnemyAttack = (type?: ReactionType) => () => {
    enemyAttack(type)
    nextTurn()
  }

  return (
    <section className="grid gap-4">
      <h1>
        Turno{" "}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
        {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
        {turn} <strong dangerouslySetInnerHTML={{ __html: hitInfo as any }} />
      </h1>

      <div className="flex gap-4">
        {enemies.length ? (
          enemies.map((enemy) => (
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
          ))
        ) : (
          <div className="grid w-fit gap-2 rounded border border-stone-500 bg-stone-200/5 p-4">
            <p>Combate encerrado...</p>
          </div>
        )}

        <div className="grid w-fit gap-2 rounded border border-stone-500 bg-stone-200/5 p-4">
          {char.currentHp > 0 ? (
            <>
              <p>Hollow lv. 10</p>
              <p>
                HP: {char.currentHp} / {hpFormula(char.strength)}
              </p>
              <p>
                Mana: {char.currentMana} / {manaFormula(char.will)}
              </p>
              <p>
                Reactions: {char.currentReactions} /{" "}
                {reactionFormula(char.agility)}
              </p>
              <p>Strength: {char.strength}</p>
              <p>Agility: {char.agility}</p>
              <p>Will: {char.will}</p>
            </>
          ) : (
            <p>No céu tem pão?</p>
          )}
        </div>
      </div>

      {char.currentHp > 0 && (
        <div className="flex gap-2">
          {isPlayerTurn ? (
            <>
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
            </>
          ) : (
            <>
              <Button onClick={handleEnemyAttack()}>Sofrer o dano</Button>
              <Button
                disabled={!char.currentReactions}
                onClick={handleEnemyAttack("dodge")}
              >
                Desviar (Teste 6 de agilidade: Zera o dano recebido)
              </Button>
              <Button
                disabled={!char.currentReactions}
                onClick={handleEnemyAttack("block")}
              >
                Bloquear (Teste 4 de força: Reduz o dano pela metade)
              </Button>
              <Button
                disabled={!char.currentReactions}
                onClick={handleEnemyAttack("parry")}
              >
                Contra-Atacar (Teste 4 de agilidade ou força; oque for melhor:
                causa metade da força como dano)
              </Button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
