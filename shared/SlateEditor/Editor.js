import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { createEditor, Transforms, Editor } from "slate";
import { withHistory } from "slate-history";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import Toolbar from "./Toolbar/Toolbar";
import { sizeMap, fontFamilyMap } from "./utils/SlateUtilityFunctions.js";
import withLinks from "./plugins/withLinks.js";
import withTables from "./plugins/withTable.js";
import withEmbeds from "./plugins/withEmbeds.js";
import withMentions from "./plugins/withMention";
// import "./Editor.css";
import Link from "./Elements/Link/Link";
import Image from "./Elements/Image/Image";
import Video from "./Elements/Video/Video";
import Mention from "./Elements/Mention/Mention";
import insertMention from "./mentionEx";
import { CHARACTERS } from "./constMetion";
import { Range } from "slate";
import { Portal } from "./components";
import { useDispatch } from "react-redux";
const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "headingOne":
      return <h1 {...attributes}>{children}</h1>;
    case "headingTwo":
      return <h2 {...attributes}>{children}</h2>;
    case "headingThree":
      return <h3 {...attributes}>{children}</h3>;
    case "blockquote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "alignLeft":
      return (
        <div
          style={{ textAlign: "left", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "alignCenter":
      return (
        <div
          style={{ textAlign: "center", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "alignRight":
      return (
        <div
          style={{ textAlign: "right", listStylePosition: "inside" }}
          {...attributes}
        >
          {children}
        </div>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "orderedList":
      return (
        <ol type="1" {...attributes}>
          {children}
        </ol>
      );
    case "unorderedList":
      return <ul {...attributes}>{children}</ul>;
    case "link":
      console.log("link case editor");
      return <Link {...props} />;
    case "mention":
      return <Mention {...props} />;
    case "table":
      return (
        <table>
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case "table-row":
      return <tr {...attributes}>{children}</tr>;
    case "table-cell":
      return <td {...attributes}>{children}</td>;
    case "image":
      return <Image {...props} />;
    case "video":
      return <Video {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code style={{ backgroundColor: "#eee" }}>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.strikethrough) {
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }
  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }
  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }
  if (leaf.bgColor) {
    children = (
      <span style={{ backgroundColor: leaf.bgColor }}>{children}</span>
    );
  }
  if (leaf.fontSize) {
    const size = sizeMap[leaf.fontSize];
    children = <span style={{ fontSize: size }}>{children}</span>;
  }
  if (leaf.fontFamily) {
    const family = fontFamilyMap[leaf.fontFamily];
    children = <span style={{ fontFamily: family }}>{children}</span>;
  }
  return <span {...attributes}>{children}</span>;
};
const SlateEditor = () => {
  // mention start
  const dispatch = useDispatch();
  const ref = useRef();
  const [target, setTarget] = useState();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");

  const chars = CHARACTERS.filter((c) =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);

  const onKeyDown = useCallback(
    (event) => {
      if (target) {
        // eslint-disable-next-line default-case
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          case "ArrowUp":
            event.preventDefault();
            const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          case "Tab":
          case "Enter":
            event.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, chars[index]);
            setTarget(null);
            break;
          case "Escape":
            event.preventDefault();
            setTarget(null);
            break;
        }
      }
    },
    [index, search, target]
  );
  // mention end
  const editor = useMemo(
    () =>
      withHistory(
        withEmbeds(
          withMentions(withTables(withLinks(withReact(createEditor()))))
        )
      ),
    []
  );

  const [value, setValue] = useState([
    {
      type: "paragaph",
      children: [{ text: "First line of text in Slate JS. " }],
    },
  ]);

  const renderElement = useCallback((props) => <Element {...props} />, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);
  // mention
  useEffect(() => {
    if (target && chars.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      el.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [chars.length, editor, index, search, target]);

 
  const handleClick = () => {
    dispatch({
      type: "GET_EDITOR_DATA",
      payload: editor,
    });
 
  };
  return (
    <>
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          // mention
          const { selection } = editor;

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection);
            const wordBefore = Editor.before(editor, start, { unit: "word" });
            const before = wordBefore && Editor.before(editor, wordBefore);
            const beforeRange = before && Editor.range(editor, before, start);
            const beforeText =
              beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
            const after = Editor.after(editor, start);
            const afterRange = Editor.range(editor, start, after);
            const afterText = Editor.string(editor, afterRange);
            const afterMatch = afterText.match(/^(\s|$)/);

            if (beforeMatch && afterMatch) {
              setTarget(beforeRange);
              setSearch(beforeMatch[1]);
              setIndex(0);
              return;
            }
          }

          setTarget(null);
        }}
      >
        <Toolbar />
        {target && chars.length > 0 && (
          <Portal>
            <div
              ref={ref}
              style={{
                top: "-9999px",
                left: "-9999px",
                position: "absolute",
                zIndex: 1,
                padding: "3px",
                background: "white",
                borderRadius: "4px",
                boxShadow: "0 1px 5px rgba(0,0,0,.2)",
              }}
              data-cy="mentions-portal"
            >
              {chars.map((char, i) => (
                <div
                  key={char}
                  style={{
                    padding: "1px 3px",
                    borderRadius: "3px",
                    background: i === index ? "#B4D5FF" : "transparent",
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </Portal>
        )}
        <div
          className="editor-wrapper"
          style={{ border: "1px solid #f3f3f3", padding: "0 10px" }}
        >
          <Editable
            placeholder="Write something"
            renderElement={renderElement}
            // mention
            onKeyDown={onKeyDown}
            renderLeaf={renderLeaf}
          />
        </div>
      </Slate>
      <button onClick={handleClick}>Click me</button>
      <div style={{ marginTop: "100px" }}>
        {/* <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            // mention
            const { selection } = editor;

            if (selection && Range.isCollapsed(selection)) {
              const [start] = Range.edges(selection);
              const wordBefore = Editor.before(editor, start, { unit: "word" });
              const before = wordBefore && Editor.before(editor, wordBefore);
              const beforeRange = before && Editor.range(editor, before, start);
              const beforeText =
                beforeRange && Editor.string(editor, beforeRange);
              const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
              const after = Editor.after(editor, start);
              const afterRange = Editor.range(editor, start, after);
              const afterText = Editor.string(editor, afterRange);
              const afterMatch = afterText.match(/^(\s|$)/);

              if (beforeMatch && afterMatch) {
                setTarget(beforeRange);
                setSearch(beforeMatch[1]);
                setIndex(0);
                return;
              }
            }

            setTarget(null);
          }}
        > */}
        {/* <Toolbar /> */}
        {/* {target && chars.length > 0 && (
            <Portal>
              <div
                ref={ref}
                style={{
                  top: "-9999px",
                  left: "-9999px",
                  position: "absolute",
                  zIndex: 1,
                  padding: "3px",
                  background: "white",
                  borderRadius: "4px",
                  boxShadow: "0 1px 5px rgba(0,0,0,.2)",
                }}
                data-cy="mentions-portal"
              >
                {chars.map((char, i) => (
                  <div
                    key={char}
                    style={{
                      padding: "1px 3px",
                      borderRadius: "3px",
                      background: i === index ? "#B4D5FF" : "transparent",
                    }}
                  >
                    {char}
                  </div>
                ))}
              </div>
            </Portal>
          )}
          <div
            className="editor-wrapper"
            style={{ border: "1px solid #f3f3f3", padding: "0 10px" }}
          >
            <Editable
              placeholder="Write something"
              renderElement={renderElement}
              // mention
              onKeyDown={onKeyDown}
              renderLeaf={renderLeaf}
            />
          </div>
        </Slate> */}
      </div>
    </>
  );
};

export default SlateEditor;
