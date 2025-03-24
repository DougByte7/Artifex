import { create, type StoreApi, type UseBoundStore } from "zustand"
import { immer } from "zustand/middleware/immer"

import type { Spell } from "@/gameplay/scripts/Spell"
import { diceRoll } from "@/utils"

// Start with 10 points
// Strength determines how much damage you do with weapons, and your hp
// Agility determines your accuracy ranged attacks, and your reactions
// Will determines how much mana you can spend on spells
// You gain 5 points per level
interface Character {
  spells: Spell[]
  strength: number
  agility: number
  will: number
  readonly hp: number
  readonly reactions: number
  readonly mana: number
  currentHp: number
  currentReactions: number
  currentMana: number
}

export interface Enemy {
  id: string
  name: string
  hp: number
  reactions: number
  reactionChance: number
  strength: number
  agility: number
}

interface GameState {
  turn: number
  turnPriority: number
  turnOrder: string[]
  hitInfo: string
  character: Character
  enemies: Enemy[]
}

interface GameActions {
  actions: {
    startCombat: (enemies: Enemy[]) => void
    attack: (spellIndex: number, enemyIndex: number) => void
    enemyAttack: (reactionType?: ReactionType) => void
    nextTurn: VoidFunction
  }
}

export type ReactionType = "dodge" | "block" | "parry"

export const manaFormula = (will: number) => 80 + will * 10
export const hpFormula = (strength: number) => strength * 2
export const reactionFormula = (agility: number) => (agility / 2) | 0

const BASE_STRENGTH = 4
const BASE_AGILITY = 2
const BASE_WILL = 2

// DO NOT EXPORT THIS | DO NOT ACCESS THE STORE DIRECTLY OUTSIDE OF THIS FILE
const gameStore = create<GameState & GameActions>()(
  immer((set) => ({
    character: {
      spells: [],
      strength: BASE_STRENGTH,
      agility: BASE_AGILITY,
      will: BASE_WILL,
      get hp() {
        return hpFormula(this.strength)
      },
      get reactions() {
        return reactionFormula(this.agility)
      },
      get mana() {
        return manaFormula(this.will)
      },
      currentHp: hpFormula(BASE_STRENGTH),
      currentReactions: reactionFormula(BASE_AGILITY),
      currentMana: manaFormula(BASE_WILL),
    },
    enemies: [],
    turn: 1,
    turnPriority: 0,
    turnOrder: [],
    hitInfo: "",
    actions: {
      startCombat: (enemies) =>
        set((prev) => ({
          turn: 1,
          turnPriority: 0,
          enemies,
          turnOrder: [...enemies, prev.character]
            .map((e) => ({ ...e, initiative: diceRoll() + e.agility }))
            .sort((a, b) => a.initiative - b.initiative)
            .map((e) => ("id" in e ? e.id : "player")),
        })),
      attack: (spellIndex, enemyIndex) =>
        set((prev) => {
          const char = prev.character
          const enemy = prev.enemies[enemyIndex]
          const isSword = spellIndex === -1
          const manaCost = isSword
            ? -char.will * 5
            : char.spells[spellIndex].cost
          const attackChance =
            diceRoll() + (isSword ? char.strength : char.will)

          const doesHit = attackChance > 4
          const isCritical = attackChance > 6

          const hasReaction = enemy.reactions > 0
          const willUseReaction =
            doesHit &&
            hasReaction &&
            (Math.random() < enemy.reactionChance ||
              (isCritical && Math.random() < enemy.reactionChance))

          const dodged =
            willUseReaction &&
            diceRoll() + (isSword ? enemy.strength : enemy.agility) >
              (isCritical ? 6 : 4)

          const damage =
            dodged || !doesHit
              ? 0
              : isSword
                ? isCritical
                  ? char.strength * 2
                  : char.strength
                : isCritical
                  ? (char.spells[spellIndex].damage + char.will / 2) | 0
                  : char.spells[spellIndex].damage

          char.currentMana = Math.min(
            prev.character.currentMana - manaCost,
            manaFormula(prev.character.will),
          )

          enemy.hp -= damage
          enemy.reactions = enemy.reactions - +willUseReaction
          if (enemy.hp <= 0) prev.enemies.splice(enemyIndex, 1)

          prev.hitInfo = dodged
            ? "Dodged"
            : doesHit
              ? `${
                  isCritical
                    ? `<span class="text-green-500">Critical </span>`
                    : ""
                }Attack <span class="text-blue-500">${spellIndex === -1 ? "Sword" : char.spells[spellIndex].name}</span> hit for <span class="text-red-500">${damage} damage</span>`
              : "Missed"
        }),
      enemyAttack: (reactionType) =>
        set((prev) => {
          const enemy = prev.enemies.find(
            (e) => e.id === prev.turnOrder[prev.turnPriority],
          )
          if (!enemy) return

          const player = prev.character

          const attackChance =
            diceRoll() + Math.max(enemy.strength, enemy.agility)

          const doesHit = attackChance > 4
          const isCritical = attackChance > 6

          const dodged =
            reactionType === "dodge" && diceRoll() + player.agility > 6
          const block =
            reactionType === "block" &&
            diceRoll() + Math.max(player.strength) > 4
          const parried =
            reactionType === "parry" &&
            diceRoll() + Math.max(player.strength, player.agility) > 6

          const damage =
            doesHit && !dodged
              ? Math.max(
                  (isCritical ? enemy.strength * 2 : enemy.strength) /
                    (block ? 2 : 1),
                  0,
                )
              : 0

          if (parried) enemy.hp -= player.strength / 2

          player.currentHp -= damage
          player.currentReactions -= reactionType ? 1 : 0
          prev.hitInfo =
            doesHit && !dodged
              ? `Enemy ${isCritical ? "critical " : " "}hit for <span class="text-red-500">${damage} damage</span> ${block ? "(Blocked)" : ""} ${parried ? "(Parried)" : ""}`
              : dodged
                ? "Dodged"
                : `Missed ${parried ? "(Parried)" : ""}`
        }),
      nextTurn: () =>
        set((prev) => {
          prev.turn++
          prev.turnPriority = (prev.turnPriority + 1) % prev.turnOrder.length
        }),
    },
  })),
)

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    // @ts-expect-error TS is being a little bitch
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    store.use[k as any] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

export const useGameStore = createSelectors(gameStore)

export function useIsPlayerTurn() {
  const turnOrder = useGameStore.use.turnOrder()
  const turnPriority = useGameStore.use.turnPriority()
  const isPlayerTurn = turnOrder[turnPriority] === "player"
  return isPlayerTurn
}
