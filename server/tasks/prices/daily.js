import { runDailyPricePipeline } from '../../price-providers/index.js'

export default defineTask({
  meta: {
    name: 'prices:daily',
    description: 'Run Egyptian finishing material price providers and record daily median snapshots'
  },
  async run() {
    const summary = await runDailyPricePipeline()
    return {
      result: summary.ok ? 'ok' : 'fallback',
      ...summary
    }
  }
})
