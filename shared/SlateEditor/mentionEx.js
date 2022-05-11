import { Transforms } from 'slate'
 const insertMention = (editor, character) => {
    const mention = {
      type: 'mention',
      character,
      children: [{ text: '' }],
    }
    Transforms.insertNodes(editor, mention)
    Transforms.move(editor)
  }
  export default insertMention