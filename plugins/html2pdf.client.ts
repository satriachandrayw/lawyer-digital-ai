import html2pdf from 'html2pdf.js'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      html2pdf: html2pdf,
    },
  }
})
