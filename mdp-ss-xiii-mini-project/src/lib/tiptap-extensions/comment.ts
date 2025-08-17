import { Mark, mergeAttributes } from '@tiptap/core'

export interface CommentOptions {
    HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        comment: {
            setComment: (commentId: string) => ReturnType,
            toggleComment: () => ReturnType,
            unsetComment: () => ReturnType,
        }
    }
}

export const CommentMark = Mark.create<CommentOptions>({
    name: 'comment',

    addOptions() {
        return {
            HTMLAttributes: {},
        }
    },

    addAttributes() {
        return {
            'data-comment-id': {
                default: null,
                parseHTML: element => element.getAttribute('data-comment-id'),
                renderHTML: attributes => {
                    if (!attributes['data-comment-id']) {
                        return {}
                    }
                    return { 'data-comment-id': attributes['data-comment-id'] }
                },
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-comment-id]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },

    addCommands() {
        return {
            setComment: (commentId) => ({ commands }) => {
                return commands.setMark(this.type, { 'data-comment-id': commentId })
            },
            toggleComment: () => ({ commands }) => {
                // Implementasi toggle jika perlu
                return commands.toggleMark(this.type)
            },
            unsetComment: () => ({ commands }) => {
                return commands.unsetMark(this.type)
            },
        }
    },
})