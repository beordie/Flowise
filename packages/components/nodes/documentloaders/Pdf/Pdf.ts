import { omit } from 'lodash'
import { IDocument, ICommonObject, INode, INodeData, INodeParams } from '../../../src/Interface'
import { TextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { getFileFromStorage } from '../../../src'

class Pdf_DocumentLoaders implements INode {
    label: string
    name: string
    version: number
    description: string
    type: string
    icon: string
    category: string
    baseClasses: string[]
    inputs: INodeParams[]

    constructor() {
        this.label = 'Pdf 文件'
        this.name = 'pdfFile'
        this.version = 1.0
        this.type = 'Document'
        this.icon = 'pdf.svg'
        this.category = 'Document Loaders'
        this.description = `从 PDF 文件中读取数据`
        this.baseClasses = [this.type]
        this.inputs = [
            {
                label: 'Pdf 文件',
                name: 'pdfFile',
                type: 'file',
                fileType: '.pdf'
            },
            {
                label: '文本分割器',
                name: 'textSplitter',
                type: 'TextSplitter',
                optional: true
            },
            {
                label: '使用方式',
                name: 'usage',
                type: 'options',
                options: [
                    {
                        label: '一页作为一个文档',
                        name: 'perPage'
                    },
                    {
                        label: '一个文件作为一个文档',
                        name: 'perFile'
                    }
                ],
                default: 'perPage'
            },
            {
                label: '使用旧版本',
                name: 'legacyBuild',
                type: 'boolean',
                optional: true,
                additionalParams: true
            },
            {
                label: '添加元数据',
                name: 'metadata',
                type: 'json',
                description: '要添加到提取的文档中的其他元数据',
                optional: true,
                additionalParams: true
            },
            {
                label: '忽略元数据键',
                name: 'omitMetadataKeys',
                type: 'string',
                rows: 4,
                description:
                    '每个文档加载器都附带一组从文档中提取的默认元数据键。您可以使用此字段省略一些默认元数据键。该值应该是一个键列表，以逗号分隔。使用*省略所有元数据键，除了在附加元数据字段中指定的键',
                placeholder: 'key1, key2, key3.nestedKey1',
                optional: true,
                additionalParams: true
            }
        ]
    }

    async init(nodeData: INodeData, _: string, options: ICommonObject): Promise<any> {
        const textSplitter = nodeData.inputs?.textSplitter as TextSplitter
        const pdfFileBase64 = nodeData.inputs?.pdfFile as string
        const usage = nodeData.inputs?.usage as string
        const metadata = nodeData.inputs?.metadata
        const legacyBuild = nodeData.inputs?.legacyBuild as boolean
        const _omitMetadataKeys = nodeData.inputs?.omitMetadataKeys as string

        let omitMetadataKeys: string[] = []
        if (_omitMetadataKeys) {
            omitMetadataKeys = _omitMetadataKeys.split(',').map((key) => key.trim())
        }

        let docs: IDocument[] = []
        let files: string[] = []

        //FILE-STORAGE::["CONTRIBUTING.md","LICENSE.md","README.md"]
        if (pdfFileBase64.startsWith('FILE-STORAGE::')) {
            const fileName = pdfFileBase64.replace('FILE-STORAGE::', '')
            if (fileName.startsWith('[') && fileName.endsWith(']')) {
                files = JSON.parse(fileName)
            } else {
                files = [fileName]
            }
            const chatflowid = options.chatflowid

            for (const file of files) {
                if (!file) continue
                const fileData = await getFileFromStorage(file, chatflowid)
                const bf = Buffer.from(fileData)
                await this.extractDocs(usage, bf, legacyBuild, textSplitter, docs)
            }
        } else {
            if (pdfFileBase64.startsWith('[') && pdfFileBase64.endsWith(']')) {
                files = JSON.parse(pdfFileBase64)
            } else {
                files = [pdfFileBase64]
            }

            for (const file of files) {
                if (!file) continue
                const splitDataURI = file.split(',')
                splitDataURI.pop()
                const bf = Buffer.from(splitDataURI.pop() || '', 'base64')
                await this.extractDocs(usage, bf, legacyBuild, textSplitter, docs)
            }
        }

        if (metadata) {
            const parsedMetadata = typeof metadata === 'object' ? metadata : JSON.parse(metadata)
            docs = docs.map((doc) => ({
                ...doc,
                metadata:
                    _omitMetadataKeys === '*'
                        ? {
                              ...parsedMetadata
                          }
                        : omit(
                              {
                                  ...doc.metadata,
                                  ...parsedMetadata
                              },
                              omitMetadataKeys
                          )
            }))
        } else {
            docs = docs.map((doc) => ({
                ...doc,
                metadata:
                    _omitMetadataKeys === '*'
                        ? {}
                        : omit(
                              {
                                  ...doc.metadata
                              },
                              omitMetadataKeys
                          )
            }))
        }

        return docs
    }

    private async extractDocs(usage: string, bf: Buffer, legacyBuild: boolean, textSplitter: TextSplitter, docs: IDocument[]) {
        if (usage === 'perFile') {
            const loader = new PDFLoader(new Blob([bf]), {
                splitPages: false,
                pdfjs: () =>
                    // @ts-ignore
                    legacyBuild ? import('pdfjs-dist/legacy/build/pdf.js') : import('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js')
            })
            if (textSplitter) {
                let splittedDocs = await loader.load()
                splittedDocs = await textSplitter.splitDocuments(splittedDocs)
                docs.push(...splittedDocs)
            } else {
                docs.push(...(await loader.load()))
            }
        } else {
            const loader = new PDFLoader(new Blob([bf]), {
                pdfjs: () =>
                    // @ts-ignore
                    legacyBuild ? import('pdfjs-dist/legacy/build/pdf.js') : import('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js')
            })
            if (textSplitter) {
                let splittedDocs = await loader.load()
                splittedDocs = await textSplitter.splitDocuments(splittedDocs)
                docs.push(...splittedDocs)
            } else {
                docs.push(...(await loader.load()))
            }
        }
    }
}

module.exports = { nodeClass: Pdf_DocumentLoaders }
