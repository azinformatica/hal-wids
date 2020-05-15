import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuex from 'vuex'
import 'pdfjs-dist/build/pdf'
import 'pdfjs-dist/web/pdf_viewer.js'
import AzPdfDocumentViewer from './AzPdfDocumentViewer'
import { actionTypes } from '../../../src/store'
import { createLocalVue, shallowMount } from '@vue/test-utils'

jest.mock('pdfjs-dist/build/pdf', () => ({
    getDocument: jest.fn(() => Promise.resolve(true))
}))

jest.mock('pdfjs-dist/web/pdf_viewer.js', () => ({
    PDFJS: {
        EventBus: jest.fn(() => ({
            on: jest.fn().mockImplementation((e, cb) =>
                cb({
                    source: {
                        currentPageNumber: 1,
                        currentScale: 1,
                        pagesCount: 10
                    },
                    scale: 1,
                    pageNumber: 2
                })
            )
        })),

        PDFViewer: jest.fn(() => ({
            setDocument: jest.fn()
        }))
    }
}))

const localVue = createLocalVue()
Vue.use(Vuetify)
Vue.use(Vuex)

describe('AzPdfDocumentViewer.spec.js', () => {
    let src, httpHeader, downloadButton, wrapper, store, actions

    beforeEach(() => {
        actions = {
            [actionTypes.DOCUMENT.DOWNLOAD]: jest.fn()
        }
        store = new Vuex.Store({ actions })
        src = 'document/url'
        httpHeader = { token: '123abcd456' }
        downloadButton = true

        wrapper = shallowMount(AzPdfDocumentViewer, {
            localVue,
            store,
            propsData: { src, httpHeader, downloadButton },
            attachTo: document.body
        })
    })

    describe('Props', () => {
        it('Should receive props src', () => {
            expect(wrapper.props().src).toEqual('document/url')
        })

        it('Should receive props httpHeader', () => {
            expect(wrapper.props().httpHeader).toEqual({ token: '123abcd456' })
        })

        it('Should have a default value to props httpHeader', () => {
            wrapper = shallowMount(AzPdfDocumentViewer, {
                localVue,
                store,
                propsData: { src, downloadButton },
                attachTo: document.body
            })
            expect(wrapper.props().httpHeader).toEqual({})
        })

        it('Should receive props downloadButton', () => {
            expect(wrapper.props().downloadButton).toBeTruthy()
        })
    })

    describe('Vue Lifecycle', () => {
        it('Should run start function when src is updated', async () => {
            wrapper.vm.start = jest.fn()
            wrapper.vm.$options.watch.src.call(wrapper.vm, 'document/url/2')
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.start).toHaveBeenCalledTimes(1)
        })
    })

    describe('PDF Rendering', () => {
        it('Should execute getPdfContainer', () => {
            wrapper.vm.getPdfContainer()
            const container = wrapper.vm.pdf.container

            expect(container.getAttribute('class')).toEqual('Viewer')
            expect(container.firstChild.getAttribute('class')).toEqual('pdfViewer')
        })

        it('Should execute createEventBus', () => {
            wrapper.vm.pagesInitEventHandler = jest.fn()
            wrapper.vm.scaleChangeEventHandler = jest.fn()
            wrapper.vm.pageChangeEventHandler = jest.fn()
            wrapper.vm.createEventBus()

            expect(wrapper.vm.pagesInitEventHandler).toHaveBeenCalled()
            expect(wrapper.vm.scaleChangeEventHandler).toHaveBeenCalled()
            expect(wrapper.vm.pageChangeEventHandler).toHaveBeenCalled()
        })

        it('Should execute pagesInitEventHandler to "small screen"', () => {
            wrapper.vm.validateSmallScreen = jest.fn().mockReturnValue(true)
            wrapper.vm.pagesInitEventHandler({
                source: {
                    currentPageNumber: 1,
                    currentScale: 1,
                    pagesCount: 10
                }
            })

            expect(wrapper.vm.pagination).toEqual({ current: 1, total: 10 })
            expect(wrapper.vm.pdf.viewer.currentScaleValue).toEqual('page-width')
            expect(wrapper.vm.scale).toEqual({ current: 1, default: 1 })
        })

        it('Should execute pagesInitEventHandler to "non small screen"', () => {
            wrapper.vm.validateSmallScreen = jest.fn().mockReturnValue(false)
            wrapper.vm.pagesInitEventHandler({
                source: {
                    currentPageNumber: 1,
                    currentScale: 1,
                    pagesCount: 10
                }
            })

            expect(wrapper.vm.pagination).toEqual({ current: 1, total: 10 })
            expect(wrapper.vm.pdf.viewer.currentScaleValue).toEqual('page-fit')
            expect(wrapper.vm.scale).toEqual({ current: 1, default: 1 })
        })

        it('Should execute scaleChangeEventHandler', () => {
            wrapper.vm.scaleChangeEventHandler({ scale: 10 })

            expect(wrapper.vm.scale.current).toEqual(10)
        })

        it('Should execute pageChangeEventHandler', () => {
            wrapper.vm.pageChangeEventHandler({ pageNumber: 100 })

            expect(wrapper.vm.pagination.current).toEqual(100)
        })

        it('Should execute createPdfViewer', () => {
            wrapper.vm.createPdfViewer()

            expect(typeof wrapper.vm.pdf.viewer.setDocument).toEqual('function')
        })
    })

    describe('Zoom control methods', () => {
        it('Should execute the zoomIn method', () => {
            wrapper = shallowMount(AzPdfDocumentViewer, {
                localVue,
                store,
                propsData: { src, httpHeader, downloadButton },
                stubs: {
                    Toolbar: '<button @click=\'$emit("zoomIn")\' ></button>'
                }
            })
            wrapper.setData({
                scale: {
                    current: 1
                },
                pdf: {
                    viewer: {
                        currentScale: 1
                    }
                }
            })
            wrapper.find('button').trigger('click')

            expect(wrapper.vm.pdf.viewer.currentScale).toEqual(1.1)
        })

        it('Should execute the zoomOut method', () => {
            wrapper = shallowMount(AzPdfDocumentViewer, {
                localVue,
                store,
                propsData: { src, httpHeader, downloadButton },
                stubs: {
                    Toolbar: '<button @click=\'$emit("zoomOut")\' ></button>'
                }
            })
            wrapper.setData({
                scale: {
                    current: 1
                },
                pdf: {
                    viewer: {
                        currentScale: 1
                    }
                }
            })
            wrapper.find('button').trigger('click')

            expect(wrapper.vm.pdf.viewer.currentScale).toEqual(1 / 1.1)
        })

        it('Should block zoomOut when scale is too small', () => {
            wrapper = shallowMount(AzPdfDocumentViewer, {
                localVue,
                store,
                propsData: { src, httpHeader, downloadButton },
                stubs: {
                    Toolbar: '<button @click=\'$emit("zoomOut")\' ></button>'
                }
            })
            wrapper.setData({
                scale: {
                    current: 0.2
                },
                pdf: {
                    viewer: {
                        currentScale: 0.2
                    }
                }
            })
            wrapper.find('button').trigger('click')

            expect(wrapper.vm.pdf.viewer.currentScale).toEqual(0.2)
        })

        it('Should execute resetZoom method', () => {
            wrapper = shallowMount(AzPdfDocumentViewer, {
                localVue,
                store,
                propsData: { src, httpHeader, downloadButton },
                stubs: {
                    Toolbar: '<button @click=\'$emit("resetZoom")\' ></button>'
                }
            })
            wrapper.setData({
                scale: {
                    default: 1
                },
                pdf: {
                    viewer: {
                        currentScale: 3
                    }
                }
            })
            wrapper.find('button').trigger('click')

            expect(wrapper.vm.pdf.viewer.currentScale).toEqual(1)
        })
    })

    describe('Download action', () => {
        it('Should execute the download action', () => {
            wrapper = shallowMount(AzPdfDocumentViewer, {
                localVue,
                store,
                propsData: { src, httpHeader, downloadButton },
                stubs: {
                    Toolbar: '<button @click=\'$emit("download")\' ></button>'
                }
            })
            wrapper.setData({
                pdf: {
                    viewer: {
                        pdfDocument: {
                            transport: {
                                _fullReader: {
                                    _filename: null
                                }
                            }
                        }
                    }
                }
            })
            wrapper.find('button').trigger('click')

            expect(actions[actionTypes.DOCUMENT.DOWNLOAD].mock.calls[0][1]).toEqual({
                src: 'document/url',
                httpHeader: { token: '123abcd456' },
                filename: 'download.pdf'
            })
        })
    })
})
