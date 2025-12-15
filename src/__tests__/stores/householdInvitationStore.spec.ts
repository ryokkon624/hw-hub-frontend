// src/__tests__/stores/householdInvitationStore.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useHouseholdInvitationStore } from '@/stores/householdInvitationStore'
import { householdInvitationApi } from '@/api/householdInvitationApi'
import type { HouseholdInvitationModel } from '@/domain'
import { INVITATION_STATUS } from '@/constants/code.constants'

vi.mock('@/api/householdInvitationApi', () => ({
  householdInvitationApi: {
    listByHousehold: vi.fn(),
    create: vi.fn(),
    revoke: vi.fn(),
  },
}))

const mockedApi = vi.mocked(householdInvitationApi, true)

const makeInvitation = (overrides?: Partial<HouseholdInvitationModel>): HouseholdInvitationModel =>
  ({
    householdId: 1,
    inviterUserId: 1,
    invitedEmail: 'invitee@example.com',
    invitationToken: 'token-1',
    status: INVITATION_STATUS.PENDING,
    expiresAt: '2025-01-01T00:00:00Z',
    acceptedUserId: null,
    acceptedUserName: null,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }) as HouseholdInvitationModel

describe('householdInvitationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('byHousehold: householdId が null / undefined のときは空配列を返す', () => {
    const store = useHouseholdInvitationStore()

    expect(store.byHousehold(null)).toEqual([])
    expect(store.byHousehold(undefined)).toEqual([])
  })

  it('byHousehold: 指定された householdId の招待一覧を返す', () => {
    const store = useHouseholdInvitationStore()
    const inv = makeInvitation()

    store.itemsByHouseholdId[1] = [inv]

    expect(store.byHousehold(1)).toEqual([inv])
    expect(store.byHousehold(2)).toEqual([])
  })

  it('fetchByHousehold: キャッシュが無い場合は API から取得して保存する', async () => {
    const store = useHouseholdInvitationStore()
    const inv = makeInvitation()

    mockedApi.listByHousehold.mockResolvedValue([inv])

    await store.fetchByHousehold(1)

    expect(mockedApi.listByHousehold).toHaveBeenCalledWith(1)
    expect(store.itemsByHouseholdId[1]).toEqual([inv])
  })

  it('fetchByHousehold: 既にキャッシュがあり force=false の場合は API を呼ばない', async () => {
    const store = useHouseholdInvitationStore()
    const cached = makeInvitation({ invitationToken: 'cached' })
    store.itemsByHouseholdId[1] = [cached]

    await store.fetchByHousehold(1)

    expect(mockedApi.listByHousehold).not.toHaveBeenCalled()
    expect(store.itemsByHouseholdId[1]).toEqual([cached])
  })

  it('fetchByHousehold: force=true の場合はキャッシュがあっても API から再取得する', async () => {
    const store = useHouseholdInvitationStore()
    const cached = makeInvitation({ invitationToken: 'cached' })
    const fresh = makeInvitation({ invitationToken: 'fresh' })

    store.itemsByHouseholdId[1] = [cached]
    mockedApi.listByHousehold.mockResolvedValue([fresh])

    await store.fetchByHousehold(1, { force: true })

    expect(mockedApi.listByHousehold).toHaveBeenCalledWith(1)
    expect(store.itemsByHouseholdId[1]).toEqual([fresh])
  })

  it('createInvitation: 正常系では先頭に追加されて返却される', async () => {
    const store = useHouseholdInvitationStore()
    const existing = makeInvitation({ invitationToken: 'old' })
    const created = makeInvitation({ invitationToken: 'new' })

    store.itemsByHouseholdId[1] = [existing]
    mockedApi.create.mockResolvedValue(created)

    const result = await store.createInvitation(1, 'new@example.com')

    expect(mockedApi.create).toHaveBeenCalledWith(1, 'new@example.com')
    expect(result).toEqual(created)
    expect(store.itemsByHouseholdId[1]).toEqual([created, existing])
  })

  it('revokeInvitation: 指定トークンの status を REVOKED に更新する', async () => {
    const store = useHouseholdInvitationStore()

    const target = makeInvitation({ invitationToken: 'target', status: INVITATION_STATUS.PENDING })
    const other = makeInvitation({ invitationToken: 'other', status: INVITATION_STATUS.PENDING })

    store.itemsByHouseholdId[1] = [target, other]

    mockedApi.revoke.mockResolvedValue()

    await store.revokeInvitation(1, 'target')

    expect(mockedApi.revoke).toHaveBeenCalledWith('target')

    const updatedList = store.itemsByHouseholdId[1]
    expect(updatedList).toHaveLength(2)

    const updatedTarget = updatedList.find((i) => i.invitationToken === 'target')
    const updatedOther = updatedList.find((i) => i.invitationToken === 'other')

    expect(updatedTarget?.status).toBe(INVITATION_STATUS.REVOKED)
    expect(updatedOther?.status).toBe(INVITATION_STATUS.PENDING)
  })
})
