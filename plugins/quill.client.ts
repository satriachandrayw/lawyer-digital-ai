import { defineNuxtPlugin } from '#app'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      quill: Quill
    }
  }
})
