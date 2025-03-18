import type { LanguageCode } from "@/interfaces"
import dedent from "dedent"

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

export type SceneName =
  | "start"
  | "tavern-trouble"
  | "inn"
  | "fight"
  | "reveal"
  | "church"
  | "lake"
  | "tavern-fight"

export const scenes = new Map<SceneName, Scene>()
scenes.set("start", {
  bgImage: "",
  bgMusic: "calm dark forest",
  dialogs: [
    {
      text: {
        br: dedent`Após uma loga viagem você enfim chega a seu destino. Do topo de uma colina você observa.
          Escondida à sombra da macabra <strong>Floresta Negra</strong>, a vila de <strong>Dusk Hollow</strong> 
          se encontra em um estado de abandono e decadência. Suas muralhas outrora protetoras agora estão em ruínas, 
          com trechos inteiros desmoronados e engolidos pela vegetação retorcida. O ar é denso, carregado com a 
          umidade do lago próximo e o cheiro de madeira podre e terra encharcada.`,
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
            // jp: "ターヴァーンに行く",
          },
          nextScene: "tavern-trouble",
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

scenes.set("tavern-trouble", {
  bgImage:
    "Uma taverna modesta, com uma parede de pedra e um bar. Um homem brande uma adaga ameaçando dois clientes numa mesa.",
  bgMusic: "tavern",
  dialogs: [
    {
      text: {
        br: dedent`
        A Taverna <strong>O Último Suspiro</strong> ainda resiste ao tempo, suas janelas embaçadas deixando escapar um 
        fraco brilho amarelado, um convite tanto para viajantes exaustos quanto para almas condenadas.
        <br /><br />
        O lugar é de teto baixo, iluminado por velas tremeluzentes e um grande candelabro enferrujado que 
        balança levemente a cada rajada de vento. O cheiro forte de cerveja azeda, madeira úmida e suor 
        paira no ar, misturado com o murmúrio dos poucos frequentadores; mercenários cansados, viajantes desconfiados 
        e locais de olhar vazio.
        `,
        // en: "A troublemaker blackmail the clients",
      },
    },
    {
      text: {
        br: dedent`
          Você se senta em um banco gasto e faz sinal para o taverneiro, um homem de ombros largos e expressão 
          endurecida pelo tempo. Antes mesmo que a bebida chegue à mesa, um homem de armadura desalinhada se aproxima. 
          Sua mão descansa no cabo da espada enquanto ele inclina o corpo para frente, um sorriso torto no rosto.
          <br /><em>"Você não pagou a taxa de entrada da cidade, não é?"</em><br />
          A pergunta soa mais como uma acusação, um pretexto barato para extorquir algumas moedas de prata. 
          Seus olhos analisam cada detalhe seu, avaliando o quão difícil seria arrancar o que deseja.
          `,
        // en: "A troublemaker blackmail the clients",
      },
      options: [
        {
          text: {
            br: '"E quem é você?"',
          },
          nextScene: "tavern-fight",
        },
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
