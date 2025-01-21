import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { CharacterTextSplitter, CharacterTextSplitterParams } from 'langchain/text_splitter'

class CharacterTextSplitter_TextSplitters implements INode {
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
        this.label = '简单分割器'
        this.name = 'characterTextSplitter'
        this.version = 1.0
        this.type = 'CharacterTextSplitter'
        this.icon = 'textsplitter.svg'
        this.category = '文本分割'
        this.description = `只对一种字符进行拆分(默认为 "\\n\\n").`
        this.baseClasses = [this.type, ...getBaseClasses(CharacterTextSplitter)]
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
            },
            {
                label: '分隔符',
                name: 'separator',
                type: 'string',
                placeholder: `" "`,
                description: '自定义用来切分文本的分隔符，它会覆盖默认的分隔符。',
                optional: true
            }
        ]
    }

    async init(nodeData: INodeData): Promise<any> {
        const separator = nodeData.inputs?.separator as string
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string

        const obj = {} as CharacterTextSplitterParams

        if (separator) obj.separator = separator
        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)

        const splitter = new CharacterTextSplitter(obj)

        return splitter
    }
}

module.exports = { nodeClass: CharacterTextSplitter_TextSplitters }
