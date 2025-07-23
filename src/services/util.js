import { date } from 'quasar'

export const currencyFormat = (value) => {
  if (typeof value !== 'number') {
    return value
  }
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  })
  return formatter.format(value)
}

export const getDate = (value) => {
  if (value) {
    const date = new Date(value)
    // noinspection JSCheckFunctionSignatures
    return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'numeric', year: '2-digit' }).format(date)
  }
}

export const getWeekDay = (value) => {
  if (value) {
    const date = new Date(value)
    // noinspection JSCheckFunctionSignatures
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', '')
  }
}

export const dateFormat = (value) => {
  if (value === null) {
    return value
  }
  if (value) {
    const date = new Date(value)
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date)
  }
}
export const dateFormatForInput = (value) => {
  if (value === null) {
    return value
  }
  if (value) {
    return date.formatDate(value, 'YYYY-MM-DD')
  }
}
//

export const dateTimeFormat = (value) => {
  if (value) {
    const date = new Date(value)
    // noinspection JSCheckFunctionSignatures
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
  }
}

export const limitString = (str, limit) => {
  if (str.length <= limit) {
    return str
  } else {
    return str.substring(0, limit) + '...'
  }
}

export const limitWords = (str, limit) => {
  if (str) {
    return str.split(' ').slice(0, limit).join(' ')
  }
  return ''
}
