import { create } from "zustand"
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
  hitInfo: string
  character: Character
  enemies: Enemy[]
}

interface GameActions {
  actions: {
    setEnemies: (enemies: Enemy[]) => void
    attack: (spellIndex: number, enemyIndex: number) => void
  }
}

export const manaFormula = (will: number) => 80 + will * 10

// DO NOT EXPORT THIS | DO NOT ACCESS THE STORE DIRECTLY OUTSIDE OF THIS FILE
const useGameStore = create<GameState & GameActions>()(
  immer((set) => ({
    turn: 1,
    hitInfo: "",
    character: {
      spells: [],
      strength: 4,
      agility: 2,
      will: 2,
      get hp() {
        return this.strength / 2
      },
      get reactions() {
        return this.agility / 2
      },
      get mana() {
        return manaFormula(this.will)
      },
      currentHp: 2,
      currentReactions: 1,
      currentMana: 100,
    },
    enemies: [],
    actions: {
      setEnemies: (enemies) => set({ enemies }),
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
            doesHit && hasReaction
              ? Math.random() < enemy.reactionChance ||
                (isCritical && Math.random() < enemy.reactionChance)
              : false
          const dodged = willUseReaction
            ? diceRoll() + (isSword ? enemy.strength : enemy.agility) >
              (isCritical ? 6 : 4)
            : false

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
          enemy.reactions = willUseReaction
            ? enemy.reactions - 1
            : enemy.reactions

          prev.hitInfo = dodged
            ? "Dodged"
            : doesHit
              ? `${
                  isCritical
                    ? `<span class="text-green-500">Critical </span>`
                    : ""
                }Attack <span class="text-blue-500">${spellIndex === -1 ? "Sword" : char.spells[spellIndex].name}</span> hit for <span class="text-red-500">${damage} damage</span>`
              : "Missed"

          prev.turn++
        }),
    },
  })),
)

// Actions never change so it's safe to subscribe to them all
export function useGameActions() {
  const actions = useGameStore((state) => state.actions)
  return actions
}

export function useCharacter() {
  const character = useGameStore((state) => state.character)
  return character
}

export function useEnemies() {
  const enemies = useGameStore((state) => state.enemies)
  return enemies
}

export function useTurn() {
  const turn = useGameStore((state) => state.turn)
  return turn
}

export function useHitInfo() {
  const hitInfo = useGameStore((state) => state.hitInfo)
  return hitInfo
}
