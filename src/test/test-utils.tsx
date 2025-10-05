import type {RenderOptions} from '@testing-library/react'
import {fireEvent, render as tlRender, screen, waitFor, within} from '@testing-library/react'
import type {ReactElement} from 'react'
import {AllTheProviders} from './TestProviders'

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => tlRender(ui, {wrapper: AllTheProviders, ...options})

// Export specific items instead of using wildcard exports
export {screen, waitFor, fireEvent, within}
export {customRender as render}
