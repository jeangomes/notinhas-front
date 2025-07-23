import { copyToClipboard, useQuasar } from 'quasar'

export default function useCopyToClipboardNotify () {
  const $q = useQuasar()

  const copyValueToClipboard = (value) => {
    copyToClipboard(value)
      .then(() => {
        $q.notify({
          type: 'positive',
          message: 'Copiado com sucesso!'
        })
      })
      .catch(() => {
        $q.notify({
          type: 'negative',
          message: 'Não copiado!'
        })
      })
  }

  return {
    copyValueToClipboard
  }
}
