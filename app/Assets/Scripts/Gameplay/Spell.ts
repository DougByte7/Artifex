export const DamageTypes = [
  "None",
  "Slashing",
  "Bludgeoning",
  "Piercing",
  "Fire",
  "Ice",
  "Electric",
  "Thunder",
  "Psychic",
  "Force",
  "Poison",
  "Acid",
  "Necrotic",
  "True",
  "Special",
] as const
export type DamageType = (typeof DamageTypes)[number]

export const Effects = [
  "None",
  "Light",
  "LifeRegen",
  "Push",
  "Pull",
  "Slow",
  "Stun",
  "Silence",
  "Blind",
  "Deaf",
  "Weaken",
  "Confuse",
  "Drain",
  "SpeedBoost",
  "DamageBoost",
  "Protection",
  "AttackSpeedBoost",
  "Reflect",
  "Teleport",
  "StaminaRegen",
  "ManaRegen",
] as const
export type Effect = (typeof Effects)[number]

export const AreaTypes = [
  "Projectile",
  "Sphere",
  "Cylinder",
  "Cone",
  "Box",
  "Target",
] as const
export type AreaType = (typeof AreaTypes)[number]

export interface SpellArgs {
  areaRadiusOrDepth: number
  areaType: AreaType
  range: number // 0 = self
  duration: number
  damage: number
  damageType: DamageType[]
  effect: Effect[]
  areaHeight?: number
  areaWidth?: number
}

export class Spell {
  areaRadiusOrDepth: number
  areaHeight?: number
  areaWidth?: number
  areaType: AreaType
  range: number // 0 = self
  duration: number
  damage: number
  damageType: DamageType[]
  effect: Effect[]

  constructor(args: SpellArgs) {
    this.areaRadiusOrDepth = args.areaRadiusOrDepth
    this.areaType = args.areaType
    this.range = args.range
    this.duration = args.duration
    this.damage = args.damage
    this.damageType = args.damageType
    this.effect = args.effect
    this.areaHeight = args.areaHeight
    this.areaWidth = args.areaWidth
  }

  get name() {
    return generateSpellName(
      this.damage,
      this.cost,
      this.damageType,
      this.effect,
      this.areaType,
    )
  }

  get cost() {
    const areaCost =
      (1 +
        AreaTypes.indexOf(this.areaType) *
          (this.areaRadiusOrDepth +
            (this.areaHeight || 1) +
            (this.areaWidth || 1))) *
      1.5

    const dameTypeCost = this.damageType.reduce(
      (acc, type, i) => acc + DamageTypes.indexOf(type) * 3 + i * 0.5,
      0,
    )
    const effectCost = this.effect.reduce(
      (acc, type, i) => acc + Effects.indexOf(type) * 1.5 + i * 0.5,
      0,
    )

    const damageCost = this.damage ** 1.15

    return Math.floor(
      areaCost +
        this.range +
        this.duration +
        damageCost +
        dameTypeCost +
        effectCost,
    )
  }
}

export function generateSpellName(
  damage: number,
  cost: number,
  damageType: DamageType[],
  effect: Effect[],
  areaType: AreaType,
) {
  const damageDescriptors = [
    "Weak",
    "",
    "Moderate",
    "Powerful",
    "Devastating",
    "Cataclysmic",
  ]
  const costDescriptors = ["Minor", "Lesser", "Greater", "Grand", "Supreme"]

  const damagePrefix = {
    None: "Mystic",
    Slashing: "Blade",
    Bludgeoning: "Hammer",
    Piercing: "Spike",
    Fire: "Fire",
    Ice: "Frost",
    Electric: "Storm",
    Thunder: "Thunder",
    Psychic: "Mind",
    Force: "Arcane",
    Poison: "Venom",
    Acid: "Corrosive",
    Necrotic: "Dark",
    True: "Eldritch",
    Special: "Unknown",
  }

  const effectSuffix = {
    None: "",
    Light: "Radiance",
    LifeRegen: "Healing",
    Push: "Repulsion",
    Pull: "Attraction",
    Slow: "Snare",
    Stun: "Paralysis",
    Silence: "Mute",
    Blind: "Blindness",
    Deaf: "Echo",
    Weaken: "Sapping",
    Confuse: "Madness",
    Drain: "Leech",
    SpeedBoost: "Swiftness",
    DamageBoost: "Empowerment",
    Protection: "Barrier",
    AttackSpeedBoost: "Frenzy",
    Reflect: "Mirror",
    Teleport: "Blink",
    StaminaRegen: "Vigor",
    ManaRegen: "Mana Surge",
  }

  const areaNames = {
    Projectile: "Bolt",
    Sphere: "Ball",
    Cylinder: "Column",
    Cone: "Wave",
    Box: "Zone",
    Target: "Touch",
  }

  // Escolhe intensidade com base no dano e custo
  const damageLevel =
    damageDescriptors[
      Math.min(Math.floor(damage / 20), damageDescriptors.length - 1)
    ]
  const costLevel =
    costDescriptors[Math.min(Math.floor(cost / 20), costDescriptors.length - 1)]

  // Gera o nome da magia
  let spellName = `${damageLevel} ${costLevel} ${damageType.map((t) => damagePrefix[t]).join(" ")} ${areaNames[areaType]}`

  // Adiciona efeito se houver
  if (effect.filter((e) => e !== "None").length > 0) {
    spellName += ` of ${effect
      .filter((e) => e !== "None")
      .map((e) => effectSuffix[e])
      .join(" and ")}`
  }

  return spellName
}
