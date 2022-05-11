const withLinks = (editor)=>{
console.log("withLink");
    const { isInline } = editor;
    editor.isInline = (element) => 
        element.type === 'link' ? true :isInline(element);
    return editor;
};

export default withLinks;