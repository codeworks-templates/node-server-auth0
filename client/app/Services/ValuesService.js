import { appState } from '../AppState.js'
import { Value } from '../Models/Value.js'

class ValuesService {
  addValue() {
    appState.values = [...appState.values, new Value({ title: Math.random() })]
  }
}

export const valuesService = new ValuesService()
