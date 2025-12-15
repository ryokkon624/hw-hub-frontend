import { defineStore } from 'pinia'
import { shoppingItemAttachmentApi } from '@/api/shoppingItemAttachmentApi'
import type { ShoppingItemAttachmentModel } from '@/domain'

interface ShoppingItemState {
  attachmentsByItemId: Record<number, ShoppingItemAttachmentModel[]>
  uploadingItemIds: number[]
}

export const useShoppingItemAttachmentStore = defineStore('shoppingItem', {
  state: (): ShoppingItemState => ({
    attachmentsByItemId: {},
    uploadingItemIds: [],
  }),

  getters: {
    /**
     * 先頭の画像を取得する。1買い物アイテムにN添付ファイルが可能であるため。
     * @param state
     * @returns 画像のURL
     */
    firstImageUrl: (state) => (itemId: number) => {
      const list = state.attachmentsByItemId[itemId] ?? []
      return list[0]?.imageUrl
    },

    /**
     * 指定されたアイテムの全添付一覧
     * @param state
     * @returns 買い物アイテム添付ファイルDomain Model
     */
    attachments:
      (state) =>
      (itemId: number): ShoppingItemAttachmentModel[] =>
        state.attachmentsByItemId[itemId] ?? [],

    /**
     * 指定された買い物アイテム添付ファイルIDがupload中であるかを返す。
     * @param state
     * @returns upload中の場合true
     */
    isUploading:
      (state) =>
      (itemId: number): boolean =>
        state.uploadingItemIds.includes(itemId),
  },

  actions: {
    /**
     * 指定された買い物アイテムIDの添付ファイルを取得する。
     * @param itemId 買い物アイテムID
     */
    async fetchAttachments(itemId: number) {
      const list: ShoppingItemAttachmentModel[] =
        await shoppingItemAttachmentApi.listAttachments(itemId)

      // 並び順を sortOrder で揃える
      const sorted = [...list].sort(
        (a: ShoppingItemAttachmentModel, b: ShoppingItemAttachmentModel) =>
          a.sortOrder - b.sortOrder,
      )

      if (!this.attachmentsByItemId[itemId]) {
        // 初回はそのままセット
        this.attachmentsByItemId[itemId] = sorted
      } else {
        // 2回目以降は「同じ配列の中身だけ」入れ替える（参照は変えない）
        // Vueがcomputedで追えなくなるため
        const target = this.attachmentsByItemId[itemId]
        target.splice(0, target.length, ...sorted)
      }
    },

    /**
     * 添付ファイルをuploadする。
     * @param itemId 買い物アイテムID
     * @param file
     */
    async uploadAttachment(itemId: number, file: File) {
      try {
        if (!this.uploadingItemIds.includes(itemId)) {
          this.uploadingItemIds.push(itemId)
        }

        // presigned URL 発行
        const upload = await shoppingItemAttachmentApi.createUploadUrl(itemId, {
          fileName: file.name,
          mimeType: file.type,
        })

        // ブラウザから PUT
        await fetch(upload.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        })

        // メタ情報登録（戻り値は使わないので握りつぶす）
        await shoppingItemAttachmentApi.createAttachment(itemId, {
          fileKey: upload.fileKey,
          fileName: file.name,
          mimeType: file.type,
        })

        // 一覧再取得
        await this.fetchAttachments(itemId)
      } finally {
        this.uploadingItemIds = this.uploadingItemIds.filter((id) => id !== itemId)
      }
    },

    /**
     * 添付ファイルを削除する。
     * @param itemId 買い物アイテムID
     * @param attachmentId 買い物アイテム添付ファイルID
     */
    async deleteAttachment(itemId: number, attachmentId: number) {
      await shoppingItemAttachmentApi.deleteAttachment(itemId, attachmentId)

      const list = this.attachmentsByItemId[itemId]
      if (!list) return

      const idx = list.findIndex((a) => a.id === attachmentId)
      if (idx !== -1) {
        // 参照は維持したまま 1 件削除
        list.splice(idx, 1)
      }
    },
  },
})
