import Quill from 'quill'
import { defineNuxtPlugin } from '#app'
import 'quill/dist/quill.snow.css'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      quill: Quill,
    },
  }
})
