const characteristicTone = (characteristic: string) => {
  return {
    'creative': 'imaginative and engaging storytelling',
    'analytical': 'detailed analysis and logical reasoning',
    'persuasive': 'convincing arguments and persuasive language',
    'informative': 'clear explanations and concise information',
    'descriptive': 'vivid descriptions and sensory details'
  }[characteristic];
}

const languageTone = (language: string) => language === 'id' ? 'Bahasa Indonesia' : 'English';

export const responGugatanMessage = (context: string) => [
  { 
    role: 'system', 
    content: `Anda adalah asisten hukum yang ahli dalam membuat surat respon gugatan dan eksepsi hukum Indonesia. Berdasarkan analisis dokumen yang telah dilakukan, buatlah surat respon gugatan dan eksepsi yang komprehensif dan akurat berdasarkan literatur hukum yang ada. Pastikan bahwa surat tersebut tidak mengandung kesalahan bahasa atau ejaan.

    Format surat respon gugatan:
    1. **Tanggal dan Nomor Surat**: [Tanggal], [Nomor Surat]
    2. **Alamat Tujuan**: 
      - Hakim Pemeriksa Perkara No. [Nomor Perkara]
      - Pengadilan Negeri [Nama Pengadilan]
      - [Alamat Pengadilan]
    3. **Perihal**: Eksepsi dan Jawaban Tergugat pada Perkara Gugatan Sederhana No. [Nomor Perkara]
    4. **Identitas Pihak**:
      - **Penggugat**: [Nama Penggugat], [Alamat Penggugat]
      - **Tergugat**: [Nama Tergugat], [Alamat Tergugat]
      - **Kuasa Hukum**: 
        - Nama: [Nama Kuasa Hukum]
        - NIK: [NIK Kuasa Hukum]
        - Tempat/Tanggal Lahir: [TTL Kuasa Hukum]
        - Jenis Kelamin: [Jenis Kelamin]
        - Warga Negara: [Warga Negara]
        - Agama: [Agama]
        - Pekerjaan: [Pekerjaan]
        - Status Kawin: [Status Kawin]
        - Pendidikan: [Pendidikan]
        - NIA: [NIA Kuasa Hukum]
    5. **Eksepsi**:
      - [Detail Eksepsi Error in Persona]
      - [Detail Plurium Litis Consortium]
      - [Detail Obscuur Libel]
    6. **Pokok Perkara**:
      - [Tanggapan terhadap dalil Gugatan]
      - [Argumen hukum yang mendukung Tergugat]
    7. **Permohonan Putusan**:
      - [Permohonan untuk menerima eksepsi dan menolak gugatan]
      - [Permohonan untuk membebankan biaya kepada Penggugat]
    8. **Penutup**: 
      - [Pernyataan harapan untuk putusan yang adil]
      - [Tanda tangan Kuasa Hukum]

    - Pastikan surat tersebut mengikuti format resmi dan menggunakan bahasa hukum yang tepat.
    - Sertakan literatur hukum yang mendukung argumen Anda sepeti KUHP atau teori hukum.
    - Pastikan bahwa surat tersebut tidak mengandung kesalahan bahasa atau ejaan.
    - Gunakan bahasa yang panjang dan rinci.
    - Sertakan dengan lengkap detail-detail yang ada dalam dokumen seperti daftar isi, tanggal, nama kuasa hukum, dan lainnya dengan panjang dan rinci. 
    - Sertakan juga dengan kutipan dari dokumen yang ada seperti pasal, ayat, dan lainnya.
    - Sebutkan juga semua perusahaan yang ada dalam dokumen dengan lengkap, dan sebutkan juga nama, alamat, dan lainnya.
    - Sebutkan juga semua kontrak yang ada dalam dokumen dengan lengkap, dan sebutkan juga nama, tanggal, dan lainnya.`
  },
  { 
    role: 'user', 
    content: `Berikut adalah analisis lengkap dari dokumen hukum. Gunakan ini untuk membuat surat respon gugatan dan eksepsi:\n\n${context}` 
  },
];

export const essayContentMessage = (topic: string, language: string, characteristic: string, index: number, section: string) => {

  // const prompt = `Buatlah paragraf untuk section ${index + 1}: ${section} 
  // berdasarkan topic berikut: "${topic}".
  // tulis dengan detail dan terstruktur.`

  const prompt = `
  Write a detailed and structured paragraph for section ${index + 1}: "${section}" 
  based on the topic: "${topic}".
  Ensure the essay is written with a ${characteristic} tone, 
  focusing on ${characteristicTone(characteristic)}. 
  Write the response in ${languageTone(language)}.
`;
  return [
  {
    role: 'system',
    content: `You are an expert essay writer helpful assistant`
  },
  {
    role: 'user',
    content: `${prompt}`
  }
]
}

export const essaySectionMessage = (topic: string, documentType: string, language: string, characteristic: string, sectionIndex: number, currentSections: string[]) => {
  const prompt = `
    Given an essay on the topic "${topic}" of type "${documentType}", 
    with the following current section titles:
    ${currentSections.map((title, index) => `${index + 1}. ${title}`).join('\n')}

    Please regenerate the section at index ${sectionIndex + 1} (currently "${currentSections[sectionIndex]}").
    Provide a new title and brief content for this section that fits well with the other sections and maintains the overall flow and coherence of the essay.
    Ensure the essay is written with a ${characteristic} tone, 
    focusing on ${characteristicTone(characteristic)}.
    write down the description just 1 sentence max 100 character. write the answer in ${languageTone(language)}.
  `

  return [
    { role: 'system', content: 'You are an expert essay writer assistant in Indonesia.' },
    { role: 'user', content: prompt }
  ]
}

export const essayStructureMessage = (topic: string, language: string, characteristic: string) => {
  const prompt = `
    Generate a structured outline for an essay based on the topic: "${topic}". 
    Include main ideas and subpoints that logically flow together.
    Ensure the essay is written with a ${characteristic} tone, 
    focusing on ${characteristicTone(characteristic)}.
    write down the description just 1 sentence max 100 character. 
    Write the response in ${languageTone(language)}.
  `;
  return [
    { role: 'system', content: 'You are an expert essay writer helpful assistant' },
    { role: 'user', content: prompt }
  ]
}