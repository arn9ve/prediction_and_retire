addEventListener('message', async ({ data: symbols }) => {
  const results = await Promise.all(
    symbols.map(async symbol => ({
      symbol,
      data: await processETFDATA(symbol)
    }))
  )
  postMessage(results)
}) 