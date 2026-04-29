// src/__tests__/components/home/OnboardingStepCard.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OnboardingStepCard from '@/components/home/OnboardingStepCard.vue'
import { defineComponent, h, markRaw } from 'vue'

const DummyIcon = markRaw(
  defineComponent({
    name: 'DummyIcon',
    render: () => h('span', { class: 'dummy-icon' }),
  }),
)

const defaultProps = {
  icon: DummyIcon,
  title: 'ステップタイトル',
  description: '説明文テキスト',
  buttonLabel: 'アクションボタン',
  isDone: false,
}

describe('OnboardingStepCard', () => {
  it('title と description が表示される', () => {
    const wrapper = mount(OnboardingStepCard, { props: defaultProps })

    expect(wrapper.text()).toContain('ステップタイトル')
    expect(wrapper.text()).toContain('説明文テキスト')
  })

  it('isDone=false のときボタンが表示される', () => {
    const wrapper = mount(OnboardingStepCard, { props: defaultProps })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.text()).toContain('アクションボタン')
  })

  it('isDone=true のときボタンが表示されない', () => {
    const wrapper = mount(OnboardingStepCard, {
      props: { ...defaultProps, isDone: true },
    })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('ボタンをクリックすると action イベントが発火する', async () => {
    const wrapper = mount(OnboardingStepCard, { props: defaultProps })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')).toHaveLength(1)
  })

  it('isButtonDisabled=true のときボタンが disabled になる', () => {
    const wrapper = mount(OnboardingStepCard, {
      props: { ...defaultProps, isButtonDisabled: true },
    })

    const btn = wrapper.find('button')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('isButtonDisabled=true のときクリックしても action イベントが発火しない', async () => {
    const wrapper = mount(OnboardingStepCard, {
      props: { ...defaultProps, isButtonDisabled: true },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('action')).toBeFalsy()
  })

  it('extraMessage が指定されると表示される', () => {
    const wrapper = mount(OnboardingStepCard, {
      props: { ...defaultProps, extraMessage: '追加メッセージです' },
    })

    expect(wrapper.text()).toContain('追加メッセージです')
  })

  it('extraMessage が未指定のときは表示されない', () => {
    const wrapper = mount(OnboardingStepCard, { props: defaultProps })

    expect(wrapper.text()).not.toContain('追加メッセージです')
  })
})
