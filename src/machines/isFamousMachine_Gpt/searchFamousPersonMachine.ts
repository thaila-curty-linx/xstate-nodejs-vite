import { createMachine, assign, fromPromise } from 'xstate'

// Definindo a interface para o contexto da máquina
interface Context {
  name: string
  resultCount: number
}

// Definindo a interface para eventos da máquina
type Events = { type: 'SEARCH'; name_query: string }

export const machine = createMachine<Context, Events>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEtYDECGBbA9gV1gFkMBjAC2QDswB9AcQAcAXAOmQgBswBiAZQFEAggCUAwgAkA2gAYAuolAMcsZE2Q5KCkAA9EARj0BWFgGYATAA4AnNL0AWPWel3DANj0AaEAE9EAWj0AdlcWKxdDMysrVwszOzsrAF9Er1RMXAJicipaRlZYMAwAJ2zKKG4IDTA2SgA3HABrarTsfCJSCmp6ZhYC4tKoBCp6kgw1DRlZSa0lFXHNJB1EQwSWC3WTV0jpSytAr18EP0iTFhjXGL29PcDNw2TU9FbMjpzu-MKSzvKwIqKcIosBgcMYAMwBWDYTwy7VKuR6fS+VEGwxwo3mk2mi1mqnUC1AugQhkM0hYbmkFnMUTcgWkhgO-lJrhMhlpdmkVhMVlZ0lsFgeIBaMKynXhrCKcDwHCYsG4WMUylxGi0hIselOeh2ZkCgWJ0mCDgZRyCGougQsdhMelcUSs-JSguhbRFbzyLAlsClMrlenk2MV8xViDVGq1Or1Bs8Pn8BjsZwsOoS1itgWt9odlBwEDgWiFzteXTyMwDeKDRxsLF5KcCUQS0mZ+2jRxMapY1pcLJtZhiO1cArzLzh7zYnDAxbmpcWhL8djMlek1drNmZFyNARWLG7HfNDnNvPuDoHsNFw8RA3HSvxSwQ2r0m6M6rMegsbhcrjsa6CgRYuvfdnO6w1hc-ZOoOJ5uh6XrwP6E7KlOwbmCwLh0juFquDsa7anOJJciyTgpk+IHpPmQ5uqCzzQQqsFXoSmpBGc763HSC7EkEn66khT6GCm+qBP+6xERRLqFj0mZMMRBAXoG8EIJqHJkrY1pcvY1zvp+1qhLOCSBJYykJgejwScero9ORyAcHgEpSZOBLLJSP4xNYFg7BYWzcka9m8mEWrROsQQHskQA */
    id: 'searchFamousPersonMachine',
    initial: 'idle',
    context: {
      name: '',
      resultCount: 0, // resultado inicial
    },
    states: {
      idle: {
        // Estado inicial, aguardando uma pesquisa de nome
        on: {
          SEARCH: {
            target: 'searching',
            actions: assign({
              name: ({ event }) => event.name_query, // atualiza o nome com o nome da pesquisa em andamento
            }),
          },
        },
      },
      searching: {
        // A máquina está procurando se o nome é famoso
        invoke: {
          src: 'searching_invoke', // função que realmente realizaria a pesquisa
          onDone: {
            target: 'check_result',
            actions: ['search_assign'], // quando a pesquisa é concluída, transfira para o estado dos resultados
          },
          onError: 'failure',
        },
      },
      check_result: {
        always: [
          { target: 'famous', guard: 'isFamous' },
          { target: 'notFamous' },
        ],
      },
      famous: {
        // O nome é famoso
      },
      notFamous: {
        // O nome não é famoso
      },
      failure: {
        // Houve um erro na pesquisa
      },
    },
  },
  {
    actors: {
      // ref: https://stately.ai/docs/xstate-v5/migration#use-actor-logic-creators-for-invokesrc-instead-of-functions
      searching_invoke: fromPromise(async ({ input }) => {
        // Aqui iria o código que realmente faz a pesquisa na internet
        // Para este exemplo, estamos apenas 'simulando' esta consulta
        return Promise.resolve({
          resultCount: Math.random() * 200,
        })
      }),
    },
    actions: {
      search_assign: assign({
        resultCount: ({ event }) => {
          return (event as any).output.resultCount
        },
      }),
    },
    guards: {
      isFamous: ({ context }) => context.resultCount > 100, // se a conta de resultados for maior que 500, consideramos o nome como famoso
    },
  }
)