import { deflateRaw } from 'pako'
import crc32 from 'pako/lib/zlib/crc32'

interface ZipEntry {
  name: string
  data: Uint8Array
  crc: number
  compressed: Uint8Array
  offset: number
}

class ZipBuilder {
  private entries: ZipEntry[] = []

  addFile(name: string, content: Uint8Array) {
    const compressed = deflateRaw(content)
    const crc = crc32(0, content, content.length, 0) >>> 0
    this.entries.push({ name, data: content, crc, compressed, offset: 0 })
  }

  generate(): Uint8Array {
    const parts: Uint8Array[] = []
    let offset = 0
    const encoder = new TextEncoder()

    for (const e of this.entries) {
      const nameBuf = encoder.encode(e.name)
      const header = new Uint8Array(30 + nameBuf.length)
      const dv = new DataView(header.buffer)
      dv.setUint32(0, 0x04034b50, true)
      dv.setUint16(4, 20, true) // version
      dv.setUint16(6, 0, true) // flags
      dv.setUint16(8, 8, true) // deflate
      dv.setUint16(10, 0, true)
      dv.setUint16(12, 0, true)
      dv.setUint32(14, e.crc, true)
      dv.setUint32(18, e.compressed.length, true)
      dv.setUint32(22, e.data.length, true)
      dv.setUint16(26, nameBuf.length, true)
      dv.setUint16(28, 0, true)
      header.set(nameBuf, 30)
      parts.push(header, e.compressed)
      e.offset = offset
      offset += header.length + e.compressed.length
    }

    const centralParts: Uint8Array[] = []
    for (const e of this.entries) {
      const nameBuf = encoder.encode(e.name)
      const central = new Uint8Array(46 + nameBuf.length)
      const dv = new DataView(central.buffer)
      dv.setUint32(0, 0x02014b50, true)
      dv.setUint16(4, 20, true)
      dv.setUint16(6, 20, true)
      dv.setUint16(8, 0, true)
      dv.setUint16(10, 8, true)
      dv.setUint16(12, 0, true)
      dv.setUint16(14, 0, true)
      dv.setUint32(16, e.crc, true)
      dv.setUint32(20, e.compressed.length, true)
      dv.setUint32(24, e.data.length, true)
      dv.setUint16(28, nameBuf.length, true)
      dv.setUint16(30, 0, true)
      dv.setUint16(32, 0, true)
      dv.setUint16(34, 0, true)
      dv.setUint16(36, 0, true)
      dv.setUint32(38, 0, true)
      dv.setUint32(42, e.offset, true)
      central.set(nameBuf, 46)
      centralParts.push(central)
    }

    const centralSize = centralParts.reduce((a, b) => a + b.length, 0)
    const centralOffset = offset

    parts.push(...centralParts)

    const end = new Uint8Array(22)
    const dvEnd = new DataView(end.buffer)
    dvEnd.setUint32(0, 0x06054b50, true)
    dvEnd.setUint16(4, 0, true)
    dvEnd.setUint16(6, 0, true)
    dvEnd.setUint16(8, this.entries.length, true)
    dvEnd.setUint16(10, this.entries.length, true)
    dvEnd.setUint32(12, centralSize, true)
    dvEnd.setUint32(16, centralOffset, true)
    dvEnd.setUint16(20, 0, true)

    parts.push(end)

    const total = parts.reduce((a, b) => a + b.length, 0)
    const out = new Uint8Array(total)
    let pos = 0
    for (const p of parts) {
      out.set(p, pos)
      pos += p.length
    }
    return out
  }
}

export function createSimpleDocx(text: string): Blob {
  const encoder = new TextEncoder()
  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body></w:document>`
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml" Id="R1"/></Relationships>`

  const zip = new ZipBuilder()
  zip.addFile('[Content_Types].xml', encoder.encode(contentTypes))
  zip.addFile('_rels/.rels', encoder.encode(rels))
  zip.addFile('word/document.xml', encoder.encode(docXml))

  const zipData = zip.generate()
  return new Blob([zipData], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
}
