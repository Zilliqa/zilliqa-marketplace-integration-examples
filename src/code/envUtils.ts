import { logError } from "./logger"

export function getAssertedValue(value: string | undefined | null, variableName: string): string {
  if (value === undefined || value === null) {
    logError('env', 'value missing', { variableName })
    throw `variable ${variableName} missing in env file`
  }

  // clean the variable from possibly encoding hidden character
  return value.replace(/(\r\n|\n|\r)/gm, "")
}