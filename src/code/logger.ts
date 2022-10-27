import toast from "react-hot-toast";

export type Categories = string | string[]

function stringifyCategories(categories: Categories): string {
  if (Array.isArray(categories)) {
    return categories.map(
      (category) => `[${category}]`
    ).join('')
  } else {
    return `[${categories}]`
  }
}

function getMessageString(categories: Categories, message: string, context: Record<string, any> = {}): string {
  return `${stringifyCategories(categories)} ${message} ${Object.keys(context).length > 0 ? JSON.stringify(context) : ''}`
}

export function logInfo(categories: Categories, message: string, context: Record<string, any> = {}): void {
  const processedMessage = getMessageString(categories, message, context)
  console.log(processedMessage)
  toast.loading(processedMessage)
}

export function logSuccess(categories: Categories, message: string, context: Record<string, any> = {}): void {
  const processedMessage = getMessageString(categories, message, context)
  console.log(processedMessage)
  toast.success(processedMessage)
}

export function logError(categories: Categories, message: string, context: Record<string, any> | Error = {}): void {
  let processedMessage = ''
  if (context instanceof Error) {
    processedMessage = getMessageString(categories, message, {
      name: context.name,
      message: context.message
    })
  } else {
    processedMessage = getMessageString(categories, message, context)
  }

  console.error(processedMessage)
  toast.error(processedMessage)
}