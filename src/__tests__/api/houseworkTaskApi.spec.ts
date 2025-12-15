import { describe, it, expect, vi, beforeEach } from 'vitest'
import { houseworkTaskApi } from '@/api/houseworkTaskApi'
import { apiClient } from '@/api/client'
import type { HouseworkTaskModel } from '@/domain'
import type { CategoryCode, HouseholdMemberStatusCode } from '@/constants/code.constants'
import * as dateUtils from '@/utils/dateUtils'

type MockedApiClient = {
  get: ReturnType<typeof vi.fn>
  patch: ReturnType<typeof vi.fn>
}

const mockedClient = apiClient as unknown as MockedApiClient

// toYmd をモックして「今日」を固定
const toYmdMock = vi.fn(() => '2025-05-10')

vi.mock('@/api/client', () => {
  return {
    apiClient: {
      get: vi.fn(),
      patch: vi.fn(),
    },
  }
})

vi.mock('@/utils/dateUtils', () => ({
  toYmd: () => '2025-05-10',
}))

describe('houseworkTaskApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    toYmdMock.mockReset()
    toYmdMock.mockImplementation(() => '2025-05-10')
  })

  describe('fetchTasks', () => {
    it('GET /api/housework-tasks に householdId / status を付けて呼び出し、DTO を Domain Model に変換する', async () => {
      const toYmdSpy = vi.spyOn(dateUtils, 'toYmd').mockReturnValue('2025-05-10')
      const dtoList = [
        {
          houseworkTaskId: 1,
          householdId: 10,
          houseworkId: 100,
          houseworkName: '掃除',
          categoryCode: 'CLEAN' as CategoryCode,
          targetDate: '2025-05-09', // 昨日 → overdue
          assigneeUserId: 1,
          assigneeNickname: 'ユーザ1',
          status: '1' as HouseholdMemberStatusCode,
          assignReasonType: 'AUTO',
          doneAt: null,
          skippedReason: null,
        },
        {
          houseworkTaskId: 2,
          householdId: 10,
          houseworkId: 101,
          houseworkName: '洗濯',
          categoryCode: 'LAUNDRY' as CategoryCode,
          targetDate: '2025-05-10', // 今日
          assigneeUserId: null,
          assigneeNickname: null,
          status: '2' as HouseholdMemberStatusCode,
          assignReasonType: null,
          doneAt: '2025-05-10T10:00:00Z',
          skippedReason: null,
        },
        {
          houseworkTaskId: 3,
          householdId: 10,
          houseworkId: 102,
          houseworkName: '皿洗い',
          categoryCode: null,
          targetDate: '2025-05-11', // 明日
          assigneeUserId: 2,
          assigneeNickname: 'ユーザ2',
          status: '3' as HouseholdMemberStatusCode,
          assignReasonType: 'MANUAL',
          doneAt: null,
          skippedReason: '疲れた',
        },
      ]

      mockedClient.get.mockResolvedValue({
        data: dtoList,
      })

      const result = await houseworkTaskApi.fetchTasks(10, 'OPEN')

      expect(mockedClient.get).toHaveBeenCalledTimes(1)
      expect(mockedClient.get).toHaveBeenCalledWith('/api/housework-tasks', {
        params: { householdId: 10, status: 'OPEN' },
      })

      expect(result).toHaveLength(3)

      const t1 = result[0]!
      const t2 = result[1]!
      const t3 = result[2]!

      const expectTask = (task: HouseworkTaskModel, idx: number) => {
        const src = dtoList[idx]!
        expect(task.houseworkTaskId).toBe(src.houseworkTaskId)
        expect(task.householdId).toBe(src.householdId)
        expect(task.houseworkId).toBe(src.houseworkId)
        expect(task.houseworkName).toBe(src.houseworkName)
        expect(task.categoryCode).toBe(src.categoryCode)
        expect(task.targetDate).toBe(src.targetDate)
        expect(task.assigneeUserId).toBe(src.assigneeUserId)
        expect(task.assigneeNickname).toBe(src.assigneeNickname)
        expect(task.status).toBe(src.status)
        expect(task.assignReasonType).toBe(src.assignReasonType)
        expect(task.doneAt).toBe(src.doneAt)
        expect(task.skippedReason).toBe(src.skippedReason)
      }

      expectTask(t1, 0)
      expectTask(t2, 1)
      expectTask(t3, 2)

      // isOverdue / isToday 判定
      expect(t1.isOverdue).toBe(true)
      expect(t1.isToday).toBe(false)

      expect(t2.isOverdue).toBe(false)
      expect(t2.isToday).toBe(true)

      expect(t3.isOverdue).toBe(false)
      expect(t3.isToday).toBe(false)

      // toYmd が内部で一度以上呼ばれていること
      expect(toYmdSpy).toHaveBeenCalled()
      expect(toYmdSpy).toHaveBeenCalledWith(expect.any(Date))

      toYmdSpy.mockRestore()
    })
  })

  describe('updateAssignee', () => {
    it('PATCH /api/housework-tasks/:id/assign を正しい payload で呼び出す (担当者あり)', async () => {
      mockedClient.patch.mockResolvedValue({})

      await houseworkTaskApi.updateAssignee(1, 99, 'AUTO')

      expect(mockedClient.patch).toHaveBeenCalledTimes(1)
      expect(mockedClient.patch).toHaveBeenCalledWith('/api/housework-tasks/1/assign', {
        assigneeUserId: 99,
        assignReasonType: 'AUTO',
      })
    })

    it('PATCH /api/housework-tasks/:id/assign を正しい payload で呼び出す (担当者なし)', async () => {
      mockedClient.patch.mockResolvedValue({})

      await houseworkTaskApi.updateAssignee(2, null, null)

      expect(mockedClient.patch).toHaveBeenCalledTimes(1)
      expect(mockedClient.patch).toHaveBeenCalledWith('/api/housework-tasks/2/assign', {
        assigneeUserId: null,
        assignReasonType: null,
      })
    })
  })

  describe('updateStatus', () => {
    it('PATCH /api/housework-tasks/:id/status を正しい payload で呼び出す', async () => {
      mockedClient.patch.mockResolvedValue({})

      await houseworkTaskApi.updateStatus(3, 'DONE', '疲れた')

      expect(mockedClient.patch).toHaveBeenCalledTimes(1)
      expect(mockedClient.patch).toHaveBeenCalledWith('/api/housework-tasks/3/status', {
        status: 'DONE',
        skippedReason: '疲れた',
      })
    })

    it('skippedReason が null の場合も PATCH される', async () => {
      mockedClient.patch.mockResolvedValue({})

      await houseworkTaskApi.updateStatus(4, 'DONE', null)

      expect(mockedClient.patch).toHaveBeenCalledTimes(1)
      expect(mockedClient.patch).toHaveBeenCalledWith('/api/housework-tasks/4/status', {
        status: 'DONE',
        skippedReason: null,
      })
    })
  })
})
