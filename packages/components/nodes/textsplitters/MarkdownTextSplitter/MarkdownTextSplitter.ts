import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { MarkdownTextSplitter, MarkdownTextSplitterParams } from 'langchain/text_splitter'

class MarkdownTextSplitter_TextSplitters implements INode {
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
        this.label = 'Markdown 分割器'
        this.name = 'markdownTextSplitter'
        this.version = 1.0
        this.type = 'MarkdownTextSplitter'
        this.icon = 'markdownTextSplitter.svg'
        this.category = '文本分割'
        this.description = `按照 Markdown 语法标题将文档内容进行分割。`
        this.baseClasses = [this.type, ...getBaseClasses(MarkdownTextSplitter)]
        this.inputs = [
            {
                label: '块大小',
                name: 'chunkSize',
                type: 'number',
                description: '每个块字符数量，默认大小 1000。',
                default: 1000,
                optional: true
            },
            {
                label: '块重叠',
                name: 'chunkOverlap',
                type: 'number',
                description: '块间字符的重叠数，默认大小 200。',
                default: 200,
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string

        const obj = {} as MarkdownTextSplitterParams

        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)

        const splitter = new MarkdownTextSplitter(obj)

        return splitter
    }
}

module.exports = { nodeClass: MarkdownTextSplitter_TextSplitters }
