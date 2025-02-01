export class PredictionEngine {
  private precomputedModels: Map<string, ProjectionModel>
  
  async initialize() {
    this.precomputedModels = await loadPrecomputedModels()
  }

  getProjection(symbol: string): ProjectionResults {
    return this.precomputedModels.get(symbol).calculate()
  }
} 