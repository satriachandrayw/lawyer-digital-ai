import { defineNuxtPlugin } from '#app'
import html2pdf from 'html2pdf.js'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      html2pdf: html2pdf
    }
  }
})
