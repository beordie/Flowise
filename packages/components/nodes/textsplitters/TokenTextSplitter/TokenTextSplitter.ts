import { INode, INodeData, INodeParams } from '../../../src/Interface'
import { getBaseClasses } from '../../../src/utils'
import { TokenTextSplitter, TokenTextSplitterParams } from 'langchain/text_splitter'
import { TiktokenEncoding } from '@dqbd/tiktoken'

class TokenTextSplitter_TextSplitters implements INode {
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
        this.label = 'Token 分割器'
        this.name = 'tokenTextSplitter'
        this.version = 1.0
        this.type = 'TokenTextSplitter'
        this.icon = 'tiktoken.svg'
        this.category = '文本分割'
        this.description = `首先使用 BPE 编码对文本进行转换分割为块，并将单个块中的标记转换为文本，之后再进行文本分割。`
        this.baseClasses = [this.type, ...getBaseClasses(TokenTextSplitter)]
        this.inputs = [
            {
                label: '编码器',
                name: 'encodingName',
                type: 'options',
                options: [
                    {
                        label: 'gpt2',
                        name: 'gpt2'
                    },
                    {
                        label: 'r50k_base',
                        name: 'r50k_base'
                    },
                    {
                        label: 'p50k_base',
                        name: 'p50k_base'
                    },
                    {
                        label: 'p50k_edit',
                        name: 'p50k_edit'
                    },
                    {
                        label: 'cl100k_base',
                        name: 'cl100k_base'
                    }
                ],
                default: 'gpt2'
            },
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
        const encodingName = nodeData.inputs?.encodingName as string
        const chunkSize = nodeData.inputs?.chunkSize as string
        const chunkOverlap = nodeData.inputs?.chunkOverlap as string

        const obj = {} as TokenTextSplitterParams

        obj.encodingName = encodingName as TiktokenEncoding
        if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10)
        if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10)

        const splitter = new TokenTextSplitter(obj)

        return splitter
    }
}

module.exports = { nodeClass: TokenTextSplitter_TextSplitters }
