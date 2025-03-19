import { createFileRoute } from "@tanstack/react-router"
import DOMPurify from "dompurify"
import { useState } from "react"

import {
  AreaTypes,
  DamageTypes,
  Effects,
  Spell,
  type AreaType,
  type DamageType,
  type Effect,
  type SpellArgs,
} from "@/gameplay/scripts/Spell"
import type { LanguageCode } from "@/interfaces"
import { scenes, type SceneName } from "@/gameplay/scenes"
import { BattleScene } from "@/components/game/battle-scene"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const lang: LanguageCode =
    (localStorage.getItem("lang") as LanguageCode) || "br"

  const [sceneName, setSceneName] = useState(() => {
    const currentSceneName: SceneName =
      (localStorage.getItem("currentSceneName") as SceneName) || "start"
    return currentSceneName
  })
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
    setSceneName(sceneName)
    setDialogIndex(0)
  }

  return (
    <main className="grid gap-4 p-8">
      <SpellBuilder />

      <BattleScene />

      <section id="scene-text">
        <div className="relative flex w-fit justify-between gap-4 rounded border border-stone-500 bg-stone-200/5 p-4">
          <div className="-top-3 absolute rounded border border-stone-500 bg-stone-700 px-1 ">
            {sceneName}
          </div>
          <p
            className="max-w-[75ch] text-lg"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(dialog?.text[lang] ?? ""),
            }}
          />

          <div className="grid w-fit gap-2">
            {dialog?.options?.map((option) => (
              <Button
                key={option.text[lang]}
                onClick={goToScene(option.nextScene)}
              >
                {option.text[lang]}
              </Button>
            )) ?? (
              <Button onClick={() => setDialogIndex(dialogIndex + 1)}>
                Próximo
              </Button>
            )}
          </div>
        </div>
      </section>
    </main>
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
    <table className="border border-stone-500 text-center [&_tr>*:not(:first-child)]:border-stone-500 [&_tr>*:not(:first-child)]:border-l-2 [&_tr>*]:px-2">
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
            className="border-stone-500 border-b last:border-b-0 "
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
