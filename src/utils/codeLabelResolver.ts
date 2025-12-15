import type { CodeModel } from '@/domain/code/code.model'

export const resolveCodeLabel = (code: CodeModel, locale: string): string => {
  switch (locale) {
    case 'ja':
      return code.displayNameJa ?? code.name
    case 'en':
      return code.displayNameEn ?? code.name
    case 'es':
      return code.displayNameEs ?? code.displayNameEn ?? code.name
    default:
      return code.name
  }
}
