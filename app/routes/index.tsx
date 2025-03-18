import { createFileRoute } from "@tanstack/react-router"
import dedent from "dedent"
import { useState } from "react"
import {
  type AreaType,
  AreaTypes,
  type DamageType,
  DamageTypes,
  type Effect,
  Effects,
  Spell,
  type SpellArgs,
} from "../Assets/Scripts/Gameplay/Spell"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const lang: LanguageCode =
    (localStorage.getItem("lang") as LanguageCode) || "br"

  const [currentScene, setCurrentScene] = useState(() => {
    const currentSceneName: SceneName =
      (localStorage.getItem("currentSceneName") as SceneName) || "start"
    return scenes.get(currentSceneName)
  })

  const [dialogIndex, setDialogIndex] = useState(0)
  const dialog = currentScene?.dialogs[dialogIndex]

  const goToScene = (sceneName: SceneName) => () => {
    //localStorage.setItem("currentSceneName", sceneName)
    setCurrentScene(scenes.get(sceneName))
    setDialogIndex(0)
  }

  return (
    <main className="p-8 grid gap-4">
      <SpellBuilder />

      <TestGame />

      <section>
        <div className="p-4 flex gap-4 border border-stone-500 rounded bg-stone-200/5 justify-between w-fit">
          <p className="text-lg max-w-[75ch]">{dialog?.text[lang]}</p>

          <div className="grid w-fit gap-2">
            {dialog?.options?.map((option) => (
              <button
                key={option.text[lang]}
                type="button"
                className={buttonStyle}
                onClick={goToScene(option.nextScene)}
              >
                {option.text[lang]}
              </button>
            )) ?? (
              <button
                className={`${buttonStyle} h-fit self-center`}
                type="button"
                onClick={() => setDialogIndex(dialogIndex + 1)}
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function TestGame() {
  const [char, setCharacter] = useState(character)
  const [enemy, setEnemy] = useState(buildEnemy())
  const [hitInfo, setInfo] = useState("")
  const [turn, setTurn] = useState(1)

  const attack = (spellIndex: number) => () => {
    const isSword = spellIndex === -1

    const manaCost = isSword ? -char.will * 5 : char.spells[spellIndex].cost

    const attackChance =
      randomBetween(6, 1) + (isSword ? char.strength : char.will)
    const doesHit = attackChance > 4
    const isCritical = attackChance > 6
    const hasReaction = enemy.reactions > 0
    const willUseReaction =
      doesHit && hasReaction
        ? Math.random() < enemy.reactionChance ||
          (isCritical && Math.random() < enemy.reactionChance)
        : false
    const dodged = willUseReaction
      ? randomBetween(6, 1) + (isSword ? enemy.strength : enemy.agility) >
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

    setCharacter((prev) => ({
      ...prev,
      mana: Math.min(prev.mana - manaCost, manaFormula(prev.will)),
    }))

    setEnemy((prev) => ({
      ...prev,
      hp: prev.hp - damage,
      reactions: willUseReaction ? prev.reactions - 1 : prev.reactions,
    }))

    setInfo(
      dodged
        ? "Dodged"
        : doesHit
          ? `${
              isCritical ? "Critical " : ""
            }Attack ${spellIndex === -1 ? "Sword" : char.spells[spellIndex].name} hit for ${damage} damage`
          : "Missed",
    )

    setTurn(turn + 1)
  }

  const react = () => {
    const reaction = char.spells[1]
    if (Math.random() < enemy.reactionChance) {
      setEnemy((prev) => ({
        ...prev,
        reactions: prev.reactions - 1,
      }))
    }
  }

  return (
    <section className="grid gap-4">
      <h1>
        Turno {turn} <strong>{hitInfo}</strong>
      </h1>

      <div className="gap-4 flex">
        <div className="p-4 grid gap-2 border border-stone-500 rounded bg-stone-200/5 w-fit">
          <p>Name: {enemy.name}</p>
          <p>HP: {enemy.hp}</p>
          <p>Reactions: {enemy.reactions}</p>
          <p>Reaction Chance: {(enemy.reactionChance * 100).toFixed(2)}%</p>
          <p>Strength: {enemy.strength}</p>
          <p>Agility: {enemy.agility}</p>
          <p>
            Power: {enemy.hp + enemy.reactions + enemy.strength + enemy.agility}
          </p>
        </div>

        <div className="p-4 grid gap-2 border border-stone-500 rounded bg-stone-200/5 w-fit">
          <p>Hollow lv. 1</p>
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
        <button type="button" className={buttonStyle} onClick={attack(-1)}>
          Sword Attack
        </button>
        {char.spells.map((spell, i) => (
          <button
            type="button"
            key={spell.name}
            className={buttonStyle}
            disabled={char.mana < spell.cost}
            onClick={attack(i)}
          >
            {spell.name} - {spell.cost} MP - {spell.damage} Dmg
          </button>
        ))}
      </div>
    </section>
  )
}

function SpellBuilder() {
  const [spell, setSpell] = useState<SpellArgs>({
    areaRadiusOrDepth: 0,
    areaType: "Projectile",
    range: 0,
    duration: 0,
    damage: 0,
    damageType: ["None"],
    effect: ["None"],
  })

  const customSpell = new Spell(spell)

  return (
    <table className="border border-stone-500 [&_tr>*:not(:first-child)]:border-l-2 [&_tr>*:not(:first-child)]:border-stone-500 [&_tr>*]:px-2 text-center">
      <caption>Spells</caption>
      <thead>
        <tr>
          <th>Name</th>
          <th>Area Radius</th>
          {/* <th>Area Height</th>
      <th>Area Width</th> */}
          <th>Range</th>
          <th>Duration</th>
          <th>Effect</th>
          <th>Area Type</th>
          <th>Damage Type</th>
          <th>Damage</th>
          <th>Cost</th>
          <th>Cast per 100 Mana</th>
          <th>Max DMG</th>
        </tr>
      </thead>
      <tbody>
        {spells.map((spell) => (
          <tr
            key={spell.name}
            className="last:border-b-0 border-b border-stone-500 "
          >
            <td>{spell.name}</td>
            <td>{spell.areaRadiusOrDepth}</td>
            {/* <td>{spell.areaHeight}</td>
        <td>{spell.areaWidth}</td> */}
            <td>{spell.range}</td>
            <td>{spell.duration}</td>
            <td>{spell.effect.join(", ")}</td>
            <td>{spell.areaType}</td>
            <td>{spell.damageType.join(", ")}</td>
            <td>{spell.damage}</td>
            <td>{spell.cost}</td>
            <td>{(100 / spell.cost) | 0}</td>
            <td>{(spell.damage * (100 / spell.cost)) | 0}</td>
          </tr>
        ))}
        <tr>
          <td>{customSpell.name}</td>
          <td>
            <input
              className="bg-transparent"
              type="number"
              value={spell.areaRadiusOrDepth}
              onChange={(e) =>
                setSpell((prev) => ({
                  ...prev,
                  areaRadiusOrDepth: Number(e.target.value),
                }))
              }
            />
          </td>
          <td>
            <input
              className="bg-transparent"
              type="number"
              value={spell.range}
              onChange={(e) =>
                setSpell((prev) => ({
                  ...prev,
                  range: Number(e.target.value),
                }))
              }
            />
          </td>
          <td>
            <input
              className="bg-transparent"
              type="number"
              value={spell.duration}
              onChange={(e) =>
                setSpell((prev) => ({
                  ...prev,
                  duration: Number(e.target.value),
                }))
              }
            />
          </td>
          <td>
            <select
              className="bg-transparent"
              value={spell.effect[0]}
              onChange={(e) =>
                setSpell((prev) => ({
                  ...prev,
                  effect: [e.target.value as Effect],
                }))
              }
            >
              {Effects.map((type) => (
                <option className="bg-stone-800" key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </td>
          <td>
            <select
              className="bg-transparent"
              value={spell.areaType}
              onChange={(e) =>
                setSpell((prev) => ({
                  ...prev,
                  areaType: e.target.value as AreaType,
                }))
              }
            >
              {AreaTypes.map((type) => (
                <option className="bg-stone-800" key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </td>
          <td>
            <select
              className="bg-transparent"
              value={spell.damageType[0]}
              onChange={(e) =>
                setSpell((prev) => ({
                  ...prev,
                  damageType: [e.target.value as DamageType],
                }))
              }
            >
              {DamageTypes.map((type) => (
                <option className="bg-stone-800" key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </td>
          <td>
            <input
              className="bg-transparent"
              type="number"
              value={spell.damage}
              onChange={(e) =>
                setSpell((prev) => ({
                  ...prev,
                  damage: Number(e.target.value),
                }))
              }
            />
          </td>
          <td>{customSpell.cost}</td>
          <td>{(100 / customSpell.cost) | 0}</td>
          <td>{(customSpell.damage * (100 / customSpell.cost)) | 0}</td>
        </tr>
      </tbody>
    </table>
  )
}

const buttonStyle =
  "disabled:bg-stone-500 disabled:text-stone-300 disabled:cursor-not-allowed bg-yellow-500 hover:bg-yellow-700 hover:text-stone-100 border border-stone-900  text-stone-800 font-bold py-2 px-4 rounded transition-colors"

const spells: Spell[] = [
  new Spell({
    areaRadiusOrDepth: 10,
    areaType: "Sphere",
    range: 10,
    duration: 0,
    damage: 140,
    damageType: ["Fire", "Bludgeoning"],
    effect: ["Light"],
  }),
  new Spell({
    areaRadiusOrDepth: 10,
    areaType: "Sphere",
    range: 10,
    duration: 0,
    damage: 28,
    damageType: ["Fire"],
    effect: ["None"],
  }),
  new Spell({
    areaRadiusOrDepth: 1,
    areaType: "Projectile",
    range: 1,
    duration: 0,
    damage: 2,
    damageType: ["Fire"],
    effect: ["None"],
  }),
  new Spell({
    areaRadiusOrDepth: 1,
    areaType: "Projectile",
    range: 10,
    duration: 2,
    damage: 22,
    damageType: ["Fire"],
    effect: ["None"],
  }),
]

// Start with 10 points
// Strength determines how much damage you do with weapons, and your hp
// Agility determines your accuracy ranged attacks, and your reactions
// Will determines how much mana you can spend on spells
// You gain 5 points per level
const manaFormula = (will: number) => 80 + will * 10
const character = {
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
  spells,
}

function randomBetween(max = 1, min = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildEnemy() {
  return {
    name: "Enemy",
    hp: randomBetween(13, 3),
    reactions: randomBetween(3, 1),
    reactionChance: randomBetween(0.5, 0.3) + Math.random(),
    strength: randomBetween(5, 1),
    agility: randomBetween(5, 1),
  }
}

interface Scene {
  bgImage: string
  bgMusic: string
  dialogs: Dialog[]
}

type SceneText = Record<LanguageCode, string>

interface Dialog {
  text: SceneText
  options?: Option[]
}

interface Option {
  text: SceneText
  nextScene: SceneName
}

type LanguageCode = "br"
type SceneName =
  | "start"
  | "tavern"
  | "inn"
  | "fight"
  | "reveal"
  | "church"
  | "lake"

const scenes = new Map<SceneName, Scene>()
scenes.set("start", {
  bgImage: "",
  bgMusic: "calm dark forest",
  dialogs: [
    {
      text: {
        br: dedent`Após uma loga viagem você enfim chega a seu destino. Do topo de uma colina você observa.
        Escondida à sombra da macabra *Floresta Negra*, a vila de *Dusk Hollow* se encontra em um estado de 
        abandono e decadência. Suas muralhas outrora protetoras agora estão em ruínas, com trechos inteiros 
        desmoronados e engolidos pela vegetação retorcida. O ar é denso, carregado com a umidade do lago próximo 
        e o cheiro de madeira podre e terra encharcada.`,
        // en: `After a long journey you finally arrive at Dusk Hollow. On top of a cliff you see the village.
        // The view would be fantastic, if the place wasn't falling apart and the dark aura of the Black Forest didn't
        // swallow you up.`,
        // jp: "あなたはダスクホールに到着しました。クリップの上で、村が見えます。その上の山からは、ダスクホールのような、美しい見所があります。",
      },
    },
    {
      text: {
        br: dedent`Ao passar pelos portões você se depara com construções de madeira decrépitas, com telhados de colmo 
        esburacados, inclinam-se como se prestes a desabar, rangendo ao menor sopro de vento. As ruas enlameadas tornam 
        cada passo um esforço, e uma carroça quebrada, abandonada e coberta de musgo, bloqueia a passagem principal, 
        como se o tempo tivesse esquecido este lugar.`,
        // en: "You enter the village.",
      },
      options: [
        {
          text: {
            br: "Ir para a taverna",
            // en: "Go to the tavern",
          },
          nextScene: "tavern",
        },
        {
          text: {
            br: "Ir para estalagem",
            // en: "Go to the inn",
          },
          nextScene: "inn",
        },
        {
          text: {
            br: "Ir para a igreja",
          },
          nextScene: "church",
        },
        {
          text: {
            br: "Ir para o lago",
          },
          nextScene: "lake",
        },
      ],
    },
  ],
})

scenes.set("tavern", {
  bgImage:
    "Uma taverna modesta, com uma parede de pedra e um bar. Um homem brande uma adaga ameaçando dois clientes numa mesa.",
  bgMusic: "tavern",
  dialogs: [
    {
      text: {
        br: "Um baderneiro ameaça os clientes",
        // en: "A troublemaker blackmail the clients",
      },
      options: [
        {
          text: {
            br: "Lutar",
            // en: "Fight",
          },
          nextScene: "fight",
        },
        {
          text: {
            br: "Revelar sua identidade",
            // en: "Reveal your identity",
          },
          nextScene: "reveal",
        },
      ],
    },
  ],
})
