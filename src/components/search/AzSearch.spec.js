import AzSearch from './AzSearch'
import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Vuetify from 'vuetify'
import Vue from 'vue'

const localVue = createLocalVue()
Vue.use(Vuetify)

describe('AzSearch', () => {
    let wrapper

    beforeEach(() => {
        wrapper = shallowMount(AzSearch, {
            localVue,
            propsData: {
                filter: {},
                simpleSearchPlaceholder: 'Informe o objeto'
            },
            vuetify: new Vuetify()
        })
    })

    it('Default Data is correct', () => {
        expect(wrapper.vm.hasAdvancedSearchItems).toBe(false)
        expect(wrapper.vm.isClosedAdvancedSearch).toBe(true)
        expect(wrapper.vm.isSimpleSearch).toBe(false)
        expect(wrapper.vm.searchTextSize).toBe(200)
    })

    it('Toggle method is called after closing window', () => {
        jest.spyOn(wrapper.vm, 'toggle')
        wrapper.vm.cancel()
        expect(wrapper.vm.toggle).toBeCalled()
    })

    it('Toggle method is OK', () => {
        const isClosed = wrapper.vm.isClosedAdvancedSearch
        jest.spyOn(wrapper.vm, 'closeAsideMenu')

        wrapper.vm.toggle()

        expect(wrapper.vm.isClosedAdvancedSearch).toBe(!isClosed)
        expect(wrapper.vm.closeAsideMenu).toBeCalled()
    })

    it('Search Button emits event', () => {
        // Full mount to render vuetify components correctly
        let wrapperFull = mount(AzSearch, {
            localVue,
            propsData: {
                filter: {},
                simpleSearchPlaceholder: 'Informe o objeto'
            }
        })

        jest.spyOn(wrapperFull.vm, 'advancedSearch')
        wrapperFull.find('.ad-search').trigger('click.native')
        expect(wrapperFull.vm.advancedSearch).toBeCalled()
    })
})